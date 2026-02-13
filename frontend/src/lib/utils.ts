import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
