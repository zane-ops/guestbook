import { LoaderIcon, CheckIcon } from "lucide-react";
import { Form, Link, useFetcher, useNavigation } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { Route } from "./+types/register";

export default function RegisterPage({}: Route.ComponentProps) {
  const fetcher = useFetcher();
  const isPending = fetcher.state !== "idle";

  return (
    <>
      <h1 className="text-2xl font-medium">Register</h1>
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
          Already have an account ?&nbsp;
          <Link
            to="/login"
            className="underline inline-flex gap-1 items-center"
          >
            login here
          </Link>
        </p>
      </fetcher.Form>
    </>
  );
}
