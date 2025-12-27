import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, ZoomIn, Move, RotateCcw, Check } from "lucide-react";

interface Project {
  id: string;
  template: string;
  effects: string[];
}

interface EffectsStepProps {
  project: Project;
  onUpdate: (updates: Partial<Project>) => void;
  onBack: () => void;
  onNext: () => void;
}

const templates = [
  { id: "flashy", name: "Flashy", description: "High-energy with beat drops" },
  { id: "smooth-zoom", name: "Smooth Zoom", description: "Cinematic and smooth" },
  { id: "amv", name: "AMV Style", description: "Dynamic and colorful" },
  { id: "minimal", name: "Minimal", description: "Clean and subtle" },
];

const effects = [
  { id: "zoom", name: "Zoom", icon: ZoomIn, description: "Dynamic zoom in/out on beats" },
  { id: "shake", name: "Shake", icon: Move, description: "Camera shake effect" },
  { id: "reverse", name: "Reverse", icon: RotateCcw, description: "Reverse clip segments" },
];

export const EffectsStep = ({ project, onUpdate, onBack, onNext }: EffectsStepProps) => {
  const toggleEffect = (effectId: string) => {
    const current = project.effects || [];
    const newEffects = current.includes(effectId)
      ? current.filter((e) => e !== effectId)
      : [...current, effectId];
    
    // Ensure at least one effect is selected
    if (newEffects.length === 0) return;
    
    onUpdate({ effects: newEffects });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Style</h2>
        <p className="text-muted-foreground">
          Select a template and effects for your edit
        </p>
      </div>

      {/* Templates */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Template Style</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              onClick={() => onUpdate({ template: template.id })}
              className={`p-4 cursor-pointer transition-all ${
                project.template === template.id
                  ? "border-purple-main bg-purple-main/10 shadow-purple"
                  : "border-border hover:border-purple-main/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{template.name}</h4>
                {project.template === template.id && (
                  <Check className="w-4 h-4 text-purple-light" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Effects */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Effects
          <span className="text-sm font-normal text-muted-foreground ml-2">
            (Select at least one)
          </span>
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {effects.map((effect) => {
            const isSelected = project.effects?.includes(effect.id);
            return (
              <Card
                key={effect.id}
                onClick={() => toggleEffect(effect.id)}
                className={`p-6 cursor-pointer transition-all ${
                  isSelected
                    ? "border-purple-main bg-purple-main/10 shadow-purple"
                    : "border-border hover:border-purple-main/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected ? "bg-purple-main" : "bg-secondary"
                    }`}
                  >
                    <effect.icon
                      className={`w-6 h-6 ${
                        isSelected ? "text-primary-foreground" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{effect.name}</h4>
                      {isSelected && (
                        <Badge className="bg-purple-main/20 text-purple-light border-0">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {effect.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-gradient-purple hover:opacity-90 gap-2 px-8"
        >
          Generate Edit
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};