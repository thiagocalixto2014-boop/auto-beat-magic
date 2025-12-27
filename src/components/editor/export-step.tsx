import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Share2, RotateCcw, CheckCircle } from "lucide-react";
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
  const handleDownload = async () => {
    if (!project.output_url) return;

    try {
      const response = await fetch(project.output_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.title || "editlabs-export"}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Download started!");
    } catch (error) {
      toast.error("Failed to download");
    }
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

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 mx-auto mb-4 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your Edit is Ready!</h2>
        <p className="text-muted-foreground">
          Preview and download your AI-generated video
        </p>
      </div>

      {/* Video Preview */}
      <Card className="overflow-hidden border-purple-main/20">
        <div className="aspect-[9/16] max-h-[500px] bg-background mx-auto">
          {project.output_url ? (
            <video
              src={project.output_url}
              controls
              autoPlay
              loop
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No preview available
            </div>
          )}
        </div>
      </Card>

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