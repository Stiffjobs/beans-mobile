import * as Dialog from '~/components/Dialog';

export type DetailsDialogProps = {
	control: Dialog.DialogControlProps;
	params: {
		type: 'post-details';
		isOwner: boolean;
		openModal: () => void;
	};
};
