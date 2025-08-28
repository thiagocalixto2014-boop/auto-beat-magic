import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Music, Video, Clock } from "lucide-react";

export const UploadSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to <span className="bg-gradient-accent bg-clip-text text-transparent">create</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your content and watch the magic happen
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Music Upload */}
            <Card className="p-8 bg-gradient-to-br from-card to-neon-purple/5 border-neon-purple/30 group hover:shadow-neon transition-all duration-300">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-neon-purple/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Music className="w-10 h-10 text-neon-purple" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-2">Upload Music</h3>
                  <p className="text-muted-foreground">
                    Add your audio track (max 15 seconds)
                  </p>
                </div>

                <div className="border-2 border-dashed border-neon-purple/50 rounded-lg p-8 hover:border-neon-purple transition-colors">
                  <Upload className="w-8 h-8 text-neon-purple mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag & drop your audio file or click to browse
                  </p>
                  <Button variant="upload" className="w-full">
                    Choose Audio File
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Max 15 seconds</span>
                </div>
              </div>
            </Card>

            {/* Video Upload */}
            <Card className="p-8 bg-gradient-to-br from-card to-neon-pink/5 border-neon-pink/30 group hover:shadow-neon transition-all duration-300">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-neon-pink/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Video className="w-10 h-10 text-neon-pink" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-2">Upload Video Clips</h3>
                  <p className="text-muted-foreground">
                    Add multiple video clips to use in your edit
                  </p>
                </div>

                <div className="border-2 border-dashed border-neon-pink/50 rounded-lg p-8 hover:border-neon-pink transition-colors">
                  <Upload className="w-8 h-8 text-neon-pink mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag & drop your video files or click to browse
                  </p>
                  <Button variant="upload" className="w-full border-neon-pink text-neon-pink hover:bg-neon-pink/10">
                    Choose Video Files
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Video className="w-4 h-4" />
                  <span>Multiple files supported</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Button */}
          <div className="text-center">
            <Button variant="ai" size="xl" className="group">
              <Upload className="w-6 h-6 mr-3 group-hover:animate-bounce" />
              Start AI Edit Magic
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