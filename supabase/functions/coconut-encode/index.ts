import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BeatData {
  bpm: number;
  totalDuration: number;
  beats: number[];
  hardBeats: number[];
  segments: Array<{ start: number; end: number; clipIndex: number }>;
  effectTimings: Array<{ time: number; effect: string; intensity: number }>;
}

interface RequestBody {
  projectId: string;
  clipsUrls: string[];
  musicUrl?: string;
  effects: string[];
  beatData: BeatData;
}

/**
 * Professional TikTok-Style Effect Filters for Coconut
 */
function getEffectFilter(effect: string, intensity: number, duration: number): string {
  const normalized = intensity / 10;
  const frames = Math.max(1, Math.round(duration * 30));
  
  switch (effect) {
    case "zoom":
    case "smooth-zoom":
    case "perfect-zoom":
      const zoomEnd = 1.0 + (0.5 * normalized);
      return `zoompan=z='min(zoom+${0.005 * intensity},${zoomEnd})':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920`;
    
    case "shake":
    case "impact-shake":
      const amp = 30 * normalized;
      return `crop=iw-${amp}:ih-${amp}:${amp/2}+${amp/2}*sin(2*PI*t*20):${amp/2}+${amp/2}*cos(2*PI*t*25),scale=1080:1920`;
    
    case "flash":
      return `eq=brightness='if(lt(t,0.15),${0.6 * normalized}*(1-t/0.15),0)'`;
      
    default:
      return `zoompan=z='zoom+0.001':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920`;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { projectId, clipsUrls, musicUrl, effects, beatData } = body;

    if (!projectId || !clipsUrls?.length) {
      throw new Error("Missing projectId or clipsUrls");
    }

    const COCONUT_API_KEY = Deno.env.get("COCONUT_API_KEY");
    if (!COCONUT_API_KEY) {
      throw new Error("COCONUT_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase
      .from("projects")
      .update({ status: "processing" })
      .eq("id", projectId);

    // Build video filter with professional effects
    let videoFilter = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920";
    
    if (beatData.segments?.length && beatData.effectTimings?.length) {
      const firstEffect = beatData.effectTimings[0];
      if (firstEffect) {
        const filter = getEffectFilter(firstEffect.effect, firstEffect.intensity, beatData.totalDuration);
        videoFilter += `,${filter}`;
      }
    }

    // Build Coconut Job with REQUIRED storage configuration
    // Using Coconut's test storage (files deleted after 24h, but works for testing)
    const coconutJob = {
      input: {
        url: clipsUrls[0],
      },
      // THIS IS THE KEY FIX: Coconut requires a storage destination
      storage: {
        service: "coconut",
      },
      notification: {
        type: "http",
        url: `${supabaseUrl}/functions/v1/coconut-webhook?projectId=${projectId}`,
      },
      outputs: {
        "mp4:1080x1920": {
          path: `/editlabs/${projectId}_${Date.now()}.mp4`,
          duration: beatData.totalDuration || 15,
          video_filter: videoFilter,
          ...(musicUrl && { audio_source: musicUrl }),
        },
      },
    };

    console.log("Coconut job config:", JSON.stringify(coconutJob, null, 2));

    const coconutResponse = await fetch("https://api.coconut.co/v2/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(COCONUT_API_KEY + ":")}`,
      },
      body: JSON.stringify(coconutJob),
    });

    const responseText = await coconutResponse.text();
    console.log("Coconut API response:", responseText);
    
    if (!coconutResponse.ok) {
      throw new Error(`Coconut API error: ${responseText}`);
    }

    const coconutResult = JSON.parse(responseText);

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
