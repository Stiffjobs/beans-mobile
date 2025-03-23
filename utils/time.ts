/**
 * Calculates how long ago a timestamp occurred in a human-readable format.
 * @param postTimestamp - The timestamp of the post (string, number, or Date object)
 * @returns A string like "5 minutes ago" or "2 days ago"
 */
export function timeAgo(postTimestamp: string | number | Date): string {
	// Convert the input timestamp to a Date object
	const postTime = new Date(postTimestamp);
	const now = new Date(); // Current time

	// Calculate the difference in milliseconds
	const diffMs = now.getTime() - postTime.getTime();

	// Convert to seconds
	const diffSeconds = Math.floor(diffMs / 1000);

	if (diffSeconds < 60) {
		return `${diffSeconds} second${diffSeconds === 1 ? '' : 's'} ago`;
	} else if (diffSeconds < 3600) {
		// Less than an hour
		const minutes = Math.floor(diffSeconds / 60);
		return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
	} else if (diffSeconds < 86400) {
		// Less than a day
		const hours = Math.floor(diffSeconds / 3600);
		return `${hours} hour${hours === 1 ? '' : 's'} ago`;
	} else if (diffSeconds < 604800) {
		// Less than a week
		const days = Math.floor(diffSeconds / 86400);
		return `${days} day${days === 1 ? '' : 's'} ago`;
	} else if (diffSeconds < 2592000) {
		// Less than a month (approx 30 days)
		const weeks = Math.floor(diffSeconds / 604800);
		return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
	} else {
		// Months or more
		const months = Math.floor(diffSeconds / 2592000);
		return `${months} month${months === 1 ? '' : 's'} ago`;
	}
}

// Example usage:
console.log(timeAgo('2025-03-17T14:30:00Z')); // Assuming current time is March 18, 2025, ~10:00 UTC
console.log(timeAgo(new Date(Date.now() - 300000))); // 5 minutes ago
console.log(timeAgo(1710775800000)); // Unix timestamp in milliseconds
