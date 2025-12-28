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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (body.event === "job.completed") {
      let outputUrl = null;
      
      // Extract output URL from Coconut response
      if (body.outputs && body.outputs.length > 0) {
        const videoOutput = body.outputs.find((o: any) => o.key === "video_output" || !o.key);
        outputUrl = videoOutput?.url || videoOutput?.urls?.[0];
      }

      if (outputUrl) {
        await supabase
          .from("projects")
          .update({
            status: "completed",
            output_url: outputUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", projectId);
      }
    } else if (body.event === "job.failed") {
      await supabase
        .from("projects")
        .update({ 
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);
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
