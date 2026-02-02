import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Sparkles, 
  BookOpen, 
  CreditCard, 
  User, 
  LogOut,
  Wand2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  highlight?: boolean;
}

export const DashboardSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Falha ao sair");
    }
  };

  const navItems: NavItem[] = [
    { icon: Home, label: "Início", path: "/dashboard" },
    { icon: Wand2, label: "Criar Mágico", path: "/editor/new", highlight: true },
    { icon: Sparkles, label: "Editor IA", path: "/dashboard" },
    { icon: BookOpen, label: "Biblioteca", path: "/library" },
    { icon: CreditCard, label: "Assinatura", path: "/dashboard" },
    { icon: User, label: "Perfil", path: "/dashboard" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-card to-background border-r border-border/30 flex flex-col z-40">
      {/* Logo */}
      <div className="p-8">
        <div className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-purple flex items-center justify-center shadow-purple">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="bg-gradient-purple bg-clip-text text-transparent">EDIT</span>
            <span className="text-foreground">LABS</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path && !item.highlight;
          return (
            <button
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300",
                item.highlight 
                  ? "bg-gradient-purple text-white shadow-purple hover:shadow-glow hover:scale-[1.02]"
                  : isActive 
                    ? "bg-purple-main/15 text-purple-light" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-300",
                item.highlight ? "text-white" : isActive ? "text-purple-light" : ""
              )} />
              {item.label}
              {item.highlight && (
                <span className="ml-auto text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  IA
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 mx-4 mb-4 rounded-2xl bg-secondary/30 border border-border/30">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-transparent group"
        >
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-destructive/10 transition-colors">
            <LogOut className="w-4 h-4 group-hover:text-destructive transition-colors" />
          </div>
          <span className="group-hover:text-destructive transition-colors">Sair</span>
        </Button>
      </div>
    </aside>
  );
};
