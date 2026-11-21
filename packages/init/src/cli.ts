import { Command } from "commander";
import type { AppConsole } from "@log4brains/cli-common";
import { InitCommand, InitCommandOpts } from "./commands";

type Deps = {
  appConsole: AppConsole;
};

export function createInitCli({ appConsole }: Deps): Command {
  const program = new Command().allowExcessArguments(); // commander >=13 rejects extra arguments; keep the previous lenient behavior

  program
    .command("init")
    .argument("[path]", "Path of your project. Default: current directory")
    .description("Configures Log4brains for your project")
    .option(
      "-d, --defaults",
      "Run in non-interactive mode and use the common default options",
      false
    )
    .action(
      (path: string | undefined, options: InitCommandOpts): Promise<void> => {
        return new InitCommand({ appConsole }).execute(options, path);
      }
    );

  return program;
}
