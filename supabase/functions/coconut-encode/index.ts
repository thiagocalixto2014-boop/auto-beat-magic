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

// Build FFmpeg filter complex for beat-synced editing
function buildFFmpegCommand(
  beatData: BeatData,
  effects: string[],
  totalDuration: number
): string {
  if (!beatData.segments?.length) {
    // Simple encode without beat sync
    return `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920`;
  }

  const filters: string[] = [];
  const segments = beatData.segments;
  const effectTimings = beatData.effectTimings || [];

  // Create trim filters for each segment
  segments.forEach((segment, i) => {
    const duration = segment.end - segment.start;
    let segmentFilter = `[0:v]trim=start=0:duration=${duration},setpts=PTS-STARTPTS`;

    // Check if this segment has an effect timing
    const effectTiming = effectTimings.find(
      (e) => e.time >= segment.start && e.time < segment.end
    );

    if (effectTiming && effects.includes(effectTiming.effect)) {
      const filter = getEffectFilter(effectTiming.effect, effectTiming.intensity);
      if (filter) {
        segmentFilter += `,${filter}`;
      }
    }

    // Add resize/crop for vertical format
    segmentFilter += `,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920`;
    segmentFilter += `[v${i}]`;
    filters.push(segmentFilter);
  });

  // Concatenate all segments
  const concatInputs = segments.map((_, i) => `[v${i}]`).join("");
  filters.push(`${concatInputs}concat=n=${segments.length}:v=1:a=0[outv]`);

  return filters.join("; ");
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

    // Build the Coconut job configuration
    // Using simple approach first - concatenation will be done via filter_complex if needed
    const outputs: Record<string, string> = {};
    
    // Output to Supabase Storage via signed URL or direct public bucket
    const outputFileName = `${projectId}_${Date.now()}.mp4`;
    const outputPath = `outputs/${outputFileName}`;
    
    // For now, use Coconut's S3-compatible upload or HTTP upload
    // We'll use a webhook to get the result URL
    const outputUrl = `https://ffzrezqwdlafysmhlzwq.supabase.co/storage/v1/object/public/outputs/${outputFileName}`;

    // Build FFmpeg filter for effects
    let videoFilter = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920";
    
    if (beatData?.segments?.length && beatData?.effectTimings?.length) {
      // For beat-synced edits, we need to apply effects at specific times
      // Coconut supports filter_complex for advanced processing
      const effectFilters: string[] = [];
      
      beatData.effectTimings.forEach((timing) => {
        if (effects.includes(timing.effect)) {
          const filter = getEffectFilter(timing.effect, timing.intensity);
          if (filter) {
            effectFilters.push(filter);
          }
        }
      });
      
      if (effectFilters.length > 0) {
        // Apply first effect filter (simplified - Coconut handles complex filter graphs)
        videoFilter = `${videoFilter},${effectFilters[0]}`;
      }
    }

    // Coconut job configuration
    // Reference: https://docs.coconut.co/
    const coconutJob: Record<string, unknown> = {
      input: {
        url: mainClipUrl,
      },
      outputs: {
        // mp4 output with vertical format (1080x1920)
        "mp4:1080x1920": {
          url: `${supabaseUrl}/storage/v1/object/outputs/${outputFileName}`,
          // Use webhook for delivery notification
          key: "video_output",
          duration: totalDuration,
          video_filters: videoFilter,
        },
      },
      notification: {
        type: "http",
        url: `${supabaseUrl}/functions/v1/coconut-webhook?projectId=${projectId}`,
      },
    };

    // If we have music, add audio input
    if (musicUrl) {
      coconutJob.inputs = {
        video: { url: mainClipUrl },
        audio: { url: musicUrl },
      };
      delete coconutJob.input;
      
      // Update output to merge audio
      (coconutJob.outputs as Record<string, unknown>)["mp4:1080x1920"] = {
        ...((coconutJob.outputs as Record<string, unknown>)["mp4:1080x1920"] as Record<string, unknown>),
        audio: "audio", // Use the audio input
      };
    }

    console.log("Coconut job config:", JSON.stringify(coconutJob, null, 2));

    // Submit job to Coconut API
    const coconutResponse = await fetch("https://api.coconut.co/v2/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(COCONUT_API_KEY + ":")}`,
      },
      body: JSON.stringify(coconutJob),
    });

    if (!coconutResponse.ok) {
      const errorText = await coconutResponse.text();
      console.error("Coconut API error:", errorText);
      
      await supabase
        .from("projects")
        .update({ status: "failed" })
        .eq("id", projectId);
        
      throw new Error(`Coconut API error: ${errorText}`);
    }

    const coconutResult = await coconutResponse.json();
    console.log("Coconut job created:", coconutResult.id);

    return new Response(
      JSON.stringify({
        success: true,
        jobId: coconutResult.id,
        message: "Video encoding started",
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
