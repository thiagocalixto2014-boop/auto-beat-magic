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
    const { projectId, musicUrl, clipsUrls, template, effects, musicDuration } = await req.json();

    console.log("=== BEAT ANALYSIS STARTING ===");
    console.log("Project ID:", projectId);
    console.log("Music URL:", musicUrl);
    console.log("Music Duration:", musicDuration);
    console.log("Clips count:", clipsUrls?.length);
    console.log("Template:", template);
    console.log("Effects:", effects);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Target output duration is 15 seconds
    const targetDuration = 15;
    const numClips = clipsUrls?.length || 1;

    // Use AI to analyze and generate beat-synced edit plan
    const analysisPrompt = `You are an expert music and video editing AI. Your task is to create a beat-synced video edit plan.

MUSIC DETAILS:
- Duration: ${musicDuration || 15} seconds (we'll use first 15 seconds)
- Template style: ${template}

VIDEO DETAILS:
- Number of clips available: ${numClips}
- Effects to apply: ${effects?.join(", ") || "none"}

YOUR TASK:
1. Estimate a typical BPM for "${template}" style music (e.g., trap = 140-160 BPM, EDM = 128 BPM, chill = 80-100 BPM)
2. Calculate exact beat timestamps for 15 seconds based on that BPM
3. Identify "hard beats" (downbeats, typically every 4 beats) where effects should trigger
4. Create clip segments that cut ON THE BEAT for maximum impact
5. Each clip segment should be short (0.5-2 seconds) for that "velocity edit" style

RESPOND WITH ONLY A JSON OBJECT (no markdown, no explanation):
{
  "bpm": <estimated BPM number>,
  "totalDuration": 15,
  "beats": [<array of ALL beat timestamps in seconds, e.g. 0, 0.5, 1.0, 1.5...>],
  "hardBeats": [<array of HARD/DOWNBEAT timestamps where effects trigger, typically every 4 beats>],
  "segments": [
    {"start": 0, "end": 0.5, "clipIndex": 0},
    {"start": 0.5, "end": 1.0, "clipIndex": 1}
  ],
  "effectTimings": [
    {"time": 0, "effect": "zoom", "intensity": 8},
    {"time": 2.0, "effect": "shake", "intensity": 10}
  ]
}

IMPORTANT RULES:
- segments must cover exactly 0 to 15 seconds with no gaps
- effectTimings should match hardBeats and use effects: ${effects?.join(", ") || "zoom, shake"}
- clipIndex should cycle through available clips (0 to ${numClips - 1})
- intensity should be 1-10, with 10 being strongest on hard drops`;

    console.log("Calling AI for beat analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a professional video editor AI specializing in beat-synced edits. You understand music theory, BPM detection, and velocity editing techniques. Always respond with valid JSON only, no markdown formatting." 
          },
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

    console.log("AI Response received:", content?.substring(0, 500));

    // Parse the AI response to extract beat data
    let beatData = null;
    try {
      // Clean up potential markdown formatting
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      
      // Try to extract JSON from the response
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        beatData = JSON.parse(jsonMatch[0]);
        console.log("Successfully parsed beat data:", JSON.stringify(beatData, null, 2));
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
    }

    // Fallback to default beat pattern if parsing failed
    if (!beatData) {
      console.log("Using fallback beat pattern...");
      const fallbackBPM = template === "hard-cuts" ? 150 : template === "smooth-zoom" ? 100 : 128;
      const beatInterval = 60 / fallbackBPM;
      const beats = [];
      const hardBeats = [];
      
      for (let t = 0; t < targetDuration; t += beatInterval) {
        beats.push(Math.round(t * 100) / 100);
        if (beats.length % 4 === 1) {
          hardBeats.push(Math.round(t * 100) / 100);
        }
      }
      
      // Create segments that cut on beats
      const segments = [];
      const segmentDuration = targetDuration / Math.min(numClips * 3, 20); // ~20 cuts for 15 seconds
      for (let i = 0; i < targetDuration; i += segmentDuration) {
        segments.push({
          start: Math.round(i * 100) / 100,
          end: Math.round(Math.min(i + segmentDuration, targetDuration) * 100) / 100,
          clipIndex: Math.floor((i / segmentDuration) % numClips),
        });
      }
      
      beatData = {
        bpm: fallbackBPM,
        totalDuration: targetDuration,
        beats,
        hardBeats,
        segments,
        effectTimings: hardBeats.map((time, i) => ({
          time,
          effect: effects?.[i % effects.length] || "zoom",
          intensity: time === 0 ? 10 : 7 + Math.floor(Math.random() * 3),
        })),
      };
    }

    // Validate and ensure segments cover full duration
    if (beatData.segments && beatData.segments.length > 0) {
      const lastSegment = beatData.segments[beatData.segments.length - 1];
      if (lastSegment.end < targetDuration) {
        lastSegment.end = targetDuration;
      }
    }

    console.log("Final beat data:", JSON.stringify(beatData, null, 2));

    // Update the project with beat data
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        beat_data: beatData,
        status: "analyzed",
      })
      .eq("id", projectId);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    console.log("=== BEAT ANALYSIS COMPLETE ===");

    return new Response(
      JSON.stringify({
        success: true,
        beatData,
        message: `Beat analysis complete. BPM: ${beatData.bpm}, ${beatData.beats?.length || 0} beats, ${beatData.segments?.length || 0} segments`,
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
