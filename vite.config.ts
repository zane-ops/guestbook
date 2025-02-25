import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 5174
  },
  resolve:
    process.env.NODE_ENV !== "production"
      ? undefined
      : {
          alias: {
            "react-dom/server": "react-dom/server.node"
          }
        },
  plugins: [reactRouter(), tailwindcss(), tsconfigPaths()]
});
