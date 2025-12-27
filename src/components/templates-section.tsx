import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Sparkles, Zap, Waves, Minus } from "lucide-react";

const templates = [
  {
    id: 'flashy',
    name: 'Flashy',
    description: 'High-energy cuts with flashes and beat drops',
    icon: Sparkles,
    gradient: 'from-purple-main/40 to-violet/20',
    effects: ['Flash Effects', 'Beat Drops', 'Quick Cuts'],
    popular: true
  },
  {
    id: 'smooth-zoom',
    name: 'Smooth Zoom',
    description: 'Cinematic zooms and smooth transitions',
    icon: Zap,
    gradient: 'from-violet/40 to-magenta/20',
    effects: ['Zoom Effects', 'Smooth Transitions', 'Slow Motion'],
    popular: true
  },
  {
    id: 'amv',
    name: 'AMV Style',
    description: 'Anime music video style with dynamic effects',
    icon: Waves,
    gradient: 'from-magenta/40 to-purple-glow/20',
    effects: ['Dynamic Cuts', 'Color Grading', 'Text Effects'],
    popular: false
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean cuts with subtle transitions',
    icon: Minus,
    gradient: 'from-purple-glow/30 to-purple-deep/20',
    effects: ['Clean Cuts', 'Subtle Effects', 'Simple Flow'],
    popular: false
  }
];

export const TemplatesSection = () => {
  return (
    <section className="py-24 bg-card/30 relative overflow-hidden">
      {/* Ambient glow */}
      <div 
        className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full blur-3xl pointer-events-none animate-drift"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(280 60% 30% / 0.15) 0%, transparent 60%)'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight mb-6">
            Choose your <span className="bg-gradient-purple bg-clip-text text-transparent">style</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Each template is designed to match different moods and genres
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className="relative group cursor-pointer overflow-hidden border-purple-main/10 hover:border-purple-main/40 transition-all duration-500 hover:shadow-purple"
            >
              {template.popular && (
                <Badge className="absolute top-4 right-4 z-10 bg-gradient-purple text-primary-foreground border-0">
                  Popular
                </Badge>
              )}

              {/* Preview Area */}
              <div className={`aspect-[9/16] bg-gradient-to-br ${template.gradient} relative`}>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <template.icon className="w-12 h-12 text-foreground/50 mb-4 group-hover:text-purple-light transition-colors" />
                  
                  {/* Waveform mockup */}
                  <div className="w-full flex items-end justify-center gap-1 h-16">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div 
                        key={i}
                        className="w-1 bg-purple-light/30 rounded-full animate-pulse group-hover:bg-purple-light/50 transition-colors"
                        style={{ 
                          height: `${20 + Math.random() * 80}%`,
                          animationDelay: `${i * 0.05}s`
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/60 backdrop-blur-sm">
                  <Button size="icon" className="w-14 h-14 rounded-full bg-gradient-purple text-primary-foreground hover:opacity-90 shadow-purple">
                    <Play className="w-6 h-6 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <template.icon className="w-5 h-5 text-purple-light" />
                  <h3 className="text-lg font-semibold group-hover:text-purple-light transition-colors">{template.name}</h3>
                </div>
                
                <p className="text-muted-foreground text-sm mb-4">
                  {template.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {template.effects.map((effect) => (
                    <Badge 
                      key={effect} 
                      variant="secondary" 
                      className="text-xs bg-purple-main/10 text-purple-light/80 border-purple-main/20"
                    >
                      {effect}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};