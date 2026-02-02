import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Project {
  id: string;
  title: string;
  status: string;
  template: string;
  created_at: string;
  output_url: string | null;
}

interface RecentVideosProps {
  projects: Project[];
  onViewAll?: () => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Concluído</Badge>;
    case "processing":
      return (
        <Badge className="bg-purple-main/20 text-purple-light border-purple-main/30 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Processando
        </Badge>
      );
    case "ready_for_edit":
      return <Badge className="bg-secondary text-muted-foreground border-border">Pronto para editar</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const RecentVideos = ({ projects, onViewAll }: RecentVideosProps) => {
  const navigate = useNavigate();
  const recentProjects = projects.slice(0, 6);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Vídeos Recentes</h2>
        {projects.length > 0 && (
          <Button 
            variant="outline" 
            onClick={onViewAll}
            className="border-purple-main/30 text-purple-light hover:bg-purple-main/10"
          >
            Biblioteca
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Videos Grid */}
      {recentProjects.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-border/50 bg-card/30">
          <p className="text-muted-foreground">Nenhum vídeo ainda. Crie seu primeiro edit!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentProjects.map((project) => (
            <Card 
              key={project.id}
              className="group bg-card/50 border-border/50 overflow-hidden hover:border-purple-main/30 transition-all cursor-pointer"
              onClick={() => navigate(`/editor/${project.id}`)}
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-secondary/50 relative overflow-hidden">
                {project.output_url ? (
                  <video 
                    src={project.output_url} 
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-main/5 to-purple-glow/5">
                    <Play className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  {getStatusBadge(project.status)}
                </div>

                {/* Play overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-purple-main/80 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <h3 className="font-medium text-sm truncate group-hover:text-purple-light transition-colors">
                  {project.title}
                </h3>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(project.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {/* Action button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-border/50 text-muted-foreground hover:text-foreground hover:border-purple-main/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/editor/${project.id}`);
                  }}
                >
                  {project.status === "completed" ? "Ver Resultado" : "Continuar Editando"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
