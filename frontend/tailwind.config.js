module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        'bg-hover': 'var(--bg-hover)',
        'bg-active': 'var(--bg-active)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-dim': 'var(--accent-dim)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)'
      },
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui'],
        mono: ['DM Mono', 'ui-monospace', 'SFMono-Regular']
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '10px'
      }
    },
  },
  plugins: [],
}