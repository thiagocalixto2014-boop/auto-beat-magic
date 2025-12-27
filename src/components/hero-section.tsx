import { Button } from "@/components/ui/button";
import { Sparkles, Plus, ChevronDown, Image } from "lucide-react";
import { FloatingCard } from "./floating-card";
import { Navbar } from "./navbar";

export const HeroSection = () => {
  return (
    <section className="min-h-screen relative overflow-hidden">
      {/* Warm Gradient Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, hsl(30 85% 45% / 0.35) 0%, hsl(25 80% 35% / 0.15) 35%, hsl(20 15% 6%) 65%)'
          }}
        />
        {/* Purple accent glow */}
        <div 
          className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(280 70% 50% / 0.15) 0%, transparent 70%)'
          }}
        />
        {/* Warm accent on right */}
        <div 
          className="absolute top-10 right-0 w-[500px] h-[400px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(35 90% 50% / 0.2) 0%, transparent 70%)'
          }}
        />
      </div>

      <Navbar />

      {/* Floating Cards - Left */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:block">
        <div className="relative">
          <FloatingCard 
            title="Viral Montage"
            creator="Creator X"
            className="animate-float -rotate-6 -translate-x-12"
            gradient="bg-gradient-to-br from-brand-violet/40 via-brand-purple/30 to-background"
          />
        </div>
      </div>

      {/* Floating Cards - Right */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block">
        <div className="relative">
          <FloatingCard 
            title="Beat Sync Edit"
            creator="EditMaster"
            className="animate-float-reverse rotate-6 translate-x-12"
            gradient="bg-gradient-to-br from-brand-amber/30 via-brand-orange/20 to-background"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Headline with typing effect */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.1]">
            <span className="text-foreground">Make a </span>
            <span className="text-foreground">viral edit about</span>
            <br />
            <span className="text-foreground relative">
              your best moments
              <span className="animate-blink">|</span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
            Start with your clips or dive into our pro editing tools, your next viral video is just a step away.
          </p>

          {/* Prompt Input Box */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="relative bg-secondary/80 backdrop-blur-sm rounded-2xl border border-border p-4">
              <div className="flex items-start gap-3">
                <input
                  type="text"
                  placeholder="Describe the edit you want to create..."
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-base outline-none py-2"
                />
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                    <Plus className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                    <Image className="w-5 h-5" />
                  </Button>
                </div>
                <Button className="bg-gradient-purple hover:opacity-90 text-primary-foreground rounded-full px-6 gap-2">
                  <Sparkles className="w-4 h-4" />
                  Create
                </Button>
              </div>
            </div>
          </div>

          {/* Explore Button */}
          <div className="pt-4">
            <Button 
              variant="outline" 
              className="rounded-full border-border text-foreground hover:bg-secondary/50 gap-2"
            >
              Explore Advanced Features
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Press Logos */}
        <div className="absolute bottom-12 left-0 right-0">
          <div className="flex items-center justify-center gap-12 text-muted-foreground/40 text-sm font-medium tracking-widest">
            <span>TECHCRUNCH</span>
            <span>WIRED</span>
            <span>THE VERGE</span>
            <span>VARIETY</span>
            <span>BILLBOARD</span>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};