<div align="center">

![License](https://img.shields.io/github/license/husamql3/hviz)
![Version](https://img.shields.io/github/package-json/v/husamql3/hviz?color=0066CC&label=Version&style=flat)

</div>

![hviz banner](https://www.hviz.tech/og-img.png)

A CLI tool for visualizing your database schema

<div align="center">

# hviz

**Beautiful ERD visualization for your database schema**

[![License](https://img.shields.io/github/license/husamql3/hviz?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/github/package-json/v/husamql3/hviz?color=0066CC&label=version&style=flat-square)](package.json)
[![NPM](https://img.shields.io/npm/v/hviz?style=flat-square)](https://www.npmjs.com/package/hviz)

[Website](https://www.hviz.tech) • [Report Bug](https://github.com/husamql3/hviz/issues) • [Request Feature](https://github.com/husamql3/hviz/issues)

![hviz banner](https://www.hviz.tech/og-img.png)

</div>

---

## ✨ What is hviz?

**hviz** is a zero-config CLI tool that instantly transforms your database schema into beautiful, interactive Entity Relationship Diagrams (ERDs). Point it at your schema file, and watch your database come to life in your browser.

No more manual diagramming. No more outdated documentation. Just run one command.

## 🚀 Quick Start

```bash
# Using npx (no installation required)
npx hviz

# Or install globally
npm install -g hviz
hviz

# Using bun
bunx hviz
```

That's it! The CLI will guide you through the rest.

## 🎯 Features

- **🔥 Zero Configuration** - Works out of the box with sensible defaults
- **⚡️ Lightning Fast** - Built with performance in mind
- **🎨 Beautiful UI** - Clean, modern interface with smooth interactions
- **🔄 Interactive Diagrams** - Pan, zoom, and explore your schema relationships
- **📦 Multiple ORMs** - Support for Prisma, Drizzle ORM (TypeORM, raw SQL coming soon)
- **🌐 Browser-Based** - Automatically opens in your default browser
- **🎭 Relationship Visualization** - Clearly shows one-to-one, one-to-many, and many-to-many relationships
- **📱 Responsive** - Works on any screen size

## 🛠 Supported ORMs & Databases

### Currently Supported ✅

| ORM         | Database                           | Status    |
| ----------- | ---------------------------------- | --------- |
| **Prisma**  | PostgreSQL, MySQL, SQLite, MongoDB | ✅ Stable |
| **Drizzle** | PostgreSQL                         | ✅ Stable |
| **Drizzle** | MySQL                              | ✅ Stable |
| **Drizzle** | SQLite                             | ✅ Stable |

### Coming Soon 🚧

- TypeORM
- Direct PostgreSQL connection
- Direct MySQL connection
- Direct SQLite connection

## 📖 Usage

### Interactive Mode (Recommended)

Simply run the command and follow the prompts:

```bash
npx hviz
```

The CLI will ask you:

1. **Which ORM/Database you're using** (Prisma, Drizzle, etc.)
2. **Path to your schema file** (with smart defaults)

Then it will:

- Generate your ERD
- Start a local server
- Automatically open the visualization in your browser

### For Prisma Projects

```bash
npx hviz
# Select: Prisma
# Path: prisma/schema.prisma (or your custom path)
```

### For Drizzle Projects

```bash
npx hviz
# Select: Drizzle
# Choose your dialect: PostgreSQL, MySQL, or SQLite
# Path: src/db/schema.ts (or your custom path)
```

## 📸 What You'll Get

- **Table View**: See all your tables with their columns and types
- **Relationship Lines**: Visual connections between related tables
- **Type Information**: Column types, constraints, and defaults
- **Interactive Canvas**: Pan and zoom to navigate large schemas
- **Clean Layout**: Automatic positioning for optimal readability

## 🏗 How It Works

1. **Parse**: Reads your schema file (Prisma or Drizzle)
2. **Transform**: Converts it to DBML (Database Markup Language)
3. **Generate**: Creates an interactive ERD structure
4. **Serve**: Spins up a local server with the visualization
5. **Open**: Launches your browser to view the diagram

## 🤝 Contributing

Contributions are welcome! Feel free to:

- 🐛 Report bugs
- 💡 Suggest new features
- 🔧 Submit pull requests
- 📖 Improve documentation

## 📝 License

MIT © [husamql3](https://github.com/husamql3)

## 🔗 Links

- **Website**: [hviz.tech](https://www.hviz.tech)
- **Author**: [@husamql3](https://x.com/husamql3)

---

<div align="center">

**Built with ❤️ for developers who love great tools**

If hviz helped you, consider [giving it a star ⭐️](https://github.com/husamql3/hviz)

</div>
