import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Sparkles, Zap, Waves, Minimize } from "lucide-react";

const templates = [
  {
    id: 'flashy',
    name: 'Flashy',
    description: 'High-energy cuts with flashes and beat drops',
    icon: Sparkles,
    color: 'neon-purple',
    effects: ['Flash Effects', 'Beat Drops', 'Quick Cuts'],
    popular: true
  },
  {
    id: 'smooth-zoom',
    name: 'Smooth Zoom',
    description: 'Cinematic zooms and smooth transitions',
    icon: Zap,
    color: 'neon-pink',
    effects: ['Zoom Effects', 'Smooth Transitions', 'Slow Motion'],
    popular: true
  },
  {
    id: 'amv',
    name: 'AMV Style',
    description: 'Anime music video style with dynamic effects',
    icon: Waves,
    color: 'neon-cyan',
    effects: ['Dynamic Cuts', 'Color Grading', 'Text Effects'],
    popular: false
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean cuts with subtle transitions',
    icon: Minimize,
    color: 'neon-green',
    effects: ['Clean Cuts', 'Subtle Effects', 'Simple Transitions'],
    popular: false
  }
];

export const TemplatesSection = () => {
  return (
    <section className="py-20 bg-card/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Choose your <span className="bg-gradient-secondary bg-clip-text text-transparent">style</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Each template is designed to match different moods and music genres
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="relative group hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden">
              {template.popular && (
                <Badge className="absolute top-4 right-4 z-10 bg-gradient-primary text-background">
                  Popular
                </Badge>
              )}

              <div className="aspect-[9/16] bg-gradient-to-br from-background to-card relative">
                {/* Template Preview Mockup */}
                <div className="absolute inset-4 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center space-y-4">
                  <template.icon className={`w-8 h-8 text-${template.color}`} />
                  <div className="w-full space-y-2">
                    <div className={`h-2 bg-${template.color}/30 rounded animate-pulse`}></div>
                    <div className={`h-2 bg-${template.color}/20 rounded animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
                    <div className={`h-2 bg-${template.color}/30 rounded animate-pulse`} style={{ animationDelay: '1s' }}></div>
                  </div>
                  
                  <Button variant="ghost" size="icon" className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4" />
                  </Button>
                </div>

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-${template.color}/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <template.icon className={`w-5 h-5 text-${template.color}`} />
                  <h3 className="text-lg font-bold">{template.name}</h3>
                </div>
                
                <p className="text-muted-foreground text-sm mb-4">
                  {template.description}
                </p>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {template.effects.map((effect) => (
                      <Badge key={effect} variant="secondary" className="text-xs">
                        {effect}
                      </Badge>
                    ))}
                  </div>

                  <Button 
                    variant="template" 
                    className="w-full group-hover:border-neon-pink group-hover:text-neon-pink"
                  >
                    Select Template
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};