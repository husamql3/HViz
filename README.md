<div align="center">

# hviz

**CLI tool for visualizing your database schema**

[![License](https://img.shields.io/github/license/husamql3/hviz?style=flat-square)](LICENSE)
[![NPM](https://img.shields.io/npm/v/hviz?style=flat-square)](https://www.npmjs.com/package/hviz)

[Website](https://www.hviz.tech) • [Report Bug](https://github.com/husamql3/hviz/issues) • [Request Feature](https://github.com/husamql3/hviz/issues)

![hviz banner](https://hviz.tech/tut.mp4)

</div>

---

## 🚀 Quick Start

```bash
# Run with npx (no installation needed)
npx hviz

# Or with bunx
bunx hviz
```

That's it! hviz will guide you through the rest with interactive prompts.

---

## 📦 Installation

Install globally for quick access:

```bash
# npm
npm install -g hviz

# bun
bun install -g hviz
```

Or add to your project as a dev dependency:

```bash
# npm
npm install -D hviz

# bun
bun install -D hviz
```

---

## 🎯 Usage

### Interactive Mode (Recommended)

Simply run hviz and follow the prompts:

```bash
hviz
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
hviz --type prisma --schema prisma/schema.prisma

# Drizzle
hviz --type drizzle --schema drizzle/schema.ts

# TypeORM
hviz --type typeorm --schema typeorm/schema.ts

# Custom port
hviz --type prisma --schema prisma/schema.prisma --port 4000
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

## 🤝 Contributing

Contributions are welcome! Feel free to:

- 🐛 Report bugs
- 💡 Suggest new features
- 🔧 Submit pull requests
- 📖 Improve documentation

---

## 📝 License

MIT

---

## 🔗 Links

- **Website**: [hviz.tech](https://www.hviz.tech)
- **Author**: [@husamql3](https://x.com/husamql3)
