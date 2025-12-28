import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, ExternalLink, RotateCcw, Share2, Sparkles, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getProxiedVideoUrl, isHttpUrl } from "@/lib/video-proxy";

interface Project {
  id: string;
  title: string;
  output_url: string | null;
}

interface ExportStepProps {
  project: Project;
  onBack: () => void;
}

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

export const ExportStep = ({ project, onBack }: ExportStepProps) => {
  const [videoError, setVideoError] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(project.output_url);
  const [status, setStatus] = useState<string>(project.output_url ? "completed" : "processing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [autoOpened, setAutoOpened] = useState(false);

  useEffect(() => {
    setOutputUrl(project.output_url);
    setStatus(project.output_url ? "completed" : "processing");
    setErrorMessage(null);
    setVideoError(false);
    setAutoOpened(false);
    setStartedAt(Date.now());
  }, [project.id, project.output_url]);

  // Polling every 3s + 5 min timeout
  useEffect(() => {
    if (outputUrl) return;

    const interval = window.setInterval(async () => {
      const elapsed = Date.now() - startedAt;
      if (elapsed >= POLL_TIMEOUT_MS) {
        window.clearInterval(interval);
        setStatus("timeout");
        setErrorMessage("Timed out after 5 minutes. Please try again.");
        toast.error("Processing timed out. Try again.");
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("status, output_url")
        .eq("id", project.id)
        .maybeSingle();

      if (error) return;
      if (!data) return;

      setStatus(data.status);

      if (data.output_url) {
        setOutputUrl(data.output_url);
        setErrorMessage(null);
      } else if (data.status === "failed") {
        setErrorMessage("Video processing failed. Please try again.");
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [outputUrl, startedAt, project.id]);

  // Auto-open once ready
  useEffect(() => {
    if (!outputUrl) return;
    if (autoOpened) return;

    const win = window.open(outputUrl, "_blank", "noopener,noreferrer");
    if (!win) toast.info("Popup blocked — click View Video");
    setAutoOpened(true);
  }, [outputUrl, autoOpened]);

  const proxiedUrl = useMemo(() => getProxiedVideoUrl(outputUrl), [outputUrl]);
  const canPreview = proxiedUrl && !videoError && !isHttpUrl(outputUrl);

  const progress = useMemo(() => {
    // Export step is "90–100%: Finalizing + loading preview"
    const elapsed = Date.now() - startedAt;
    const pct = 90 + Math.min(9, Math.floor((elapsed / 60_000) * 9));
    return outputUrl ? 100 : pct;
  }, [outputUrl, startedAt, status]);

  const handleViewVideo = () => {
    if (!outputUrl) return;
    const win = window.open(outputUrl, "_blank", "noopener,noreferrer");
    if (!win) toast.info("Popup blocked — allow popups and try again");
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const win = window.open(outputUrl, "_blank", "noopener,noreferrer");
    if (!win) toast.info("Popup blocked — allow popups and try again");
    else toast.success("Opening video — right-click to save");
  };

  const handleShare = async () => {
    if (!outputUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title || "My Edit",
          text: "Check out my AI-powered video edit!",
          url: outputUrl,
        });
      } catch {
        // ignore cancel
      }
    } else {
      await navigator.clipboard.writeText(outputUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  // Processing view
  if (!outputUrl) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-main/20 to-magenta/10 border border-purple-main/30">
            {errorMessage ? (
              <XCircle className="w-8 h-8 text-destructive" />
            ) : (
              <Sparkles className="w-8 h-8 text-purple-light" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">Processing…</h2>
            <p className="text-muted-foreground mt-1">This can take 1–2 minutes. We’ll show your video as soon as it’s ready.</p>
          </div>
        </div>

        <div className="space-y-3">
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Finalizing and loading preview</span>
            <span>{Math.min(progress, 99)}%</span>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="font-medium text-destructive">{errorMessage}</p>
            <p className="mt-1 text-muted-foreground">You can go back and try generating again.</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onBack} size="lg" className="bg-gradient-purple hover:opacity-90 gap-2 px-10 h-14">
            <RotateCcw className="w-5 h-5" />
            Try Again
          </Button>
          <Button variant="outline" onClick={handleViewVideo} size="lg" className="gap-2 px-10 h-14" disabled>
            <ExternalLink className="w-5 h-5" />
            View Video
          </Button>
        </div>
      </div>
    );
  }

  // Ready view
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30">
          <Sparkles className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Video ready! Click to view</h2>
          <p className="text-muted-foreground mt-2">We open the video in a new tab for reliable playback.</p>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-main via-magenta to-violet rounded-3xl opacity-20 blur-2xl animate-pulse" />
        <div className="absolute -inset-2 bg-gradient-to-r from-violet via-purple-main to-magenta rounded-2xl opacity-30 blur-xl" />

        <div className="relative bg-card/90 backdrop-blur-sm border border-purple-main/30 rounded-2xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 rounded-2xl border-2 border-purple-main/20 pointer-events-none" />

          <div className="aspect-[9/16] max-h-[550px] mx-auto bg-background/50 flex items-center justify-center">
            {canPreview ? (
              <video
                key={proxiedUrl || undefined}
                src={proxiedUrl || undefined}
                controls
                autoPlay
                loop
                className="w-full h-full object-contain"
                onError={() => {
                  console.error("Video playback error");
                  setVideoError(true);
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 gap-6">
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-main/30 to-magenta/20 border border-purple-main/40 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-purple-light" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Preview not available here</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">Open the video in a new tab to watch.</p>
                </div>
                <Button onClick={handleViewVideo} className="bg-gradient-purple hover:opacity-90 gap-2">
                  <ExternalLink className="w-4 h-4" />
                  View Video
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Button
          onClick={handleViewVideo}
          size="lg"
          className="bg-gradient-purple hover:opacity-90 gap-3 px-10 h-14 text-base font-semibold shadow-lg shadow-purple-main/25 transition-all hover:shadow-purple-main/40 hover:scale-[1.02]"
        >
          <ExternalLink className="w-5 h-5" />
          View Video
        </Button>
        <Button
          onClick={handleDownload}
          size="lg"
          variant="outline"
          className="gap-3 px-10 h-14 text-base font-semibold border-purple-main/30 hover:bg-purple-main/10 hover:border-purple-main/50 transition-all hover:scale-[1.02]"
        >
          <Download className="w-5 h-5" />
          Download MP4
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleShare}
          className="gap-3 px-10 h-14 text-base font-semibold border-purple-main/30 hover:bg-purple-main/10 hover:border-purple-main/50 transition-all hover:scale-[1.02]"
        >
          <Share2 className="w-5 h-5" />
          Share
        </Button>
      </div>

      <div className="text-center">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground gap-2 hover:bg-muted/50">
          <RotateCcw className="w-4 h-4" />
          Create Another Edit
        </Button>
      </div>
    </div>
  );
};
