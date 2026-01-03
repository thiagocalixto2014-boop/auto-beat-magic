import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, ExternalLink, Clock, AlertCircle, Check, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export interface Job {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  output_url: string | null;
  error: string | null;
  perf_data?: {
    total_time: number;
    stages: Record<string, number>;
  };
}

interface JobsTableProps {
  jobs: Job[];
  isLoading: boolean;
  onSelectJob: (job: Job) => void;
  selectedJobId: string | null;
}

const statusConfig = {
  queued: {
    label: "Na Fila",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-400/30 hover:bg-yellow-500/30",
  },
  processing: {
    label: "Processando",
    className: "bg-blue-500/20 text-blue-400 border-blue-400/30 hover:bg-blue-500/30",
  },
  completed: {
    label: "Concluído",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-400/30 hover:bg-emerald-500/30",
  },
  failed: {
    label: "Falhou",
    className: "bg-red-500/20 text-red-400 border-red-400/30 hover:bg-red-500/30",
  },
};

export const JobsTable = ({ jobs, isLoading, onSelectJob, selectedJobId }: JobsTableProps) => {
  const [filter, setFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredJobs = filter === "all" 
    ? jobs 
    : jobs.filter(job => job.status === filter);

  const copyJobId = async (id: string) => {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("Job ID copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDuration = (job: Job) => {
    if (!job.started_at) return "-";
    
    const start = new Date(job.started_at).getTime();
    const end = job.completed_at 
      ? new Date(job.completed_at).getTime() 
      : Date.now();
    
    const seconds = Math.floor((end - start) / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Jobs Recentes</CardTitle>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40 bg-background/50 border-border/50">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="completed">Concluídos</SelectItem>
            <SelectItem value="processing">Processando</SelectItem>
            <SelectItem value="queued">Na Fila</SelectItem>
            <SelectItem value="failed">Falhos</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Job ID</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Progresso</TableHead>
                <TableHead className="text-muted-foreground">Tempo</TableHead>
                <TableHead className="text-muted-foreground">Criado</TableHead>
                <TableHead className="text-muted-foreground">Output</TableHead>
                <TableHead className="text-muted-foreground">Erro</TableHead>
                <TableHead className="text-muted-foreground w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-main border-t-transparent rounded-full animate-spin" />
                      Carregando jobs...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum job encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <TableRow 
                    key={job.id} 
                    className={`border-border/50 cursor-pointer transition-colors ${
                      selectedJobId === job.id ? "bg-purple-main/10" : "hover:bg-muted/20"
                    }`}
                    onClick={() => onSelectJob(job)}
                  >
                    <TableCell className="font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-24">{job.id.substring(0, 12)}...</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyJobId(job.id);
                          }}
                        >
                          {copiedId === job.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={statusConfig[job.status].className}
                      >
                        {statusConfig[job.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted/30 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              job.status === "failed" ? "bg-red-500" :
                              job.status === "completed" ? "bg-emerald-500" :
                              "bg-purple-main"
                            }`}
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-10">
                          {job.progress.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDuration(job)}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(job.created_at)}
                    </TableCell>
                    <TableCell>
                      {job.output_url ? (
                        <a
                          href={job.output_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-purple-main hover:text-purple-main/80 transition-colors text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Ver vídeo
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.error ? (
                        <div className="flex items-center gap-1 text-red-400 text-xs max-w-32 truncate" title={job.error}>
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{job.error}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.perf_data && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectJob(job);
                          }}
                          title="Ver métricas de performance"
                        >
                          <BarChart3 className="w-3 h-3 text-purple-main" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
