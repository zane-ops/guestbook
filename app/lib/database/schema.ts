import { relations } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", (t) => ({
  id: t.varchar({ length: 255 }).notNull().unique(),
  username: t.varchar({ length: 255 }).notNull().unique(),
  password: t.varchar({ length: 1024 }).notNull()
}));

export const commentsTable = pgTable("comments", (t) => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  message: t.text().notNull().default(""),
  author_id: t
    .varchar()
    .references(() => usersTable.id, {
      onDelete: "cascade"
    })
    .notNull(),
  created_at: t.timestamp().defaultNow().notNull()
}));

export const usersRelations = relations(usersTable, ({ many }) => ({
  comments: many(commentsTable, {
    relationName: "comments"
  })
}));

export const commentsRelations = relations(commentsTable, ({ one }) => ({
  comments: one(usersTable, {
    fields: [commentsTable.author_id],
    references: [usersTable.id],
    relationName: "author"
  })
}));

export type Comment = typeof commentsTable.$inferSelect;
export type User = typeof usersTable.$inferSelect;
