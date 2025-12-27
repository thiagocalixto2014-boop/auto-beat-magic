import { Upload, Sliders, Sparkles, Download, Check } from "lucide-react";

interface EditorStepsProps {
  currentStep: number;
}

const steps = [
  { number: 1, title: "Upload", icon: Upload },
  { number: 2, title: "Effects", icon: Sliders },
  { number: 3, title: "Generate", icon: Sparkles },
  { number: 4, title: "Export", icon: Download },
];

export const EditorSteps = ({ currentStep }: EditorStepsProps) => {
  return (
    <div className="border-b border-border bg-card/30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep > step.number
                      ? "bg-purple-main text-primary-foreground"
                      : currentStep === step.number
                      ? "bg-gradient-purple text-primary-foreground shadow-purple"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`text-sm hidden sm:block ${
                    currentStep >= step.number
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                    currentStep > step.number
                      ? "bg-purple-main"
                      : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};