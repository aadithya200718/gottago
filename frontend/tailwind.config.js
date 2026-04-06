/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#38bdf8',
          'primary-hover': '#0ea5e9',
          'primary-glow': 'rgba(56, 189, 248, 0.15)',
          'primary-muted': 'rgba(56, 189, 248, 0.08)',
        },
        surface: {
          DEFAULT: '#0a0f1a',
          card: '#111827',
          'card-hover': '#1f2937',
          elevated: '#1a2332',
          border: '#1f2937',
          'border-active': 'rgba(56, 189, 248, 0.35)',
        },
        text: {
          primary: '#f9fafb',
          secondary: '#9ca3af',
          muted: '#6b7280',
        },
        status: {
          success: '#22c55e',
          warning: '#eab308',
          danger: '#ef4444',
          'success-bg': 'rgba(34, 197, 94, 0.1)',
          'warning-bg': 'rgba(234, 179, 8, 0.1)',
          'danger-bg': 'rgba(239, 68, 68, 0.1)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        button: '8px',
        input: '6px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.4)',
        'card-hover': '4px 4px 0px #38bdf8',
        'solid-primary': '4px 4px 0px #38bdf8',
        'solid-primary-lg': '6px 6px 0px #38bdf8',
        'glow-sky': '0 0 20px rgba(56, 189, 248, 0.12)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.15)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.15)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'bar-fill': 'barFill 0.8s ease-out forwards',
        'count-up': 'countUp 0.6s ease-out',
        'scan-line': 'scanLine 3s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(56, 189, 248, 0.15)' },
          '50%': { boxShadow: '0 0 25px rgba(56, 189, 248, 0.35)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        barFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--bar-width)' },
        },
        countUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scanLine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
