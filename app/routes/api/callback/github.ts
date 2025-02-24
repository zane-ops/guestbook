import { redirect } from "react-router";
import type { Route } from "./+types/github";

export function loader({ request }: Route.LoaderArgs) {
	return redirect("/guestbook");
}
