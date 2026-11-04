export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { brand: { red: "#E31E24", blue: "#4285C5", navy: "#3B55A8", cyan: "#27AAE1", ink: "#111111", bg: "#F7F7F7" } },
    fontFamily: { sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"] },
  } },
  plugins: [],
};
