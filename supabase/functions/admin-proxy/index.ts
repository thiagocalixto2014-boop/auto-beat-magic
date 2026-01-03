import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SERVER_BASE_URL = "http://188.34.136.38";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint");

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: "Missing endpoint parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let targetUrl: string;
    
    switch (endpoint) {
      case "health":
        targetUrl = `${SERVER_BASE_URL}/health`;
        break;
      case "queue":
        targetUrl = `${SERVER_BASE_URL}/api/queue/status`;
        break;
      case "job":
        const jobId = url.searchParams.get("jobId");
        if (!jobId) {
          return new Response(
            JSON.stringify({ error: "Missing jobId parameter" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        targetUrl = `${SERVER_BASE_URL}/api/job/${jobId}`;
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid endpoint" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    console.log(`Proxying request to: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to connect to server",
        details: error.message 
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
