import { Button } from "@/components/ui/button";
import { Github, Twitter, Youtube, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Editfy
            </h3>
            <p className="text-sm text-muted-foreground">
              Turn your clips into stunning TikTok-style edits automatically with AI.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="hover:text-neon-purple">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-neon-pink">
                <Youtube className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-neon-cyan">
                <Github className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-semibold">Product</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-neon-purple transition-colors">Templates</a>
              <a href="#" className="block text-muted-foreground hover:text-neon-purple transition-colors">Pricing</a>
              <a href="#" className="block text-muted-foreground hover:text-neon-purple transition-colors">API</a>
              <a href="#" className="block text-muted-foreground hover:text-neon-purple transition-colors">Integrations</a>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold">Resources</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-neon-pink transition-colors">Documentation</a>
              <a href="#" className="block text-muted-foreground hover:text-neon-pink transition-colors">Tutorials</a>
              <a href="#" className="block text-muted-foreground hover:text-neon-pink transition-colors">Blog</a>
              <a href="#" className="block text-muted-foreground hover:text-neon-pink transition-colors">Community</a>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold">Support</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-neon-cyan transition-colors">Help Center</a>
              <a href="#" className="block text-muted-foreground hover:text-neon-cyan transition-colors">Contact Us</a>
              <a href="#" className="block text-muted-foreground hover:text-neon-cyan transition-colors">Status</a>
              <a href="#" className="block text-muted-foreground hover:text-neon-cyan transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Editfy. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="hover:text-neon-purple">
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};