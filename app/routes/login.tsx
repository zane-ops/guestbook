import { data, Link, redirect, useFetcher } from "react-router";
import type { Route } from "./+types/login";
import { LoaderIcon, CheckIcon, AlertCircleIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getSession, commitSession } from "~/lib/auth.server";
import { db } from "~/lib/database";
import { usersTable } from "~/lib/database/schema";
import argon2 from "argon2";
import { Alert, AlertTitle, AlertDescription } from "~/components/ui/alert";

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  const formData = await request.formData();
  const registerSchema = z.object({
    username: z.string().min(3).trim(),
    password: z.string().min(8)
  });

  const result = registerSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (result.error) {
    return data(
      {
        error: {
          ...result.error.flatten().fieldErrors,
          non_field_errors: undefined as string[] | undefined
        }
      },
      {
        headers: {
          "Set-Cookie": await commitSession(session)
        }
      }
    );
  }

  const { username, password } = result.data;

  const currentUser = await db
    .select({ userId: usersTable.id, password: usersTable.password })
    .from(usersTable)
    .where(eq(usersTable.username, username));

  if (currentUser.length === 0) {
    return data(
      {
        error: {
          non_field_errors: ["Invalid credentials."] as string[] | undefined,
          username: undefined,
          password: undefined
        }
      },
      {
        headers: {
          "Set-Cookie": await commitSession(session)
        }
      }
    );
  }

  if (!(await argon2.verify(currentUser[0].password, password))) {
    return data(
      {
        error: {
          non_field_errors: ["Invalid credentials."] as string[] | undefined,
          username: undefined,
          password: undefined
        }
      },
      {
        headers: {
          "Set-Cookie": await commitSession(session)
        }
      }
    );
  }

  session.set("userId", currentUser[0].userId);
  session.flash("success", "Logged in sucessfully");
  throw redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  });
}

export default function LoginPage({}: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>();
  const isPending = fetcher.state !== "idle";

  const errors =
    fetcher.data !== undefined && "error" in fetcher.data
      ? fetcher.data.error
      : null;

  return (
    <>
      <h1 className="text-2xl font-medium">Login</h1>

      <fetcher.Form method="post" className="flex flex-col gap-4">
        {errors?.non_field_errors && (
          <Alert variant="destructive" className="">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{errors.non_field_errors} </AlertDescription>
          </Alert>
        )}

        <input type="hidden" name="intent" value="login" />
        <fieldset>
          <label htmlFor="username">Username</label>
          <Input
            type="text"
            placeholder="ex: jonhdoe"
            name="username"
            id="username"
            aria-describedby="username-error"
          />
          {errors?.username && (
            <span id="username-error" className="text-red-500 text-sm">
              {errors.username}
            </span>
          )}
        </fieldset>
        <fieldset>
          <label htmlFor="password">Password</label>
          <Input
            type="password"
            placeholder="******"
            name="password"
            id="password"
            aria-describedby="password-error"
          />
          {errors?.password && (
            <span id="password-error" className="text-red-500 text-sm">
              {errors.password}
            </span>
          )}
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
