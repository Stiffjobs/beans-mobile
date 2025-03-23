import * as Dialog from '~/components/Dialog';
import { Id } from '~/convex/_generated/dataModel';

export type BeanProfileListDialogProps = {
	control: Dialog.DialogControlProps;
	params: {
		type: 'bean-profile-list';
		onSelect?: (beanProfile: Id<'bean_profiles'>) => void;
	};
};
