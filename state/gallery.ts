import { nanoid } from 'nanoid/non-secure';
export type ImageMeta = {
	path: string;
	width: number;
	height: number;
	mime: string;
	size: number;
};
export type ComposerImage = ImageMeta & {
	id: string;
};

export async function createComposerImage(
	raw: ImageMeta
): Promise<ComposerImage> {
	return {
		id: nanoid(),
		...raw,
	};
}
