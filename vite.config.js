import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: ["92c5-103-107-117-14.ngrok-free.app"],
  },
  plugins: [tailwindcss(), react()],
});
