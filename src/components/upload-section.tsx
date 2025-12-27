import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Music, Video, ArrowRight } from "lucide-react";

export const UploadSection = () => {
  return (
    <section className="py-24 relative">
      {/* Subtle aura background */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full animate-aura-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(262 83% 58% / 0.08) 0%, transparent 60%)'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Ready to create?
          </h2>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Upload your content and watch the magic happen
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Music Upload */}
            <Card className="p-8 bg-card/80 border-border hover:border-aura-purple/50 transition-all duration-300 group">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-aura-purple/10 flex items-center justify-center group-hover:bg-aura-purple/20 transition-colors">
                  <Music className="w-8 h-8 text-aura-purple" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Upload Music</h3>
                  <p className="text-muted-foreground text-sm">
                    Add your audio track (max 15 seconds)
                  </p>
                </div>

                <div className="border-2 border-dashed border-border rounded-xl p-6 hover:border-aura-purple/50 transition-colors cursor-pointer">
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or click to browse
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Video Upload */}
            <Card className="p-8 bg-card/80 border-border hover:border-aura-pink/50 transition-all duration-300 group">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-aura-pink/10 flex items-center justify-center group-hover:bg-aura-pink/20 transition-colors">
                  <Video className="w-8 h-8 text-aura-pink" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Upload Clips</h3>
                  <p className="text-muted-foreground text-sm">
                    Add multiple video clips to use
                  </p>
                </div>

                <div className="border-2 border-dashed border-border rounded-xl p-6 hover:border-aura-pink/50 transition-colors cursor-pointer">
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-3" />
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
            <Button size="lg" className="text-lg px-10 py-6 bg-gradient-primary hover:opacity-90 shadow-aura group">
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