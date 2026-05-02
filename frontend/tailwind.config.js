import theme from "./src/theme";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: theme.colors,
      fontFamily: {
        sans: theme.typography.fontFamily.primary
      }
    }
  },
  plugins: []
};