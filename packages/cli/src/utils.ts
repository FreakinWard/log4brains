import { execa } from "execa";

export async function previewAdr(slug: string): Promise<void> {
  const subprocess = execa("log4brains", ["preview", slug], {
    stdio: "inherit"
  });
  await subprocess;
}
