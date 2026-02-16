/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './App.{js,ts,tsx}',
    './app/**/*.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        avigul: ['Avigul_400Regular'],
        'avigul-bold': ['Avigul_700Bold'],
      },
      colors: {
        primary: '#FF758F',
        'dark-primary': "#b05163",
        secondary: '#B8744E',
        natural: '#4A4A4A'
      },
    },
  },
  plugins: [],
};
