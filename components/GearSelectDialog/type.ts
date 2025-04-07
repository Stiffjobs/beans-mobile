import * as Dialog from '~/components/Dialog';
import { Id } from '~/convex/_generated/dataModel';
import { GEAR_TYPE } from '~/lib/constants';
export type GearSelectDialogProps = {
	control: Dialog.DialogControlProps;
	params: {
		type: 'gear-select';
		selected?: Id<'gears'>;
		onSelect?: (gear: Id<'gears'>) => void;
		gearType?: GEAR_TYPE;
	};
};
