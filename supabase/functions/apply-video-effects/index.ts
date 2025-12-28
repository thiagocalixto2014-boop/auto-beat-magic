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
  
  // Use the global Web Crypto API available in Deno
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

// Build FFmpeg filter for effects based on intensity
function getEffectFilter(effect: string, intensity: number): string {
  const normalized = intensity / 10; // 0 to 1
  
  switch (effect) {
    case "shake":
    case "shake-light":
    case "shake-heavy":
      const shakeAmount = effect === "shake-heavy" ? 40 : effect === "shake-light" ? 8 : 20;
      const shake = Math.round(shakeAmount * normalized);
      return `crop=iw-${shake}:ih-${shake}:${shake/2}+random(1)*${shake/2}:${shake/2}+random(1)*${shake/2}`;
    case "zoom":
      const zoomFactor = 1 + (0.3 * normalized); // 1.0 to 1.3
      return `scale=iw*${zoomFactor}:ih*${zoomFactor},crop=iw/${zoomFactor}:ih/${zoomFactor}`;
    case "flash":
      return `eq=brightness=${0.3 * normalized}`;
    default:
      return "";
  }
}

// Build the Transloadit assembly for beat-synced editing
function buildTransloaditSteps(
  clipsUrls: string[],
  musicUrl: string | undefined,
  beatData: BeatData,
  projectId: string
) {
  const steps: Record<string, unknown> = {};
  
  console.log("Building Transloadit steps for beat-synced edit...");
  console.log("Segments:", beatData.segments?.length);
  console.log("Effect timings:", beatData.effectTimings?.length);

  // Import all source clips
  clipsUrls.forEach((url, index) => {
    steps[`import_clip_${index}`] = {
      robot: "/http/import",
      url: url,
    };
  });

  // Import music if provided
  if (musicUrl) {
    steps["import_music"] = {
      robot: "/http/import",
      url: musicUrl,
    };
  }

  // Step 1: Resize all clips to phone format (9:16 vertical)
  clipsUrls.forEach((_, index) => {
    steps[`resize_${index}`] = {
      robot: "/video/encode",
      use: `import_clip_${index}`,
      preset: "iphone-high",
      width: 1080,
      height: 1920,
      resize_strategy: "crop",
      background: "#000000",
      ffmpeg_stack: "v6.0.0",
    };
  });

  // Step 2: Cut segments based on beat data
  if (beatData.segments && beatData.segments.length > 0) {
    beatData.segments.forEach((segment, index) => {
      const clipIndex = segment.clipIndex % clipsUrls.length;
      const duration = segment.end - segment.start;
      
      // Find if there's an effect for this segment
      const effectTiming = beatData.effectTimings?.find(
        e => e.time >= segment.start && e.time < segment.end
      );
      
      let ffmpegFilters = [];
      
      // Add effect filter if applicable
      if (effectTiming) {
        const filter = getEffectFilter(effectTiming.effect, effectTiming.intensity);
        if (filter) {
          ffmpegFilters.push(filter);
        }
      }
      
      // Always ensure 9:16 output
      ffmpegFilters.push("scale=1080:1920:force_original_aspect_ratio=decrease");
      ffmpegFilters.push("pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black");
      
      steps[`segment_${index}`] = {
        robot: "/video/encode",
        use: `resize_${clipIndex}`,
        preset: "iphone-high",
        ffmpeg_stack: "v6.0.0",
        ffmpeg: {
          ss: 0, // Start from beginning of clip (we'll vary which clip is used)
          t: duration,
          vf: ffmpegFilters.join(","),
        },
      };
    });

    // Step 3: Concatenate all segments
    const segmentRefs = beatData.segments.map((_, index) => ({
      name: `segment_${index}`,
      as: "video",
    }));

    steps["concatenate"] = {
      robot: "/video/concat",
      use: {
        steps: segmentRefs,
      },
      preset: "iphone-high",
      ffmpeg_stack: "v6.0.0",
    };

    // Step 4: Add music track if provided
    if (musicUrl) {
      steps["add_music"] = {
        robot: "/video/encode",
        use: {
          steps: [
            { name: "concatenate", as: "video" },
            { name: "import_music", as: "audio" },
          ],
        },
        preset: "iphone-high",
        ffmpeg_stack: "v6.0.0",
        ffmpeg: {
          t: beatData.totalDuration || 15,
          shortest: true,
          "c:v": "copy",
          map: ["0:v:0", "1:a:0"],
        },
      };
    }
  } else {
    // Fallback: Simple processing without beat data
    console.log("No segments found, using simple processing...");
    
    steps["simple_encode"] = {
      robot: "/video/encode",
      use: "resize_0",
      preset: "iphone-high",
      ffmpeg_stack: "v6.0.0",
      ffmpeg: {
        t: 15,
        vf: "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black",
      },
    };

    if (musicUrl) {
      steps["add_music"] = {
        robot: "/video/encode",
        use: {
          steps: [
            { name: "simple_encode", as: "video" },
            { name: "import_music", as: "audio" },
          ],
        },
        preset: "iphone-high",
        ffmpeg_stack: "v6.0.0",
        ffmpeg: {
          t: 15,
          shortest: true,
        },
      };
    }
  }

  // Final export step - use Transloadit CDN
  const finalStep = musicUrl ? "add_music" : (beatData.segments?.length > 0 ? "concatenate" : "simple_encode");
  
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
      console.error("Missing Transloadit credentials");
      return new Response(
        JSON.stringify({ error: "Transloadit credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { projectId, clipsUrls, musicUrl, effects, beatData }: ProcessRequest = await req.json();
    
    console.log("=== APPLY VIDEO EFFECTS ===");
    console.log("Project ID:", projectId);
    console.log("Clips:", clipsUrls?.length);
    console.log("Music URL:", musicUrl ? "provided" : "none");
    console.log("Effects:", effects);
    console.log("Beat data segments:", beatData?.segments?.length);

    if (!clipsUrls || clipsUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: "No video clips provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!beatData) {
      return new Response(
        JSON.stringify({ error: "Beat data required. Run analyze-beats first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the assembly params
    const steps = buildTransloaditSteps(clipsUrls, musicUrl, beatData, projectId);
    
    console.log("Generated Transloadit steps:", Object.keys(steps));

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

    console.log("Creating Transloadit assembly...");

    const formData = new FormData();
    formData.append("params", JSON.stringify(params));
    formData.append("signature", signature);

    const response = await fetch("https://api2.transloadit.com/assemblies", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    
    if (result.error) {
      console.error("Transloadit error:", result);
      return new Response(
        JSON.stringify({ error: result.error, message: result.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Transloadit assembly created:", result.assembly_id);

    // Update project status
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
        message: `Processing ${beatData.segments?.length || 1} segments with ${beatData.effectTimings?.length || 0} effects at ${beatData.bpm || "unknown"} BPM`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing video effects:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process video effects", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
