import { Play } from "lucide-react";

interface FloatingCardProps {
  title: string;
  creator: string;
  className?: string;
  gradient: string;
}

export const FloatingCard = ({ title, creator, className = "", gradient }: FloatingCardProps) => {
  return (
    <div className={`relative w-48 aspect-[3/4] rounded-2xl overflow-hidden shadow-card ${className}`}>
      {/* Gradient Background */}
      <div className={`absolute inset-0 ${gradient}`} />
      
      {/* Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center border border-foreground/10">
          <Play className="w-6 h-6 text-foreground fill-foreground" />
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/80 to-transparent">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-5 h-5 rounded-full bg-foreground/20" />
          <p className="text-xs text-foreground/70">{creator}</p>
        </div>
      </div>
    </div>
  );
};