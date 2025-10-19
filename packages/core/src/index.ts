import { cancel, intro, isCancel, outro, spinner, text } from "@clack/prompts";
import color from "picocolors";
import { selectDB } from "./cmd/select-db";

export const main = async () => {
  console.log();
  intro(color.inverse(" HViz "));

  // Select the database type (prisma, drizzle, typeorm)
  const databaseType = await selectDB();

  outro(color.green(`Database type: ${databaseType}`));
  // outro(color.green(`Server running at ${color.cyan(`http://localhost:${PORT}`)}`));
}

main().catch((err) => {
  console.error(color.red(`❌ Unexpected error: ${err.message}`));
  process.exit(1);
});
