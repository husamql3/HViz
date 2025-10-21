import { pgTable, uuid, timestamp, text, boolean, integer, unique, serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const resourceTabs = pgTable('resource_tabs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
}, (table) => ({
  nameIdx: unique('resource_tabs_name_idx').on(table.name),
}));

export const resourceTypes = pgTable('resource_types', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
}, (table) => ({
  nameIdx: unique('resource_types_name_idx').on(table.name),
}));

export const resources = pgTable('resources', {
  id: uuid('id').defaultRandom().primaryKey(),
  created_at: timestamp('created_at', { withTimezone: true, precision: 6 }).defaultNow().notNull(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  contributor: text('contributor').notNull(),
  topic: text('topic').notNull(),
  is_visible: boolean('is_visible').default(false).notNull(),
  is_approved: boolean('is_approved').default(false).notNull(),
  type_id: integer('type_id').notNull().references(() => resourceTypes.id),
  tab_id: integer('tab_id').notNull().references(() => resourceTabs.id),
});

export const resourceTabsRelations = relations(resourceTabs, ({ many }) => ({
  resources: many(resources),
}));

export const resourceTypesRelations = relations(resourceTypes, ({ many }) => ({
  resources: many(resources),
}));

export const resourcesRelations = relations(resources, ({ one }) => ({
  type: one(resourceTypes, {
    fields: [resources.type_id],
    references: [resourceTypes.id],
  }),
  tab: one(resourceTabs, {
    fields: [resources.tab_id],
    references: [resourceTabs.id],
  }),
}));