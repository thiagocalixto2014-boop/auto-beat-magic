import { Play } from "lucide-react";

interface FloatingCardProps {
  title: string;
  creator: string;
  className?: string;
  gradient: string;
}

export const FloatingCard = ({ title, creator, className = "", gradient }: FloatingCardProps) => {
  return (
    <div className={`relative w-52 aspect-[3/4] rounded-2xl overflow-hidden shadow-card border border-purple-main/20 backdrop-blur-sm ${className}`}>
      {/* Gradient Background */}
      <div className={`absolute inset-0 ${gradient}`} />
      
      {/* Shimmer effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-light/10 to-transparent animate-shimmer"
        style={{ backgroundSize: '200% 100%' }}
      />
      
      {/* Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-background/30 backdrop-blur-md flex items-center justify-center border border-purple-main/30 shadow-purple transition-all hover:scale-110 hover:bg-background/50 cursor-pointer group">
          <Play className="w-6 h-6 text-foreground fill-foreground group-hover:text-purple-light group-hover:fill-purple-light transition-colors" />
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 via-background/60 to-transparent">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-5 h-5 rounded-full bg-purple-main/30 border border-purple-main/50" />
          <p className="text-xs text-muted-foreground">{creator}</p>
        </div>
      </div>
    </div>
  );
};