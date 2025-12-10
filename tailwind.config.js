/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        hover: 'rgba(0, 0, 0, 0.05)',
      },
      spacing: {
        15: '60px',
      },
    },
  },
};
