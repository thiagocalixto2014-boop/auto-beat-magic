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
    gradient: 'from-aura-purple/20 to-aura-pink/10',
    effects: ['Flash Effects', 'Beat Drops', 'Quick Cuts'],
    popular: true
  },
  {
    id: 'smooth-zoom',
    name: 'Smooth Zoom',
    description: 'Cinematic zooms and smooth transitions',
    icon: Zap,
    gradient: 'from-aura-pink/20 to-aura-blue/10',
    effects: ['Zoom Effects', 'Smooth Transitions', 'Slow Motion'],
    popular: true
  },
  {
    id: 'amv',
    name: 'AMV Style',
    description: 'Anime music video style with dynamic effects',
    icon: Waves,
    gradient: 'from-aura-blue/20 to-aura-teal/10',
    effects: ['Dynamic Cuts', 'Color Grading', 'Text Effects'],
    popular: false
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean cuts with subtle transitions',
    icon: Minus,
    gradient: 'from-aura-teal/20 to-aura-purple/10',
    effects: ['Clean Cuts', 'Subtle Effects', 'Simple Flow'],
    popular: false
  }
];

export const TemplatesSection = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Choose your style
          </h2>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Each template is designed to match different moods and genres
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className="relative group cursor-pointer overflow-hidden border-border hover:border-muted-foreground/30 transition-all duration-300"
            >
              {template.popular && (
                <Badge className="absolute top-4 right-4 z-10 bg-aura-purple text-primary-foreground border-0">
                  Popular
                </Badge>
              )}

              {/* Preview Area */}
              <div className={`aspect-[9/16] bg-gradient-to-br ${template.gradient} relative`}>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <template.icon className="w-12 h-12 text-foreground/60 mb-4" />
                  
                  {/* Waveform mockup */}
                  <div className="w-full flex items-end justify-center gap-1 h-16">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div 
                        key={i}
                        className="w-1 bg-foreground/20 rounded-full animate-pulse"
                        style={{ 
                          height: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.05}s`
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm">
                  <Button size="icon" className="w-14 h-14 rounded-full bg-foreground text-background hover:bg-foreground/90">
                    <Play className="w-6 h-6 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <template.icon className="w-5 h-5 text-aura-purple" />
                  <h3 className="text-lg font-semibold">{template.name}</h3>
                </div>
                
                <p className="text-muted-foreground text-sm mb-4">
                  {template.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {template.effects.map((effect) => (
                    <Badge 
                      key={effect} 
                      variant="secondary" 
                      className="text-xs bg-secondary text-secondary-foreground"
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