/** @type {import('tailwindcss').Config} */
 config =  {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        buttonTheme: '#DBB42C', // your custom yellow
      },
    },
  },
  plugins: [],
}

export default config