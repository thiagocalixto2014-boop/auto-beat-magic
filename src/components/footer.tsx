import { Button } from "@/components/ui/button";
import { Github, Twitter, Youtube } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-purple-main/10 bg-card/30">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xl font-bold tracking-tight">
              <span className="bg-gradient-purple bg-clip-text text-transparent">EDIT</span>
              <span>LABS</span>
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Turn your clips into stunning TikTok-style edits automatically with AI. No editing skills required.
            </p>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="hover:text-purple-light text-muted-foreground hover:bg-purple-main/10">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-purple-light text-muted-foreground hover:bg-purple-main/10">
                <Youtube className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-purple-light text-muted-foreground hover:bg-purple-main/10">
                <Github className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-purple-light/80">Product</h4>
            <div className="space-y-3 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-purple-light transition-colors">Templates</a>
              <a href="#" className="block text-muted-foreground hover:text-purple-light transition-colors">Pricing</a>
              <a href="#" className="block text-muted-foreground hover:text-purple-light transition-colors">API</a>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-purple-light/80">Resources</h4>
            <div className="space-y-3 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-purple-light transition-colors">Documentation</a>
              <a href="#" className="block text-muted-foreground hover:text-purple-light transition-colors">Tutorials</a>
              <a href="#" className="block text-muted-foreground hover:text-purple-light transition-colors">Blog</a>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-purple-light/80">Legal</h4>
            <div className="space-y-3 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-purple-light transition-colors">Privacy</a>
              <a href="#" className="block text-muted-foreground hover:text-purple-light transition-colors">Terms</a>
              <a href="#" className="block text-muted-foreground hover:text-purple-light transition-colors">Contact</a>
            </div>
          </div>
        </div>

        <div className="border-t border-purple-main/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 EditLabs. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made for creators, by creators
          </p>
        </div>
      </div>
    </footer>
  );
};