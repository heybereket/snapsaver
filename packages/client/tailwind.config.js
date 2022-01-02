module.exports = {
    mode: 'jit',
      purge: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
      ],
      darkMode: 'class', 
      theme: {
        extend: {
          colors: {
            dark: '#1d1f21',
            navbar: '#232936',
            'dark-secondary': '#222428',
            'dark-tertiary': '#0C111B',
            'dark-lighter': '#141923',
            'dark-text': '#f9f8ff',
            'primary': '#FED8B1',
            'secondary': 'var(--color-primary-100)',
          },
          boxShadow: {
            outline: '0 0 0.5pt 0.5pt white',
          },
          maxWidth: {
            '3/4': '75%',
          },
          screens: {
            '3xl': '1792px',
          },
          spacing: {
            128: '32rem',
          },
        },
      },
      variants: {
        extend: {},
      },
      plugins: [
        require('@tailwindcss/aspect-ratio'),
      ],
    };