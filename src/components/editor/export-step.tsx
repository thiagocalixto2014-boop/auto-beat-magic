import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, RotateCcw, CheckCircle, Sparkles } from "lucide-react";
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

  const proxiedUrl = getProxiedVideoUrl(project.output_url);
  const canPreview = proxiedUrl && !videoError;

  const handleDownload = () => {
    if (!project.output_url) return;
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
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(project.output_url);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Your Edit is Ready!
          </h2>
          <p className="text-muted-foreground mt-2">
            Preview and download your AI-generated video
          </p>
        </div>
      </div>

      {/* Video Player with LED Effects */}
      <div className="relative group">
        {/* Outer LED glow layers */}
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-main via-magenta to-violet rounded-3xl opacity-20 blur-2xl animate-pulse" />
        <div className="absolute -inset-2 bg-gradient-to-r from-violet via-purple-main to-magenta rounded-2xl opacity-30 blur-xl" />
        
        {/* LED strip effect - top */}
        <div className="absolute -top-1 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-purple-light to-transparent rounded-full opacity-60" />
        
        {/* LED strip effect - bottom */}
        <div className="absolute -bottom-1 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-magenta to-transparent rounded-full opacity-60" />
        
        {/* LED strip effect - left */}
        <div className="absolute -left-1 top-8 bottom-8 w-1 bg-gradient-to-b from-transparent via-violet to-transparent rounded-full opacity-60" />
        
        {/* LED strip effect - right */}
        <div className="absolute -right-1 top-8 bottom-8 w-1 bg-gradient-to-b from-transparent via-purple-glow to-transparent rounded-full opacity-60" />
        
        {/* Corner LED accents */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-purple-light rounded-full blur-sm opacity-70" />
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-magenta rounded-full blur-sm opacity-70" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-violet rounded-full blur-sm opacity-70" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-purple-glow rounded-full blur-sm opacity-70" />

        {/* Main video container */}
        <div className="relative bg-card/90 backdrop-blur-sm border border-purple-main/30 rounded-2xl overflow-hidden shadow-2xl">
          {/* Inner glow border */}
          <div className="absolute inset-0 rounded-2xl border-2 border-purple-main/20 pointer-events-none" />
          
          <div className="aspect-[9/16] max-h-[550px] mx-auto bg-background/50 flex items-center justify-center">
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
              <div className="flex flex-col items-center justify-center text-center p-8 gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-main/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-main/30 to-magenta/20 border border-purple-main/40 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-purple-light" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Preview Loading...</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Click download to view your video
                  </p>
                </div>
                <Button
                  onClick={handleDownload}
                  className="bg-gradient-purple hover:opacity-90 gap-2"
                >
                  <Download className="w-4 h-4" />
                  Open Video
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Button
          onClick={handleDownload}
          size="lg"
          className="bg-gradient-purple hover:opacity-90 gap-3 px-10 h-14 text-base font-semibold shadow-lg shadow-purple-main/25 transition-all hover:shadow-purple-main/40 hover:scale-[1.02]"
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

      {/* Create Another */}
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground gap-2 hover:bg-muted/50"
        >
          <RotateCcw className="w-4 h-4" />
          Create Another Edit
        </Button>
      </div>
    </div>
  );
};
