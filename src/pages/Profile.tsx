import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  User, 
  X, 
  Loader2, 
  DollarSign,
  Copy,
  Check,
  Gift
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    language: "pt-BR"
  });
  const navigate = useNavigate();

  // Affiliate stats (placeholder - would come from actual affiliate system)
  const affiliateStats = {
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    availableBalance: 0
  };

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
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
          language: "pt-BR"
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;
      
      toast.success("Perfil atualizado com sucesso!");
      setProfile(prev => prev ? { ...prev, full_name: formData.full_name } : null);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Falha ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  const generateAffiliateLink = () => {
    const baseUrl = window.location.origin;
    const referralCode = user?.id?.slice(0, 10).toUpperCase() || "XXXXX";
    return `${baseUrl}/auth?ref=${referralCode}`;
  };

  const copyAffiliateLink = async () => {
    try {
      await navigator.clipboard.writeText(generateAffiliateLink());
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Falha ao copiar link");
    }
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
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <User className="w-8 h-8 text-purple-light" />
              Meu Perfil
            </h1>
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Info Card */}
            <div className="rounded-2xl border border-border/50 bg-card/30 p-6 space-y-6">
              <h2 className="text-lg font-semibold">Informações Pessoais</h2>
              
              <div className="space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Nome</label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Seu nome"
                    className="bg-secondary/50 border-border/50 h-12 rounded-xl"
                  />
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">E-mail</label>
                  <Input
                    value={user?.email || ""}
                    readOnly
                    className="bg-secondary/50 border-border/50 h-12 rounded-xl text-muted-foreground cursor-not-allowed"
                  />
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Idioma</label>
                  <Select 
                    value={formData.language} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger className="bg-secondary/50 border-border/50 h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (BR)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-purple hover:opacity-90 rounded-xl h-11 px-8 mt-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Salvar
                </Button>
              </div>
            </div>

            {/* Affiliate Program Card */}
            <div className="rounded-2xl border border-purple-main/30 bg-card/30 p-6 space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-light" />
                Programa de Afiliados
              </h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Indicações</p>
                  <p className="text-2xl font-bold">{affiliateStats.totalReferrals}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Indicações Ativas</p>
                  <p className="text-2xl font-bold">{affiliateStats.activeReferrals}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ganhos Totais</p>
                  <p className="text-2xl font-bold">R$ {affiliateStats.totalEarnings.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Disponível</p>
                  <p className="text-2xl font-bold text-purple-light">R$ {affiliateStats.availableBalance.toFixed(2)}</p>
                </div>
              </div>

              {/* Affiliate Link */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Link de Afiliado</label>
                <div className="flex gap-3">
                  <Input
                    value={generateAffiliateLink()}
                    readOnly
                    className="bg-secondary/50 border-border/50 h-12 rounded-xl text-sm flex-1"
                  />
                  <Button
                    onClick={copyAffiliateLink}
                    className="bg-gradient-purple hover:opacity-90 rounded-xl h-12 px-6"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    {copied ? "Copiado!" : "Copiar Link"}
                  </Button>
                </div>
              </div>

              {/* Commission Info */}
              <div className="rounded-xl bg-purple-main/10 border border-purple-main/20 p-4 flex items-start gap-3">
                <Gift className="w-5 h-5 text-purple-light flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Ganhe <span className="text-purple-light font-semibold">30% de comissão recorrente</span> em todas as assinaturas dos seus indicados!
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
