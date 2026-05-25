module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(210, 40%, 50%)',
        accent: 'hsl(210, 40%, 60%)',
        background: 'hsl(210, 30%, 98%)',
        surface: 'hsl(210, 30%, 95%)',
      },
    },
  },
  plugins: [],
};
