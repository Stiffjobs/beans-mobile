export function getDataUriSize(uri: string): number {
	return Math.round((uri.length * 3) / 4);
}
