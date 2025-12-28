import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BeatData {
  bpm?: number;
  totalDuration?: number;
  beats?: number[];
  hardBeats?: number[];
  segments?: Array<{ start: number; end: number; clipIndex: number }>;
  effectTimings?: Array<{ time: number; effect: string; intensity: number }>;
}

interface RequestBody {
  projectId: string;
  clipsUrls: string[];
  musicUrl?: string;
  effects: string[];
  beatData?: BeatData;
}

// Map effects to FFmpeg filters
function getEffectFilter(effect: string, intensity: number = 5): string {
  const scale = 1 + (intensity / 100) * 2;
  switch (effect) {
    case "zoom":
      return `scale=iw*${scale.toFixed(2)}:ih*${scale.toFixed(2)},crop=iw/${scale.toFixed(2)}:ih/${scale.toFixed(2)}`;
    case "shake":
      const shakeAmount = Math.floor(intensity / 2);
      return `crop=iw-${shakeAmount * 2}:ih-${shakeAmount * 2}:x='${shakeAmount}+${shakeAmount}*sin(t*20)':y='${shakeAmount}+${shakeAmount}*cos(t*25)'`;
    case "flash":
      return `eq=brightness=${0.1 + intensity / 50}:saturation=${1.2 + intensity / 25}`;
    case "blur":
      return `boxblur=${Math.max(1, Math.floor(intensity / 5))}:1`;
    case "glitch":
      return `rgbashift=rh=-${intensity}:bh=${intensity}`;
    default:
      return "";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { projectId, clipsUrls, musicUrl, effects, beatData } = body;

    console.log("=== COCONUT ENCODE ===");
    console.log("Project ID:", projectId);
    console.log("Clips:", clipsUrls?.length);
    console.log("Music URL:", musicUrl ? "provided" : "none");
    console.log("Effects:", effects);

    if (!projectId || !clipsUrls?.length) {
      return new Response(
        JSON.stringify({ error: "Missing projectId or clipsUrls" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const COCONUT_API_KEY = Deno.env.get("COCONUT_API_KEY");
    if (!COCONUT_API_KEY) {
      throw new Error("COCONUT_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update project status to processing
    await supabase
      .from("projects")
      .update({ status: "processing" })
      .eq("id", projectId);

    const totalDuration = beatData?.totalDuration || 15;
    const mainClipUrl = clipsUrls[0];

    // Build FFmpeg video filter for effects
    let videoFilter = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920";
    
    if (beatData?.effectTimings?.length && effects?.length) {
      // Apply first effect filter for simplicity
      const firstEffect = beatData.effectTimings[0];
      if (effects.includes(firstEffect.effect)) {
        const filter = getEffectFilter(firstEffect.effect, firstEffect.intensity);
        if (filter) {
          videoFilter = `${videoFilter},${filter}`;
        }
      }
    }

    // Build Coconut job configuration
    // Reference: https://docs.coconut.co/api-reference/v2/jobs
    const coconutJob: Record<string, unknown> = {
      input: {
        url: mainClipUrl,
      },
      notification: {
        type: "http",
        url: `${supabaseUrl}/functions/v1/coconut-webhook?projectId=${projectId}`,
      },
      outputs: {},
    };

    // Configure output based on whether we have music
    if (musicUrl) {
      // With music: use audio_source to merge audio
      (coconutJob.outputs as Record<string, unknown>)["mp4:1080x1920"] = {
        duration: totalDuration,
        audio_source: musicUrl,
        ffmpeg: {
          vf: videoFilter,
        },
      };
    } else {
      // Without music: simple video encode
      (coconutJob.outputs as Record<string, unknown>)["mp4:1080x1920"] = {
        duration: totalDuration,
        ffmpeg: {
          vf: videoFilter,
        },
      };
    }

    console.log("Coconut job config:", JSON.stringify(coconutJob, null, 2));

    // Submit job to Coconut API v2
    const coconutResponse = await fetch("https://api.coconut.co/v2/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(COCONUT_API_KEY + ":")}`,
      },
      body: JSON.stringify(coconutJob),
    });

    const responseText = await coconutResponse.text();
    console.log("Coconut API response status:", coconutResponse.status);
    console.log("Coconut API response:", responseText);

    if (!coconutResponse.ok) {
      console.error("Coconut API error:", responseText);
      
      await supabase
        .from("projects")
        .update({ status: "failed" })
        .eq("id", projectId);
        
      throw new Error(`Coconut API error: ${responseText}`);
    }

    const coconutResult = JSON.parse(responseText);
    console.log("Coconut job created:", coconutResult.id);

    return new Response(
      JSON.stringify({
        success: true,
        jobId: coconutResult.id,
        message: "Video encoding started with Coconut",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
