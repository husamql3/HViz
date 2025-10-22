"use client";

import type { BundledLanguage } from "@/components/code-block";
import {
	CodeBlock,
	CodeBlockBody,
	CodeBlockContent,
	CodeBlockFilename,
	CodeBlockFiles,
	CodeBlockHeader,
	CodeBlockItem,
} from "@/components/code-block";

const code = [
	{
		language: "bash",
		filename: "Install",
		code: `
# npm
npm install -D hviz

# yarn
yarn add -D hviz

# pnpm
pnpm install -D hviz

# bun
bun install -D hviz
`,
	},
];

const interactiveMode = [
	{
		language: "bash",
		filename: "Run",
		displayName: "Basic",
		code: `
# Run with interactive prompts
bunx hviz

# Run with non-interactive mode
bunx hviz --type prisma --schema prisma/schema.prisma

# Run with custom port
bunx hviz --port 4000

# Run with all options
bunx hviz --type prisma --schema prisma/schema.prisma --port 4000
`,
	},
];

const scriptUsage = [
	{
		language: "json",
		filename: "package.json",
		code: `{
  "scripts": {
    // prisma
    "visualize": "hviz --type prisma --schema prisma/schema.prisma --port 4000",

    // drizzle
    "visualize": "hviz --type drizzle --schema drizzle/schema.ts --port 4000",

    // typeorm
    "visualize": "hviz --type typeorm --schema typeorm/schema.ts --port 4000",
  }
}`,
	},
];

export const GettingStarted = () => (
	<div className="z-10 px-6.5 w-full space-y-12 py-20">
		<div className="text-center space-y-3">
			<h2 className="text-4xl md:text-5xl font-bold tracking-tight">Getting Started</h2>
			<p className="text-neutral-400 text-lg max-w-2xl mx-auto">
				Install hviz and visualize your database schema in seconds
			</p>
		</div>

		{/* Installation */}
		<div className="space-y-6">
			<div className="space-y-2">
				<h3 className="text-2xl md:text-3xl font-bold tracking-tight">Install</h3>
				<p className="text-neutral-300 text-base leading-relaxed">Add hviz to your project as a dev dependency</p>
			</div>
			<CodeBlock data={code} defaultValue={code[0].language}>
				<CodeBlockHeader>
					<CodeBlockFiles>
						{(item) => (
							<CodeBlockFilename key={item.filename} value={item.language}>
								{item.filename}
							</CodeBlockFilename>
						)}
					</CodeBlockFiles>
				</CodeBlockHeader>
				<CodeBlockBody>
					{(item) => (
						<CodeBlockItem key={item.language} value={item.language} lineNumbers={false}>
							<CodeBlockContent language={item.language as BundledLanguage}>{item.code}</CodeBlockContent>
						</CodeBlockItem>
					)}
				</CodeBlockBody>
			</CodeBlock>
		</div>

		{/* Quick Start */}
		<div className="space-y-6">
			<div className="space-y-2">
				<h3 className="text-2xl md:text-3xl font-bold tracking-tight">Run</h3>
				<p className="text-neutral-300 text-base leading-relaxed">
					Start hviz with interactive prompts or specify options directly
				</p>
			</div>
			<CodeBlock data={interactiveMode} defaultValue={interactiveMode[0].filename}>
				<CodeBlockHeader>
					<CodeBlockFiles>
						{(item) => (
							<CodeBlockFilename key={item.filename} value={item.filename}>
								{item.filename}
							</CodeBlockFilename>
						)}
					</CodeBlockFiles>
				</CodeBlockHeader>
				<CodeBlockBody>
					{(item) => (
						<CodeBlockItem key={item.filename} value={item.filename} lineNumbers={false}>
							<CodeBlockContent language={item.language as BundledLanguage}>{item.code}</CodeBlockContent>
						</CodeBlockItem>
					)}
				</CodeBlockBody>
			</CodeBlock>
		</div>

		{/* Add to Scripts */}
		<div className="space-y-6">
			<div className="space-y-2">
				<h3 className="text-2xl md:text-3xl font-bold tracking-tight">Add to Scripts</h3>
				<p className="text-neutral-300 text-base leading-relaxed">
					Add hviz to your package.json scripts for quick access
				</p>
			</div>
			<CodeBlock data={scriptUsage} defaultValue={scriptUsage[0].filename}>
				<CodeBlockHeader>
					<CodeBlockFiles>
						{(item) => (
							<CodeBlockFilename key={item.filename} value={item.filename}>
								{item.filename}
							</CodeBlockFilename>
						)}
					</CodeBlockFiles>
				</CodeBlockHeader>
				<CodeBlockBody>
					{(item) => (
						<CodeBlockItem key={item.filename} value={item.filename} lineNumbers={false}>
							<CodeBlockContent language={item.language as BundledLanguage}>{item.code}</CodeBlockContent>
						</CodeBlockItem>
					)}
				</CodeBlockBody>
			</CodeBlock>
		</div>
	</div>
);
