import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, Loader2, X, Wand2 } from "lucide-react";
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
    const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-purple-main/20 border-t-purple-light animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-purple flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-sm mt-2">Carregando seus projetos...</p>
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
        <main className="p-10 space-y-10 max-w-6xl">
          {/* Header */}
          <div className="flex items-start justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">
                Bem-vindo, {getUserName()}! 
                <span className="inline-block ml-3 animate-wave origin-bottom-right">👋</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Crie edits virais em segundos com IA
              </p>
            </div>

            <Button
              onClick={createNewProject}
              disabled={creating}
              size="lg"
              className="bg-gradient-purple hover:opacity-90 transition-all duration-300 gap-2.5 shadow-purple hover:shadow-glow hover:scale-105 rounded-xl px-6"
            >
              {creating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Wand2 className="w-5 h-5" />
              )}
              <span className="font-semibold">Criar Mágico</span>
            </Button>
          </div>

          {/* Stats Cards */}
          <StatsCards 
            totalVideos={projects.length}
            credits={10}
            plan="free"
          />

          {/* Recent Videos */}
          <RecentVideos 
            projects={projects}
            onViewAll={() => navigate("/library")}
          />
        </main>
      </div>

      {/* Custom CSS for wave animation */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-10deg); }
        }
        .animate-wave {
          animation: wave 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
