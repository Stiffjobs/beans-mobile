export const formatRecipeTime = (seconds: number): string => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const parseRecipeTime = (timeStr: string): number => {
	const [mins, secs] = timeStr.split(':').map(Number);
	return mins * 60 + secs;
};
