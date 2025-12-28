import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

interface ProcessRequest {
  projectId: string;
  clipsUrls: string[];
  musicUrl?: string;
  effects: string[];
  beatData: BeatData;
}

// Generate Transloadit signature using HMAC-SHA384
async function generateSignature(params: Record<string, unknown>, authSecret: string): Promise<string> {
  const paramsString = JSON.stringify(params);
  const encoder = new TextEncoder();
  const keyData = encoder.encode(authSecret);
  const data = encoder.encode(paramsString);
  
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-384" },
    false,
    ["sign"]
  );
  
  const signature = await globalThis.crypto.subtle.sign("HMAC", key, data);
  const hashArray = Array.from(new Uint8Array(signature));
  return "sha384:" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Professional TikTok-Style Effect Filters
 * 
 * Zoom: Uses a more aggressive exponential easing for that "pop" effect.
 * Shake: Uses a high-frequency sine wave with decay for impact.
 * 9:16 Formatting: Ensures everything is perfectly centered and scaled for mobile.
 */
function getEffectFilter(effect: string, intensity: number, duration: number): string {
  const normalized = intensity / 10;
  const frames = Math.max(1, Math.round(duration * 30));
  
  switch (effect) {
    case "zoom":
    case "smooth-zoom":
    case "perfect-zoom":
      // Aggressive TikTok Zoom: Starts with a "pop" and eases out
      const zoomStart = 1.0;
      const zoomEnd = 1.0 + (0.5 * normalized);
      // zoompan=z='zoom+0.01':d=frames:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920
      return `zoompan=z='min(zoom+${0.005 * intensity},${zoomEnd})':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920`;
    
    case "shake":
    case "impact-shake":
      // High-energy TikTok Shake: Rapid movement that decays
      const amp = 30 * normalized;
      return `crop=iw-${amp}:ih-${amp}:${amp/2}+${amp/2}*sin(2*PI*t*20):${amp/2}+${amp/2}*cos(2*PI*t*25),scale=1080:1920`;
    
    case "flash":
      // White flash transition
      return `eq=brightness='if(lt(t,0.15),${0.6 * normalized}*(1-t/0.15),0)'`;
      
    default:
      // Subtle constant zoom to keep the video "alive"
      return `zoompan=z='zoom+0.001':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920`;
  }
}

function buildTransloaditSteps(
  clipsUrls: string[],
  musicUrl: string | undefined,
  beatData: BeatData,
  projectId: string
) {
  const steps: Record<string, unknown> = {};

  clipsUrls.forEach((url, index) => {
    steps[`import_clip_${index}`] = {
      robot: "/http/import",
      url: url,
    };
  });

  if (musicUrl) {
    steps["import_music"] = {
      robot: "/http/import",
      url: musicUrl,
    };
  }

  // Step 1: Force 9:16 (1080x1920) for all clips
  clipsUrls.forEach((_, index) => {
    steps[`resize_${index}`] = {
      robot: "/video/encode",
      use: `import_clip_${index}`,
      preset: "iphone-high",
      ffmpeg_stack: "v6.0.0",
      ffmpeg: {
        vf: "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",
      },
    };
  });

  // Step 2: Apply professional cuts and effects
  if (beatData.segments && beatData.segments.length > 0) {
    beatData.segments.forEach((segment, index) => {
      const clipIndex = segment.clipIndex % clipsUrls.length;
      const duration = segment.end - segment.start;

      const effectTiming = beatData.effectTimings?.find(
        (e) => e.time >= segment.start && e.time < segment.end
      );

      const ffmpegFilters: string[] = [];
      const filter = getEffectFilter(effectTiming?.effect || "default", effectTiming?.intensity || 5, duration);
      if (filter) ffmpegFilters.push(filter);

      steps[`segment_${index}`] = {
        robot: "/video/encode",
        use: `resize_${clipIndex}`,
        preset: "iphone-high",
        ffmpeg_stack: "v6.0.0",
        ffmpeg: {
          ss: 0,
          t: duration,
          vf: ffmpegFilters.join(","),
        },
      };
    });

    const segmentRefs = beatData.segments.map((_, index) => ({
      name: `segment_${index}`,
      as: `video_${index + 1}`,
    }));

    steps["concatenate"] = {
      robot: "/video/concat",
      use: {
        steps: segmentRefs,
      },
      preset: "iphone-high",
      ffmpeg_stack: "v6.0.0",
    };

    if (musicUrl) {
      steps["add_music"] = {
        robot: "/video/merge",
        use: {
          steps: [
            { name: "concatenate", as: "video" },
            { name: "import_music", as: "audio" },
          ],
        },
        replace_audio: true,
        duration: beatData.totalDuration || 15,
        preset: "iphone-high",
        ffmpeg_stack: "v6.0.0",
      };
    }
  }

  const finalStep = musicUrl ? "add_music" : "concatenate";

  steps["exported"] = {
    robot: "/file/serve",
    use: finalStep,
    inline: false,
    download: false,
  };

  return steps;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authKey = Deno.env.get("TRANSLOADIT_AUTH_KEY");
    const authSecret = Deno.env.get("TRANSLOADIT_AUTH_SECRET");
    
    if (!authKey || !authSecret) {
      return new Response(
        JSON.stringify({ error: "Transloadit credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { projectId, clipsUrls, musicUrl, effects, beatData }: ProcessRequest = await req.json();
    
    const steps = buildTransloaditSteps(clipsUrls, musicUrl, beatData, projectId);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    
    const params = {
      auth: {
        key: authKey,
        expires: new Date(Date.now() + 3600000).toISOString().replace(/\.\d{3}Z$/, "+00:00"),
      },
      steps,
      notify_url: `${supabaseUrl}/functions/v1/transloadit-webhook?projectId=${projectId}`,
    };

    const signature = await generateSignature(params, authSecret);

    const formData = new FormData();
    formData.append("params", JSON.stringify(params));
    formData.append("signature", signature);

    const response = await fetch("https://api2.transloadit.com/assemblies", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    
    if (result.error) {
      return new Response(
        JSON.stringify({ error: result.error, message: result.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase
      .from("projects")
      .update({ 
        status: "processing",
        updated_at: new Date().toISOString()
      })
      .eq("id", projectId);

    return new Response(
      JSON.stringify({
        success: true,
        assemblyId: result.assembly_id,
        assemblyUrl: result.assembly_ssl_url,
        message: `Processing TikTok-style edit: ${beatData.segments?.length || 0} cuts`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to process video effects", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
