import { pgTable, uuid, timestamp, integer, text, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { groupProgress } from './groups';
import { submissions } from './submissions';

export const roadmap = pgTable('roadmap', {
  id: uuid('id').defaultRandom().primaryKey(),
  created_at: timestamp('created_at', { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  problem_no: integer('problem_no').notNull(),
  problem_order: integer('problem_order').notNull().unique(),
  problem_slug: text('problem_slug').notNull(),
  topic: text('topic').notNull(),
  difficulty: text('difficulty').default('easy').notNull(),
}, (table) => ({
  problemOrderIdx: unique('roadmap_problem_order_idx').on(table.problem_order),
}));

export const roadmapRelations = relations(roadmap, ({ many }) => ({
  group_progress: many(groupProgress),
  submissions: many(submissions),
}));