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
    
    // Transloadit sends form-urlencoded data, not JSON
    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, unknown>;
    
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      const transloaditData = formData.get("transloadit");
      if (typeof transloaditData === "string") {
        body = JSON.parse(transloaditData);
      } else {
        throw new Error("No transloadit data in form");
      }
    } else if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      // Try to parse as text and handle both formats
      const text = await req.text();
      if (text.startsWith("transloadit=")) {
        const decoded = decodeURIComponent(text.replace("transloadit=", ""));
        body = JSON.parse(decoded);
      } else {
        body = JSON.parse(text);
      }
    }
    
    console.log("Transloadit webhook received:", {
      projectId,
      ok: body.ok,
      error: body.error,
      assembly_id: body.assembly_id,
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (body.ok === "ASSEMBLY_COMPLETED" && body.results) {
      // Get the output URL from the exported results
      const results = body.results as Record<string, Array<{ ssl_url?: string; url?: string }>>;
      const exportedFile = results.exported?.[0];
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
        const { error: updateError } = await supabase
          .from("projects")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", projectId);

        if (updateError) {
          console.error("Error marking project failed:", updateError);
        }
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
