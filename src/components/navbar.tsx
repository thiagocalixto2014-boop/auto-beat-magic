import { Button } from "@/components/ui/button";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl font-bold tracking-tight text-foreground">
          <span className="bg-gradient-purple bg-clip-text text-transparent">EDIT</span>
          <span>LABS</span>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            className="text-foreground/80 hover:text-foreground hover:bg-purple-main/10"
          >
            Sign In
          </Button>
          <Button 
            className="bg-purple-main/20 border border-purple-main/40 text-foreground hover:bg-purple-main/30 rounded-full px-5"
          >
            Sign Up
          </Button>
        </div>
      </div>
    </nav>
  );
};