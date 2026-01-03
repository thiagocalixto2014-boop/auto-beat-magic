import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Clock, Zap } from "lucide-react";
import type { Job } from "./JobsTable";

interface PerformanceChartProps {
  job: Job | null;
}

const stageLabels: Record<string, string> = {
  download_video: "Download Vídeo",
  download_audio: "Download Áudio",
  beat_detect: "Detecção de Beats",
  effects_apply: "Aplicar Efeitos",
  encode_video: "Codificar Vídeo",
};

const stageColors: Record<string, string> = {
  download_video: "#8b5cf6",
  download_audio: "#a855f7",
  beat_detect: "#d946ef",
  effects_apply: "#ec4899",
  encode_video: "#f43f5e",
};

export const PerformanceChart = ({ job }: PerformanceChartProps) => {
  if (!job) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-12 text-center text-muted-foreground">
          <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Selecione um job para ver as métricas de performance</p>
        </CardContent>
      </Card>
    );
  }

  if (!job.perf_data) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-main" />
            Métricas de Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>Dados de performance não disponíveis para este job</p>
          <p className="text-sm mt-1">Job ID: {job.id}</p>
        </CardContent>
      </Card>
    );
  }

  const totalTime = job.perf_data.total_time;
  const chartData = Object.entries(job.perf_data.stages).map(([stage, time]) => ({
    stage,
    label: stageLabels[stage] || stage,
    time: Number(time.toFixed(2)),
    percentage: ((time / totalTime) * 100).toFixed(1),
    color: stageColors[stage] || "#8b5cf6",
  }));

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs.toFixed(0)}s`;
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-main" />
          Métricas de Performance
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          Total: <span className="text-foreground font-medium">{formatTime(totalTime)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis 
                type="number" 
                stroke="#6b7280" 
                fontSize={12}
                tickFormatter={(value) => `${value}s`}
              />
              <YAxis 
                type="category" 
                dataKey="label" 
                stroke="#6b7280" 
                fontSize={12}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number, name: string) => [
                  `${value}s (${((value / totalTime) * 100).toFixed(1)}%)`,
                  "Tempo"
                ]}
                labelFormatter={(label) => label}
              />
              <Bar dataKey="time" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stage breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {chartData.map((item) => (
            <div 
              key={item.stage}
              className="p-3 rounded-lg bg-background/50 border border-border/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground truncate">{item.label}</span>
              </div>
              <p className="text-lg font-semibold" style={{ color: item.color }}>
                {formatTime(item.time)}
              </p>
              <p className="text-xs text-muted-foreground">{item.percentage}% do total</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Job ID: <span className="font-mono">{job.id}</span>
        </p>
      </CardContent>
    </Card>
  );
};
