import { Doc } from '~/convex/_generated/dataModel';
import { GEAR_TYPE } from './constants';

export interface CountryDetails {
	currency: string[];
	callingCode: string[];
	region: string;
	subregion: string;
	flag: string;
	name: { common: string; [lang: string]: string }; // Adjust based on actual name structure
	// Add other properties from your JSON file here
}

// Define the structure for the array elements we want
export interface Country {
	code: string; // We'll add the key as the code
	details: CountryDetails;
}
export interface GearData {
	_id: string;
	name: string;
	type: string | GEAR_TYPE;
	details?: string;
	settings?: string;
}

export type BrewerDetails = Doc<'gears'>;
export type GrinderDetails = Doc<'gears'>;
export type FilterPaperDetails = Doc<'gears'>;

export type BeanProfileProps = Doc<'bean_profiles'>;
