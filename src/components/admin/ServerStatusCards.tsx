import { Card, CardContent } from "@/components/ui/card";
import { 
  Server, 
  Activity, 
  Users, 
  ListTodo, 
  CheckCircle, 
  HardDrive,
  AlertCircle
} from "lucide-react";

interface ServerHealth {
  status: string;
  version: string;
  queue: {
    queue_size: number;
    active_workers: number;
    max_workers: number;
    total_jobs: number;
    use_ramdisk: boolean;
  };
}

interface ServerStatusCardsProps {
  health: ServerHealth | null;
  isLoading: boolean;
  isError: boolean;
}

export const ServerStatusCards = ({ health, isLoading, isError }: ServerStatusCardsProps) => {
  const cards = [
    {
      title: "Status do Servidor",
      value: isError ? "Offline" : (health?.status === "healthy" ? "Online" : "Unhealthy"),
      icon: Server,
      color: isError ? "text-red-400" : (health?.status === "healthy" ? "text-emerald-400" : "text-yellow-400"),
      bgColor: isError ? "bg-red-500/10" : (health?.status === "healthy" ? "bg-emerald-500/10" : "bg-yellow-500/10"),
    },
    {
      title: "Versão",
      value: health?.version || "-",
      icon: Activity,
      color: "text-purple-main",
      bgColor: "bg-purple-main/10",
    },
    {
      title: "Workers",
      value: health ? `${health.queue.active_workers} / ${health.queue.max_workers}` : "-",
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Fila",
      value: health?.queue.queue_size?.toString() || "0",
      icon: ListTodo,
      color: health?.queue.queue_size && health.queue.queue_size > 0 ? "text-yellow-400" : "text-muted-foreground",
      bgColor: health?.queue.queue_size && health.queue.queue_size > 0 ? "bg-yellow-500/10" : "bg-muted/10",
    },
    {
      title: "Total de Jobs",
      value: health?.queue.total_jobs?.toString() || "0",
      icon: CheckCircle,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Ramdisk",
      value: health?.queue.use_ramdisk ? "Ativo" : "Inativo",
      icon: HardDrive,
      color: health?.queue.use_ramdisk ? "text-emerald-400" : "text-muted-foreground",
      bgColor: health?.queue.use_ramdisk ? "bg-emerald-500/10" : "bg-muted/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card 
          key={card.title} 
          className="border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-purple-main/30"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
                ) : isError && card.title === "Status do Servidor" ? (
                  <AlertCircle className={`w-5 h-5 ${card.color}`} />
                ) : (
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{card.title}</p>
                <p className={`text-lg font-semibold ${card.color}`}>
                  {isLoading ? "..." : card.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
