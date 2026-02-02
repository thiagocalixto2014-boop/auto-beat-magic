import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Sparkles, 
  Video, 
  Clock, 
  Calendar,
  Film,
  Upload,
  X,
  Loader2,
  Play,
  ArrowRight
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

interface Project {
  id: string;
  title: string;
  status: string;
  template: string;
  created_at: string;
  output_url: string | null;
  clips_urls: string[] | null;
}

const CreateMagic = () => {
  const [user, setUser] = useState<any>(null);
  const [lastProject, setLastProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showBanner, setShowBanner] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        fetchLastProject();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchLastProject = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setLastProject(data);
    } catch (error) {
      console.error("Error fetching last project:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato inválido. Use MP4, MOV, AVI ou WebM.");
      return;
    }

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 500MB.");
      return;
    }

    // Check duration (will create project and navigate)
    setUploading(true);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Create new project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          title: file.name.replace(/\.[^/.]+$/, ""),
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Upload file to storage
      const filePath = `${user.id}/${project.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("clips")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("clips")
        .getPublicUrl(filePath);

      // Update project with clip URL
      await supabase
        .from("projects")
        .update({ clips_urls: [urlData.publicUrl] })
        .eq("id", project.id);

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast.success("Vídeo importado com sucesso!");
      navigate(`/editor/${project.id}`);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Falha ao importar vídeo. Tente novamente.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-purple-light" />
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
        <main className="p-10 space-y-8 max-w-5xl">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-light" />
                Criar Mágico
              </h1>
              <p className="text-muted-foreground">
                Crie edits virais com inteligência artificial
              </p>
            </div>
          </div>

          {/* Last Created Edit */}
          {lastProject && (
            <div className="rounded-2xl border border-border/50 bg-card/30 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span className="text-xl">🚀</span>
                  Última Edição Criada
                </h2>
                <Button
                  onClick={() => navigate(`/editor/${lastProject.id}`)}
                  className="bg-gradient-purple hover:opacity-90 transition-all gap-2 rounded-xl"
                >
                  Ver Previews
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-5">
                {/* Thumbnail */}
                <div className="w-32 h-20 rounded-xl bg-secondary/50 overflow-hidden flex-shrink-0 relative group">
                  {lastProject.output_url ? (
                    <video 
                      src={lastProject.output_url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-main/10 to-purple-glow/5">
                      <Play className="w-8 h-8 text-purple-main/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{lastProject.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1.5">
                      <Film className="w-4 h-4" />
                      {lastProject.clips_urls?.length || 0} cenas
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatDate(lastProject.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Import Video Section */}
          <div className="rounded-2xl border border-border/50 bg-card/30 p-6 space-y-5">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-light" />
                Importar Vídeo
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Limite de até 3 minutos de duração
              </p>
            </div>

            {/* Upload Zone */}
            <div
              className={`
                relative rounded-2xl border-2 border-dashed p-12 text-center
                transition-all duration-300 cursor-pointer
                ${dragActive 
                  ? 'border-purple-light bg-purple-main/10 scale-[1.01]' 
                  : 'border-purple-main/40 hover:border-purple-light hover:bg-purple-main/5'
                }
                ${uploading ? 'pointer-events-none' : ''}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                onChange={handleFileInput}
                className="hidden"
              />

              {uploading ? (
                <div className="space-y-4">
                  <Loader2 className="w-12 h-12 mx-auto text-purple-light animate-spin" />
                  <div className="space-y-2">
                    <p className="text-foreground font-medium">Importando vídeo...</p>
                    <div className="w-64 mx-auto h-2 rounded-full bg-secondary overflow-hidden">
                      <div 
                        className="h-full bg-gradient-purple transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-main/20 to-purple-glow/10 flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-purple-light" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-foreground font-medium text-lg">
                      Clique para importar vídeo
                    </p>
                    <p className="text-muted-foreground text-sm">
                      ou arraste e solte aqui
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground/70">
                    MP4, MOV, AVI, WebM (máx. 3 minutos)
                  </p>
                </div>
              )}

              {/* Animated border glow on drag */}
              {dragActive && (
                <div className="absolute inset-0 rounded-2xl border-2 border-purple-light animate-pulse pointer-events-none" />
              )}
            </div>

            {/* Quick tips */}
            <div className="flex items-center gap-6 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-main" />
                Resolução recomendada: 1080p ou 4K
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-main" />
                Qualidade melhor = edits melhores
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateMagic;
