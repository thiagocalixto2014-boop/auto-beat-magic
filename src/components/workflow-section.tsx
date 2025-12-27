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
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-3xl pointer-events-none animate-pulse-glow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(270 60% 25% / 0.15) 0%, transparent 60%)'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight mb-6">
            How it <span className="bg-gradient-purple bg-clip-text text-transparent">works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            From raw clips to viral content in four simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <Card 
              key={index} 
              className="relative p-8 bg-card/50 backdrop-blur-sm border-purple-main/10 hover:border-purple-main/30 transition-all duration-500 group hover:shadow-purple"
            >
              {/* Step Number */}
              <div className="text-6xl font-black text-purple-main/10 absolute top-4 right-4 group-hover:text-purple-main/20 transition-colors">
                {step.step}
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-purple-main/10 flex items-center justify-center mb-6 group-hover:bg-purple-main/20 transition-colors group-hover:shadow-purple">
                <step.icon className="w-7 h-7 text-purple-light" />
              </div>

              {/* Content */}
              <div className="space-y-3 relative z-10">
                <h3 className="text-xl font-semibold group-hover:text-purple-light transition-colors">{step.title}</h3>
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