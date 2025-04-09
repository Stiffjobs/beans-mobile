export enum RoastLevelEnum {
	ExtraLight = 'Extra Light',
	Light = 'Light',
	MediumLight = 'Medium Light',
	Medium = 'Medium',
	MediumDark = 'Medium Dark',
	Dark = 'Dark',
}

export interface RoastLevel {
	label: string;
	value: RoastLevelEnum;
}
export const POST_IMG_MAX = {
	width: 2000,
	height: 2000,
	size: 1000000,
};

export enum GEAR_TYPE {
	Grinder = 'grinder',
	Brewer = 'brewer',
	'Filter paper' = 'filter paper',
}

export const NOTIFICATION_TRIGGER_TABLE = {
	POST_COMMENTS: 'post_comments',
	POSTS: 'posts',
};
