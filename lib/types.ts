import { Doc } from '~/convex/_generated/dataModel';
import { GEAR_TYPE } from './constants';

export interface GearData {
	_id: string;
	name: string;
	type: string | GEAR_TYPE;
	details?: string;
	settings?: string;
}

export interface BrewingData {
	_creationTime: number;
	_id: string;
	author: string;
	createdDate: string;
	bean: string;
	roastLevel: string;
	coffeeIn: string;
	ratio: string;
	beverageWeight: string;
	brewTemperature: string;
	filterPaper: string;
	grinder: string;
	grindSetting: string;
	bloomTime: string;
	totalDrawdownTime?: string;
	brewingWater?: string;
	recipeSteps?: {
		timestamp: string;
		action: string;
		value: number;
	}[];
	methodName?: string;
	brewer?: string;
	otherTools?: string;
	flavor?: string;
	tds?: number;
	ey?: number;
	beanProfile?: BeanProfileProps | null;
	brewerDetails?: BrewerDetails | null;
	grinderDetails?: GrinderDetails | null;
	filterPaperDetails?: FilterPaperDetails | null;
}

export type BrewerDetails = Doc<'gears'>;
export type GrinderDetails = Doc<'gears'>;
export type FilterPaperDetails = Doc<'gears'>;

export type BeanProfileProps = Doc<'bean_profiles'>;
