import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  CreditCard, 
  Check, 
  Sparkles,
  X,
  Loader2,
  Zap
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Grátis",
    price: 0,
    credits: 10,
    features: [
      "10 créditos/mês",
      "Qualidade HD",
      "Suporte básico"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: 29.9,
    credits: 100,
    features: [
      "100 créditos/mês",
      "Qualidade 4K",
      "Suporte prioritário",
      "Sem marca d'água"
    ],
    popular: true
  },
  {
    id: "premium",
    name: "Premium",
    price: 79.9,
    credits: 500,
    features: [
      "500 créditos/mês",
      "Qualidade 4K",
      "Suporte VIP",
      "Sem marca d'água",
      "API Access"
    ]
  }
];

const Subscription = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [currentPlan] = useState("free"); // TODO: Get from user profile/subscription
  const [credits] = useState(10); // TODO: Get from user profile
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
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubscribe = (planId: string) => {
    if (planId === currentPlan) return;
    
    // TODO: Implement Stripe checkout
    toast.info("Integração de pagamento em breve!");
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
              <CreditCard className="w-8 h-8 text-purple-light" />
              Assinatura
            </h1>
          </div>

          {/* Current Plan Card */}
          <div className="rounded-2xl border border-border/50 bg-card/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Plano Atual</p>
                <p className="text-2xl font-bold mt-1 bg-gradient-purple bg-clip-text text-transparent">
                  {currentPlan}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Créditos</p>
                <p className="text-3xl font-bold text-purple-light">{credits}</p>
              </div>
            </div>
          </div>

          {/* Upgrade Plans */}
          <div className="space-y-5">
            <h2 className="text-xl font-semibold">Atualizar Plano</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {plans.map((plan) => {
                const isCurrentPlan = plan.id === currentPlan;
                
                return (
                  <div 
                    key={plan.id}
                    className={`
                      relative rounded-2xl p-6 transition-all duration-300
                      ${isCurrentPlan 
                        ? 'border-2 border-purple-main/50 bg-gradient-to-b from-purple-main/10 to-card/50' 
                        : 'border border-border/50 bg-card/30 hover:border-purple-main/30'
                      }
                    `}
                  >
                    {/* Plan name */}
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    
                    {/* Price */}
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-bold bg-gradient-purple bg-clip-text text-transparent">
                        R$ {plan.price.toFixed(plan.price === 0 ? 0 : 1).replace('.', ',')}
                      </span>
                      <span className="text-muted-foreground text-sm">/Mensal</span>
                    </div>
                    
                    {/* Credits */}
                    <p className="text-muted-foreground text-sm mt-2">
                      {plan.credits} Créditos/mês
                    </p>
                    
                    {/* Features */}
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-emerald-400" />
                          </div>
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* CTA Button */}
                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isCurrentPlan}
                      className={`
                        w-full mt-8 rounded-xl h-12 font-semibold transition-all
                        ${isCurrentPlan 
                          ? 'bg-secondary text-muted-foreground cursor-not-allowed' 
                          : 'bg-gradient-purple hover:opacity-90 shadow-purple hover:shadow-glow text-white'
                        }
                      `}
                    >
                      {isCurrentPlan ? 'Plano Atual' : 'Assinar'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAQ or additional info */}
          <div className="rounded-2xl border border-border/50 bg-card/30 p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-light" />
              Como funcionam os créditos?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cada vídeo criado consome 1 crédito. Os créditos são renovados mensalmente de acordo com seu plano.
              Créditos não utilizados não acumulam para o próximo mês.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Subscription;
