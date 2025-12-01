import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges and optimizes Tailwind CSS class names.
 * 
 * @param inputs - An array of class values.
 * @requires inputs is an array of valid class values.
 * @effects Merges class names using clsx (for conditionals) and tailwind-merge 
 *          (to resolve conflicting Tailwind classes). 
 *          Returns the final optimized class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
