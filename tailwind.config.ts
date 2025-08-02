import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark mode crypto theme - neon glow colors
        'neon-green': '#16FF81',
        'neon-purple': '#9C35FF',
        'neon-blue': '#6A5AE0',
        'neon-red': '#FF4C4C',
        'neon-yellow': '#FFD93D',
        'neon-cyan': '#00F5FF',
        // Dark backgrounds
        'dark-base': '#0B0B0B',
        'dark-card': '#1A1A1A',
        'dark-card-hover': '#222222',
        'dark-border': '#333333',
        // Text colors
        'text-primary': '#E0E0E0',
        'text-secondary': '#A5A5A5',
        'text-muted': '#707070',
        // Legacy crypto colors (for compatibility)
        'crypto-green': '#16FF81',
        'crypto-red': '#FF4C4C',
        'crypto-yellow': '#FFD93D',
        'crypto-blue': '#6A5AE0',
        'crypto-purple': '#9C35FF',
        'crypto-orange': '#FF6348',
      },
      backgroundImage: {
        // Dark mode neon gradients
        'neon-gradient-green': 'linear-gradient(135deg, #16FF81 0%, #00D4AA 100%)',
        'neon-gradient-purple': 'linear-gradient(135deg, #9C35FF 0%, #6A5AE0 100%)',
        'neon-gradient-red': 'linear-gradient(135deg, #FF4C4C 0%, #FF6B6B 100%)',
        'neon-gradient-yellow': 'linear-gradient(135deg, #FFD93D 0%, #FFA502 100%)',
        'neon-gradient-blue': 'linear-gradient(135deg, #6A5AE0 0%, #9C35FF 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0B0B0B 0%, #1A1A1A 100%)',
        'dark-mesh': 'radial-gradient(circle at 20% 80%, rgba(156, 53, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(22, 255, 129, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(106, 90, 224, 0.1) 0%, transparent 50%)',
        // Legacy gradients (updated for dark theme)
        'crypto-gradient-green': 'linear-gradient(135deg, #16FF81 0%, #00D4AA 100%)',
        'crypto-gradient-red': 'linear-gradient(135deg, #FF4C4C 0%, #FF6B6B 100%)',
        'crypto-gradient-blue': 'linear-gradient(135deg, #6A5AE0 0%, #9C35FF 100%)',
        'bitcoin-gradient': 'linear-gradient(135deg, #f7931e 0%, #ffb347 100%)',
      },
      fontFamily: {
        'crypto': ['Inter', 'Space Grotesk', 'Satoshi', 'system-ui', 'sans-serif'],
        'space': ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        'satoshi': ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 212, 170, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 212, 170, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        // Dark theme neon glow shadows
        'neon-green': '0 0 20px rgba(22, 255, 129, 0.3), 0 0 40px rgba(22, 255, 129, 0.1)',
        'neon-green-lg': '0 0 30px rgba(22, 255, 129, 0.4), 0 0 60px rgba(22, 255, 129, 0.2)',
        'neon-purple': '0 0 20px rgba(156, 53, 255, 0.3), 0 0 40px rgba(156, 53, 255, 0.1)',
        'neon-purple-lg': '0 0 30px rgba(156, 53, 255, 0.4), 0 0 60px rgba(156, 53, 255, 0.2)',
        'neon-red': '0 0 20px rgba(255, 76, 76, 0.3), 0 0 40px rgba(255, 76, 76, 0.1)',
        'neon-red-lg': '0 0 30px rgba(255, 76, 76, 0.4), 0 0 60px rgba(255, 76, 76, 0.2)',
        'neon-yellow': '0 0 20px rgba(255, 217, 61, 0.3), 0 0 40px rgba(255, 217, 61, 0.1)',
        'neon-blue': '0 0 20px rgba(106, 90, 224, 0.3), 0 0 40px rgba(106, 90, 224, 0.1)',
        'dark-card': '0 4px 20px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.15)',
        'dark-card-hover': '0 8px 30px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)',
        // Legacy shadows (updated for dark theme)
        'crypto': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'crypto-lg': '0 8px 30px rgba(0, 0, 0, 0.4)',
        'green-glow': '0 0 20px rgba(22, 255, 129, 0.3)',
        'red-glow': '0 0 20px rgba(255, 76, 76, 0.3)',
        'blue-glow': '0 0 20px rgba(106, 90, 224, 0.3)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config