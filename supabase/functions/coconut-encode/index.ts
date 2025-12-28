import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Edit Labs Video Processor Server
const VIDEO_PROCESSOR_URL = "http://188.34.136.38/api/process";

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
    const { projectId, clipsUrls, musicUrl, effects, beatData } = body;

    if (!projectId || !clipsUrls?.length) {
      throw new Error("Missing projectId or clipsUrls");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update project status to processing
    await supabase
      .from("projects")
      .update({ status: "processing" })
      .eq("id", projectId);

    console.log("=== SENDING TO EDIT LABS VIDEO PROCESSOR ===");
    console.log("Project ID:", projectId);
    console.log("Input URL:", clipsUrls[0]);
    console.log("Effects:", effects);
    console.log("Beat Data:", JSON.stringify(beatData, null, 2));

    // Build webhook URL for the processor to call back
    const webhookUrl = `${supabaseUrl}/functions/v1/coconut-webhook?projectId=${projectId}`;

    // Send to our custom video processor server
    const processorPayload = {
      projectId,
      inputUrl: clipsUrls[0],
      musicUrl: musicUrl || null,
      effects: effects || ["zoom", "shake"],
      beatData: {
        bpm: beatData?.bpm || 120,
        totalDuration: beatData?.totalDuration || 15,
        beats: beatData?.beats || [],
        hardBeats: beatData?.hardBeats || [],
      },
      webhookUrl,
    };

    console.log("Processor payload:", JSON.stringify(processorPayload, null, 2));

    const processorResponse = await fetch(VIDEO_PROCESSOR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(processorPayload),
    });

    const responseText = await processorResponse.text();
    console.log("=== VIDEO PROCESSOR RESPONSE ===");
    console.log("Status:", processorResponse.status);
    console.log("Response:", responseText);

    if (!processorResponse.ok) {
      throw new Error(`Video processor error: ${responseText}`);
    }

    const processorResult = JSON.parse(responseText);

    if (!processorResult.success) {
      throw new Error(processorResult.error || "Video processing failed to start");
    }

    return new Response(
      JSON.stringify({
        success: true,
        jobId: processorResult.jobId,
        message: "Video processing started on Edit Labs server",
        expectedOutput: processorResult.expectedOutput,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
