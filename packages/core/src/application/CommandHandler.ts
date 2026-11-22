import type { ClassType } from "./ClassType";
import { Command } from "./Command";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CommandHandler<C extends Command = any> {
  readonly commandClass: ClassType<Command>;
  execute(command: C): Promise<void>;
}
