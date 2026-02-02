import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Sparkles, 
  BookOpen, 
  CreditCard, 
  User, 
  LogOut,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  action?: () => void;
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
    { icon: Sparkles, label: "Criar Mágico", path: "/editor/new" },
    { icon: BookOpen, label: "Biblioteca", path: "/dashboard" },
    { icon: CreditCard, label: "Assinatura", path: "/dashboard" },
    { icon: User, label: "Perfil", path: "/dashboard" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border/50 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6">
        <div className="text-xl font-bold tracking-tight">
          <span className="bg-gradient-purple bg-clip-text text-transparent">EDIT</span>
          <span className="text-foreground">LABS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive 
                  ? "bg-purple-main/10 text-purple-light border-l-2 border-purple-main" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-purple-light")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-border/50">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </Button>
      </div>
    </aside>
  );
};
