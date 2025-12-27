import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Aura Background - Suno-style atmospheric glow */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
        
        {/* Primary aura blob */}
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full animate-aura-pulse"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(262 83% 58% / 0.15) 0%, hsl(330 85% 60% / 0.08) 40%, transparent 70%)'
          }}
        />
        
        {/* Secondary glow */}
        <div 
          className="absolute top-1/3 left-1/3 w-[500px] h-[400px] rounded-full animate-aura-pulse"
          style={{
            animationDelay: '2s',
            background: 'radial-gradient(ellipse at center, hsl(220 90% 56% / 0.1) 0%, transparent 60%)'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 border border-border text-sm text-muted-foreground animate-fade-up">
            <Sparkles className="w-4 h-4 text-aura-purple" />
            <span>AI-powered video editing</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Make any edit<br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              you can imagine
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Upload your clips, choose a style, and let EditLabs create stunning TikTok edits—automatically synced to the beat.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button size="lg" className="group text-lg px-8 py-6 bg-gradient-primary hover:opacity-90 shadow-aura transition-all">
              Start Creating
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 border-border hover:bg-secondary/50 hover:border-muted-foreground/30"
            >
              Watch Demo
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-12 text-muted-foreground animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">15s</div>
              <div className="text-sm">Max Audio</div>
            </div>
            <div className="w-px h-10 bg-border hidden sm:block" />
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">1080p</div>
              <div className="text-sm">TikTok Ready</div>
            </div>
            <div className="w-px h-10 bg-border hidden sm:block" />
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">AI</div>
              <div className="text-sm">Beat Sync</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};