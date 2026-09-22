import { type ClassValue, clsx } from "clsx"

/** Join class names, dropping falsy values. No utility merging: components
 * put their rules in `@layer components`, so a later or unlayered class wins
 * by cascade order. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
