import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Loader2, Music, Zap, Video, AudioWaveform } from "lucide-react";

interface BeatData {
  bpm: number;
  totalDuration: number;
  beats: number[];
  hardBeats: number[];
  segments: Array<{ start: number; end: number; clipIndex: number }>;
  effectTimings: Array<{ time: number; effect: string; intensity: number }>;
}

interface Project {
  id: string;
  status: string;
  music_url: string | null;
  music_duration: number | null;
  clips_urls: string[] | null;
  template: string;
  effects: string[];
  output_url: string | null;
  beat_data: BeatData | null;
}

interface GenerateStepProps {
  project: Project;
  onUpdate: (updates: Partial<Project>) => void;
  onBack: () => void;
}

const processingSteps = [
  { id: "analyzing", label: "Analyzing music BPM & beats", icon: AudioWaveform, progress: 20 },
  { id: "detecting", label: "Finding best clip moments", icon: Zap, progress: 40 },
  { id: "syncing", label: "Syncing cuts to beat drops", icon: Music, progress: 60 },
  { id: "effects", label: "Applying professional effects", icon: Sparkles, progress: 80 },
  { id: "rendering", label: "Rendering 9:16 phone format", icon: Video, progress: 100 },
];

export const GenerateStep = ({ project, onUpdate, onBack }: GenerateStepProps) => {
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [beatInfo, setBeatInfo] = useState<string | null>(null);

  useEffect(() => {
    if (project.status === "processing" || project.status === "analyzed") {
      setProcessing(true);
    }
  }, [project.status]);

  const animateProgress = async (fromStep: number, toStep: number) => {
    for (let i = fromStep; i <= toStep; i++) {
      setCurrentStep(i);
      const targetProgress = processingSteps[i].progress;
      const startProgress = i === 0 ? 0 : processingSteps[i - 1].progress;
      
      for (let p = startProgress; p <= targetProgress; p += 3) {
        setProgress(p);
        await new Promise((r) => setTimeout(r, 80));
      }
      
      if (i < toStep) {
        await new Promise((r) => setTimeout(r, 800));
      }
    }
  };

  const startGeneration = async () => {
    setProcessing(true);
    setProgress(0);
    setCurrentStep(0);
    
    try {
      if (!project.clips_urls || project.clips_urls.length === 0) {
        throw new Error("No video clips uploaded");
      }

      // Step 1: Analyze beats with AI
      toast.info("Analyzing music beats with AI...");
      await animateProgress(0, 1);

      const { data: beatAnalysis, error: beatError } = await supabase.functions.invoke("analyze-beats", {
        body: {
          projectId: project.id,
          musicUrl: project.music_url,
          clipsUrls: project.clips_urls,
          template: project.template,
          effects: project.effects,
          musicDuration: project.music_duration || 15,
        },
      });

      if (beatError) throw new Error("Failed to analyze beats: " + beatError.message);
      if (!beatAnalysis?.success) throw new Error(beatAnalysis?.error || "Beat analysis failed");

      const beatData = beatAnalysis.beatData as BeatData;
      setBeatInfo(`${beatData.bpm} BPM • ${beatData.beats?.length || 0} beats • ${beatData.segments?.length || 0} cuts`);
      
      onUpdate({ 
        beat_data: beatData,
        status: "analyzed" 
      });

      // Step 2-3: Animate finding moments and syncing
      await animateProgress(2, 3);

      // Step 4: Apply professional effects and render using Transloadit
      toast.info("Applying professional effects...");
      
      const { data: processResult, error: processError } = await supabase.functions.invoke("apply-video-effects", {
        body: {
          projectId: project.id,
          clipsUrls: project.clips_urls,
          musicUrl: project.music_url,
          effects: project.effects,
          beatData: beatData,
        },
      });

      if (processError) throw new Error("Failed to process video: " + processError.message);
      if (!processResult?.success) throw new Error(processResult?.error || "Video processing failed");

      // Animate remaining progress
      await animateProgress(4, 4);

      toast.success("Video processing started! This may take a few minutes.");
      onUpdate({ status: "processing" });

    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to start processing");
      setProcessing(false);
      onUpdate({ status: "draft" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {processing ? "Creating Your Beat-Synced Edit" : "Ready to Generate"}
        </h2>
        <p className="text-muted-foreground">
          {processing
            ? "AI is analyzing beats and syncing your clips"
            : "Click below to start the AI beat-sync editing process"}
        </p>
        {beatInfo && (
          <p className="text-purple-light font-medium mt-2">{beatInfo}</p>
        )}
      </div>

      {processing ? (
        <Card className="p-8 bg-card/60 border-purple-main/20">
          <div className="space-y-6">
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {progress}% complete
              </p>
            </div>

            <div className="space-y-3">
              {processingSteps.map((step, index) => {
                const isActive = index === currentStep;
                const isComplete = index < currentStep;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-purple-main/10 border border-purple-main/30"
                        : isComplete
                        ? "opacity-60"
                        : "opacity-30"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isActive
                          ? "bg-gradient-purple"
                          : isComplete
                          ? "bg-purple-main/50"
                          : "bg-secondary"
                      }`}
                    >
                      {isActive ? (
                        <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
                      ) : (
                        <step.icon
                          className={`w-5 h-5 ${
                            isComplete ? "text-primary-foreground" : "text-muted-foreground"
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`font-medium ${
                        isActive ? "text-purple-light" : ""
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-12 bg-card/60 border-purple-main/20 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-purple mx-auto mb-6 flex items-center justify-center shadow-glow">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">AI Beat-Sync Editor</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Our AI will analyze your music's BPM, detect hard beats, and automatically 
            cut your clips in perfect sync. Output: 15 seconds, 9:16 phone format.
          </p>
          <div className="space-y-3">
            <Button
              onClick={startGeneration}
              className="bg-gradient-purple hover:opacity-90 gap-2 px-8 py-6 text-lg"
            >
              <Sparkles className="w-5 h-5" />
              Generate Beat-Synced Edit
            </Button>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>✓ Auto-detect BPM & hard beats</p>
              <p>✓ Cut clips on beat drops</p>
              <p>✓ Apply effects synced to rhythm</p>
              <p>✓ 9:16 vertical phone format</p>
            </div>
          </div>
        </Card>
      )}

      {!processing && (
        <div className="flex justify-start">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Effects
          </Button>
        </div>
      )}
    </div>
  );
};
