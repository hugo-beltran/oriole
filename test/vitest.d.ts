import "vitest"

interface AxeMatchers<R = unknown> {
  toHaveNoViolations(): R
}

declare module "vitest" {
  interface Matchers<T = unknown> extends AxeMatchers<T> {}
}
