import { data } from "react-router";
import type { Route } from "./+types/health";
import { db } from "~/lib/database";
import { commentsTable } from "~/lib/database/schema";
import { RedisKV } from "~/lib/kv.server";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const kv = new RedisKV();
    await Promise.all([
      db
        .select({
          message: commentsTable.message
        })
        .from(commentsTable)
        .limit(1),
      kv.ensureConnection()
    ]);

    return data(
      {
        healthy: true
      },
      {
        status: 200
      }
    );
  } catch (error) {
    return data(
      {
        healthy: false
      },
      {
        status: 400
      }
    );
  }
}
