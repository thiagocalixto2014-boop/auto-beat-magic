import { Button } from "@/components/ui/button";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl font-bold tracking-tight text-foreground">
          EDITLABS
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            className="text-foreground/80 hover:text-foreground hover:bg-transparent"
          >
            Sign In
          </Button>
          <Button 
            variant="outline" 
            className="border-foreground/20 text-foreground hover:bg-foreground/10 rounded-full px-5"
          >
            Sign Up
          </Button>
        </div>
      </div>
    </nav>
  );
};