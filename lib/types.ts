import { Doc } from '~/convex/_generated/dataModel';
import { GEAR_TYPE } from './constants';

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
