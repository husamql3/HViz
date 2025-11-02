<div align="center">

# hviz

**CLI tool for visualizing your database schema**

[![NPM](https://img.shields.io/npm/v/hviz?style=flat-square)](https://www.npmjs.com/package/hviz)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Transform your database schema into beautiful, interactive ERDs in seconds.

[Website](https://www.hviz.tech) · [Documentation](https://www.hviz.tech) · [Report Bug](https://github.com/husamql3/hviz/issues)

</div>

---

## 🚀 Quick Start

```bash
# Run with interactive prompts
bunx hviz

# Or with npx
npx hviz
```

That's it! hviz will guide you through the rest with interactive prompts.

---

## 📦 Installation

Add hviz to your project as a dev dependency:

```bash
# npm
npm install -D hviz

# yarn
yarn add -D hviz

# pnpm
pnpm install -D hviz

# bun
bun install -D hviz
```

---

## 🎯 Usage

### Interactive Mode (Recommended)

Simply run hviz and follow the prompts:

```bash
bunx hviz
```

The CLI will ask you:

1. **Which ORM you're using** (Prisma, Drizzle, or TypeORM)
2. **Path to your schema file** (with smart suggestions)

Then it will:

- Parse your schema
- Generate an interactive ERD
- Start a local server
- Open the visualization in your browser

### Non-Interactive Mode

Specify all options directly:

```bash
# Prisma
bunx hviz --type prisma --schema prisma/schema.prisma

# Drizzle
bunx hviz --type drizzle --schema drizzle/schema.ts

# TypeORM
bunx hviz --type typeorm --schema typeorm/schema.ts

# Custom port
bunx hviz --type prisma --schema prisma/schema.prisma --port 4000

# PostgreSQL
bunx hviz --type postgres --schema schema.sql

# MySQL
bunx hviz --type mysql --schema schema.sql

# SQLite
bunx hviz --type sqlite --schema schema.sql
```

### Add to package.json Scripts

For quick access, add hviz to your `package.json` scripts:

```json
{
  "scripts": {
    // Prisma
    "visualize": "hviz --type prisma --schema prisma/schema.prisma --port 4000",

    // Drizzle
    "visualize": "hviz --type drizzle --schema drizzle/schema.ts --port 4000",

    // TypeORM
    "visualize": "hviz --type typeorm --schema typeorm/schema.ts --port 4000"
  }
}
```

Then run:

```bash
bun run visualize
```

---

## 🛠️ CLI Options

| Option      | Alias | Description                         | Default            |
| ----------- | ----- | ----------------------------------- | ------------------ |
| `--type`    | `-t`  | ORM type (prisma, drizzle, typeorm) | Interactive prompt |
| `--schema`  | `-s`  | Path to schema file                 | Interactive prompt |
| `--port`    | `-p`  | Port to run server on               | `3000`             |
| `--version` | `-v`  | Show version                        | -                  |

---

## 🗄️ Supported ORMs & Databases

### ORMs

- ✅ **Prisma**
- ✅ **Drizzle** (PostgreSQL, MySQL, SQLite)
- ✅ **TypeORM**

### Raw SQL Files

- ✅ **PostgreSQL** (.sql files)
- ✅ **MySQL** (.sql files)
- ✅ **SQLite** (.sql files)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT ©

---

<div align="center">

**[hviz.tech](https://www.hviz.tech)**

Built with ❤️ for developers who love great tools

</div>
