import { Command } from "commander";
import type { AppConsole } from "@freakin-ward/log4brains-cli-common";
import { previewCommand, buildCommand } from "./commands";

type StartEditorCommandOpts = {
  port: string;
  open: boolean;
};
type BuildCommandOpts = {
  out: string;
  basePath: string;
};

type Deps = {
  appConsole: AppConsole;
};

export function createWebCli({ appConsole }: Deps): Command {
  const program = new Command().allowExcessArguments(); // commander >=13 rejects extra arguments; keep the previous lenient behavior

  program
    .command("preview")
    .argument(
      "[adr]",
      "If provided, will automatically open your browser to this specific ADR"
    )
    .description("Start Log4brains locally to preview your changes")
    .option("-p, --port <port>", "Port to listen on", "4004")
    .option("--no-open", "Do not open the browser automatically", false)
    .action((adr: string, opts: StartEditorCommandOpts): Promise<void> => {
      return previewCommand(
        { appConsole },
        parseInt(opts.port, 10),
        opts.open,
        adr
      );
    });

  program
    .command("build")
    .description("Build Log4brains as a deployable static website")
    .option("-o, --out <path>", "Output path", ".log4brains/out")
    .option("--basePath <path>", "Custom base path", "")
    .action((opts: BuildCommandOpts): Promise<void> => {
      return buildCommand({ appConsole }, opts.out, opts.basePath);
    });

  return program;
}
