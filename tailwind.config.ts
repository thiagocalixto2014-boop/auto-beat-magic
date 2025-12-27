import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				purple: {
					deep: 'hsl(var(--purple-deep))',
					main: 'hsl(var(--purple-main))',
					light: 'hsl(var(--purple-light))',
					glow: 'hsl(var(--purple-glow))'
				},
				violet: 'hsl(var(--violet))',
				magenta: 'hsl(var(--magenta))',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-purple': 'var(--gradient-purple)',
				'gradient-dark': 'var(--gradient-dark)'
			},
			boxShadow: {
				'purple': 'var(--shadow-purple)',
				'glow': 'var(--shadow-glow)',
				'card': 'var(--shadow-card)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px) rotate(-6deg)' },
					'50%': { transform: 'translateY(-15px) rotate(-6deg)' }
				},
				'float-reverse': {
					'0%, 100%': { transform: 'translateY(0px) rotate(6deg)' },
					'50%': { transform: 'translateY(15px) rotate(6deg)' }
				},
				'fade-up': {
					'0%': { opacity: '0', transform: 'translateY(30px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'pulse-glow': {
					'0%, 100%': { 
						opacity: '0.4',
						transform: 'scale(1)'
					},
					'50%': { 
						opacity: '0.7',
						transform: 'scale(1.05)'
					}
				},
				'drift': {
					'0%, 100%': { transform: 'translate(0, 0)' },
					'25%': { transform: 'translate(10px, -10px)' },
					'50%': { transform: 'translate(-5px, 5px)' },
					'75%': { transform: 'translate(-10px, -5px)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'blink': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0' }
				},
				'gradient-shift': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				},
				'particle-float': {
					'0%': { transform: 'translateY(100vh) scale(0)', opacity: '0' },
					'10%': { opacity: '1' },
					'90%': { opacity: '1' },
					'100%': { transform: 'translateY(-100vh) scale(1)', opacity: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'float-reverse': 'float-reverse 7s ease-in-out infinite',
				'fade-up': 'fade-up 0.8s ease-out forwards',
				'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
				'drift': 'drift 20s ease-in-out infinite',
				'shimmer': 'shimmer 3s ease-in-out infinite',
				'blink': 'blink 1s step-end infinite',
				'gradient-shift': 'gradient-shift 8s ease infinite',
				'particle-float': 'particle-float 15s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;