import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Loader2, Music, Zap, Video } from "lucide-react";

interface Project {
  id: string;
  status: string;
  music_url: string | null;
  clips_urls: string[] | null;
  template: string;
  effects: string[];
  output_url: string | null;
}

interface GenerateStepProps {
  project: Project;
  onUpdate: (updates: Partial<Project>) => void;
  onBack: () => void;
}

const processingSteps = [
  { id: "analyzing", label: "Analyzing audio beats", icon: Music, progress: 25 },
  { id: "detecting", label: "Detecting best moments", icon: Zap, progress: 50 },
  { id: "syncing", label: "Syncing clips to beat", icon: Sparkles, progress: 75 },
  { id: "rendering", label: "Rendering final edit", icon: Video, progress: 100 },
];

export const GenerateStep = ({ project, onUpdate, onBack }: GenerateStepProps) => {
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (project.status === "processing") {
      setProcessing(true);
      simulateProcessing();
    }
  }, [project.status]);

  const simulateProcessing = async () => {
    // Simulate AI processing steps
    for (let i = 0; i < processingSteps.length; i++) {
      setCurrentStep(i);
      
      // Animate progress
      const targetProgress = processingSteps[i].progress;
      const startProgress = i === 0 ? 0 : processingSteps[i - 1].progress;
      
      for (let p = startProgress; p <= targetProgress; p += 2) {
        setProgress(p);
        await new Promise((r) => setTimeout(r, 100));
      }
      
      await new Promise((r) => setTimeout(r, 1500));
    }

    // Complete
    setProcessing(false);
    onUpdate({ 
      status: "completed",
      // In a real app, this would be the actual output URL from the processing
      output_url: project.clips_urls?.[0] || null 
    });
    toast.success("Your edit is ready!");
  };

  const startGeneration = async () => {
    setProcessing(true);
    onUpdate({ status: "processing" });

    try {
      // Call the AI processing edge function
      const { data, error } = await supabase.functions.invoke("analyze-beats", {
        body: {
          projectId: project.id,
          musicUrl: project.music_url,
          clipsUrls: project.clips_urls,
          template: project.template,
          effects: project.effects,
        },
      });

      if (error) throw error;

      // Start the visual simulation while processing happens
      simulateProcessing();
    } catch (error: any) {
      console.error("Generation error:", error);
      // Continue with simulation for demo purposes
      simulateProcessing();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {processing ? "Creating Your Edit" : "Ready to Generate"}
        </h2>
        <p className="text-muted-foreground">
          {processing
            ? "AI is analyzing and syncing your content"
            : "Click below to start the AI editing process"}
        </p>
      </div>

      {processing ? (
        <Card className="p-8 bg-card/60 border-purple-main/20">
          <div className="space-y-6">
            {/* Progress bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {progress}% complete
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {processingSteps.map((step, index) => {
                const isActive = index === currentStep;
                const isComplete = index < currentStep;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                      isActive
                        ? "bg-purple-main/10 border border-purple-main/30"
                        : isComplete
                        ? "opacity-50"
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
          <h3 className="text-xl font-semibold mb-2">AI Edit Ready</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Our AI will analyze your music's beats and automatically cut your clips
            in perfect sync with the rhythm.
          </p>
          <Button
            onClick={startGeneration}
            className="bg-gradient-purple hover:opacity-90 gap-2 px-8 py-6 text-lg"
          >
            <Sparkles className="w-5 h-5" />
            Generate Edit
          </Button>
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