import { redirect } from "react-router";
import type { Route } from "./+types/github";
import { z } from "zod";
import { commitSession, getSession } from "~/lib/auth.server";
import { db } from "~/lib/database";
import { usersTable } from "~/lib/database/schema";

const githubUserSchema = z.object({
  login: z.string(),
  id: z.number(),
  name: z.string(),
  avatar_url: z.string(),
  location: z.string().nullish(),
  bio: z.string().nullish()
});

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const code = new URL(request.url).searchParams.get("code");

  if (!code) {
    session.flash(
      "error",
      "An unexpected error happenned on authentication, please retry"
    );
    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session)
      }
    });
  }

  const response: any = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
        code
      })
    }
  ).then((r) => r.json());

  if (response.error || !response.access_token) {
    console.error({
      error_access_token: response.error
    });
    session.flash(
      "error",
      "An unexpected error happenned on authentication, please retry"
    );
    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session)
      }
    });
  }

  const githubUser = await fetch("https://api.github.com/user", {
    headers: {
      "User-Agent": `Github-OAuth-${process.env.GITHUB_CLIENT_ID}`,
      Authorization: `token ${response.access_token}`,
      Accept: "application/json"
    }
  }).then((r) => r.json());

  const ghUserResult = githubUserSchema.safeParse(githubUser);
  if (!ghUserResult.success) {
    console.error({
      error_api_github: ghUserResult.error
    });

    session.flash(
      "error",
      "An unexpected error happenned on authentication, please retry"
    );

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session)
      }
    });
  }

  const ghUser = ghUserResult.data;

  const [user] = await db
    .insert(usersTable)
    .values({
      github_id: ghUser.id.toString(),
      username: ghUser.login,
      avatar_url: ghUser.avatar_url
    })
    .onConflictDoUpdate({
      target: usersTable.github_id,
      set: {
        avatar_url: ghUser.avatar_url
      }
    })
    .returning();

  console.log({
    user,
    userId: user.github_id
  });
  session.set("userId", user.github_id);
  session.flash("success", "Logged in sucessfully");
  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  });
}
