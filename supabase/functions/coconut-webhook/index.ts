import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");

    if (!projectId) {
      console.error("No projectId in webhook URL");
      return new Response(
        JSON.stringify({ error: "Missing projectId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    
    console.log("=== COCONUT WEBHOOK ===");
    console.log("Project ID:", projectId);
    console.log("Event:", body.event);
    console.log("Status:", body.status);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Coconut webhook events:
    // - job.completed: All outputs are done
    // - job.failed: Job failed
    // - output.completed: Single output is done
    // - output.failed: Single output failed

    if (body.event === "job.completed") {
      console.log("Job completed successfully");
      
      // Find the output URL from the completed outputs
      let outputUrl = null;
      
      if (body.outputs && body.outputs.length > 0) {
        // Get the first video output
        const videoOutput = body.outputs.find((o: { key?: string }) => 
          o.key === "video_output" || !o.key
        );
        
        if (videoOutput?.url) {
          outputUrl = videoOutput.url;
        } else if (videoOutput?.urls?.length > 0) {
          outputUrl = videoOutput.urls[0];
        }
      }

      // Also check data.outputs format
      if (!outputUrl && body.data?.outputs) {
        const outputs = body.data.outputs;
        for (const key of Object.keys(outputs)) {
          if (outputs[key]?.url) {
            outputUrl = outputs[key].url;
            break;
          }
        }
      }

      console.log("Output URL:", outputUrl);

      const { error: updateError } = await supabase
        .from("projects")
        .update({
          status: "completed",
          output_url: outputUrl,
        })
        .eq("id", projectId);

      if (updateError) {
        console.error("Error updating project:", updateError);
      } else {
        console.log("Project updated to completed");
      }
    } else if (body.event === "job.failed" || body.status === "error") {
      console.error("Job failed:", body.error || body.message);

      await supabase
        .from("projects")
        .update({ status: "failed" })
        .eq("id", projectId);
    } else if (body.event === "output.completed") {
      console.log("Output completed:", body.output);
      
      // For single output completion, we can update incrementally
      // But we'll wait for job.completed to finalize
    } else {
      console.log("Unhandled event type:", body.event);
      console.log("Full body:", JSON.stringify(body, null, 2));
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
