/**
 * ./utils/utils.js
 * 
 * cn()
 *
 * Utility function for merging conditional class names.
 *
 * Purpose:
 * - Combines multiple class name inputs using `clsx`, which handles
 *   conditional values, arrays, objects, and falsy values gracefully.
 * - Passes the merged result through `twMerge`, which resolves Tailwind CSS
 *   class conflicts (e.g., "p-2 p-4" → "p-4").
 *
 * Why this exists:
 * - `clsx` helps build class strings dynamically.
 * - `twMerge` ensures the final output is clean, predictable, and conflict‑free.
 *
 * Usage:
 *   cn("p-4", condition && "bg-red-500", "text-sm")
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  // Merge conditional class inputs (clsx) and resolve Tailwind conflicts (twMerge)
  return twMerge(clsx(inputs));
}