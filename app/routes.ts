import type { RouteConfig } from "@react-router/dev/routes";
import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/guestbook.tsx"),
  route("api/auth/callback/github", "routes/api/auth/callback/github.ts")
] satisfies RouteConfig;
