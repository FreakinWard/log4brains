import { execa } from "execa";
import os from "os";
import path from "path";
import fs from "fs";
import chalk from "chalk";
import { expect } from "chai";

const fsP = fs.promises;

process.env.NODE_ENV = "test";

// Inspired by Next.js's test/integration/create-next-app/index.test.js. Thank you!
async function usingTempDir(fn) {
  const folder = await fsP.mkdtemp(path.join(os.tmpdir(), "log4brains-e2e-"));
  console.log(chalk.bold(`${chalk.green("WORKDIR")} ${folder}`));
  try {
    return await fn(folder);
  } finally {
    fs.rmSync(folder, { recursive: true, force: true });
  }
}

async function run(file, args, cwd) {
  console.log(chalk.bold(`${chalk.green("RUN")} ${file} ${args.join(" ")}`));
  const childProcess = execa(file, args, { cwd });
  childProcess.stdout.pipe(process.stdout);
  childProcess.stderr.pipe(process.stderr);
  return await childProcess;
}

(async () => {
  await usingTempDir(async (cwd) => {
    await run("log4brains", ["--version"], cwd);

    await run("log4brains", ["init", "--defaults"], cwd);

    await run("log4brains", ["adr", "new", "--quiet", '"E2E test ADR"'], cwd);

    const adrListRes = await run("log4brains", ["adr", "list", "--raw"], cwd);
    expect(adrListRes.stdout).to.contain(
      "use-log4brains-to-manage-the-adrs",
      "Log4brains ADR was not created by init"
    );
    expect(adrListRes.stdout).to.contain(
      "use-markdown-architectural-decision-records",
      "MADR ADR was not created by init"
    );
    expect(adrListRes.stdout).to.contain(
      "E2E test ADR",
      "E2E test ADR was not created"
    );

    await run("log4brains", ["build"], cwd);
    expect(fs.existsSync(path.join(cwd, ".log4brains", "out", "index.html"))).to
      .be.true;

    // TODO: preview tests (https://github.com/thomvaill/log4brains/issues/2)

    console.log(chalk.bold.green("END"));
  });
})().catch((e) => {
  console.error("");
  console.error(`${chalk.red.bold("== FATAL ERROR ==")}`);
  console.error(e);
  process.exit(1);
});
