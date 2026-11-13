import { pgTable, text, jsonb, integer } from 'drizzle-orm/pg-core';
export const players = pgTable('players', {
  id: text().primaryKey(),
  state: jsonb().notNull(),
  version: integer().notNull().default(0),
});
