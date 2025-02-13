import { ComposerImage } from '~/state/gallery';

// Define action types
export type ComposerAction =
	| { type: 'ADD_IMAGES'; images: ComposerImage[] }
	| { type: 'REMOVE_IMAGE'; imageId: string }
	| { type: 'CLEAR_IMAGES' };

type ImagesMedia = {
	type: 'images';
	images: ComposerImage[];
};

export type EmbedDraft = {
	media: ImagesMedia;
};

export type PostDraft = {
	embed: EmbedDraft;
};

// Initial state
export const initialPostDraft: PostDraft = {
	embed: {
		media: {
			type: 'images',
			images: [],
		},
	},
};

export type ComposerState = {
	post: PostDraft;
};

// Reducer function
export function composerReducer(
	state: PostDraft,
	action: ComposerAction
): PostDraft {
	switch (action.type) {
		case 'ADD_IMAGES':
			return {
				...state,
				embed: {
					...state.embed,
					media: {
						type: 'images',
						images: state.embed.media
							? [...state.embed.media.images, ...action.images]
							: action.images,
					},
				},
			};

		case 'REMOVE_IMAGE':
			if (!state.embed.media) return state;
			return {
				...state,
				embed: {
					...state.embed,
					media: {
						type: 'images',
						images: state.embed.media.images.filter(
							img => img.id !== action.imageId
						),
					},
				},
			};

		case 'CLEAR_IMAGES':
			return {
				...state,
				embed: {
					...state.embed,
					media: {
						type: 'images',
						images: [],
					},
				},
			};

		default:
			return state;
	}
}
