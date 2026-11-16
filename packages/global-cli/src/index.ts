import { readFileSync } from "fs";
import chalk from "chalk";
import { AppConsole, FailureExit } from "@freakin-ward/log4brains-cli-common";
import { Log4brainsConfigNotFoundError } from "@freakin-ward/log4brains-core";
import { createGlobalCli } from "./cli";

const debug = !!process.env.DEBUG;
const dev = process.env.NODE_ENV === "development";
const appConsole = new AppConsole({ debug, traces: debug || dev });

function handleError(err: unknown): void {
  if (appConsole.isSpinning()) {
    appConsole.stopSpinner(true);
  }

  if (err instanceof FailureExit) {
    process.exit(1);
  }

  if (err instanceof Log4brainsConfigNotFoundError) {
    appConsole.fatal(`Cannot find ${chalk.bold(".log4brains.yml")}`);
    appConsole.printlnErr(
      chalk.red(
        `You are in the wrong directory or you need to run ${chalk.cyan(
          "log4brains init"
        )}`
      )
    );
    process.exit(1);
  }

  appConsole.fatal(err as Error);
  process.exit(1);
}

try {
  const pkgVersion = (
    JSON.parse(
      readFileSync(new URL("../package.json", import.meta.url), "utf8")
    ) as { version: string }
  ).version;

  const cli = createGlobalCli({ version: pkgVersion, appConsole });
  cli.parseAsync(process.argv).catch(handleError);
} catch (e) {
  handleError(e);
}
