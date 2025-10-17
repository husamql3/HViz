import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	real,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("UserRole", [
	"USER",
	"ADMIN",
	"CAMPAIGN_SUPERVISOR",
	"EXPENSES_SUPERVISOR",
	"MARKETING_SUPERVISOR",
	"SUPER_ADMIN",
	"SUBSCRIBER",
]);
export const orgTypeEnum = pgEnum("OrgType", ["EXTERNAL", "INTERNAL"]);
export const organizationTypeEnum = pgEnum("OrganizationType", ["PRO", "STANDARD"]);
export const organizationStatusEnum = pgEnum("OrganizationStatus", ["ACTIVE", "INACTIVE", "PENDING"]);
export const languageCodeEnum = pgEnum("LanguageCode", ["EN", "AR"]);
export const sessionStatusEnum = pgEnum("SessionStatus", ["ACTIVE", "INACTIVE"]);
export const paymentProviderEnum = pgEnum("PaymentProvider", ["STRIPE", "PAYPAL", "MANUAL"]);
export const paymentStatusEnum = pgEnum("PaymentStatus", [
	"PENDING",
	"PROCESSING",
	"SUCCEEDED",
	"FAILED",
	"CANCELED",
	"REFUNDED",
	"PARTIALLY_REFUNDED",
]);
export const paymentMethodEnum = pgEnum("PaymentMethod", ["CARD", "MANUAL"]);
export const subscriptionStatusEnum = pgEnum("SubscriptionStatus", [
	"ACTIVE",
	"INACTIVE",
	"CANCELED",
	"PAST_DUE",
	"UNPAID",
	"TRIALING",
]);
export const billingCycleEnum = pgEnum("BillingCycle", ["MONTHLY"]);
export const cardBrandEnum = pgEnum("CardBrand", [
	"VISA",
	"MASTERCARD",
	"AMEX",
	"DISCOVER",
	"JCB",
	"DINERS",
	"UNIONPAY",
	"UNKNOWN",
]);
export const supportTypeEnum = pgEnum("SupportType", ["FINANCIAL", "INKIND"]);
export const supportStatusEnum = pgEnum("SupportStatus", ["PENDING", "APPROVED", "REJECTED"]);
export const expenseCategoryEnum = pgEnum("ExpenseCategory", ["CAMPAIGN", "GENERAL"]);
export const dutyTypeEnum = pgEnum("DutyType", ["FULL_TIME", "PART_TIME"]);
export const employeeSalaryTypeEnum = pgEnum("EmployeeSalaryType", ["BASIC", "BONUS"]);
export const administrativeRoleEnum = pgEnum("AdministrativeRole", ["EMPLOYEE", "VOLUNTEER"]);
export const employeeStatusEnum = pgEnum("EmployeeStatus", ["ACTIVE", "NON_ACTIVE", "HOLIDAY"]);
export const campaignStatusEnum = pgEnum("CampaignStatus", ["ACTIVE", "INACTIVE", "COMPLETED"]);
export const emailCampaignContactStatusEnum = pgEnum("EmailCampaignContactStatus", ["SUBSCRIBED", "UNSUBSCRIBED"]);

// Tables

export const users = pgTable(
	"User",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		email: varchar("email", { length: 255 }).notNull(),
		name: varchar("name", { length: 255 }),
		image: varchar("image", { length: 255 }),
		password: varchar("password", { length: 255 }),
		emailVerified: boolean("emailVerified").default(true).notNull(),
		role: userRoleEnum("role").default("USER").notNull(),
		active: boolean("active").default(true).notNull(),
		createdAt: timestamp("createdAt").defaultNow().notNull(),
		updatedAt: timestamp("updatedAt")
			.defaultNow()
			.$onUpdate(() => new Date()),
		organizationId: uuid("organizationId").notNull(),
	},
	(table) => ({
		emailOrganizationUnique: uniqueIndex("User_email_organizationId_key").on(table.email, table.organizationId),
	}),
);

export const sessions = pgTable("Session", {
	id: uuid("id").defaultRandom().primaryKey(),
	status: sessionStatusEnum("status").default("ACTIVE").notNull(),
	token: varchar("token", { length: 255 }),
	ipAddress: varchar("ipAddress", { length: 255 }),
	userAgent: text("userAgent"),
	userId: uuid("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp("createdAt").defaultNow().notNull(),
	updatedAt: timestamp("updatedAt")
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const organizations = pgTable("Organization", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	host: varchar("host", { length: 255 }).notNull().unique(),
	email: varchar("email", { length: 255 }),
	logo: varchar("logo", { length: 255 }),
	description: text("description"),
	facebook: varchar("facebook", { length: 255 }),
	instagram: varchar("instagram", { length: 255 }),
	link: varchar("link", { length: 255 }),
	location: varchar("location", { length: 255 }),
	phone: varchar("phone", { length: 255 }),
	telegram: varchar("telegram", { length: 255 }),
	thanksMessage: text("thanksMessage"),
	theme: varchar("theme", { length: 255 }),
	twitter: varchar("twitter", { length: 255 }),
	whatsapp: varchar("whatsapp", { length: 255 }),
	youtube: varchar("youtube", { length: 255 }),
	adminEmail: varchar("adminEmail", { length: 255 }),
	adminName: varchar("adminName", { length: 255 }),
	type: orgTypeEnum("type").default("INTERNAL").notNull(),
	integrationNotes: text("integrationNotes"),
	notes: text("notes"),
	isDeleted: boolean("isDeleted").default(false),
	defaultLanguage: languageCodeEnum("defaultLanguage").default("EN").notNull(),
	supportedLanguages: varchar("supportedLanguages", { length: 255 }).default('["EN"]').notNull(), // JSON array as string
	createdAt: timestamp("createdAt").defaultNow().notNull(),
	updatedAt: timestamp("updatedAt")
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const organizationSubscriptions = pgTable("OrganizationSubscription", {
	id: uuid("id").defaultRandom().primaryKey(),
	createdAt: timestamp("createdAt").defaultNow().notNull(),
	updatedAt: timestamp("updatedAt")
		.defaultNow()
		.$onUpdate(() => new Date()),
	startDate: timestamp("startDate").defaultNow().notNull(),
	endDate: timestamp("endDate").defaultNow().notNull(),
	organizationId: uuid("organizationId")
		.notNull()
		.unique()
		.references(() => organizations.id, { onDelete: "cascade" }),
	type: organizationTypeEnum("type").default("STANDARD").notNull(),
	status: organizationStatusEnum("status").default("ACTIVE").notNull(),
	amount: real("amount"),
	maxEmailContacts: integer("maxEmailContacts").default(1000).notNull(),
	maxEmailMessages: integer("maxEmailMessages").default(500).notNull(),
});

export const donors = pgTable(
	"donors",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: varchar("name", { length: 255 }).notNull(),
		email: varchar("email", { length: 255 }).notNull(),
		phone: varchar("phone", { length: 255 }),
		country: varchar("country", { length: 255 }),
		organizationId: uuid("organizationId")
			.notNull()
			.references(() => organizations.id),
		createdAt: timestamp("createdAt").defaultNow().notNull(),
		updatedAt: timestamp("updatedAt")
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => ({
		emailOrganizationUnique: uniqueIndex("donors_email_organizationId_key").on(table.email, table.organizationId),
	}),
);

export const payments = pgTable(
	"payments",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		donorId: uuid("donorId")
			.notNull()
			.references(() => donors.id),
		provider: paymentProviderEnum("provider").notNull(),
		providerPaymentId: varchar("providerPaymentId", { length: 255 }).notNull(),
		providerCustomerId: varchar("providerCustomerId", { length: 255 }),
		manualPaymentMethod: varchar("manualPaymentMethod", { length: 255 }),
		grossAmount: integer("grossAmount").notNull(),
		netAmount: integer("netAmount").notNull(),
		feeAmount: integer("feeAmount").notNull(),
		currency: varchar("currency", { length: 3 }).notNull(),
		status: paymentStatusEnum("status").notNull(),
		paymentMethod: paymentMethodEnum("paymentMethod").notNull(),
		campaignId: uuid("campaignId").references(() => campaigns.id),
		organizationId: uuid("organizationId")
			.notNull()
			.references(() => organizations.id),
		subscriptionId: uuid("subscriptionId").references(() => subscriptions.id),
		description: text("description"),
		receiptUrl: varchar("receiptUrl", { length: 255 }),
		providerMetadata: jsonb("providerMetadata"),
		createdAt: timestamp("createdAt").defaultNow().notNull(),
		updatedAt: timestamp("updatedAt")
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => ({
		providerPaymentUnique: uniqueIndex("payments_provider_providerPaymentId_key").on(
			table.provider,
			table.providerPaymentId,
		),
	}),
);

export const subscriptions = pgTable(
	"subscriptions",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		donorId: uuid("donorId")
			.notNull()
			.references(() => donors.id),
		provider: paymentProviderEnum("provider").notNull(),
		providerSubscriptionId: varchar("providerSubscriptionId", { length: 255 }).notNull(),
		providerCustomerId: varchar("providerCustomerId", { length: 255 }).notNull(),
		status: subscriptionStatusEnum("status").notNull(),
		amount: integer("amount"),
		currency: varchar("currency", { length: 3 }),
		billingCycle: billingCycleEnum("billingCycle").default("MONTHLY"),
		campaignId: uuid("campaignId")
			.notNull()
			.references(() => campaigns.id),
		organizationId: uuid("organizationId")
			.notNull()
			.references(() => organizations.id),
		createdAt: timestamp("createdAt").defaultNow().notNull(),
		updatedAt: timestamp("updatedAt")
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => ({
		providerSubscriptionUnique: uniqueIndex("subscriptions_provider_providerSubscriptionId_key").on(
			table.provider,
			table.providerSubscriptionId,
		),
	}),
);

export const cards = pgTable(
	"cards",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		donorId: uuid("donorId")
			.notNull()
			.references(() => donors.id),
		provider: paymentProviderEnum("provider").notNull(),
		providerCardId: varchar("providerCardId", { length: 255 }).notNull(),
		providerCustomerId: varchar("providerCustomerId", { length: 255 }).notNull(),
		last4: varchar("last4", { length: 4 }).notNull(),
		brand: cardBrandEnum("brand").notNull(),
		expMonth: integer("expMonth").notNull(),
		expYear: integer("expYear").notNull(),
		isDefault: boolean("isDefault").default(false).notNull(),
		isActive: boolean("isActive").default(true).notNull(),
		createdAt: timestamp("createdAt").defaultNow().notNull(),
		updatedAt: timestamp("updatedAt")
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => ({
		providerCardUnique: uniqueIndex("cards_provider_providerCardId_key").on(table.provider, table.providerCardId),
	}),
);

export const providerCustomers = pgTable(
	"provider_customers",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		donorId: uuid("donorId")
			.notNull()
			.references(() => donors.id),
		provider: paymentProviderEnum("provider").notNull(),
		providerCustomerId: varchar("providerCustomerId", { length: 255 }).notNull(),
		isActive: boolean("isActive").default(true).notNull(),
		providerMetadata: jsonb("providerMetadata"),
		organizationId: uuid("organizationId")
			.notNull()
			.references(() => organizations.id),
		createdAt: timestamp("createdAt").defaultNow().notNull(),
		updatedAt: timestamp("updatedAt")
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => ({
		donorProviderUnique: uniqueIndex("provider_customers_donorId_provider_key").on(table.donorId, table.provider),
		providerCustomerUnique: uniqueIndex("provider_customers_provider_providerCustomerId_key").on(
			table.provider,
			table.providerCustomerId,
		),
	}),
);

export const campaigns = pgTable("campaigns", {
	id: uuid("id").defaultRandom().primaryKey(),
	title: varchar("title", { length: 255 }).notNull(),
	targetAmount: integer("targetAmount"),
	currentAmount: integer("currentAmount").default(0).notNull(),
	isActive: boolean("isActive").default(true).notNull(),
	mainImage: varchar("mainImage", { length: 255 }),
	status: campaignStatusEnum("status").default("ACTIVE").notNull(),
	country: varchar("country", { length: 255 }),
	organizationId: uuid("organizationId")
		.notNull()
		.references(() => organizations.id),
	createdAt: timestamp("createdAt").defaultNow().notNull(),
	updatedAt: timestamp("updatedAt")
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const campaignVisitors = pgTable(
	"campaign_visitors",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		ipAddress: varchar("ipAddress", { length: 255 }).notNull(),
		country: varchar("country", { length: 255 }),
		visitCount: integer("visitCount").default(1).notNull(),
		lastVisit: timestamp("lastVisit").defaultNow().notNull(),
		campaignId: uuid("campaignId")
			.notNull()
			.references(() => campaigns.id, { onDelete: "cascade" }),
		createdAt: timestamp("createdAt").defaultNow().notNull(),
		updatedAt: timestamp("updatedAt")
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => ({
		campaignIpUnique: uniqueIndex("campaign_visitors_campaignId_ipAddress_key").on(table.campaignId, table.ipAddress),
	}),
);

export const campaignCategories = pgTable(
	"campaign_category",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		createdAt: timestamp("createdAt", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
		updatedAt: timestamp("updatedAt", { withTimezone: true, precision: 6 })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
		type: varchar("type", { length: 255 }).notNull(),
		organizationId: uuid("organizationId")
			.notNull()
			.references(() => organizations.id),
	},
	(table) => ({
		typeOrganizationUnique: uniqueIndex("campaign_category_type_organizationId_key").on(
			table.type,
			table.organizationId,
		),
	}),
);

export const campaignCategoryCampaigns = pgTable(
	"campaign_category_campaign",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		campaignId: uuid("campaignId")
			.notNull()
			.references(() => campaigns.id, { onDelete: "cascade" }),
		campaignCategoryId: uuid("campaignCategoryId")
			.notNull()
			.references(() => campaignCategories.id, { onDelete: "cascade" }),
		createdAt: timestamp("createdAt").defaultNow().notNull(),
		updatedAt: timestamp("updatedAt")
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => ({
		campaignCategoryUnique: uniqueIndex("campaign_category_campaign_campaignId_campaignCategoryId_key").on(
			table.campaignId,
			table.campaignCategoryId,
		),
	}),
);

export const campainLinks = pgTable("CampainLink", {
	id: uuid("id").defaultRandom().primaryKey(),
	campaignId: uuid("campaignId")
		.notNull()
		.unique()
		.references(() => campaigns.id),
	link: varchar("link", { length: 255 }).notNull(),
});

export const campainPages = pgTable("CampainPage", {
	id: uuid("id").defaultRandom().primaryKey(),
	campaignId: uuid("campaignId")
		.notNull()
		.unique()
		.references(() => campaigns.id),
	description: varchar("description", { length: 150 }).notNull(),
	fullDescription: text("fullDescription").notNull(),
	videoUrl: varchar("videoUrl", { length: 255 }),
	imageGallery: varchar("imageGallery", { length: 1000 }).default("[]").notNull(), // JSON array as string
	needs: jsonb("needs").default({}),
	seoTitle: varchar("seoTitle", { length: 255 }),
	seoKeywords: varchar("seoKeywords", { length: 1000 }).default("[]").notNull(), // JSON array as string
	seoDescription: text("seoDescription"),
});

export const campainEmails = pgTable("campaign_email", {
	id: uuid("id").defaultRandom().primaryKey(),
	campaignId: uuid("campaignId")
		.notNull()
		.unique()
		.references(() => campaigns.id),
	totalMessages: integer("totalMessages").default(0).notNull(),
	createdAt: timestamp("createdAt").defaultNow().notNull(),
	updatedAt: timestamp("updatedAt")
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const emailCampaignContacts = pgTable(
	"email_campaign_contact",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		organizationId: uuid("organizationId")
			.notNull()
			.references(() => organizations.id),
		email: varchar("email", { length: 255 }).notNull(),
		name: varchar("name", { length: 255 }).notNull(),
		country: varchar("country", { length: 255 }).notNull(),
		status: emailCampaignContactStatusEnum("status").default("SUBSCRIBED").notNull(),
		createdAt: timestamp("createdAt").defaultNow().notNull(),
		updatedAt: timestamp("updatedAt")
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => ({
		organizationEmailUnique: uniqueIndex("email_campaign_contact_organizationId_email_key").on(
			table.organizationId,
			table.email,
		),
	}),
);

export const beneficiaryRoles = pgTable("beneficiary_role", {
	id: uuid("id").defaultRandom().primaryKey(),
	role: varchar("role", { length: 255 }).notNull().unique(),
	organizationId: uuid("organizationId")
		.notNull()
		.references(() => organizations.id),
	createdAt: timestamp("createdAt", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updatedAt", { withTimezone: true, precision: 6 })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const beneficiaries = pgTable("Beneficiary", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	beneficiaryRoleId: uuid("beneficiaryRoleId")
		.notNull()
		.references(() => beneficiaryRoles.id),
	supportType: supportTypeEnum("supportType").default("FINANCIAL").notNull(),
	supportValue: text("supportValue").notNull(),
	supportStatus: supportStatusEnum("supportStatus").default("PENDING").notNull(),
	organizationId: uuid("organizationId")
		.notNull()
		.references(() => organizations.id),
	createdAt: timestamp("createdAt").defaultNow().notNull(),
	updatedAt: timestamp("updatedAt")
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const beneficiarySupports = pgTable("beneficiary_support", {
	id: uuid("id").defaultRandom().primaryKey(),
	supportType: supportTypeEnum("supportType").default("FINANCIAL").notNull(),
	supportValue: text("supportValue").notNull(),
	beneficiaryId: uuid("beneficiaryId")
		.notNull()
		.references(() => beneficiaries.id, { onDelete: "cascade" }),
	createdAt: timestamp("createdAt").defaultNow().notNull(),
	updatedAt: timestamp("updatedAt")
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const expenseTypes = pgTable("expense_type", {
	id: uuid("id").defaultRandom().primaryKey(),
	createdAt: timestamp("createdAt", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updatedAt", { withTimezone: true, precision: 6 })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
	type: varchar("type", { length: 255 }).notNull(),
	organizationId: uuid("organizationId")
		.notNull()
		.references(() => organizations.id),
});

export const expenses = pgTable("expense", {
	id: uuid("id").defaultRandom().primaryKey(),
	expenseCategory: expenseCategoryEnum("expenseCategory").notNull(),
	amount: real("amount").notNull(),
	description: text("description"),
	invoiceUrl: varchar("invoiceUrl", { length: 255 }),
	expenseTypeId: uuid("expenseTypeId").references(() => expenseTypes.id),
	campaignId: uuid("campaignId").references(() => campaigns.id),
	organizationId: uuid("organizationId").references(() => organizations.id),
	userId: uuid("userId").references(() => users.id),
	createdAt: timestamp("createdAt", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updatedAt", { withTimezone: true, precision: 6 })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const employeeRoles = pgTable("employee_role", {
	id: uuid("id").defaultRandom().primaryKey(),
	role: varchar("role", { length: 255 }).notNull().unique(),
	organizationId: uuid("organizationId")
		.notNull()
		.references(() => organizations.id),
	createdAt: timestamp("createdAt", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updatedAt", { withTimezone: true, precision: 6 })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const employees = pgTable("employee", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	salary: real("salary"),
	email: varchar("email", { length: 255 }),
	dutyType: dutyTypeEnum("dutyType"),
	status: employeeStatusEnum("status").notNull(),
	administrativeRole: administrativeRoleEnum("administrativeRole").notNull(),
	employeeRoleId: uuid("employeeRoleId")
		.notNull()
		.references(() => employeeRoles.id),
	organizationId: uuid("organizationId").references(() => organizations.id),
	createdAt: timestamp("createdAt", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updatedAt", { withTimezone: true, precision: 6 })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const employeeSalaries = pgTable("employee_salary", {
	id: uuid("id").defaultRandom().primaryKey(),
	salary: real("salary").notNull(),
	type: employeeSalaryTypeEnum("type").notNull(),
	employeeId: uuid("employeeId")
		.notNull()
		.references(() => employees.id, { onDelete: "cascade" }),
	createdAt: timestamp("createdAt", { withTimezone: true, precision: 6 }).defaultNow().notNull(),
	updatedAt: timestamp("updatedAt", { withTimezone: true, precision: 6 })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const paymentProviderConfigs = pgTable(
	"payment_provider_configs",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		organizationId: uuid("organizationId")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		provider: paymentProviderEnum("provider").notNull(),
		isActive: boolean("isActive").default(true).notNull(),
		isDefault: boolean("isDefault").default(false).notNull(),
		priority: integer("priority").default(0).notNull(),
		configName: varchar("configName", { length: 255 }).notNull(),
		apiKey: varchar("apiKey", { length: 1000 }),
		secretKey: varchar("secretKey", { length: 1000 }),
		webhookSecret: varchar("webhookSecret", { length: 1000 }),
		publicKey: varchar("publicKey", { length: 1000 }),
		settings: jsonb("settings"),
		supportedCurrencies: varchar("supportedCurrencies", { length: 1000 }).default("[]").notNull(), // JSON array as string
		supportedMethods: varchar("supportedMethods", { length: 1000 }).default("[]").notNull(), // JSON array as string
		description: text("description"),
		isTestMode: boolean("isTestMode").default(false).notNull(),
		createdAt: timestamp("createdAt").defaultNow().notNull(),
		updatedAt: timestamp("updatedAt")
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => ({
		organizationProviderConfigUnique: uniqueIndex("payment_provider_configs_organizationId_provider_configName_key").on(
			table.organizationId,
			table.provider,
			table.configName,
		),
	}),
);

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
	sessions: many(sessions),
	expenses: many(expenses),
	organization: one(organizations, {
		fields: [users.organizationId],
		references: [organizations.id],
	}),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
}));

export const organizationsRelations = relations(organizations, ({ many, one }) => ({
	users: many(users),
	organizationSubscription: one(organizationSubscriptions, {
		fields: [organizations.id],
		references: [organizationSubscriptions.organizationId],
	}),
	payments: many(payments),
	subscriptions: many(subscriptions),
	campaigns: many(campaigns),
	paymentProviderConfigs: many(paymentProviderConfigs),
	campaignCategories: many(campaignCategories),
	beneficiaries: many(beneficiaries),
	beneficiaryRoles: many(beneficiaryRoles),
	expenses: many(expenses),
	expenseTypes: many(expenseTypes),
	employees: many(employees),
	employeeRoles: many(employeeRoles),
	donors: many(donors),
	providerCustomers: many(providerCustomers),
	emailCampaignContacts: many(emailCampaignContacts),
}));

export const organizationSubscriptionsRelations = relations(organizationSubscriptions, ({ one }) => ({
	organization: one(organizations, {
		fields: [organizationSubscriptions.organizationId],
		references: [organizations.id],
	}),
}));

export const donorsRelations = relations(donors, ({ many, one }) => ({
	payments: many(payments),
	subscriptions: many(subscriptions),
	cards: many(cards),
	providerCustomers: many(providerCustomers),
	organization: one(organizations, {
		fields: [donors.organizationId],
		references: [organizations.id],
	}),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
	donor: one(donors, {
		fields: [payments.donorId],
		references: [donors.id],
	}),
	campaign: one(campaigns, {
		fields: [payments.campaignId],
		references: [campaigns.id],
	}),
	organization: one(organizations, {
		fields: [payments.organizationId],
		references: [organizations.id],
	}),
	subscription: one(subscriptions, {
		fields: [payments.subscriptionId],
		references: [subscriptions.id],
	}),
}));

export const subscriptionsRelations = relations(subscriptions, ({ many, one }) => ({
	payments: many(payments),
	donor: one(donors, {
		fields: [subscriptions.donorId],
		references: [donors.id],
	}),
	campaign: one(campaigns, {
		fields: [subscriptions.campaignId],
		references: [campaigns.id],
	}),
	organization: one(organizations, {
		fields: [subscriptions.organizationId],
		references: [organizations.id],
	}),
}));

export const cardsRelations = relations(cards, ({ one }) => ({
	donor: one(donors, {
		fields: [cards.donorId],
		references: [donors.id],
	}),
}));

export const providerCustomersRelations = relations(providerCustomers, ({ one }) => ({
	donor: one(donors, {
		fields: [providerCustomers.donorId],
		references: [donors.id],
	}),
	organization: one(organizations, {
		fields: [providerCustomers.organizationId],
		references: [organizations.id],
	}),
}));

export const campaignsRelations = relations(campaigns, ({ many, one }) => ({
	payments: many(payments),
	subscriptions: many(subscriptions),
	expenses: many(expenses),
	visitors: many(campaignVisitors),
	campaignCategoryCampaigns: many(campaignCategoryCampaigns),
	campainLink: one(campainLinks, {
		fields: [campaigns.id],
		references: [campainLinks.campaignId],
	}),
	campainPage: one(campainPages, {
		fields: [campaigns.id],
		references: [campainPages.campaignId],
	}),
	campainEmail: one(campainEmails, {
		fields: [campaigns.id],
		references: [campainEmails.campaignId],
	}),
	organization: one(organizations, {
		fields: [campaigns.organizationId],
		references: [organizations.id],
	}),
}));

export const campaignVisitorsRelations = relations(campaignVisitors, ({ one }) => ({
	campaign: one(campaigns, {
		fields: [campaignVisitors.campaignId],
		references: [campaigns.id],
	}),
}));

export const campaignCategoriesRelations = relations(campaignCategories, ({ many, one }) => ({
	campaigns: many(campaignCategoryCampaigns),
	organization: one(organizations, {
		fields: [campaignCategories.organizationId],
		references: [organizations.id],
	}),
}));

export const campaignCategoryCampaignsRelations = relations(campaignCategoryCampaigns, ({ one }) => ({
	campaign: one(campaigns, {
		fields: [campaignCategoryCampaigns.campaignId],
		references: [campaigns.id],
	}),
	campaignCategory: one(campaignCategories, {
		fields: [campaignCategoryCampaigns.campaignCategoryId],
		references: [campaignCategories.id],
	}),
}));

export const campainLinksRelations = relations(campainLinks, ({ one }) => ({
	campaign: one(campaigns, {
		fields: [campainLinks.campaignId],
		references: [campaigns.id],
	}),
}));

export const campainPagesRelations = relations(campainPages, ({ one }) => ({
	campaign: one(campaigns, {
		fields: [campainPages.campaignId],
		references: [campaigns.id],
	}),
}));

export const campainEmailsRelations = relations(campainEmails, ({ one }) => ({
	campaign: one(campaigns, {
		fields: [campainEmails.campaignId],
		references: [campaigns.id],
	}),
}));

export const emailCampaignContactsRelations = relations(emailCampaignContacts, ({ one }) => ({
	organization: one(organizations, {
		fields: [emailCampaignContacts.organizationId],
		references: [organizations.id],
	}),
}));

export const beneficiaryRolesRelations = relations(beneficiaryRoles, ({ many, one }) => ({
	beneficiaries: many(beneficiaries),
	organization: one(organizations, {
		fields: [beneficiaryRoles.organizationId],
		references: [organizations.id],
	}),
}));

export const beneficiariesRelations = relations(beneficiaries, ({ many, one }) => ({
	beneficiarySupports: many(beneficiarySupports),
	beneficiaryRole: one(beneficiaryRoles, {
		fields: [beneficiaries.beneficiaryRoleId],
		references: [beneficiaryRoles.id],
	}),
	organization: one(organizations, {
		fields: [beneficiaries.organizationId],
		references: [organizations.id],
	}),
}));

export const beneficiarySupportsRelations = relations(beneficiarySupports, ({ one }) => ({
	beneficiary: one(beneficiaries, {
		fields: [beneficiarySupports.beneficiaryId],
		references: [beneficiaries.id],
	}),
}));

export const expenseTypesRelations = relations(expenseTypes, ({ many, one }) => ({
	expenses: many(expenses),
	organization: one(organizations, {
		fields: [expenseTypes.organizationId],
		references: [organizations.id],
	}),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
	expenseType: one(expenseTypes, {
		fields: [expenses.expenseTypeId],
		references: [expenseTypes.id],
	}),
	campaign: one(campaigns, {
		fields: [expenses.campaignId],
		references: [campaigns.id],
	}),
	organization: one(organizations, {
		fields: [expenses.organizationId],
		references: [organizations.id],
	}),
	user: one(users, {
		fields: [expenses.userId],
		references: [users.id],
	}),
}));

export const employeeRolesRelations = relations(employeeRoles, ({ many, one }) => ({
	employees: many(employees),
	organization: one(organizations, {
		fields: [employeeRoles.organizationId],
		references: [organizations.id],
	}),
}));

export const employeesRelations = relations(employees, ({ many, one }) => ({
	employeeSalaries: many(employeeSalaries),
	employeeRole: one(employeeRoles, {
		fields: [employees.employeeRoleId],
		references: [employeeRoles.id],
	}),
	organization: one(organizations, {
		fields: [employees.organizationId],
		references: [organizations.id],
	}),
}));

export const employeeSalariesRelations = relations(employeeSalaries, ({ one }) => ({
	employee: one(employees, {
		fields: [employeeSalaries.employeeId],
		references: [employees.id],
	}),
}));

export const paymentProviderConfigsRelations = relations(paymentProviderConfigs, ({ one }) => ({
	organization: one(organizations, {
		fields: [paymentProviderConfigs.organizationId],
		references: [organizations.id],
	}),
}));
