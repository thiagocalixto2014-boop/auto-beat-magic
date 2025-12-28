import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Share2, RotateCcw, CheckCircle, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { getProxiedVideoUrl } from "@/lib/video-proxy";

interface Project {
  id: string;
  title: string;
  output_url: string | null;
}

interface ExportStepProps {
  project: Project;
  onBack: () => void;
}

export const ExportStep = ({ project, onBack }: ExportStepProps) => {
  const [videoError, setVideoError] = useState(false);

  // Get proxied URL for playback
  const proxiedUrl = getProxiedVideoUrl(project.output_url);
  const canPreview = proxiedUrl && !videoError;

  const handleDownload = () => {
    if (!project.output_url) return;
    
    // Use original URL for download (opens in new tab)
    window.open(project.output_url, "_blank");
    toast.success("Opening video - right-click to save");
  };

  const handleShare = async () => {
    if (!project.output_url) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title || "My EditLabs Edit",
          text: "Check out my AI-powered video edit!",
          url: project.output_url,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(project.output_url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleCopyUrl = () => {
    if (project.output_url) {
      navigator.clipboard.writeText(project.output_url);
      toast.success("URL copied!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 mx-auto mb-4 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your Edit is Ready!</h2>
        <p className="text-muted-foreground">
          Preview and download your AI-generated video
        </p>
      </div>

      {/* Video Preview */}
      <Card className="overflow-hidden border-purple-main/20">
        <div className="aspect-[9/16] max-h-[500px] bg-background mx-auto relative">
          {canPreview ? (
            <video
              key={proxiedUrl}
              src={proxiedUrl}
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
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 gap-4">
              <div className="w-20 h-20 rounded-full bg-purple-main/20 flex items-center justify-center">
                <ExternalLink className="w-10 h-10 text-purple-light" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Preview Unavailable</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click below to open the video in a new tab.
                </p>
              </div>
              <Button
                onClick={handleDownload}
                className="bg-gradient-purple hover:opacity-90 gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Video
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Direct Link */}
      {project.output_url && (
        <Card className="p-4 border-purple-main/10 bg-card/50">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Video URL</p>
              <p className="text-sm font-mono truncate text-foreground/80">
                {project.output_url}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyUrl}
              className="shrink-0 gap-1"
            >
              <Copy className="w-3 h-3" />
              Copy
            </Button>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={handleDownload}
          className="bg-gradient-purple hover:opacity-90 gap-2 px-8"
        >
          <Download className="w-5 h-5" />
          Download MP4
        </Button>
        <Button
          variant="outline"
          onClick={handleShare}
          className="gap-2 border-purple-main/30 hover:bg-purple-main/10"
        >
          <Share2 className="w-5 h-5" />
          Share
        </Button>
      </div>

      {/* Create Another */}
      <div className="text-center pt-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Create Another Edit
        </Button>
      </div>
    </div>
  );
};
