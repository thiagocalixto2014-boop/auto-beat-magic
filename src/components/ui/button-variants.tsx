import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        
        // Editfy Custom Variants
        neon: "bg-gradient-primary text-background shadow-neon hover:shadow-glow transition-all duration-300 hover:scale-105",
        hero: "bg-gradient-primary text-background px-8 py-4 text-lg font-bold shadow-glow hover:shadow-neon transition-all duration-500 hover:scale-110 animate-pulse-neon",
        upload: "border-2 border-dashed border-neon-purple bg-card/50 text-neon-purple hover:bg-neon-purple/10 hover:border-neon-pink transition-all duration-300",
        template: "bg-card border border-border hover:border-neon-cyan hover:shadow-neon transition-all duration-300 group",
        ai: "bg-gradient-secondary text-background shadow-glow hover:shadow-neon animate-glow-rotate transition-all duration-300"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-12",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);