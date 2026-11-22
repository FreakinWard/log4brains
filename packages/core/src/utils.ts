const deepFreezeRecur = (obj: unknown): void => {
  if (typeof obj !== "object" || obj === null) {
    return;
  }
  Object.values(obj).forEach((value: unknown) => {
    if (
      typeof value === "object" &&
      value !== null &&
      !Object.isFrozen(value)
    ) {
      deepFreezeRecur(value);
    }
  });
  Object.freeze(obj);
};

/**
 * Apply Object.freeze() recursively on the given object and sub-objects.
 */
export const deepFreeze = <T>(obj: T): T => {
  deepFreezeRecur(obj);
  return obj;
};
