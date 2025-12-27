interface FloatingCardProps {
  title: string;
  creator: string;
  className?: string;
  gradient: string;
  videoSrc?: string;
}

export const FloatingCard = ({ title, creator, className = "", gradient, videoSrc }: FloatingCardProps) => {
  return (
    <div className={`relative w-52 aspect-[9/16] rounded-2xl overflow-hidden shadow-card border border-purple-main/20 backdrop-blur-sm ${className}`}>
      {/* Video or Gradient Background */}
      {videoSrc ? (
        <video
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className={`absolute inset-0 ${gradient}`} />
      )}
      
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      
      {/* Shimmer effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-light/10 to-transparent animate-shimmer pointer-events-none"
        style={{ backgroundSize: '200% 100%' }}
      />

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-5 h-5 rounded-full bg-purple-main/30 border border-purple-main/50" />
          <p className="text-xs text-muted-foreground">{creator}</p>
        </div>
      </div>
    </div>
  );
};