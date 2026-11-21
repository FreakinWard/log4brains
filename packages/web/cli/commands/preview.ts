import next from "next";
import { createServer } from "http";
import { randomUUID } from "crypto";
import SocketIO from "socket.io";
import chalk from "chalk";
import open from "open";
import type { AppConsole } from "@log4brains/cli-common";
import { execNext, getL4bInstance, getNextJsDir } from "../utils";

type Deps = {
  appConsole: AppConsole;
};

type SystemError = Error & { code?: string };
function isSystemError(obj: unknown): obj is SystemError {
  return obj instanceof Error && "code" in obj;
}

export async function previewCommand(
  { appConsole }: Deps,
  port: number,
  openBrowser: boolean,
  adrSlug?: string
): Promise<void> {
  process.env.NEXT_TELEMETRY_DISABLED = "1";
  const dev = process.env.NODE_ENV === "development";

  appConsole.startSpinner("Log4brains is starting...");
  appConsole.debug(`Run \`next ${dev ? "dev" : "start"}\`...`);

  // Authenticates the revalidation requests sent to the Next.js app (see nextjs/src/pages/api/revalidate.ts)
  const revalidateToken = randomUUID();
  process.env.LOG4BRAINS_REVALIDATE_TOKEN = revalidateToken;

  const app = next({
    dev,
    dir: getNextJsDir()
  });

  await execNext(async () => {
    await app.prepare();
  });

  const handle = app.getRequestHandler();
  const srv = createServer((req, res) => {
    void handle(req, res);
  });

  // FileWatcher with Socket.io
  const io = SocketIO(srv);

  const { fileWatcher } = getL4bInstance();
  // Hot Reload: the pages showing the changed file are regenerated before the browser re-renders them
  const revalidatePages = async (relativePath: string): Promise<void> => {
    try {
      const res = await fetch(`http://localhost:${port}/api/revalidate/`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-log4brains-token": revalidateToken
        },
        body: JSON.stringify({ relativePath })
      });
      appConsole.debug(
        `[FileWatcher] revalidation: ${res.status} ${await res.text()}`
      );
    } catch (e) {
      appConsole.debug(`[FileWatcher] revalidation failed: ${String(e)}`);
    }
  };
  fileWatcher.subscribe((event) => {
    appConsole.debug(`[FileWatcher] ${event.type} - ${event.relativePath}`);
    void revalidatePages(event.relativePath).then(() =>
      io.emit("FileWatcher", event)
    );
  });
  fileWatcher.start();

  try {
    await execNext(
      () =>
        new Promise((resolve, reject) => {
          // This code catches EADDRINUSE error if the port is already in use
          srv.on("error", reject);
          srv.on("listening", () => resolve());
          srv.listen(port);
        })
    );
  } catch (err) {
    appConsole.stopSpinner();

    if (isSystemError(err) && err.code === "EADDRINUSE") {
      if (openBrowser && adrSlug) {
        appConsole.println(
          chalk.dim(
            "Log4brains is already started. We open the browser and exit"
          )
        );
        await open(`http://localhost:${port}/adr/${adrSlug}`);
        process.exit(0);
      }

      appConsole.fatal(
        `Port ${port} is already in use. Use the -p <PORT> option to select another one.`
      );
      process.exit(1);
    } else if (isSystemError(err) && err.code === "EACCES") {
      appConsole.fatal(
        `Impossible to use port ${port} (permission denied). Use the -p <PORT> option to select another one.`
      );
      process.exit(1);
    }

    throw err;
  }

  appConsole.stopSpinner();
  appConsole.println(
    `Your Log4brains preview is 🚀 on ${chalk.underline.blueBright(
      `http://localhost:${port}/`
    )}`
  );
  appConsole.println(
    chalk.dim(
      "Hot Reload is enabled: any change you make to a markdown file is applied live"
    )
  );

  if (dev) {
    appConsole.println();
    appConsole.println(
      `${chalk.bgBlue.white.bold(" DEV ")} ${chalk.blue(
        "Next.js' Fast Refresh is enabled"
      )}`
    );
    appConsole.println();
  }

  if (openBrowser) {
    await open(`http://localhost:${port}/${adrSlug ? `adr/${adrSlug}` : ""}`);
  }
}
