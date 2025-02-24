import type { RouteConfig } from "@react-router/dev/routes";
import { route } from "@react-router/dev/routes";

export default [
	route("", "routes/guestbook.tsx"),
	route("api/callback/github", "routes/api/callback/github.ts"),
] satisfies RouteConfig;
