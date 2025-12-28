import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Edit Labs Video Processor Server
const VIDEO_PROCESSOR_URL = "http://188.34.136.38/api/process";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { projectId, clipsUrls, musicUrl, effects, beatData } = body;

    if (!projectId || !clipsUrls?.length) {
      throw new Error("Missing projectId or clipsUrls");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.from("projects").update({ status: "processing" }).eq("id", projectId);

    const webhookUrl = `${supabaseUrl}/functions/v1/coconut-webhook?projectId=${projectId}`;

    console.log("Sending to Edit Labs processor:", VIDEO_PROCESSOR_URL);
    console.log("Project ID:", projectId);
    console.log("Input URL:", clipsUrls[0]);

    const processorResponse = await fetch(VIDEO_PROCESSOR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      }),
    });

    const processorResult = await processorResponse.json();

    console.log("Processor response:", processorResult);

    if (!processorResponse.ok || !processorResult.success) {
      throw new Error(processorResult.error || "Video processing failed");
    }

    return new Response(
      JSON.stringify({ success: true, jobId: processorResult.jobId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
