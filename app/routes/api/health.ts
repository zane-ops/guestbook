import { db } from "~/lib/database";
import { commentsTable } from "~/lib/database/schema";
import { RedisKV } from "~/lib/kv.server";
import type { Route } from "./+types/health";

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

    return Response.json(
      {
        healthy: true
      },
      {
        status: 200
      }
    );
  } catch (error) {
    return Response.json(
      {
        healthy: false
      },
      {
        status: 500
      }
    );
  }
}
