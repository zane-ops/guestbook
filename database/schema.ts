import { relations } from "drizzle-orm";
import {
	integer,
	pgTable,
	varchar,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
	github_id: varchar({ length: 255 }).notNull().unique(),
	username: varchar({ length: 255 }).notNull().unique(),
	avatar_url: varchar({ length: 1000 }).notNull(),
});

export const commentsTable = pgTable("comments", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	message: text().notNull().default(""),
	author_id: varchar()
		.references(() => usersTable.github_id, {
			onDelete: "cascade",
		})
		.notNull(),
	created_at: timestamp().defaultNow().notNull(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
	comments: many(commentsTable, {
		relationName: "comments",
	}),
}));

export const commentsRelations = relations(commentsTable, ({ one }) => ({
	comments: one(usersTable, {
		fields: [commentsTable.author_id],
		references: [usersTable.github_id],
		relationName: "author",
	}),
}));

export type Comment = typeof commentsTable.$inferSelect;
export type User = typeof usersTable.$inferSelect;
