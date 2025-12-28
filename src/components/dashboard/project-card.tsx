import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  ExternalLink,
  Video
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getProxiedVideoUrl } from "@/lib/video-proxy";

interface Project {
  id: string;
  title: string;
  status: string;
  template: string;
  created_at: string;
  output_url: string | null;
  clips_urls?: string[] | null;
}

interface ProjectCardProps {
  project: Project;
  onDelete: () => void;
}

export const ProjectCard = ({ project, onDelete }: ProjectCardProps) => {
  const [deleting, setDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  // Lazy load: only load media when card is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Get the best available thumbnail source
  const thumbnailUrl = project.clips_urls?.[0] || null;
  const proxiedOutputUrl = getProxiedVideoUrl(project.output_url);
  
  // Use output video for completed, otherwise use clip thumbnail
  const displayUrl = project.status === "completed" && proxiedOutputUrl 
    ? proxiedOutputUrl 
    : thumbnailUrl;

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
      toast.success("Project deleted");
      onDelete();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!project.output_url) return;
    window.open(project.output_url, "_blank");
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && thumbnailLoaded) {
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
      ref={cardRef}
      className="group overflow-hidden border-border/50 hover:border-purple-main/40 bg-card/80 backdrop-blur-sm transition-all duration-300 cursor-pointer hover:shadow-purple hover:-translate-y-1"
      onClick={() => navigate(`/editor/${project.id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Preview Area */}
      <div className="aspect-video relative overflow-hidden">
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${templateGradients[project.template] || templateGradients.flashy}`} />
        
        {/* Skeleton loader */}
        {isVisible && displayUrl && !thumbnailLoaded && (
          <Skeleton className="absolute inset-0 bg-muted/50" />
        )}

        {/* Single optimized video element - with reduced opacity and blur */}
        {isVisible && displayUrl && (
          <video
            ref={videoRef}
            src={displayUrl}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 blur-[2px] ${
              thumbnailLoaded ? 'opacity-60' : 'opacity-0'
            } ${isHovered ? 'scale-110 blur-0 opacity-80' : 'scale-105'}`}
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={() => setThumbnailLoaded(true)}
          />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-background/30" />

        {/* Inner glow effect */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top inner glow */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-purple-main/20 to-transparent" />
          {/* Bottom inner glow */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-purple-glow/25 to-transparent" />
          {/* Left inner glow */}
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-violet/15 to-transparent" />
          {/* Right inner glow */}
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-magenta/15 to-transparent" />
          {/* Center radial glow */}
          <div className="absolute inset-0 bg-radial-glow opacity-40" style={{
            background: 'radial-gradient(ellipse at center, hsl(270 70% 55% / 0.15) 0%, transparent 70%)'
          }} />
        </div>

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-purple-main/30 border-t-purple-light animate-spin" />
                <Sparkles className="w-5 h-5 text-purple-light absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <span className="text-xs text-purple-light font-medium">Processing...</span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!displayUrl && !isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-foreground/15" />
          </div>
        )}

        {/* Play button on hover */}
        {isCompleted && thumbnailLoaded && (
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-background/60 backdrop-blur-sm rounded-full p-3">
              <Play className="w-6 h-6 text-foreground fill-current" />
            </div>
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none" />

        {/* Status badge */}
        <Badge 
          variant="outline"
          className={`absolute top-2 right-2 ${statusConfig.className} backdrop-blur-sm gap-1 text-xs`}
        >
          {statusConfig.icon}
          {statusConfig.label}
        </Badge>

        {/* Ready indicator */}
        {isCompleted && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-sm">
            <Video className="w-3 h-3 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">Ready</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-foreground truncate group-hover:text-purple-light transition-colors">
              {project.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
            </p>
          </div>
          
          <div className="flex items-center gap-0.5">
            {isCompleted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="text-muted-foreground hover:text-emerald-400 h-7 w-7"
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={deleting}
              className="text-muted-foreground hover:text-destructive h-7 w-7"
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs capitalize h-5 px-1.5">
            {project.template.replace("-", " ")}
          </Badge>
          
          {isCompleted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); window.open(project.output_url!, "_blank"); }}
              className="text-xs text-purple-light h-5 px-1.5 gap-1"
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
