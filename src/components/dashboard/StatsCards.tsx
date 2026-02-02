import { CreditCard, Video, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsCardsProps {
  totalVideos: number;
  credits: number;
  plan: string;
}

export const StatsCards = ({ totalVideos, credits, plan }: StatsCardsProps) => {
  const stats = [
    {
      icon: CreditCard,
      label: "Créditos",
      value: credits.toString(),
      iconBg: "bg-purple-main/20",
      iconColor: "text-purple-light",
    },
    {
      icon: Video,
      label: "Meus Vídeos",
      value: totalVideos.toString(),
      iconBg: "bg-purple-main/20",
      iconColor: "text-purple-light",
    },
    {
      icon: TrendingUp,
      label: "Plano Atual",
      value: plan,
      valueColor: "text-purple-light",
      iconBg: "bg-purple-main/20",
      iconColor: "text-purple-light",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card 
          key={stat.label} 
          className="bg-card/50 border-border/50 p-5 flex items-center gap-4 hover:border-purple-main/30 transition-colors"
        >
          <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
            <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.valueColor || 'text-foreground'}`}>
              {stat.value}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};
