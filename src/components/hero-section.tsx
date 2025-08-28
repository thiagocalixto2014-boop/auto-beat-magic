import { Button } from "@/components/ui/button";
import { Play, Upload, Zap, Download } from "lucide-react";
import heroImage from "@/assets/hero-video-editing.jpg";

export const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-neon-purple/10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-neon-purple/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-neon-pink/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-neon-cyan/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Editfy
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground">
                Turn your clips into stunning <span className="text-neon-pink">TikTok-style</span> edits automatically
              </p>
              <p className="text-lg text-muted-foreground max-w-lg">
                No editing skills, no complex software. Just upload your content, choose a template, and let our AI do the magic.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="group">
                <Upload className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Start Creating
              </Button>
              <Button variant="outline" size="xl" className="group border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-background">
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-purple">15s</div>
                <div className="text-sm text-muted-foreground">Max Audio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-pink">1080×1920</div>
                <div className="text-sm text-muted-foreground">Perfect Format</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-cyan">AI</div>
                <div className="text-sm text-muted-foreground">Auto-Sync</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-glow">
              <img 
                src={heroImage} 
                alt="Editfy video editing interface" 
                className="w-full h-auto animate-float"
              />
              <div className="absolute inset-0 bg-gradient-accent/20"></div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 bg-neon-green text-background px-4 py-2 rounded-full text-sm font-bold animate-pulse-neon">
              AI Powered
            </div>
            <div className="absolute -bottom-6 -left-6 bg-neon-pink text-background px-4 py-2 rounded-full text-sm font-bold animate-pulse-neon" style={{ animationDelay: '1s' }}>
              Beat Sync
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};