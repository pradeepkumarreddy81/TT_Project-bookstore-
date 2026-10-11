/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#FAF6EF', // warm paper background
          light: '#FFFFFF',
          muted: '#F4ECE1',
          border: '#E8DFC8',
          dark: '#E0D4BA',
        },
        ink: {
          DEFAULT: '#1B1A17', // ink text
          light: '#383631',
          muted: '#666358',
          subtle: '#999484',
          border: '#D3CBB9',
        },
        terracotta: {
          DEFAULT: '#B5472B', // accent terracotta
          hover: '#983921',
          light: '#F8ECE8',
          dark: '#7D2E1A',
        },
        forest: {
          DEFAULT: '#24443A', // secondary forest green
          hover: '#19322A',
          light: '#E6EFEA',
          dark: '#12251F',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'DM Sans', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'book': '0 4px 20px -2px rgba(27, 26, 23, 0.08), 0 2px 6px -1px rgba(27, 26, 23, 0.04)',
        'book-hover': '0 12px 28px -4px rgba(27, 26, 23, 0.12), 0 4px 10px -2px rgba(27, 26, 23, 0.06)',
        'paper': '0 1px 3px rgba(27, 26, 23, 0.05)',
      },
      borderRadius: {
        'sm': '2px',
        'DEFAULT': '4px',
        'md': '6px',
        'lg': '8px',
      },
      letterSpacing: {
        'tight-title': '-0.025em',
        'wide-label': '0.08em',
      },
    },
  },
  plugins: [],
};
