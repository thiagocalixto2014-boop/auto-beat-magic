import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft, Clock, Wifi, WifiOff } from "lucide-react";
import { AdminLoginGate } from "@/components/admin/AdminLoginGate";
import { ServerStatusCards } from "@/components/admin/ServerStatusCards";
import { JobsTable, Job } from "@/components/admin/JobsTable";
import { PerformanceChart } from "@/components/admin/PerformanceChart";

const POLL_INTERVAL = 5000;
const SERVER_BASE_URL = "http://188.34.136.38";

interface ServerHealth {
  status: string;
  version: string;
  queue: {
    queue_size: number;
    active_workers: number;
    max_workers: number;
    total_jobs: number;
    use_ramdisk: boolean;
    recent_jobs: Job[];
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [health, setHealth] = useState<ServerHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [previousJobIds, setPreviousJobIds] = useState<Set<string>>(new Set());
  const [newJobIds, setNewJobIds] = useState<Set<string>>(new Set());

  const fetchServerData = useCallback(async (isManual = false) => {
    if (isManual) setIsLoading(true);

    try {
      // Direct request to server (CORS enabled on server)
      const response = await fetch(`${SERVER_BASE_URL}/health`, {
        method: "GET",
        mode: "cors",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const healthData: ServerHealth = await response.json();
      
      // Check for new jobs
      const currentJobIds = new Set(healthData.queue.recent_jobs.map((j: Job) => j.id));
      const newIds = new Set<string>();
      currentJobIds.forEach((id: string) => {
        if (!previousJobIds.has(id)) {
          newIds.add(id);
        }
      });
      
      if (newIds.size > 0 && previousJobIds.size > 0) {
        setNewJobIds(newIds);
        setTimeout(() => setNewJobIds(new Set()), 3000);
      }
      
      setPreviousJobIds(currentJobIds);
      setHealth(healthData);
      setIsError(false);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to fetch server data:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [previousJobIds]);

  useEffect(() => {
    fetchServerData(true);
    
    const interval = setInterval(() => {
      fetchServerData(false);
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const getTimeSinceUpdate = () => {
    if (!lastUpdate) return "-";
    const seconds = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
    if (seconds < 5) return "agora";
    return `${seconds}s atrás`;
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(selectedJob?.id === job.id ? null : job);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="hover:bg-purple-main/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">
                  <span className="bg-gradient-purple bg-clip-text text-transparent">EDIT</span>
                  <span className="text-foreground">LABS</span>
                  <span className="text-muted-foreground ml-2 font-normal">Admin Dashboard</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Server status indicator */}
              <div className="flex items-center gap-2">
                {isError ? (
                  <WifiOff className="w-4 h-4 text-red-400" />
                ) : (
                  <Wifi className="w-4 h-4 text-emerald-400" />
                )}
                <span className={`text-sm ${isError ? "text-red-400" : "text-emerald-400"}`}>
                  {isError ? "Offline" : "Online"}
                </span>
              </div>

              {/* Last update indicator */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Atualizado: {getTimeSinceUpdate()}</span>
              </div>

              {/* Manual refresh button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchServerData(true)}
                disabled={isLoading}
                className="border-border/50 hover:bg-purple-main/10 hover:border-purple-main/30"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Server Status Cards */}
        <ServerStatusCards 
          health={health} 
          isLoading={isLoading && !health} 
          isError={isError} 
        />

        {/* Jobs Table */}
        <JobsTable 
          jobs={health?.queue.recent_jobs || []}
          isLoading={isLoading && !health}
          onSelectJob={handleSelectJob}
          selectedJobId={selectedJob?.id || null}
        />

        {/* Performance Chart */}
        <PerformanceChart job={selectedJob} />

        {/* New job indicator */}
        {newJobIds.size > 0 && (
          <div className="fixed bottom-4 right-4 bg-purple-main text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {newJobIds.size} novo(s) job(s) na fila
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          EditLabs Admin Dashboard • Polling a cada {POLL_INTERVAL / 1000}s
        </div>
      </footer>
    </div>
  );
};

const Admin = () => {
  return (
    <AdminLoginGate>
      <AdminDashboard />
    </AdminLoginGate>
  );
};

export default Admin;
