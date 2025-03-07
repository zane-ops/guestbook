import { Button } from "~/components/ui/button";
import type { Route } from "./+types/guestbook";
import {
  commitSession,
  destroySession,
  getSession,
  getUser,
  type Session
} from "~/lib/auth.server";
import { data, Form, Link, redirect, useNavigation } from "react-router";
import {
  ArrowUpRightIcon,
  LoaderIcon,
  LogInIcon,
  LogOutIcon
} from "lucide-react";
import { Textarea } from "~/components/ui/textarea";
import { z } from "zod";
import { db } from "~/lib/database";
import { commentsTable, usersTable } from "~/lib/database/schema";
import { eq } from "drizzle-orm";
import * as React from "react";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  const messages = await db
    .select({
      author: usersTable.username,
      id: commentsTable.id,
      message: commentsTable.message
    })
    .from(commentsTable)
    .innerJoin(usersTable, eq(commentsTable.author_id, usersTable.id));

  return data(
    {
      user: z
        .object({ username: z.string() })
        .nullish()
        .parse(await getUser(session)),
      messages
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session)
      }
    }
  );
}

export default function GuestBookPage({
  loaderData: { user, messages },
  actionData
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const isPending = navigation.state !== "idle";

  const errors =
    actionData !== undefined && "error" in actionData ? actionData.error : null;

  const formRef = React.useRef<React.ComponentRef<"form">>(null);

  React.useEffect(() => {
    if (formRef.current) {
      if (navigation.state !== "idle" && actionData !== undefined) {
        if ("success" in actionData) {
          formRef.current?.reset();
        }

        (
          formRef.current.querySelector(
            '[name="message"]'
          ) as HTMLTextAreaElement | null
        )?.focus();
      }
    }
  }, [navigation.state, actionData]);

  return (
    <>
      <h1 className="text-2xl font-medium">sign my guestbook</h1>

      <Form method="POST" action="/?index">
        {user ? (
          <>
            <input type="hidden" name="intent" value="logout" />
            <Button
              className="rounded-[0.25rem] disabled:opacity-40"
              variant="destructive"
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <LoaderIcon className="animate-spin size-4" />
              ) : (
                <LogOutIcon className="size-4" />
              )}

              <span>Sign out</span>
            </Button>
          </>
        ) : (
          <Link
            to="/login"
            className="underline inline-flex gap-1 items-center"
          >
            <LogInIcon className="size-4" />
            <span>Log in to leave a message</span>
          </Link>
        )}
      </Form>

      {user && (
        <Form
          method="POST"
          action="/?index"
          className="flex flex-col gap-4 w-full"
          ref={formRef}
        >
          <input type="hidden" name="intent" value="post" />
          <h2>
            Hello <strong>{user.username}</strong>, please type your message:
          </h2>
          <div className="flex flex-col gap-1">
            <Textarea
              name="message"
              rows={3}
              placeholder="hello..."
              className="dark:bg-black"
              required
              aria-describedby="error"
              aria-invalid={!!errors?.message}
            />

            {errors?.message && (
              <span id="error" className="text-red-500 text-sm">
                {errors.message}
              </span>
            )}
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="disabled:opacity-40 self-end"
          >
            {isPending && <LoaderIcon className="animate-spin size-4" />}
            <span>Submit</span>
          </Button>
        </Form>
      )}

      {messages.length === 0 ? (
        <p className="italic text-gray-500">-- No messages yet -- </p>
      ) : (
        <dl>
          {messages.map((msg) => (
            <div className="flex items-center gap-2" key={msg.id}>
              <dt className="text-gray-400">{msg.author}:</dt>
              <dd className="">{msg.message}</dd>
            </div>
          ))}
        </dl>
      )}

      <hr className="w-full border border-border" />
      <small>
        Built with React router & deployed on&nbsp;
        <a
          href="https://zaneops.dev"
          className="underline inline-flex gap-0.5 items-center"
        >
          <span>ZaneOps</span>
          <ArrowUpRightIcon className="size-3.5 relative top-0.5" />
        </a>
      </small>
    </>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  const formData = await request.formData();
  const intent = formData.get("intent")?.toString();
  switch (intent) {
    case "login": {
      return loginWithGithub();
    }
    case "logout": {
      return logout(session);
    }
    case "post": {
      return post(formData, session);
    }
    default: {
      session.flash("error", `Invalid intent '${intent}'`);
      throw redirect("/", {
        headers: {
          "Set-Cookie": await commitSession(session)
        }
      });
    }
  }
}

async function loginWithGithub() {
  const searchParams = new URLSearchParams();
  // searchParams.append("client_id", process.env.GITHUB_CLIENT_ID!);
  // searchParams.append("redirect_uri", process.env.GITHUB_REDIRECT_URI!);

  // throw redirect(
  //   `https://github.com/login/oauth/authorize?${searchParams.toString()}`
  // );
}

async function logout(session: Session) {
  const user = await getUser(session);
  if (!user) {
    session.flash("error", "You must be authenticated to perform this action!");
    throw redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session)
      }
    });
  }

  session.flash("success", "Logged out succesfully");
  throw redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session)
    }
  });
}

async function post(formData: FormData, session: Session) {
  const postSchema = z.object({
    message: z.string().min(1).trim()
  });

  const result = postSchema.safeParse(Object.fromEntries(formData.entries()));
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

  const user = await getUser(session);
  if (!user) {
    session.flash("error", "You must be authenticated to perform this action!");
    throw redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session)
      }
    });
  }

  await db.insert(commentsTable).values({
    author_id: user.id,
    message: result.data.message
  });

  session.flash("success", "Your message has been sent !");
  return data(
    {
      success: true
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session)
      }
    }
  );
}
