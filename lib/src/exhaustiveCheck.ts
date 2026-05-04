export const exhaustiveCheck = (_variable: never, errorMessage?: string): never => {
  throw new Error(errorMessage ?? "Exhaustive check failed: unreachable branch");
};
