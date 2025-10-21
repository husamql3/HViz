import { Command } from "commander";
import { cancel } from "@clack/prompts";

export const DEFAULT_PORT = 3333;

export const cmdArgs = (): { port: number } => {
  const program = new Command();
  program
    .option('-p, --port <number>', 'Port to run the server on', DEFAULT_PORT.toString())
    .parse(process.argv);

  const options = program.opts();
  const port = parseInt(options.port, 10);

  // Validate port
  if (isNaN(port) || port < 1 || port > 65535) {
    cancel("Invalid port number. Please provide a port between 1 and 65535.");
    process.exit(1);
  }

  return { port };
}