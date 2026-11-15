/**
 * Any class (constructor) whose instances are of type T.
 * Used to register command/query handlers by their command/query class.
 */
export type ClassType<T = unknown> = abstract new (...args: never[]) => T;
