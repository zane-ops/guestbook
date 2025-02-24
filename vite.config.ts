import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
	server: {
		port: 5174,
	},
	plugins: [reactRouter()],
});
