import * as Dialog from '~/components/Dialog';

export type CommentsDialogProps = {
	control: Dialog.DialogControlProps;
	params: {
		type: 'comments';
		postId: string; // The ID of the post for which comments are being managed
	};
};
