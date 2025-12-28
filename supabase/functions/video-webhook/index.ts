import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");

    if (!projectId) {
      throw new Error("Missing projectId");
    }

    const body = await req.json();
    
    console.log("=== VIDEO PROCESSOR WEBHOOK ===");
    console.log("Project ID:", projectId);
    console.log("Event:", body.event);
    console.log("Status:", body.status);
    console.log("Full body:", JSON.stringify(body, null, 2));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Edit Labs Video Processor webhook - check for success or outputUrl
    // The processor may send: { success: true, outputUrl: "..." } without event field
    const isSuccess = body.success === true || body.event === "job.completed" || body.status === "completed";
    const isFailed = body.event === "job.failed" || body.status === "failed" || body.status === "error";

    if (isSuccess && body.outputUrl) {
      console.log("Job completed successfully");
      
      const outputUrl = body.outputUrl;
      console.log("Output URL:", outputUrl);

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
      } else {
        console.log("Project updated to completed with URL:", outputUrl);
      }
    } else if (isFailed) {
      console.error("Job failed:", body.error || body.message);

      await supabase
        .from("projects")
        .update({ 
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);
    } else {
      console.log("Unknown webhook format, body:", JSON.stringify(body));
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
