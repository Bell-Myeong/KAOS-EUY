import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',       // Sunset Orange
        secondary: '#2D3436',     // Charcoal
        accent: '#00B894',        // Mint Green
        background: '#FFEAA7',    // Warm Cream
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        accent: ['Pacifico', 'cursive'],
      },
    },
  },
  plugins: [],
}
export default config
