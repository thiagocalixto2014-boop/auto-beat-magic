import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Music, Video, ArrowRight } from "lucide-react";

export const UploadSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Subtle purple glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none blur-3xl animate-pulse-glow"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(270 70% 30% / 0.2) 0%, transparent 60%)'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight mb-6">
            Ready to <span className="bg-gradient-purple bg-clip-text text-transparent">create</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Upload your content and watch the magic happen
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Music Upload */}
            <Card className="p-8 bg-card/60 backdrop-blur-sm border-purple-main/10 hover:border-purple-main/40 transition-all duration-500 group hover:shadow-purple">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-purple-main/10 flex items-center justify-center group-hover:bg-purple-main/20 transition-colors group-hover:shadow-purple">
                  <Music className="w-8 h-8 text-purple-light" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-light transition-colors">Upload Music</h3>
                  <p className="text-muted-foreground text-sm">
                    Add your audio track (max 15 seconds)
                  </p>
                </div>

                <div className="border-2 border-dashed border-purple-main/20 rounded-xl p-6 hover:border-purple-main/50 transition-colors cursor-pointer group-hover:bg-purple-main/5">
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-purple-light/50 mx-auto mb-3 group-hover:text-purple-light transition-colors" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or click to browse
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Video Upload */}
            <Card className="p-8 bg-card/60 backdrop-blur-sm border-purple-main/10 hover:border-magenta/40 transition-all duration-500 group hover:shadow-purple">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-magenta/10 flex items-center justify-center group-hover:bg-magenta/20 transition-colors group-hover:shadow-purple">
                  <Video className="w-8 h-8 text-magenta" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-magenta transition-colors">Upload Clips</h3>
                  <p className="text-muted-foreground text-sm">
                    Add multiple video clips to use
                  </p>
                </div>

                <div className="border-2 border-dashed border-magenta/20 rounded-xl p-6 hover:border-magenta/50 transition-colors cursor-pointer group-hover:bg-magenta/5">
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-magenta/50 mx-auto mb-3 group-hover:text-magenta transition-colors" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or click to browse
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button size="lg" className="text-lg px-10 py-6 bg-gradient-purple hover:opacity-90 shadow-glow group rounded-full transition-all hover:shadow-purple">
              Start AI Edit
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Your video will be ready in seconds
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};