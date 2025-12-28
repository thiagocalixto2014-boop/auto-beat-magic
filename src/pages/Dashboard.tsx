import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, LogOut, Video, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { ProjectCard } from "@/components/dashboard/project-card";

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
  const [refreshing, setRefreshing] = useState(false);
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
    }, 10000); // Check every 10 seconds

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
      if (!silent) toast.error("Failed to load projects");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const createNewProject = async () => {
    if (!user) {
      toast.error("Please sign in to create a project");
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          title: "Untitled Project",
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Project created!");
      navigate(`/editor/${data.id}`);
    } catch (error: any) {
      console.error("Create project error:", error);
      toast.error("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  const completedCount = projects.filter(p => p.status === "completed").length;
  const processingCount = projects.filter(p => p.status === "processing").length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-purple-main/30 border-t-purple-light animate-spin" />
          <Sparkles className="w-6 h-6 text-purple-light absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-muted-foreground text-sm">Loading your projects...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold tracking-tight">
              <span className="bg-gradient-purple bg-clip-text text-transparent">EDIT</span>
              <span className="text-foreground">LABS</span>
            </div>
            {processingCount > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-main/10 border border-purple-main/20">
                <Loader2 className="w-3 h-3 animate-spin text-purple-light" />
                <span className="text-xs text-purple-light font-medium">
                  {processingCount} processing
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden md:block max-w-[200px] truncate">
              {user?.email}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-muted-foreground hover:text-foreground"
              title="Refresh projects"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
              Your Projects
            </h1>
            <p className="text-muted-foreground">
              {projects.length === 0 
                ? "Create your first AI-powered video edit"
                : `${projects.length} project${projects.length !== 1 ? 's' : ''} • ${completedCount} completed`
              }
            </p>
          </div>
          
          <Button
            onClick={createNewProject}
            disabled={creating}
            size="lg"
            className="bg-gradient-purple hover:opacity-90 transition-opacity gap-2 shadow-purple"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            New Project
          </Button>
        </div>

        {/* Empty State */}
        {projects.length === 0 ? (
          <Card className="p-16 text-center bg-card/50 border-dashed border-purple-main/20 hover:border-purple-main/40 transition-colors">
            <div className="max-w-sm mx-auto">
              <div className="w-20 h-20 rounded-full bg-gradient-purple/10 flex items-center justify-center mx-auto mb-6">
                <Video className="w-10 h-10 text-purple-main/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-8">
                Start by creating your first AI-powered video edit. Upload your clips, add music, and let AI do the magic.
              </p>
              <Button
                onClick={createNewProject}
                disabled={creating}
                size="lg"
                className="bg-gradient-purple hover:opacity-90 transition-opacity shadow-purple"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Create Your First Edit
              </Button>
            </div>
          </Card>
        ) : (
          /* Projects Grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={() => fetchProjects()}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            <span className="bg-gradient-purple bg-clip-text text-transparent font-medium">EDITLABS</span>
            {" "}• AI-Powered Video Editing
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
