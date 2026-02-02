import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Clock, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 backdrop-blur-sm">
          Concluído
        </Badge>
      );
    case "processing":
      return (
        <Badge className="bg-purple-main/30 text-purple-light border-purple-main/40 backdrop-blur-sm flex items-center gap-1.5">
          <Loader2 className="w-3 h-3 animate-spin" />
          Processando
        </Badge>
      );
    case "ready_for_edit":
      return (
        <Badge className="bg-secondary/80 text-muted-foreground border-border/50 backdrop-blur-sm">
          Pronto para editar
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const RecentVideos = ({ projects, onViewAll }: RecentVideosProps) => {
  const navigate = useNavigate();
  const recentProjects = projects.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vídeos Recentes</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Seus últimos projetos de edição
          </p>
        </div>
        {projects.length > 0 && (
          <Button 
            variant="outline" 
            onClick={onViewAll}
            className="border-purple-main/30 text-purple-light hover:bg-purple-main/10 hover:border-purple-main/50 rounded-xl group"
          >
            Ver Biblioteca
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </div>

      {/* Videos Grid */}
      {recentProjects.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-dashed border-border/50 bg-gradient-to-br from-card/50 to-secondary/20">
          <div className="w-20 h-20 rounded-3xl bg-gradient-purple/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-purple-main/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Nenhum vídeo ainda</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Crie seu primeiro edit com IA e surpreenda-se com os resultados!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentProjects.map((project) => (
            <div 
              key={project.id}
              className="group relative rounded-2xl overflow-hidden bg-card/50 border border-border/30 hover:border-purple-main/40 transition-all duration-500 hover:shadow-xl hover:shadow-purple-main/5 cursor-pointer"
              onClick={() => navigate(`/editor/${project.id}`)}
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-secondary to-secondary/50 relative overflow-hidden">
                {project.output_url ? (
                  <video 
                    src={project.output_url} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    muted
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-main/20 to-purple-glow/10 flex items-center justify-center">
                        <Play className="w-8 h-8 text-purple-main/40 ml-1" />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  {getStatusBadge(project.status)}
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Play overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-purple flex items-center justify-center shadow-purple transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-7 h-7 text-white ml-1" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-semibold truncate group-hover:text-purple-light transition-colors duration-300">
                    {project.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(project.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full rounded-xl border-border/50 text-muted-foreground hover:text-foreground hover:border-purple-main/30 hover:bg-purple-main/5 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/editor/${project.id}`);
                  }}
                >
                  {project.status === "completed" ? "Ver Resultado" : "Continuar Editando"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
