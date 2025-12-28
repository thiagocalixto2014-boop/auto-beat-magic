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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { projectId, clipsUrls, musicUrl, beatData } = body;

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

    // Build Coconut Job with CORRECT format based on documentation
    // Format: mp4:WIDTHxHEIGHT for custom resolution (9:16 vertical = 1080x1920)
    // Storage: "coconut" for test storage (files available for 24h)
    // Path: REQUIRED - where the file will be uploaded
    
    const outputPath = `/editlabs/${projectId}_${Date.now()}.mp4`;
    const duration = beatData?.totalDuration || 15;

    const coconutJob = {
      input: {
        url: clipsUrls[0],
      },
      storage: {
        service: "coconut",
      },
      notification: {
        type: "http",
        url: `${supabaseUrl}/functions/v1/coconut-webhook?projectId=${projectId}`,
      },
      outputs: {
        // Using standard format: mp4:1080x1920 for 9:16 vertical video
        // The key is the format spec, path is where to save
        "mp4:1080x1920": {
          path: outputPath,
          duration: duration,
          fit: "crop", // Crop to fit instead of padding
        },
      },
    };

    console.log("=== COCONUT JOB CONFIG ===");
    console.log(JSON.stringify(coconutJob, null, 2));

    const coconutResponse = await fetch("https://api.coconut.co/v2/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(COCONUT_API_KEY + ":")}`,
      },
      body: JSON.stringify(coconutJob),
    });

    const responseText = await coconutResponse.text();
    console.log("=== COCONUT API RESPONSE ===");
    console.log(responseText);
    
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
