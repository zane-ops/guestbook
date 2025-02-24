import type { RouteConfig } from "@react-router/dev/routes";
import { index, layout, route } from "@react-router/dev/routes";

export default [
    layout("layouts/sidebar.tsx", [
        index("routes/home.tsx"),
        route("contacts/:contactId", "routes/contact.tsx"),
        route("contacts/:contactId/edit", "routes/contact-edit.tsx"),
        route("contacts/:contactId/destroy", "routes/contact-delete.tsx"),
    ]),
    route("about", "routes/about.tsx"),
] satisfies RouteConfig;
