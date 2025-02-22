import { DataModel } from '~/convex/_generated/dataModel';

export type User = Omit<DataModel['users']['document'], 'avatar'> & {
	avatar?: string | null;
};
