import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, LogOut, Video, Loader2 } from "lucide-react";
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
    } catch (error: any) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const createNewProject = async () => {
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
      navigate(`/editor/${data.id}`);
    } catch (error: any) {
      toast.error("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-light" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-bold">
            <span className="bg-gradient-purple bg-clip-text text-transparent">EDIT</span>
            <span>LABS</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Projects</h1>
            <p className="text-muted-foreground">
              Create AI-powered video edits in minutes
            </p>
          </div>
          <Button
            onClick={createNewProject}
            disabled={creating}
            className="bg-gradient-purple hover:opacity-90 gap-2"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            New Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card className="p-12 text-center bg-card/50 border-dashed border-purple-main/20">
            <Video className="w-16 h-16 text-purple-main/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first AI-powered video edit
            </p>
            <Button
              onClick={createNewProject}
              disabled={creating}
              className="bg-gradient-purple hover:opacity-90"
            >
              Create Your First Edit
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
};

export default Dashboard;