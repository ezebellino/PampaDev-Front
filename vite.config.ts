import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => ({
  plugins: [tailwindcss(), ...(mode === "test" ? [] : [reactRouter()]), tsconfigPaths()],
  server: {
    proxy: {
      "/api": {
        target: "https://turnos.pampadev.ar",
        changeOrigin: true,
        secure: true,
        followRedirects: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    include: ["app/**/*.test.ts", "app/**/*.test.tsx"],
    restoreMocks: true,
    clearMocks: true,
  },
}));
