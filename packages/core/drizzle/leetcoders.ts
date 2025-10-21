import { pgTable, uuid, text, boolean, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { groups } from './groups';
import { submissions } from './submissions';

export const leetcodeStatusEnum = pgEnum('leetcode_status', ['PENDING', 'APPROVED', 'SUSPENDED']);

export const leetcoders = pgTable('leetcoders', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  lc_username: text('lc_username').notNull(),
  gh_username: text('gh_username'),
  x_username: text('x_username'),
  li_username: text('li_username'),
  avatar: text('avatar'),
  website: text('website'),
  group_no: integer('group_no').notNull().references(() => groups.group_no),
  has_second_chance: boolean('has_second_chance').default(false).notNull(),
  rejoined_at: timestamp('rejoined_at', { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  is_visible: boolean('is_visible').default(true).notNull(),
  username: text('username').notNull().unique(),
  created_at: timestamp('created_at', { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  is_notified: boolean('is_notified').default(false).notNull(),
  status: leetcodeStatusEnum('status').default('PENDING').notNull(),
});

export const leetcodersRelations = relations(leetcoders, ({ one, many }) => ({
  group: one(groups, {
    fields: [leetcoders.group_no],
    references: [groups.group_no],
  }),
  submissions: many(submissions),
}));