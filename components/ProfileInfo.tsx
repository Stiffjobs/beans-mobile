import React from 'react';
import { View } from 'react-native';

import { Button } from './ui/button';
import { useGetCurrentUser, useSignOut } from '~/state/queries/auth';
import { Text } from './ui/text';
import { useModalControls } from '~/state/modals';
import { UserAvatar } from '~/view/com/util/UserAvatar';
import { ReportDialog, useReportDialogControl } from './ReportDialog';
export default function EditScreenInfo() {
	const currentUser = useGetCurrentUser();
	const { openModal } = useModalControls();
	const signOutMutation = useSignOut();
	const reportDialogControl = useReportDialogControl();

	const handleSignOut = async () => {
		await signOutMutation.mutateAsync();
	};

	const openEditProfileModal = () => {
		openModal({
			name: 'edit-profile',
			user: currentUser.data!,
		});
	};
	const openReportDialog = () => {
		reportDialogControl.open();
	};
	return (
		<View className="gap-4 items-center">
			<View className="items-center gap-4">
				<UserAvatar avatar={currentUser.data?.avatar} />
				<Button onPress={openEditProfileModal} size="sm" variant={'secondary'}>
					<Text>Edit Profile</Text>
				</Button>
			</View>
			<Button variant={'destructive'} onPress={handleSignOut}>
				<Text className="font-bold">Sign Out</Text>
			</Button>
			<ReportDialog control={reportDialogControl} params={{ type: 'post' }} />
		</View>
	);
}
