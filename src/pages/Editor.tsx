import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { EditorSteps } from "@/components/editor/editor-steps";
import { UploadStep } from "@/components/editor/upload-step";
import { EffectsStep } from "@/components/editor/effects-step";
import { GenerateStep } from "@/components/editor/generate-step";
import { ExportStep } from "@/components/editor/export-step";

interface Project {
  id: string;
  title: string;
  status: string;
  template: string;
  effects: string[];
  music_url: string | null;
  music_duration: number | null;
  clips_urls: string[] | null;
  output_url: string | null;
  beat_data: any;
}

const Editor = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);

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
        fetchProject();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, projectId]);

  // Poll project status every 3s while processing (max 5 minutes)
  useEffect(() => {
    if (!projectId) return;
    if (step !== 3) return;
    if (!project) return;
    if (project.output_url) {
      setStep(4);
      return;
    }
    if (project.status !== "processing") return;

    const startedAt = Date.now();
    const interval = window.setInterval(async () => {
      const elapsed = Date.now() - startedAt;
      if (elapsed >= 5 * 60 * 1000) {
        window.clearInterval(interval);
        toast.error("Processing timed out (5 min). Try again.");
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("status, output_url")
        .eq("id", projectId)
        .maybeSingle();

      if (error || !data) return;

      setProject((prev) => (prev ? { ...prev, ...data } : prev));

      if (data.output_url || data.status === "completed") {
        window.clearInterval(interval);
        setStep(4);
      } else if (data.status === "failed") {
        window.clearInterval(interval);
        toast.error("Video processing failed. Please try again.");
      }
    }, 3000);

    return () => window.clearInterval(interval);
  }, [projectId, step, project, project?.status, project?.output_url]);

  const fetchProject = async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error("Project not found");
        navigate("/dashboard");
        return;
      }

      setProject(data);
      
      // Determine current step based on project state
      if (data.output_url) {
        setStep(4);
      } else if (data.status === "processing") {
        setStep(3);
      } else if (data.music_url && data.clips_urls?.length) {
        setStep(2);
      }
    } catch (error: any) {
      toast.error("Failed to load project");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (updates: Partial<Project>) => {
    if (!projectId) return;

    try {
      const { error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", projectId);

      if (error) throw error;
      setProject((prev) => prev ? { ...prev, ...updates } : null);
    } catch (error: any) {
      toast.error("Failed to update project");
    }
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-light" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={project.title}
              onChange={(e) => updateProject({ title: e.target.value })}
              className="bg-transparent text-lg font-semibold outline-none w-full truncate"
              placeholder="Project title..."
            />
          </div>
        </div>
      </header>

      {/* Steps indicator */}
      <EditorSteps currentStep={step} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {step === 1 && (
          <UploadStep
            project={project}
            userId={user?.id}
            onUpdate={updateProject}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <EffectsStep
            project={project}
            onUpdate={updateProject}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <GenerateStep
            project={project}
            onUpdate={(updates) => {
              updateProject(updates);
              if (updates.output_url) setStep(4);
            }}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <ExportStep
            project={project}
            onBack={() => setStep(3)}
          />
        )}
      </main>
    </div>
  );
};

export default Editor;