// Simple className combiner similar to shadcn's cn (JavaScript version)
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
