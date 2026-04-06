/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SEPLAG Institutional Colors
        seplag: {
          primary: '#003366',      // Azul escuro institucional
          secondary: '#0066CC',    // Azul médio
          accent: '#00A859',       // Verde institucional
          warning: '#FFC107',      // Amarelo aviso
          danger: '#DC3545',       // Vermelho erro
          success: '#28A745',      // Verde sucesso
          light: '#F8F9FA',        // Cinza claro
          dark: '#212529',         // Cinza escuro
          muted: '#6C757D',        // Cinza médio
        },
        slot: {
          available: '#28A745',    // Verde - disponível
          occupied: '#DC3545',     // Vermelho - ocupado
          unavailable: '#6C757D',  // Cinza - indisponível
        }
      },
      fontFamily: {
        sans: ['Open Sans', 'system-ui', 'sans-serif'],
        heading: ['Roboto', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
