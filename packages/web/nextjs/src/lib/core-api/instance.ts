import path from "path";
import { Log4brains } from "@awarded/log4brains-core";

let instance: Log4brains;

export function getLog4brainsInstance(): Log4brains {
  if (!instance) {
    if (process.env.LOG4BRAINS_PHASE === "initial-build") {
      // Noop instance during the initial "next build" phase, which runs from the Next.js app's folder
      instance = Log4brains.createFromCwd(
        path.join(process.cwd(), "src/lib/core-api/noop")
      );
    } else {
      instance = Log4brains.createFromCwd(process.env.LOG4BRAINS_CWD || ".");
    }
  }
  return instance;
}
