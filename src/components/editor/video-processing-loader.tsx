import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clapperboard } from "lucide-react";

interface VideoProcessingLoaderProps {
  fileName?: string;
  isProcessing: boolean;
  onComplete?: () => void;
}

export const VideoProcessingLoader = ({ 
  fileName = "Vídeo", 
  isProcessing,
  onComplete 
}: VideoProcessingLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [framesLoaded, setFramesLoaded] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  
  // Simulated values for visual effect
  const totalFrames = 1337;
  const totalBatches = 14;
  const estimatedSeconds = Math.max(5, Math.round((100 - progress) * 0.34));

  useEffect(() => {
    if (!isProcessing) {
      setProgress(0);
      setFramesLoaded(0);
      setCurrentBatch(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onComplete?.();
          return 100;
        }
        return prev + Math.random() * 2 + 0.5;
      });

      setFramesLoaded((prev) => {
        const newVal = Math.min(totalFrames, prev + Math.floor(Math.random() * 30 + 10));
        return newVal;
      });

      setCurrentBatch((prev) => {
        const expectedBatch = Math.floor((progress / 100) * totalBatches);
        return Math.min(totalBatches, Math.max(prev, expectedBatch));
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isProcessing, progress, onComplete]);

  if (!isProcessing) return null;

  return (
    <Card className="p-8 bg-card/80 border-border/60 max-w-xl mx-auto">
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Clapper Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center">
            <Clapperboard className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-purple-main animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-purple-light">
            Carregando Conteúdo
          </h3>
          <p className="text-muted-foreground">
            Preparando <span className="text-foreground font-semibold">{totalFrames.toLocaleString()}</span> frames para reprodução fluida...
          </p>
          <p className="text-sm text-muted-foreground">
            Isso pode levar cerca de {estimatedSeconds} segundos
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-3">
          <Progress value={Math.min(100, progress)} className="h-2" />
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-3xl font-bold text-foreground">
              {Math.min(100, Math.floor(progress))}%
            </span>
            <span className="text-muted-foreground">
              Lote {currentBatch}/{totalBatches}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-8 w-full pt-2">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Frames Carregados
            </p>
            <p className="text-2xl font-bold text-foreground">
              {framesLoaded.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Total de Frames
            </p>
            <p className="text-2xl font-bold text-foreground">
              {totalFrames.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Footer message */}
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <span>🎬</span>
          Por favor, aguarde enquanto otimizamos seu conteúdo...
        </p>
      </div>
    </Card>
  );
};
