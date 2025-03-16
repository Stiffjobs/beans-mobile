export const NAV_THEME = {
	light: {
		background: 'hsl(0 0% 100%)', // background
		border: 'hsl(240 5.9% 90%)', // border
		card: 'hsl(0 0% 100%)', // card
		notification: 'hsl(0 84.2% 60.2%)', // destructive
		primary: 'hsl(240 5.9% 10%)', // primary
		text: 'hsl(240 10% 3.9%)', // foreground
	},
	dark: {
		background: 'hsl(240 10% 3.9%)', // background
		border: 'hsl(240 3.7% 15.9%)', // border
		card: 'hsl(240 10% 3.9%)', // card
		notification: 'hsl(0 72% 51%)', // destructive
		primary: 'hsl(0 0% 98%)', // primary
		text: 'hsl(0 0% 98%)', // foreground
	},
};

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
