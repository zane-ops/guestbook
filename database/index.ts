import { drizzle } from "drizzle-orm/node-postgres";
import { remember } from "@epic-web/remember";
import {
	commentsTable,
	usersTable,
	usersRelations,
	commentsRelations,
} from "./schema";

// You can specify any property from the node-postgres connection options
export const db = remember("drizzle:db", () =>
	drizzle({
		logger: true,
		connection: {
			connectionString: import.meta.env.DATABASE_URL!,
		},
		schema: {
			commentsTable,
			usersTable,
			// relations
			usersRelations,
			commentsRelations,
		},
	}),
);
