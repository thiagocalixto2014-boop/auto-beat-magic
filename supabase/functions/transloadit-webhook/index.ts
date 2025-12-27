import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");
    
    const body = await req.json();
    
    console.log("Transloadit webhook received:", {
      projectId,
      ok: body.ok,
      error: body.error,
      assembly_id: body.assembly_id,
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (body.ok === "ASSEMBLY_COMPLETED" && body.results?.exported) {
      // Get the output URL from the exported results
      const exportedFile = body.results.exported[0];
      const outputUrl = exportedFile?.ssl_url || exportedFile?.url;

      console.log("Assembly completed, output URL:", outputUrl);

      if (projectId && outputUrl) {
        const { error } = await supabase
          .from("projects")
          .update({ 
            status: "completed",
            output_url: outputUrl,
            updated_at: new Date().toISOString()
          })
          .eq("id", projectId);

        if (error) {
          console.error("Error updating project:", error);
        } else {
          console.log("Project updated successfully:", projectId);
        }
      }
    } else if (body.error) {
      console.error("Assembly error:", body.error, body.message);
      
      if (projectId) {
        await supabase
          .from("projects")
          .update({ 
            status: "error",
            updated_at: new Date().toISOString()
          })
          .eq("id", projectId);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
