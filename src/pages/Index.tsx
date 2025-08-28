import { HeroSection } from "@/components/hero-section";
import { WorkflowSection } from "@/components/workflow-section";
import { TemplatesSection } from "@/components/templates-section";
import { UploadSection } from "@/components/upload-section";
import { Footer } from "@/components/footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <WorkflowSection />
      <TemplatesSection />
      <UploadSection />
      <Footer />
    </div>
  );
};

export default Index;