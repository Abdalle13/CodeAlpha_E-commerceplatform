/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-ivory': '#F7F5EF',
        'charcoal': '#191A17',
        'muted-olive': '#777B62',
        'soft-beige': '#E8E2D8',
        'muted-text': '#77766F',
        'surface-subtle': '#F1EDE4',
        'admin-sidebar': '#141513',
        'status-success': '#3D6B52',
        'status-warning': '#B88746',
        'status-error': '#A63A3A',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        'widest-brand': '0.15em',
        'wider-brand': '0.08em',
      },
      scale: {
        '98': '0.98',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(25, 26, 23, 0.05)',
        'card': '0 10px 30px -4px rgba(25, 26, 23, 0.06)',
      }
    },
  },
  plugins: [],
}

