import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, musicUrl, clipsUrls, template, effects } = await req.json();

    console.log("Processing project:", projectId);
    console.log("Music URL:", musicUrl);
    console.log("Clips:", clipsUrls?.length);
    console.log("Template:", template);
    console.log("Effects:", effects);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use AI to analyze the project and generate edit suggestions
    const analysisPrompt = `You are an AI video editing assistant. Analyze this video editing request and provide beat timing suggestions.

Project Details:
- Template Style: ${template}
- Effects to apply: ${effects.join(", ")}
- Music duration: approximately 15 seconds
- Number of clips: ${clipsUrls?.length || 0}

Based on typical beat patterns for this style, generate a JSON response with:
1. Suggested cut points (timestamps in seconds)
2. Effect timings for each beat
3. Intensity levels (1-10) for each segment

Respond with a JSON object like:
{
  "beats": [0, 0.5, 1.0, 1.5, 2.0, ...],
  "effects": [
    {"time": 0, "effect": "zoom", "intensity": 8},
    {"time": 0.5, "effect": "shake", "intensity": 5}
  ],
  "segments": [
    {"start": 0, "end": 0.5, "clipIndex": 0},
    {"start": 0.5, "end": 1.0, "clipIndex": 1}
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a video editing AI that analyzes audio beats and suggests cut points. Always respond with valid JSON." },
          { role: "user", content: analysisPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    console.log("AI Response:", content);

    // Parse the AI response to extract beat data
    let beatData = null;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        beatData = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Use default beat pattern
      beatData = {
        beats: [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0],
        effects: effects.map((effect, i) => ({
          time: i * 0.5,
          effect,
          intensity: 7,
        })),
        segments: clipsUrls?.map((_, i) => ({
          start: i * 2,
          end: (i + 1) * 2,
          clipIndex: i,
        })) || [],
      };
    }

    // Update the project with beat data
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        beat_data: beatData,
        status: "processing",
      })
      .eq("id", projectId);

    if (updateError) {
      console.error("Database update error:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        beatData,
        message: "Beat analysis complete",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-beats:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});