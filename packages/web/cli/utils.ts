import chalk from "chalk";
import { ConsoleCapturer } from "@log4brains/cli-common";
import { Log4brains } from "@log4brains/core";
import path from "path";
import { spawn } from "child_process";

let l4bInstance: Log4brains;
export function getL4bInstance(): Log4brains {
  if (!l4bInstance) {
    l4bInstance = Log4brains.createFromCwd(process.env.LOG4BRAINS_CWD || ".");
  }
  return l4bInstance;
}

export function getNextJsDir(): string {
  return path.resolve(path.join(__dirname, "../nextjs")); // only one level up because bundled with microbundle
}

/**
 * #NEXTJS-HACK
 * We want to hide the output of Next.js when we execute CLI commands.
 *
 * @param fn The code which calls Next.js methods for which we want to capture the output
 */
export async function execNext(fn: () => Promise<void>): Promise<void> {
  const debug = !!process.env.DEBUG;

  const capturer = new ConsoleCapturer();
  capturer.onLog = (method, args, stream) => {
    if (stream === "stderr" || debug) {
      capturer.doPrintln(...["[Next] ", ...args].map((a) => chalk.dim(a)));
    }
  };

  capturer.start();
  await fn();
  capturer.stop();
}

/**
 * Runs the Next.js CLI on the Next.js app (eg. `next build`), hiding its output like execNext().
 *
 * @param args The Next.js CLI arguments
 * @param env Environment variables to add for the Next.js process
 */
export async function runNextCli(
  args: string[],
  env: Record<string, string>
): Promise<void> {
  const debug = !!process.env.DEBUG;
  const output: string[] = [];

  const child = spawn(
    process.execPath,
    [require.resolve("next/dist/bin/next"), ...args],
    {
      cwd: getNextJsDir(),
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"]
    }
  );
  const print = (data: Buffer, isStderr: boolean): void => {
    const text = data.toString().trimEnd();
    output.push(text);
    if (isStderr || debug) {
      process.stdout.write(`${chalk.dim(`[Next] ${text}`)}\n`);
    }
  };
  child.stdout.on("data", (data: Buffer) => print(data, false));
  child.stderr.on("data", (data: Buffer) => print(data, true));

  const exitCode = await new Promise<number | null>((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });
  if (exitCode !== 0) {
    throw new Error(
      `\`next ${args.join(" ")}\` failed (exit code ${String(exitCode)}):\n${output.join("\n")}`
    );
  }
}
