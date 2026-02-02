import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, Loader2, X, RefreshCw } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentVideos } from "@/components/dashboard/RecentVideos";

interface Project {
  id: string;
  title: string;
  status: string;
  template: string;
  created_at: string;
  output_url: string | null;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
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

  // Auto-refresh for processing projects
  useEffect(() => {
    const hasProcessing = projects.some(p => p.status === "processing");
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      fetchProjects(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [projects]);

  const fetchProjects = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error("Fetch projects error:", error);
      if (!silent) toast.error("Falha ao carregar projetos");
    } finally {
      setLoading(false);
    }
  };

  const createNewProject = async () => {
    if (!user) {
      toast.error("Faça login para criar um projeto");
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          title: "Projeto sem título",
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Projeto criado!");
      navigate(`/editor/${data.id}`);
    } catch (error: any) {
      console.error("Create project error:", error);
      toast.error("Falha ao criar projeto");
    } finally {
      setCreating(false);
    }
  };

  const getUserName = () => {
    if (!user) return "";
    // Try to get display name from metadata, fallback to email
    const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-purple-main/30 border-t-purple-light animate-spin" />
          <Sparkles className="w-6 h-6 text-purple-light absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-muted-foreground text-sm">Carregando seus projetos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Promo Banner */}
        {showBanner && (
          <div className="bg-gradient-purple text-white py-2 px-4 text-center text-sm relative">
            <span>Ganhe dinheiro indicando amigos! Clique aqui</span>
            <button 
              onClick={() => setShowBanner(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Area */}
        <main className="p-8 space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Bem-vindo, {getUserName()}! 
                <span className="text-2xl">👋</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Crie edits virais em segundos
              </p>
            </div>

            <Button
              onClick={createNewProject}
              disabled={creating}
              className="bg-gradient-purple hover:opacity-90 transition-opacity gap-2 shadow-purple"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Criar Mágico
            </Button>
          </div>

          {/* Stats Cards */}
          <StatsCards 
            totalVideos={projects.length}
            credits={10} // TODO: Implement credits system
            plan="free" // TODO: Implement plan system
          />

          {/* Recent Videos */}
          <RecentVideos 
            projects={projects}
            onViewAll={() => {/* TODO: Navigate to library */}}
          />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
