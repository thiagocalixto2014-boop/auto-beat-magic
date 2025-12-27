import { Card } from "@/components/ui/card";
import { Upload, Palette, Zap, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload your clips & music",
    description: "Add up to 15 seconds of audio and the video clips you want to use."
  },
  {
    icon: Palette,
    step: "02",
    title: "Choose your style",
    description: "Select from templates like Flashy, Smooth Zoom, AMV, or Minimal."
  },
  {
    icon: Zap,
    step: "03",
    title: "AI Auto-Edit",
    description: "EditLabs detects the beat, cuts clips in rhythm, and applies effects perfectly synced."
  },
  {
    icon: Download,
    step: "04",
    title: "Export & share",
    description: "Get a vertical 1080×1920 video ready for TikTok, Reels, or Shorts."
  }
];

export const WorkflowSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            How it works
          </h2>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            From raw clips to viral content in four simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <Card 
              key={index} 
              className="relative p-8 bg-card/50 backdrop-blur-sm border-border hover:border-muted-foreground/30 transition-all duration-300 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Step Number */}
              <div className="text-6xl font-black text-muted/30 absolute top-4 right-4">
                {step.step}
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-aura-purple/10 transition-colors">
                <step.icon className="w-7 h-7 text-aura-purple" />
              </div>

              {/* Content */}
              <div className="space-y-3 relative z-10">
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};