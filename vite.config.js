import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "0.0.0.0",
      port: 5173,
      allowedHosts: [env.VITE_FRONTEND_URL]
    },
    plugins: [tailwindcss(), react()],
    define: {
      "process.env": env,
    },
  };
});
