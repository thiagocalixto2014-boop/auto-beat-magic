import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Palette, Zap, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload your clips & music",
    description: "Add up to 15 seconds of audio and the video clips you want to use.",
    color: "neon-purple",
    action: "Choose Files"
  },
  {
    icon: Palette,
    title: "Choose your style",
    description: "Select from templates like Flashy, Smooth Zoom, AMV, or Minimal.",
    color: "neon-pink", 
    action: "Pick Template"
  },
  {
    icon: Zap,
    title: "AI Auto-Edit",
    description: "Editfy detects the beat of your music, cuts clips in rhythm, and applies effects perfectly synced to the song.",
    color: "neon-cyan",
    action: "Generate"
  },
  {
    icon: Download,
    title: "Export & share",
    description: "Get a vertical 1080×1920 video ready for TikTok, Reels, or Shorts. Download in seconds.",
    color: "neon-green",
    action: "Download"
  }
];

export const WorkflowSection = () => {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            How it <span className="bg-gradient-primary bg-clip-text text-transparent">works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From raw clips to viral content in 4 simple steps
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="relative p-6 bg-card/50 backdrop-blur-sm border-border hover:border-neon-purple/50 transition-all duration-300 group hover:shadow-neon">
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-background font-bold text-sm">
                {index + 1}
              </div>

              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-${step.color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <step.icon className={`w-8 h-8 text-${step.color}`} />
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>

                <Button 
                  variant="upload" 
                  size="sm"
                  className="w-full group-hover:border-neon-pink group-hover:text-neon-pink"
                >
                  {step.action}
                </Button>
              </div>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-neon-purple to-transparent"></div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};