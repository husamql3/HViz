import { pgTable, uuid, timestamp, integer, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { roadmap } from './roadmap';
import { leetcoders } from './leetcoders';
import { submissions } from './submissions';

export const groups = pgTable('groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  group_no: integer('group_no').notNull().unique(),
}, (table) => ({
  groupNoIdx: unique('groups_group_no_idx').on(table.group_no),
}));

export const groupProgress = pgTable('group_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  created_at: timestamp('created_at', { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  group_no: integer('group_no').notNull().references(() => groups.group_no),
  current_problem: integer('current_problem').notNull().references(() => roadmap.problem_order),
});

export const groupsRelations = relations(groups, ({ many }) => ({
  group_progress: many(groupProgress),
  leetcoders: many(leetcoders),
  submissions: many(submissions),
}));

export const groupProgressRelations = relations(groupProgress, ({ one }) => ({
  group: one(groups, {
    fields: [groupProgress.group_no],
    references: [groups.group_no],
  }),
  roadmap: one(roadmap, {
    fields: [groupProgress.current_problem],
    references: [roadmap.problem_order],
  }),
}));