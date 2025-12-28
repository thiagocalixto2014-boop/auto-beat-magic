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
    
    console.log("=== COCONUT WEBHOOK ===");
    console.log("Project ID:", projectId);
    console.log("Event:", body.event);
    console.log("Full body:", JSON.stringify(body, null, 2));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Coconut webhook events:
    // - job.completed: All outputs are done
    // - job.failed: Job failed
    // - output.completed: Single output is done

    if (body.event === "job.completed") {
      console.log("Job completed successfully");
      
      let outputUrl = null;
      
      // Try to find the output URL from various possible locations in the response
      // Coconut can return URLs in different formats depending on the API version
      
      // Check outputs array
      if (body.outputs && Array.isArray(body.outputs)) {
        for (const output of body.outputs) {
          if (output.url) {
            outputUrl = output.url;
            break;
          }
          if (output.urls && output.urls.length > 0) {
            outputUrl = output.urls[0];
            break;
          }
        }
      }
      
      // Check outputs object (keyed by format)
      if (!outputUrl && body.outputs && typeof body.outputs === "object") {
        for (const key of Object.keys(body.outputs)) {
          const output = body.outputs[key];
          if (output?.url) {
            outputUrl = output.url;
            break;
          }
        }
      }

      // Check data.outputs format
      if (!outputUrl && body.data?.outputs) {
        const outputs = body.data.outputs;
        for (const key of Object.keys(outputs)) {
          if (outputs[key]?.url) {
            outputUrl = outputs[key].url;
            break;
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
    } else if (body.event === "job.failed" || body.status === "error") {
      console.error("Job failed:", body.error || body.message);

      await supabase
        .from("projects")
        .update({ 
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);
    } else if (body.event === "output.completed") {
      console.log("Single output completed:", body.output);
      // We'll wait for job.completed to finalize
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
