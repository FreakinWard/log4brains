/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ClassType } from "./ClassType";
import { Query } from "./Query";

export interface QueryHandler<Q extends Query = any, QR = any> {
  readonly queryClass: ClassType<Query>;
  execute(query: Q): Promise<QR>;
}
