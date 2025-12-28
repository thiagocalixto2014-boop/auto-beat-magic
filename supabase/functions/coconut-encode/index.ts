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

    // Build Coconut Job with CORRECT format based on official documentation
    // https://docs.coconut.co/jobs/outputs-videos
    // 
    // Key insights from docs:
    // 1. Storage "coconut" is for testing (24h availability)
    // 2. "path" is REQUIRED for every output
    // 3. Use "resolution" parameter for custom sizes like "1080x1920"
    // 4. Use "fit": "crop" to avoid black bars
    // 5. Format key should be simple like "mp4" with parameters inside
    
    const outputPath = `/editlabs/${projectId}_${Date.now()}.mp4`;
    const duration = beatData?.totalDuration || 15;

    // Correct Coconut API v2 job configuration
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
        // Use simple format key "mp4" with parameters inside the object
        "mp4": {
          path: outputPath,
          resolution: "1080x1920",  // 9:16 vertical format
          fit: "crop",              // Crop to fit instead of padding
          duration: duration,       // Max duration in seconds
          quality: 4,               // Good quality (1-5 scale)
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

    // Store the job ID in the project for tracking
    await supabase
      .from("projects")
      .update({ 
        status: "processing",
        // Store job ID if you have a field for it
      })
      .eq("id", projectId);

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
