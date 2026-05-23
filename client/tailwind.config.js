/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#fcf8ff',
        'surface-container': '#f0ecf9',
        'surface-container-low': '#f5f2ff',
        'surface-container-high': '#eae6f4',
        'surface-container-highest': '#e4e1ee',
        'surface-container-lowest': '#ffffff',
        'surface-bright': '#fcf8ff',
        primary: '#3525cd',
        'primary-container': '#4f46e5',
        'primary-fixed': '#e2dfff',
        'on-primary': '#ffffff',
        'on-primary-fixed': '#0f0069',
        'on-surface': '#1b1b24',
        'on-surface-variant': '#464555',
        outline: '#777587',
        'outline-variant': '#c7c4d8',
        secondary: '#515f74',
        'secondary-container': '#d5e3fd',
        'on-secondary-container': '#57657b',
        tertiary: '#7e3000',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
      },
      fontFamily: {
        headline: ['Hanken Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        auth: '0 20px 40px -10px rgba(53, 37, 205, 0.1)',
        admin: '0 0 40px -10px rgba(79, 70, 229, 0.15)',
      },
    },
  },
  plugins: [],
};
