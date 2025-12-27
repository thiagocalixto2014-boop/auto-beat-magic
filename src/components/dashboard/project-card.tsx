import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Play, Trash2, Edit, Loader2, Clock, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
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
      toast.success("Project deleted");
      onDelete();
    } catch (error: any) {
      toast.error("Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusIcon = () => {
    switch (project.status) {
      case "draft":
        return <Edit className="w-3 h-3" />;
      case "processing":
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case "completed":
        return <CheckCircle className="w-3 h-3" />;
      case "failed":
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusColor = () => {
    switch (project.status) {
      case "draft":
        return "bg-muted text-muted-foreground";
      case "processing":
        return "bg-purple-main/20 text-purple-light";
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "failed":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const templateGradients: Record<string, string> = {
    flashy: "from-purple-main/30 to-violet/20",
    "smooth-zoom": "from-violet/30 to-magenta/20",
    amv: "from-magenta/30 to-purple-glow/20",
    minimal: "from-purple-glow/20 to-purple-deep/20",
  };

  return (
    <Card
      className="overflow-hidden border-purple-main/10 hover:border-purple-main/30 transition-all cursor-pointer group"
      onClick={() => navigate(`/editor/${project.id}`)}
    >
      {/* Preview Area */}
      <div className={`aspect-video bg-gradient-to-br ${templateGradients[project.template] || templateGradients.flashy} relative`}>
        {project.output_url ? (
          <video
            src={project.output_url}
            className="w-full h-full object-cover"
            muted
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-foreground/20" />
          </div>
        )}

        {/* Play overlay for completed */}
        {project.status === "completed" && project.output_url && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm">
            <Button size="icon" className="w-14 h-14 rounded-full bg-gradient-purple">
              <Play className="w-6 h-6 ml-1" />
            </Button>
          </div>
        )}

        {/* Status badge */}
        <Badge className={`absolute top-3 right-3 ${getStatusColor()} border-0 gap-1`}>
          {getStatusIcon()}
          {project.status}
        </Badge>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{project.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={deleting}
            className="text-muted-foreground hover:text-red-400 shrink-0"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>

        <Badge variant="secondary" className="mt-3 text-xs capitalize">
          {project.template.replace("-", " ")}
        </Badge>
      </div>
    </Card>
  );
};