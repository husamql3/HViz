type Status = "done" | "in progress" | "not started";

type RoadmapItem = {
	title: string;
	subtitle?: string;
	status: Status;
	subFeatures?: {
		title: string;
		status?: Status;
	}[];
	priority: "P1" | "P2" | "P3" | "P4";
};

export const ROADMAP: RoadmapItem[] = [
	// 🟢 MVP
	{
		title: "CLI & Core Engine",
		subtitle: "CLI tool that generates ERD from parsing schema files",
		status: "done",
		priority: "P1", // Critical
	},
	{
		title: "ORM Support",
		subFeatures: [{ title: "Prisma" }, { title: "Drizzle" }, { title: "TypeORM" }],
		priority: "P1", // Critical - without this, no parsing
		status: "done",
	},
	{
		title: "Schema Validation",
		subtitle: "Validate schema files for accuracy",
		status: "done",
		priority: "P2", // Important for reliability
	},

	// 🟡 Essential Features
	{
		title: "Database Support",
		subFeatures: [
			{ title: "Postgres", status: "not started" },
			{ title: "MySQL", status: "done" },
			{ title: "SQLite", status: "done" },
		],
		priority: "P2", // Depends on ORM parsing
		status: "in progress",
	},
	{
		title: "Automatic Schema Detection",
		subtitle: "Auto-detect schema from package.json",
		status: "not started",
		priority: "P2", // UX improvement
	},
	{
		title: "Visual Schema Editor",
		subtitle: "Update schema from ERD (bidirectional sync)",
		status: "not started",
		priority: "P3", // Killer feature but complex
	},

	// 🟠 Nice-to-Haves
	{
		title: "Visual Customization",
		subtitle: "Themes, layouts, and export options",
		status: "not started",
		priority: "P3",
	},
	{
		title: "Export & Integration",
		subtitle: "PNG/SVG/PDF export, API integration",
		status: "not started",
		priority: "P3",
	},

	// 🔴 Future
	{
		title: "Collaboration Features",
		subtitle: "Real-time editing and sharing",
		status: "not started",
		priority: "P4", // Most complex, enterprise-level
	},
];
