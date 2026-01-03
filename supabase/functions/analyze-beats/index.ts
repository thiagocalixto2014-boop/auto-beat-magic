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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const targetDuration = 15;
    const numClips = clipsUrls?.length || 1;

    const analysisPrompt = `You are an expert music and video editing AI. Your task is to create a professional beat-synced video edit plan.
    
    STYLE: Professional Velocity Edit (similar to After Effects)
    
    MUSIC DETAILS:
    - Duration: ${musicDuration || 15} seconds
    - Template style: ${template}
    
    VIDEO DETAILS:
    - Number of clips available: ${numClips}
    - Effects to apply: ${effects?.join(", ") || "smooth-zoom, shake, flash"}
    
    YOUR TASK:
    1. Estimate BPM for "${template}" style.
    2. Identify "hard beats" for impact effects.
    3. Create clip segments (0.3s to 1.5s) that cut EXACTLY on the beat.
    4. Use "smooth-zoom" for professional exponential zooms.
    5. Use "shake" for impact beats.
    6. Use "flash" for transitions.
    
    RESPOND WITH ONLY A JSON OBJECT:
    {
      "bpm": <number>,
      "totalDuration": 15,
      "beats": [<timestamps>],
      "hardBeats": [<timestamps>],
      "segments": [{"start": 0, "end": 0.5, "clipIndex": 0}, ...],
      "effectTimings": [
        {"time": 0, "effect": "smooth-zoom", "intensity": 9},
        {"time": 2.0, "effect": "shake", "intensity": 8}
      ]
    }`;

    // Retry logic for transient errors (503, 429)
    let response: Response | null = null;
    let lastError: Error | null = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`AI Gateway attempt ${attempt}/${maxRetries}`);
      
      try {
        response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                content: "You are a professional video editor AI. Always respond with valid JSON only." 
              },
              { role: "user", content: analysisPrompt },
            ],
          }),
        });

        if (response.ok) {
          console.log("AI Gateway request successful");
          break;
        }
        
        // Handle specific error codes
        if (response.status === 503 || response.status === 429) {
          console.log(`AI Gateway returned ${response.status}, retrying in ${attempt * 2}s...`);
          lastError = new Error(`AI Gateway error: ${response.status}`);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, attempt * 2000));
            continue;
          }
        } else if (response.status === 402) {
          throw new Error("AI credits exhausted. Please add funds to continue.");
        } else {
          const errorText = await response.text();
          console.error("AI Gateway error:", response.status, errorText);
          throw new Error(`AI Gateway error: ${response.status}`);
        }
      } catch (fetchError) {
        console.error(`Attempt ${attempt} failed:`, fetchError);
        lastError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
        }
      }
    }

    if (!response || !response.ok) {
      console.log("AI Gateway failed after retries, using fallback beat data");
      // Use fallback data instead of failing completely
      const fallbackBeatData = {
        bpm: template === "phonk" ? 140 : template === "lofi" ? 85 : 128,
        totalDuration: targetDuration,
        beats: Array.from({ length: 32 }, (_, i) => i * 0.47),
        hardBeats: [0, 1.87, 3.75, 5.62, 7.5, 9.37, 11.25, 13.12],
        segments: clipsUrls?.map((_, i) => ({
          start: i * (targetDuration / numClips),
          end: (i + 1) * (targetDuration / numClips),
          clipIndex: i
        })) || [{ start: 0, end: targetDuration, clipIndex: 0 }],
        effectTimings: [
          { time: 0, effect: "smooth-zoom", intensity: 10 },
          { time: 1.87, effect: "shake", intensity: 8 },
          { time: 3.75, effect: "flash", intensity: 7 },
          { time: 5.62, effect: "smooth-zoom", intensity: 9 },
          { time: 7.5, effect: "shake", intensity: 8 }
        ]
      };

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase
        .from("projects")
        .update({
          beat_data: fallbackBeatData,
          status: "processing",
        })
        .eq("id", projectId);

      return new Response(
        JSON.stringify({ success: true, beatData: fallbackBeatData, usedFallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    let beatData = null;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      beatData = JSON.parse(jsonMatch[0]);
    }

    if (!beatData) {
      // Fallback logic (simplified for brevity)
      beatData = {
        bpm: 128,
        totalDuration: 15,
        beats: [0, 0.46, 0.93, 1.4, 1.87],
        hardBeats: [0, 1.87],
        segments: [{start: 0, end: 1.87, clipIndex: 0}],
        effectTimings: [{time: 0, effect: "smooth-zoom", intensity: 10}]
      };
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase
      .from("projects")
      .update({
        beat_data: beatData,
        status: "processing",
      })
      .eq("id", projectId);

    return new Response(
      JSON.stringify({ success: true, beatData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
