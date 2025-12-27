import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as crypto from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EffectRequest {
  videoUrl: string;
  effects: string[];
  projectId: string;
  outputBucket?: string;
}

// Generate Transloadit signature
async function generateSignature(params: Record<string, unknown>, authSecret: string): Promise<string> {
  const paramsString = JSON.stringify(params);
  const encoder = new TextEncoder();
  const key = encoder.encode(authSecret);
  const data = encoder.encode(paramsString);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-384" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, data);
  const hashArray = Array.from(new Uint8Array(signature));
  return "sha384:" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Build Transloadit steps based on effects
function buildTransloaditSteps(effects: string[], videoUrl: string) {
  const steps: Record<string, unknown> = {
    ":original": {
      robot: "/http/import",
      url: videoUrl,
    },
  };

  let previousStep = ":original";

  effects.forEach((effect, index) => {
    const stepName = `effect_${index}`;
    
    switch (effect) {
      case "shake":
        // Camera shake effect using FFmpeg filter
        steps[stepName] = {
          robot: "/video/encode",
          use: previousStep,
          preset: "hls-1080p",
          ffmpeg_stack: "v6.0.0",
          ffmpeg: {
            vf: "crop=iw-20:ih-20:10+random(1)*10:10+random(1)*10,scale=iw+20:ih+20",
            // Additional shake parameters for more intensity
            "filter_complex": null,
          },
        };
        break;
        
      case "shake-light":
        steps[stepName] = {
          robot: "/video/encode",
          use: previousStep,
          preset: "hls-1080p",
          ffmpeg_stack: "v6.0.0",
          ffmpeg: {
            vf: "crop=iw-8:ih-8:4+random(1)*4:4+random(1)*4,scale=iw+8:ih+8",
          },
        };
        break;
        
      case "shake-heavy":
        steps[stepName] = {
          robot: "/video/encode",
          use: previousStep,
          preset: "hls-1080p",
          ffmpeg_stack: "v6.0.0",
          ffmpeg: {
            vf: "crop=iw-40:ih-40:20+random(1)*20:20+random(1)*20,scale=iw+40:ih+40",
          },
        };
        break;
        
      case "zoom":
        steps[stepName] = {
          robot: "/video/encode",
          use: previousStep,
          preset: "hls-1080p",
          ffmpeg_stack: "v6.0.0",
          ffmpeg: {
            vf: "scale=iw*1.2:ih*1.2,crop=iw/1.2:ih/1.2",
          },
        };
        break;
        
      case "reverse":
        steps[stepName] = {
          robot: "/video/encode",
          use: previousStep,
          preset: "hls-1080p",
          ffmpeg_stack: "v6.0.0",
          ffmpeg: {
            vf: "reverse",
            af: "areverse",
          },
        };
        break;
        
      default:
        console.log(`Unknown effect: ${effect}`);
        return;
    }
    
    previousStep = stepName;
  });

  // Final export step
  steps["exported"] = {
    robot: "/s3/store",
    use: previousStep,
    credentials: "supabase_storage",
    path: "outputs/${unique_prefix}/${file.url_name}",
  };

  return steps;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authKey = Deno.env.get("TRANSLOADIT_AUTH_KEY");
    const authSecret = Deno.env.get("TRANSLOADIT_AUTH_SECRET");
    
    if (!authKey || !authSecret) {
      console.error("Missing Transloadit credentials");
      return new Response(
        JSON.stringify({ error: "Transloadit credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { videoUrl, effects, projectId }: EffectRequest = await req.json();
    
    console.log("Processing video effects:", { videoUrl, effects, projectId });

    if (!videoUrl || !effects || effects.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing videoUrl or effects" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the assembly params
    const steps = buildTransloaditSteps(effects, videoUrl);
    
    const params = {
      auth: {
        key: authKey,
        expires: new Date(Date.now() + 3600000).toISOString().replace(/\.\d{3}Z$/, "+00:00"),
      },
      steps,
      notify_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/transloadit-webhook?projectId=${projectId}`,
    };

    const signature = await generateSignature(params, authSecret);

    console.log("Creating Transloadit assembly...");

    // Create the assembly
    const formData = new FormData();
    formData.append("params", JSON.stringify(params));
    formData.append("signature", signature);

    const response = await fetch("https://api2.transloadit.com/assemblies", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    
    console.log("Transloadit assembly created:", result.assembly_id);

    if (result.error) {
      console.error("Transloadit error:", result);
      return new Response(
        JSON.stringify({ error: result.error, message: result.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update project status
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase
      .from("projects")
      .update({ 
        status: "processing",
        updated_at: new Date().toISOString()
      })
      .eq("id", projectId);

    return new Response(
      JSON.stringify({
        success: true,
        assemblyId: result.assembly_id,
        assemblyUrl: result.assembly_ssl_url,
        status: result.ok,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing video effects:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process video effects", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
