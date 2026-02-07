import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { CheckIcon, LoaderIcon } from "lucide-react";
import { nanoid } from "nanoid";
import { data, Link, redirect, useFetcher } from "react-router";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { commitSession, getSession } from "~/lib/auth.server";
import { db } from "~/lib/database";
import { usersTable } from "~/lib/database/schema";
import type { Route } from "./+types/register";

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
        error: result.error.flatten().fieldErrors
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
    .select({ username: usersTable.username })
    .from(usersTable)
    .where(eq(usersTable.username, username));

  if (currentUser.length > 0) {
    return data(
      {
        error: {
          username: ["A user with this username already exists."],
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

  const hash = await argon2.hash(password);
  const user_id = nanoid();

  await db
    .insert(usersTable)
    .values({
      username,
      password: hash,
      id: user_id
    })
    .returning();

  session.set("userId", user_id);
  session.flash("success", "Account created sucessfully");
  throw redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  });
}

export default function RegisterPage({}: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>();
  const isPending = fetcher.state !== "idle";
  const errors =
    fetcher.data !== undefined && "error" in fetcher.data
      ? fetcher.data.error
      : null;

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
