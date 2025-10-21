import { pgTable, uuid, timestamp, boolean, integer, primaryKey, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { groups } from './groups';
import { roadmap } from './roadmap';
import { leetcoders } from './leetcoders';

export const submissions = pgTable('submissions', {
  id: uuid('id').defaultRandom().notNull(),
  created_at: timestamp('created_at', { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  user_id: uuid('user_id').notNull().references(() => leetcoders.id, { onDelete: 'cascade' }),
  problem_id: uuid('problem_id').notNull().references(() => roadmap.id),
  solved: boolean('solved').default(true).notNull(),
  group_no: integer('group_no').references(() => groups.group_no),
}, (table) => ({
  pk: primaryKey({ columns: [table.id, table.user_id] }),
  userIdx: index('submissions_user_id_idx').on(table.user_id),
  problemIdx: index('submissions_problem_id_idx').on(table.problem_id),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  group: one(groups, {
    fields: [submissions.group_no],
    references: [groups.group_no],
  }),
  problem: one(roadmap, {
    fields: [submissions.problem_id],
    references: [roadmap.id],
  }),
  user: one(leetcoders, {
    fields: [submissions.user_id],
    references: [leetcoders.id],
  }),
}));