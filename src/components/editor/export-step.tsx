import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Share2, RotateCcw, CheckCircle, ExternalLink, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

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

  // Check if URL is HTTP (will be blocked on HTTPS sites)
  const isHttpUrl = project.output_url?.startsWith("http://");
  const canPreview = project.output_url && !isHttpUrl && !videoError;

  const handleDownload = () => {
    if (!project.output_url) return;
    
    // Open in new tab - most reliable method for external URLs
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

  const handleOpenExternal = () => {
    if (project.output_url) {
      window.open(project.output_url, "_blank");
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
              src={project.output_url!}
              controls
              autoPlay
              loop
              className="w-full h-full object-contain"
              onError={() => setVideoError(true)}
            />
          ) : project.output_url ? (
            // Show message when video can't be previewed inline (HTTP URL or error)
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 gap-4">
              <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Preview Unavailable</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {isHttpUrl 
                    ? "The video server uses HTTP. Click below to view the video in a new tab."
                    : "Unable to preview the video. Click below to open it directly."}
                </p>
              </div>
              <Button
                onClick={handleOpenExternal}
                className="bg-gradient-purple hover:opacity-90 gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Video in New Tab
              </Button>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No preview available
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
              onClick={() => {
                navigator.clipboard.writeText(project.output_url!);
                toast.success("URL copied!");
              }}
              className="shrink-0"
            >
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
