import { CreditCard, Video, Crown, Zap } from "lucide-react";

interface StatsCardsProps {
  totalVideos: number;
  credits: number;
  plan: string;
}

export const StatsCards = ({ totalVideos, credits, plan }: StatsCardsProps) => {
  const stats = [
    {
      icon: Zap,
      label: "Créditos",
      value: credits.toString(),
      gradient: "from-purple-main/20 to-purple-glow/10",
      iconGradient: "from-purple-main to-purple-glow",
      borderColor: "border-purple-main/20",
    },
    {
      icon: Video,
      label: "Meus Vídeos",
      value: totalVideos.toString(),
      gradient: "from-violet/20 to-purple-main/10",
      iconGradient: "from-violet to-purple-main",
      borderColor: "border-violet/20",
    },
    {
      icon: Crown,
      label: "Plano Atual",
      value: plan,
      isHighlight: true,
      gradient: "from-magenta/20 to-purple-glow/10",
      iconGradient: "from-magenta to-purple-glow",
      borderColor: "border-magenta/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          className={`
            group relative overflow-hidden rounded-2xl p-6
            bg-gradient-to-br ${stat.gradient}
            border ${stat.borderColor}
            hover:scale-[1.02] hover:shadow-purple/20 hover:shadow-xl
            transition-all duration-500 cursor-default
          `}
        >
          {/* Background glow effect */}
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-purple-main/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative flex items-center gap-5">
            <div className={`
              w-14 h-14 rounded-2xl 
              bg-gradient-to-br ${stat.iconGradient}
              flex items-center justify-center
              shadow-lg group-hover:shadow-purple/30
              transition-shadow duration-300
            `}>
              <stat.icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <p className={`text-3xl font-bold mt-0.5 ${stat.isHighlight ? 'bg-gradient-purple bg-clip-text text-transparent' : 'text-foreground'}`}>
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
