import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Edit Labs Video Processor Server
const VIDEO_PROCESSOR_URL = "http://188.34.136.38";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { projectId, jobId } = body;

    if (!projectId || !jobId) {
      throw new Error("Missing projectId or jobId");
    }

    console.log("Checking status for job:", jobId, "project:", projectId);

    // Check job status on the external server
    const statusResponse = await fetch(`${VIDEO_PROCESSOR_URL}/api/status/${jobId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!statusResponse.ok) {
      console.error("Status check failed:", statusResponse.status);
      return new Response(
        JSON.stringify({ success: false, status: "unknown", error: "Failed to check status" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const statusResult = await statusResponse.json();
    console.log("Status result:", JSON.stringify(statusResult));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if job is completed
    const outputUrl = statusResult.outputUrl || statusResult.output_url || statusResult.url;
    const isCompleted = statusResult.status === "completed" || statusResult.success === true || outputUrl;
    const isFailed = statusResult.status === "failed" || statusResult.status === "error";

    if (isCompleted && outputUrl) {
      console.log("Job completed! Output URL:", outputUrl);
      
      // Update project with output URL
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          status: "completed",
          output_url: outputUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      if (updateError) {
        console.error("Error updating project:", updateError);
      }

      return new Response(
        JSON.stringify({ success: true, status: "completed", outputUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (isFailed) {
      console.log("Job failed");
      
      await supabase
        .from("projects")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      return new Response(
        JSON.stringify({ success: false, status: "failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Still processing
    return new Response(
      JSON.stringify({ 
        success: true, 
        status: statusResult.status || "processing",
        progress: statusResult.progress || null
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error checking status:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
