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

## 🚀 Quick Start

```bash
# Install globally (recommended)
npm install -g hviz
hviz

# Using bun
bun install -g hviz
hviz
```

That's it! The CLI will guide you through the rest.

## Supported ORMs & Databases

### Currently Supported

- [x] Prisma (PostgreSQL, MySQL, SQLite, MongoDB)
- [x] Drizzle (PostgreSQL, MySQL, SQLite)
- [ ] Typeorm
- [ ] PostgreSQL
- [ ] MySQL
- [ ] SQLite

## 📖 Usage

### Interactive Mode

Simply run the command and follow the prompts:

```bash
hviz
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
hviz
# Select: Prisma
# Path: prisma/schema.prisma (or your custom path)
```

### For Drizzle Projects

```bash
hviz
# Select: Drizzle
# Choose your dialect: PostgreSQL, MySQL, or SQLite
# Path: src/db/schema.ts (or your custom path)
```

## 🤝 Contributing

Contributions are welcome! Feel free to:

- 🐛 Report bugs
- 💡 Suggest new features
- 🔧 Submit pull requests
- 📖 Improve documentation

## 📝 License

MIT

## 🔗 Links

- **Website**: [hviz.tech](https://www.hviz.tech)
- **Author**: [@husamql3](https://x.com/husamql3)

---

<div align="center">

**Built with ❤️ for developers who love great tools**

If hviz helped you, consider [giving it a star ⭐️](https://github.com/husamql3/hviz)

</div>
