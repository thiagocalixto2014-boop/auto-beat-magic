import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Play, 
  Trash2, 
  Edit, 
  Loader2, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Download,
  ExternalLink
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Project {
  id: string;
  title: string;
  status: string;
  template: string;
  created_at: string;
  output_url: string | null;
}

interface ProjectCardProps {
  project: Project;
  onDelete: () => void;
}

export const ProjectCard = ({ project, onDelete }: ProjectCardProps) => {
  const [deleting, setDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id);

      if (error) throw error;
      toast.success("Project deleted successfully");
      onDelete();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!project.output_url) return;

    try {
      toast.info("Starting download...");
      const response = await fetch(project.output_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.title || "video"}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Download started!");
    } catch (error) {
      console.error("Download error:", error);
      // Fallback: open in new tab
      window.open(project.output_url, "_blank");
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && project.output_url) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const getStatusConfig = () => {
    switch (project.status) {
      case "draft":
        return {
          icon: <Edit className="w-3 h-3" />,
          label: "Draft",
          className: "bg-muted/80 text-muted-foreground border-muted-foreground/20"
        };
      case "processing":
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          label: "Processing",
          className: "bg-purple-main/20 text-purple-light border-purple-light/30"
        };
      case "completed":
        return {
          icon: <CheckCircle className="w-3 h-3" />,
          label: "Completed",
          className: "bg-emerald-500/20 text-emerald-400 border-emerald-400/30"
        };
      case "failed":
        return {
          icon: <AlertCircle className="w-3 h-3" />,
          label: "Failed",
          className: "bg-destructive/20 text-destructive border-destructive/30"
        };
      default:
        return {
          icon: <Clock className="w-3 h-3" />,
          label: project.status,
          className: "bg-muted/80 text-muted-foreground border-muted-foreground/20"
        };
    }
  };

  const statusConfig = getStatusConfig();

  const templateGradients: Record<string, string> = {
    flashy: "from-purple-main/40 via-violet/30 to-magenta/20",
    "smooth-zoom": "from-violet/40 via-purple-main/30 to-purple-glow/20",
    amv: "from-magenta/40 via-purple-glow/30 to-purple-main/20",
    minimal: "from-purple-glow/30 via-purple-deep/20 to-purple-main/10",
  };

  const isCompleted = project.status === "completed" && project.output_url;
  const isProcessing = project.status === "processing";

  return (
    <Card
      className="group overflow-hidden border-border/50 hover:border-purple-main/40 bg-card/80 backdrop-blur-sm transition-all duration-300 cursor-pointer hover:shadow-purple hover:-translate-y-1"
      onClick={() => navigate(`/editor/${project.id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Preview Area */}
      <div className={`aspect-video relative overflow-hidden bg-gradient-to-br ${templateGradients[project.template] || templateGradients.flashy}`}>
        {isCompleted ? (
          <video
            ref={videoRef}
            src={project.output_url}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-purple-main/30 border-t-purple-light animate-spin" />
                  <Sparkles className="w-6 h-6 text-purple-light absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <span className="text-xs text-purple-light/80 font-medium">Processing...</span>
              </div>
            ) : (
              <Sparkles className="w-12 h-12 text-foreground/15" />
            )}
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />

        {/* Play button overlay for completed videos */}
        {isCompleted && (
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-background/60 backdrop-blur-md rounded-full p-4 shadow-lg">
              <Play className="w-8 h-8 text-foreground fill-current" />
            </div>
          </div>
        )}

        {/* Status badge */}
        <Badge 
          variant="outline"
          className={`absolute top-3 right-3 ${statusConfig.className} backdrop-blur-sm gap-1.5 text-xs font-medium`}
        >
          {statusConfig.icon}
          {statusConfig.label}
        </Badge>
      </div>

      {/* Info Section */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-purple-light transition-colors">
              {project.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {isCompleted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="text-muted-foreground hover:text-emerald-400 hover:bg-emerald-400/10 h-8 w-8"
                title="Download video"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={deleting}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
              title="Delete project"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Template badge and additional info */}
        <div className="flex items-center justify-between">
          <Badge 
            variant="secondary" 
            className="text-xs capitalize bg-secondary/50 text-secondary-foreground/80 hover:bg-secondary/70"
          >
            {project.template.replace("-", " ")}
          </Badge>
          
          {isCompleted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-xs text-purple-light hover:text-purple-glow h-7 px-2 gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Open
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
