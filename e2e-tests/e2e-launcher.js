import { execa } from "execa";
import os from "os";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import chalk from "chalk";
import { expect } from "chai";

const fsP = fs.promises;
const FIXTURES_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures"
);

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

// Regression coverage for `log4brains build` on a multi-package project with
// superseded ADRs (FreakinWard/log4brains#13, upstream thomvaill/log4brains#107).
// Runs the real CLI against a self-contained multi-package fixture and asserts
// the generated output by meaning: a same-package supersession resolves to the
// package-qualified superseder URL, and a dangling superseder reference still
// builds its page instead of crashing. It never snapshots and never reads
// Git-derived metadata, so (squash-)committing the fixture cannot flake it.
async function testMultipackageSupersederBuild(cwd) {
  // arrange
  const outDir = path.join(cwd, ".log4brains", "out");
  const supersededPage = path.join(
    outDir,
    "adr",
    "mypackage",
    "20201028-superseded-in-package",
    "index.html"
  );
  const missingSupersederPage = path.join(
    outDir,
    "adr",
    "mypackage",
    "20201101-superseded-missing",
    "index.html"
  );
  fs.cpSync(path.join(FIXTURES_DIR, "multipackage-superseder"), cwd, {
    recursive: true
  });

  // act
  const buildRes = await run("log4brains", ["build"], cwd);

  // assert
  expect(buildRes.exitCode).to.equal(0, "log4brains build must exit 0");
  expect(fs.readFileSync(supersededPage, "utf8")).to.contain(
    "/adr/mypackage/20201029-superseder-in-package/",
    "a same-package superseder must resolve to its package-qualified URL"
  );
  expect(fs.existsSync(missingSupersederPage)).to.equal(
    true,
    "an ADR with a missing superseder must still be built"
  );
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
  });

  await usingTempDir(testMultipackageSupersederBuild);

  console.log(chalk.bold.green("END"));
})().catch((e) => {
  console.error("");
  console.error(`${chalk.red.bold("== FATAL ERROR ==")}`);
  console.error(e);
  process.exit(1);
});
