import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, fromUnixTime } from 'date-fns';
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

import { makeUseQueryWithStatus } from 'convex-helpers/react';
import { useQueries } from 'convex/react';
// Do this once somewhere, name it whatever you want.
export const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

export function formatDate(timestamp: number) {
	return format(fromUnixTime(timestamp / 1000), 'yyyy-MM-dd');
}

export function formatDateToString(date: Date) {
	return format(date, 'yyyy-MM-dd');
}

export const ratioMaskRegex = [/\d/, /\d/, '.', /\d/, /\d/];
export const timeMaskRegex = [/\d/, /\d/, ':', /\d/, /\d/];
export const timeMaskInputClassName = cn(
	'web:flex h-10 native:h-12 web:w-full rounded-md border border-input bg-background px-3 web:py-2 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
);
export function getFlagEmoji(flagIdentifier: string): string {
	// Extract the country code (e.g., "al") and convert to uppercase ("AL")
	const code = flagIdentifier.split('-')[1]?.toUpperCase();

	// Ensure we have a valid 2-letter code
	if (!code || code.length !== 2) {
		return '🏳️'; // Return a default/fallback flag (e.g., white flag) for invalid codes
	}

	// Calculate Unicode code points for regional indicator symbols
	const OFFSET = 0x1f1e6 - 'A'.charCodeAt(0);
	const codePoints = code.split('').map((char) => OFFSET + char.charCodeAt(0));

	// Combine code points into the emoji string
	return String.fromCodePoint(...codePoints);
}
