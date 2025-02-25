import { Button } from "~/components/ui/button";
import type { Route } from "./+types/guestbook";
import { GithubLogo } from "~/components/github-logo";

export function loader({ request }: Route.LoaderArgs) {
  return;
}
export function action({ request }: Route.ActionArgs) {
  return;
}

export default function GuestBookPage({}: Route.ComponentProps) {
  return (
    <main className="container p-5 flex flex-col items-start gap-5">
      <h1 className="text-2xl font-medium">Sign my guestbook</h1>

      <Button className="rounded-[0.25rem]">
        <GithubLogo className="text-background size-5" />
        <span>Sign in with github</span>
      </Button>
    </main>
  );
}
