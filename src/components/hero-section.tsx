import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, ChevronDown, Image } from "lucide-react";
import { FloatingCard } from "./floating-card";
import { Navbar } from "./navbar";
import edit1Video from "@/assets/edit-1.mp4";
import edit2Video from "@/assets/edit-2.mp4";

// Floating particles component
const Particles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-purple-light/30 rounded-full animate-particle-float"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}
        />
      ))}
    </div>
  );
};

export const HeroSection = () => {
  return (
    <section className="min-h-screen relative overflow-hidden bg-gradient-dark">
      {/* Animated Purple Gradient Background */}
      <div className="absolute inset-0">
        {/* Main purple glow - top */}
        <div 
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full animate-pulse-glow blur-3xl"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(270 70% 40% / 0.5) 0%, hsl(280 60% 30% / 0.2) 50%, transparent 70%)'
          }}
        />
        
        {/* Secondary glow - left */}
        <div 
          className="absolute top-1/4 -left-40 w-[500px] h-[500px] rounded-full animate-drift blur-3xl"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(285 70% 35% / 0.3) 0%, transparent 60%)'
          }}
        />

        {/* Tertiary glow - right */}
        <div 
          className="absolute top-1/3 -right-40 w-[600px] h-[500px] rounded-full animate-drift blur-3xl"
          style={{
            animationDelay: '-10s',
            background: 'radial-gradient(ellipse at center, hsl(310 60% 35% / 0.25) 0%, transparent 60%)'
          }}
        />

        {/* Deep bottom glow */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[400px] animate-pulse-glow"
          style={{
            animationDelay: '-2s',
            background: 'radial-gradient(ellipse at bottom, hsl(265 80% 20% / 0.3) 0%, transparent 60%)'
          }}
        />
      </div>

      <Particles />
      <Navbar />

      {/* Floating Cards - Left */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:block z-10">
        <FloatingCard 
          title="Viral Montage"
          creator="@nkftblll"
          className="animate-float -translate-x-16"
          gradient="bg-gradient-to-br from-purple-main/50 via-violet/30 to-background/80"
          videoSrc={edit1Video}
        />
      </div>

      {/* Floating Cards - Right */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block z-10">
        <FloatingCard 
          title="Beat Sync Edit"
          creator="@lizrd_aep"
          className="animate-float-reverse translate-x-16"
          gradient="bg-gradient-to-br from-magenta/40 via-purple-glow/30 to-background/80"
          videoSrc={edit2Video}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Headline */}
          <h1 
            className="text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.1] opacity-0 animate-fade-up"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="text-foreground">Make a </span>
            <span className="text-foreground">viral edit about</span>
            <br />
            <span className="bg-gradient-purple bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient-shift">
              your best moments
            </span>
            <span className="text-purple-light animate-blink">|</span>
          </h1>

          {/* Subtitle */}
          <p 
            className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto opacity-0 animate-fade-up"
            style={{ animationDelay: '0.3s' }}
          >
            Start with your clips or dive into our pro editing tools, your next viral video is just a step away.
          </p>

          {/* Prompt Input Box */}
          <div 
            className="max-w-2xl mx-auto mt-8 opacity-0 animate-fade-up"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="relative bg-secondary/60 backdrop-blur-xl rounded-2xl border border-purple-main/20 p-4 shadow-purple transition-all hover:border-purple-main/40 hover:shadow-glow">
              <div className="flex items-start gap-3">
                <input
                  type="text"
                  placeholder="Describe the edit you want to create..."
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-base outline-none py-2"
                />
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-purple-light hover:bg-purple-main/10">
                    <Plus className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-purple-light hover:bg-purple-main/10">
                    <Image className="w-5 h-5" />
                  </Button>
                </div>
                <Button className="bg-gradient-purple hover:opacity-90 text-primary-foreground rounded-full px-6 gap-2 shadow-purple transition-all hover:shadow-glow">
                  <Sparkles className="w-4 h-4" />
                  Create
                </Button>
              </div>
            </div>
          </div>

          {/* Explore Button */}
          <div 
            className="pt-4 opacity-0 animate-fade-up"
            style={{ animationDelay: '0.7s' }}
          >
            <Button 
              variant="outline" 
              className="rounded-full border-purple-main/30 text-foreground hover:bg-purple-main/10 hover:border-purple-main/50 gap-2 transition-all"
            >
              Explore Advanced Features
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
    </section>
  );
};