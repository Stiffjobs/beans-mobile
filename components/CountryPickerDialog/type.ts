import * as Dialog from '~/components/Dialog';
import { Country } from '~/lib/types';

export type CountryPickerDialogProps = {
	control: Dialog.DialogControlProps;
	params: {
		type: 'country-picker';
		onSelect?: (country: Country) => void;
	};
};
