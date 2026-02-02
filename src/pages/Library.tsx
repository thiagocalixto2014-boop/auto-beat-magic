import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  BookOpen, 
  Sparkles, 
  Loader2, 
  X, 
  Play, 
  Pencil, 
  Trash2,
  Clock,
  Film,
  Wand2
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Project {
  id: string;
  title: string;
  status: string;
  template: string;
  created_at: string;
  output_url: string | null;
  clips_urls: string[] | null;
  music_duration: number | null;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
          CONCLUÍDO
        </Badge>
      );
    case "processing":
      return (
        <Badge className="bg-purple-main/20 text-purple-light border-purple-main/30 text-xs flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          PROCESSANDO
        </Badge>
      );
    case "ready_for_edit":
      return (
        <Badge className="bg-secondary text-muted-foreground border-border/50 text-xs">
          READY_FOR_EDIT
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="text-xs">
          {status.toUpperCase()}
        </Badge>
      );
  }
};

const Library = () => {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate("/auth");
        } else {
          setUser(session.user);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchProjects();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Falha ao carregar biblioteca");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectToDelete.id);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      toast.success("Projeto excluído com sucesso");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Falha ao excluir projeto");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-purple-main/20 border-t-purple-light animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-purple-light" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-72">
        {/* Promo Banner */}
        {showBanner && (
          <div className="bg-gradient-purple text-white py-3 px-6 text-center text-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
            <span className="relative font-medium">✨ Ganhe dinheiro indicando amigos! Clique aqui</span>
            <button 
              onClick={() => setShowBanner(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Area */}
        <main className="p-10 space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-purple-light" />
                Biblioteca
              </h1>
              <p className="text-muted-foreground">
                {projects.length} {projects.length === 1 ? 'projeto' : 'projetos'} na sua biblioteca
              </p>
            </div>

            <Button
              onClick={() => navigate("/editor/new")}
              className="bg-gradient-purple hover:opacity-90 transition-all duration-300 gap-2 shadow-purple hover:shadow-glow rounded-xl"
            >
              <Wand2 className="w-4 h-4" />
              Criar Mágico
            </Button>
          </div>

          {/* Videos Grid */}
          {projects.length === 0 ? (
            <div className="p-20 text-center rounded-3xl border border-dashed border-border/50 bg-gradient-to-br from-card/50 to-secondary/20">
              <div className="w-20 h-20 rounded-3xl bg-gradient-purple/10 flex items-center justify-center mx-auto mb-6">
                <Film className="w-10 h-10 text-purple-main/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sua biblioteca está vazia</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                Crie seu primeiro edit com IA e ele aparecerá aqui!
              </p>
              <Button
                onClick={() => navigate("/editor/new")}
                className="bg-gradient-purple hover:opacity-90"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Criar Primeiro Edit
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div 
                  key={project.id}
                  className="group rounded-2xl overflow-hidden bg-card/30 border border-border/30 hover:border-purple-main/40 transition-all duration-500 hover:shadow-xl hover:shadow-purple-main/5"
                >
                  {/* Thumbnail */}
                  <div 
                    className="aspect-video bg-gradient-to-br from-secondary to-secondary/50 relative overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/editor/${project.id}`)}
                  >
                    {project.output_url ? (
                      <video 
                        src={project.output_url} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        muted
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-main/20 to-purple-glow/10 flex items-center justify-center">
                          <Play className="w-8 h-8 text-purple-main/40 ml-1" />
                        </div>
                      </div>
                    )}

                    {/* Play overlay on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/30">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-purple flex items-center justify-center shadow-purple transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-semibold truncate text-lg group-hover:text-purple-light transition-colors">
                        {project.title}
                      </h3>
                      
                      <div className="flex items-center gap-3 mt-3">
                        {project.music_duration && (
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {formatDuration(project.music_duration)}
                          </span>
                        )}
                        {getStatusBadge(project.status)}
                      </div>

                      <p className="text-sm text-muted-foreground mt-2">
                        {formatDate(project.created_at)}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 rounded-xl border-border/50 hover:border-purple-main/30 hover:bg-purple-main/5"
                        onClick={() => navigate(`/editor/${project.id}`)}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                        onClick={() => {
                          setProjectToDelete(project);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{projectToDelete?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Library;
