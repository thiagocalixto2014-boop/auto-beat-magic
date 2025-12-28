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

    // Edit Labs Video Processor webhook events:
    // - job.completed: Processing is done
    // - job.failed: Processing failed

    if (body.event === "job.completed" || body.status === "completed") {
      console.log("Job completed successfully");
      
      let outputUrl = null;
      
      // Extract output URL from Edit Labs Video Processor response
      // The processor sends outputUrl directly or in outputs.mp4.url
      
      // Direct outputUrl field
      if (body.outputUrl) {
        outputUrl = body.outputUrl;
      }
      
      // Check outputs object
      if (!outputUrl && body.outputs) {
        if (body.outputs.mp4?.url) {
          outputUrl = body.outputs.mp4.url;
        } else if (typeof body.outputs === "object") {
          for (const key of Object.keys(body.outputs)) {
            if (body.outputs[key]?.url) {
              outputUrl = body.outputs[key].url;
              break;
            }
          }
        }
      }

      console.log("Extracted output URL:", outputUrl);

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
    } else if (body.event === "job.failed" || body.status === "failed" || body.status === "error") {
      console.error("Job failed:", body.error || body.message);

      await supabase
        .from("projects")
        .update({ 
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);
    } else {
      console.log("Received event:", body.event);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
