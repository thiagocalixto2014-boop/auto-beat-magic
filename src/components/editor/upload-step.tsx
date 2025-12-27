import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Music, Video, X, Loader2, ArrowRight, Clock } from "lucide-react";

interface Project {
  id: string;
  music_url: string | null;
  clips_urls: string[] | null;
}

interface UploadStepProps {
  project: Project;
  userId: string;
  onUpdate: (updates: Partial<Project>) => void;
  onNext: () => void;
}

export const UploadStep = ({ project, userId, onUpdate, onNext }: UploadStepProps) => {
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [uploadingClips, setUploadingClips] = useState(false);
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [clipFiles, setClipFiles] = useState<File[]>([]);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const clipsInputRef = useRef<HTMLInputElement>(null);

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check duration (max 15 seconds)
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    await new Promise((resolve) => {
      audio.onloadedmetadata = () => {
        if (audio.duration > 15) {
          toast.error("Audio must be 15 seconds or less");
          return;
        }
        resolve(true);
      };
    });

    setMusicFile(file);
    setUploadingMusic(true);

    try {
      const filePath = `${userId}/${project.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("music")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("music")
        .getPublicUrl(filePath);

      onUpdate({ music_url: publicUrl });
      toast.success("Music uploaded");
    } catch (error: any) {
      toast.error("Failed to upload music");
      setMusicFile(null);
    } finally {
      setUploadingMusic(false);
    }
  };

  const handleClipsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Check total duration (max 30 seconds)
    let totalDuration = 0;
    for (const file of files) {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          totalDuration += video.duration;
          resolve(true);
        };
      });
    }

    if (totalDuration > 30) {
      toast.error("Total clip duration must be 30 seconds or less");
      return;
    }

    setClipFiles(files);
    setUploadingClips(true);

    try {
      const urls: string[] = [];

      for (const file of files) {
        const filePath = `${userId}/${project.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("clips")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("clips")
          .getPublicUrl(filePath);

        urls.push(publicUrl);
      }

      onUpdate({ clips_urls: urls });
      toast.success(`${files.length} clip(s) uploaded`);
    } catch (error: any) {
      toast.error("Failed to upload clips");
      setClipFiles([]);
    } finally {
      setUploadingClips(false);
    }
  };

  const removeMusic = () => {
    setMusicFile(null);
    onUpdate({ music_url: null });
  };

  const removeClips = () => {
    setClipFiles([]);
    onUpdate({ clips_urls: null });
  };

  const canProceed = project.music_url && project.clips_urls?.length;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Upload Your Content</h2>
        <p className="text-muted-foreground">
          Add your music (max 15s) and video clips (max 30s total)
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Music Upload */}
        <Card className="p-6 bg-card/60 border-purple-main/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-main/10 flex items-center justify-center">
              <Music className="w-6 h-6 text-purple-light" />
            </div>
            <div>
              <h3 className="font-semibold">Music Track</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Max 15 seconds
              </p>
            </div>
          </div>

          {project.music_url || musicFile ? (
            <div className="bg-secondary/50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Music className="w-5 h-5 text-purple-light shrink-0" />
                <span className="text-sm truncate">
                  {musicFile?.name || "Uploaded music"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeMusic}
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div
              onClick={() => musicInputRef.current?.click()}
              className="border-2 border-dashed border-purple-main/30 rounded-xl p-8 text-center cursor-pointer hover:border-purple-main/60 transition-colors"
            >
              {uploadingMusic ? (
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-light" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-purple-light/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Click or drag to upload
                  </p>
                </>
              )}
            </div>
          )}

          <input
            ref={musicInputRef}
            type="file"
            accept="audio/*"
            onChange={handleMusicUpload}
            className="hidden"
          />
        </Card>

        {/* Clips Upload */}
        <Card className="p-6 bg-card/60 border-magenta/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-magenta/10 flex items-center justify-center">
              <Video className="w-6 h-6 text-magenta" />
            </div>
            <div>
              <h3 className="font-semibold">Video Clips</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Max 30s total
              </p>
            </div>
          </div>

          {(project.clips_urls?.length || clipFiles.length) ? (
            <div className="space-y-2">
              <div className="bg-secondary/50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-magenta" />
                  <span className="text-sm">
                    {clipFiles.length || project.clips_urls?.length} clip(s) uploaded
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeClips}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => clipsInputRef.current?.click()}
              className="border-2 border-dashed border-magenta/30 rounded-xl p-8 text-center cursor-pointer hover:border-magenta/60 transition-colors"
            >
              {uploadingClips ? (
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-magenta" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-magenta/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Click or drag to upload
                  </p>
                </>
              )}
            </div>
          )}

          <input
            ref={clipsInputRef}
            type="file"
            accept="video/*"
            multiple
            onChange={handleClipsUpload}
            className="hidden"
          />
        </Card>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-gradient-purple hover:opacity-90 gap-2 px-8"
        >
          Continue to Effects
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};