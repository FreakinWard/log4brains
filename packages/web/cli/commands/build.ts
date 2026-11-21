import chalk from "chalk";
import path from "path";
import { randomUUID } from "crypto";
import mkdirp from "mkdirp";
import { makeBadge } from "badge-maker";
import { promises as fsP } from "fs";
import type { AppConsole } from "@freakin-ward/log4brains-cli-common";
import { Search } from "@lib-shared/search";
import { toAdrLight } from "@lib-shared/types";
import { getL4bInstance, getNextJsDir, runNextCli } from "../utils";

type Deps = {
  appConsole: AppConsole;
};

export async function buildCommand(
  { appConsole }: Deps,
  outPathOpt: string,
  basePath: string
): Promise<void> {
  process.env.NEXT_TELEMETRY_DISABLED = "1";
  appConsole.println("Building Log4brains...");

  // `next build` runs from the Next.js app's folder: paths are resolved from the current one first
  const outPath = path.resolve(outPathOpt);
  const cwdFromOutPath = path.relative(outPath, process.cwd());
  if (
    !cwdFromOutPath.startsWith("..") &&
    !path.isAbsolute(cwdFromOutPath) // Windows: on another drive
  ) {
    // The output folder is emptied before the build: it must not contain the project
    throw new Error(
      `Invalid output path: ${outPath} contains the current folder. Use the -o <path> option to select another one.`
    );
  }
  const buildId = randomUUID();

  appConsole.debug("Run `next build`...");
  // Static export (output: "export" in next.config.js), generated in the app's .next-export folder
  await runNextCli(["build"], {
    NEXT_PUBLIC_LOG4BRAINS_STATIC: "1",
    LOG4BRAINS_BUILD_ID: buildId,
    LOG4BRAINS_BASE_PATH: basePath,
    LOG4BRAINS_CWD: path.resolve(process.env.LOG4BRAINS_CWD || ".")
  });

  await fsP.rm(outPath, { recursive: true, force: true });
  await fsP.cp(path.join(getNextJsDir(), ".next-export"), outPath, {
    recursive: true
  });

  appConsole.startSpinner("Generating ADR data...");
  // TODO: move to a dedicated module
  await mkdirp(path.join(outPath, "data", buildId));
  const adrs = await getL4bInstance().searchAdrs();

  // TODO: remove this dead code when we are sure we don't need a JSON file per ADR

  // const packages = new Set<string>();
  // adrs.forEach((adr) => adr.package && packages.add(adr.package));
  // const mkdirpPromises = Array.from(packages).map((pkg) =>
  //   mkdirp(path.join(outPath, `data/adr/${pkg}`))
  // );
  // await Promise.all(mkdirpPromises);

  const promises = [
    // ...adrs.map((adr) =>
    //   fsP.writeFile(
    //     path.join(outPath, "data", buildId, "adr", `${adr.slug}.json`),
    //     JSON.stringify(
    //       toAdr(
    //         adr,
    //         adr.supersededBy ? getAdrBySlug(adr.supersededBy, adrs) : undefined
    //       )
    //     ),
    //     "utf-8"
    //   )
    // ),
    fsP.writeFile(
      path.join(outPath, "data", buildId, "adrs.json"),
      JSON.stringify(adrs.map(toAdrLight)),
      "utf-8"
    )
  ];
  await Promise.all(promises);

  // Badge
  await fsP.writeFile(
    path.join(outPath, "badge.svg"),
    makeBadge({
      label: "ADRs",
      message: adrs.length.toString(),
      color: "#FF007B"
    })
  );

  appConsole.updateSpinner("Generating search index...");
  await fsP.writeFile(
    path.join(outPath, "data", buildId, "search-index.json"),
    JSON.stringify(Search.createFromAdrs(adrs).serializeIndex()),
    "utf-8"
  );

  appConsole.stopSpinner();
  appConsole.success(
    `Your Log4brains static site was successfully generated to ${chalk.cyan(
      outPath
    )} with a total of ${chalk.cyan(`${adrs.length} ADRs`)}`
  );
  appConsole.println();
  process.exit(0); // otherwise Next.js's spinner keeps running
}
