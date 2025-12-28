import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";

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
  onJobStarted?: (jobId: string) => void;
}

type UiPhase = "idle" | "upload" | "sending" | "processing" | "finalizing" | "ready" | "error";

const POLL_TIMEOUT_MS = 5 * 60 * 1000;
const ESTIMATED_PROCESSING_MS = 2 * 60 * 1000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const GenerateStep = ({ project, onUpdate, onBack, onJobStarted }: GenerateStepProps) => {
  const [processing, setProcessing] = useState(false);
  const [uiPhase, setUiPhase] = useState<UiPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [beatInfo, setBeatInfo] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [autoOpened, setAutoOpened] = useState(false);

  const phaseLabel = useMemo(() => {
    switch (uiPhase) {
      case "upload":
        return "Uploading files";
      case "sending":
        return "Sending for processing";
      case "processing":
        return "Processing video";
      case "finalizing":
        return "Finalizing & loading preview";
      case "ready":
        return "Video ready";
      case "error":
        return "Processing failed";
      default:
        return "";
    }
  }, [uiPhase]);

  // If user reloads mid-processing, keep UI in processing mode
  useEffect(() => {
    if (project.output_url) return;
    if (project.status === "processing") {
      setProcessing(true);
      setUiPhase("processing");
      setErrorMessage(null);
      setStartedAt((prev) => prev ?? Date.now());
      setProgress((p) => (p < 30 ? 30 : p));
    }
  }, [project.status, project.output_url]);

  // When output_url arrives (from parent polling), switch to ready state
  useEffect(() => {
    if (!project.output_url) return;
    setProcessing(false);
    setUiPhase("ready");
    setProgress(100);
    setErrorMessage(null);
  }, [project.output_url]);

  // Time-based progress while server is processing (30-90%) + timeout
  useEffect(() => {
    if (!processing) return;
    if (uiPhase !== "processing" && uiPhase !== "finalizing") return;
    if (!startedAt) return;

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;

      if (elapsed >= POLL_TIMEOUT_MS) {
        window.clearInterval(interval);
        setProcessing(false);
        setUiPhase("error");
        setErrorMessage("Timed out after 5 minutes. Please try again.");
        toast.error("Processing timed out. Try again.");
        return;
      }

      // 30–90% based on estimated time
      const estimated = ESTIMATED_PROCESSING_MS;
      const base = 30;
      const span = 60;
      const computed = base + Math.min(span, (elapsed / estimated) * span);
      const capped = Math.min(90, Math.max(base, computed));

      setProgress((p) => Math.max(p, Math.floor(capped)));

      // If we're near the end, show finalizing state
      if (capped >= 90 && uiPhase !== "finalizing") {
        setUiPhase("finalizing");
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [processing, uiPhase, startedAt]);

  // Auto-open in new tab once ready (HTTP videos can't be embedded reliably)
  useEffect(() => {
    if (uiPhase !== "ready") return;
    if (!project.output_url) return;
    if (autoOpened) return;

    const win = window.open(project.output_url, "_blank", "noopener,noreferrer");
    if (!win) {
      toast.info("Popup blocked — click View Video");
    }
    setAutoOpened(true);
  }, [uiPhase, project.output_url, autoOpened]);

  const handleViewVideo = () => {
    if (!project.output_url) return;
    const win = window.open(project.output_url, "_blank", "noopener,noreferrer");
    if (!win) toast.info("Popup blocked — allow popups and try again");
  };

  const handleDownload = () => {
    if (!project.output_url) return;
    const win = window.open(project.output_url, "_blank", "noopener,noreferrer");
    if (!win) toast.info("Popup blocked — allow popups and try again");
  };

  const startGeneration = async () => {
    setProcessing(true);
    setUiPhase("upload");
    setProgress(0);
    setBeatInfo(null);
    setErrorMessage(null);
    setAutoOpened(false);

    try {
      if (!project.clips_urls || project.clips_urls.length === 0) {
        throw new Error("No video clips uploaded");
      }

      // 0–10%: "Upload" phase (files already uploaded in previous step; this is UI-only)
      setProgress(5);
      await sleep(600);
      setProgress(10);

      // 10–30%: sending / analysis
      setUiPhase("sending");
      setProgress(15);
      toast.info("Analyzing beats… this may take a few seconds");

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
      if (beatAnalysis?.error) throw new Error(beatAnalysis.error);
      if (!beatAnalysis?.success) throw new Error("Beat analysis failed");

      const beatData = beatAnalysis.beatData as BeatData;
      setBeatInfo(`${beatData.bpm} BPM • ${beatData.beats?.length || 0} beats • ${beatData.segments?.length || 0} cuts`);

      setProgress(25);

      // trigger processing (async)
      const { data: processResult, error: processError } = await supabase.functions.invoke("video-encode", {
        body: {
          projectId: project.id,
          clipsUrls: project.clips_urls,
          musicUrl: project.music_url,
          effects: project.effects,
          beatData,
        },
      });

      if (processError) throw new Error("Failed to start processing: " + processError.message);
      if (processResult?.error) throw new Error(processResult.error);

      // Notify parent about the job ID for status polling
      if (processResult?.jobId && onJobStarted) {
        onJobStarted(processResult.jobId);
      }

      setProgress(30);
      setUiPhase("processing");
      setStartedAt(Date.now());

      toast.success("Processing… this may take 1–2 minutes");
      onUpdate({ beat_data: beatData, status: "processing" });
    } catch (error: any) {
      console.error("Generation error:", error);
      setProcessing(false);
      setUiPhase("error");
      setErrorMessage(error?.message || "Failed to start processing");
      toast.error(error?.message || "Failed to start processing");
      onUpdate({ status: "draft" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {uiPhase === "ready"
            ? "Video Ready"
            : processing
            ? "Processing Your Edit"
            : "Ready to Generate"}
        </h2>
        <p className="text-muted-foreground">
          {uiPhase === "ready"
            ? "Your video is ready — open it in a new tab."
            : processing
            ? "Processing… this may take 1–2 minutes"
            : "Click below to start the beat-sync editing process"}
        </p>
        {beatInfo && <p className="text-purple-light font-medium mt-2">{beatInfo}</p>}
      </div>

      {uiPhase === "ready" && project.output_url ? (
        <Card className="p-10 bg-card/60 border-purple-main/20">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-purple flex items-center justify-center shadow-glow">
              <ExternalLink className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Video ready! Click to view</h3>
              <p className="text-sm text-muted-foreground">
                We open the video in a new tab because HTTP video URLs can't be previewed reliably inside an HTTPS iframe.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleViewVideo} size="lg" className="bg-gradient-purple hover:opacity-90 gap-2 px-10 h-14">
                <ExternalLink className="w-5 h-5" />
                View Video
              </Button>
              <Button onClick={handleDownload} size="lg" variant="outline" className="gap-2 px-10 h-14">
                Download
              </Button>
            </div>
          </div>
        </Card>
      ) : processing ? (
        <Card className="p-8 bg-card/60 border-purple-main/20">
          <div className="space-y-6">
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{phaseLabel}</span>
                <span>{progress}%</span>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-background/30 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground/90">Processing… this may take 1–2 minutes</p>
              <p className="mt-1">We'll show the preview as soon as the video is ready.</p>
            </div>

            {uiPhase === "error" && errorMessage && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
                <p className="font-medium text-destructive">{errorMessage}</p>
              </div>
            )}

            {uiPhase === "error" && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={startGeneration} className="bg-gradient-purple hover:opacity-90 gap-2" size="lg">
                  <Sparkles className="w-5 h-5" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={onBack} size="lg" className="gap-2">
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-12 bg-card/60 border-purple-main/20 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-purple mx-auto mb-6 flex items-center justify-center shadow-glow">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">AI Beat-Sync Editor</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Our AI will analyze your music's BPM and automatically cut your clips in sync. Output: 15 seconds, 9:16.
          </p>
          <div className="space-y-3">
            <Button onClick={startGeneration} className="bg-gradient-purple hover:opacity-90 gap-2 px-8 py-6 text-lg">
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

      {!processing && uiPhase !== "ready" && (
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
