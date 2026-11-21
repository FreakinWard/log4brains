// Installs the git hooks. Skipped when husky is absent (e.g. `npm install --omit=dev`).
try {
  const { default: husky } = await import("husky");
  const message = husky();
  if (message) console.log(message);
} catch (e) {
  if (e.code !== "ERR_MODULE_NOT_FOUND") throw e;
}
