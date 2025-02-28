import { Form, Link, useFetcher, useNavigation } from "react-router";
import type { Route } from "./+types/login";
import { LoaderIcon, CheckIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export default function LoginPage({}: Route.ComponentProps) {
  const fetcher = useFetcher();
  const isPending = fetcher.state !== "idle";
  return (
    <>
      <h1 className="text-2xl font-medium">Login</h1>
      <fetcher.Form method="post" className="flex flex-col gap-4">
        <input type="hidden" name="intent" value="login" />
        <fieldset>
          <label htmlFor="username">Username</label>
          <Input
            type="text"
            placeholder="ex: jonhdoe"
            name="username"
            id="username"
          />
        </fieldset>
        <fieldset>
          <label htmlFor="password">Password</label>
          <Input
            type="password"
            placeholder="******"
            name="password"
            id="password"
          />
        </fieldset>
        <Button
          className="rounded-[0.25rem] disabled:opacity-40"
          type="submit"
          disabled={isPending}
        >
          {isPending ? (
            <LoaderIcon className="animate-spin size-4" />
          ) : (
            <CheckIcon className="size-4" />
          )}
          Submit
        </Button>

        <p>
          No account ?&nbsp;
          <Link
            to="/register"
            className="underline inline-flex gap-1 items-center"
          >
            register here
          </Link>
        </p>
      </fetcher.Form>
    </>
  );
}
