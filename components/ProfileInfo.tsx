import React from 'react';
import { Linking, Pressable, View } from 'react-native';

import { Button } from './ui/button';
import { useGetCurrentUser, useSignOut } from '~/state/queries/auth';
import { Text } from './ui/text';
import { useModalControls } from '~/state/modals';
import { UserAvatar } from '~/view/com/util/UserAvatar';
import { t } from '@lingui/core/macro';
import { Link2 } from '~/lib/icons';
import { Muted } from './ui/typography';

export default function ProfileInfo() {
	const currentUser = useGetCurrentUser();
	const { openModal } = useModalControls();
	const signOutMutation = useSignOut();

	const handleSignOut = async () => {
		await signOutMutation.mutateAsync();
	};

	const openEditProfileModal = () => {
		openModal({
			name: 'edit-profile',
			user: currentUser.data!,
		});
	};
	const followersCount = currentUser.data?.followersCount ?? 0;
	const followingCount = currentUser.data?.followingCount ?? 0;

	return (
		<View className="gap-4 w-full px-4">
			<View className="items-start justify-between flex flex-row ">
				<View>
					<Text className="text-2xl font-bold text-foreground">
						{currentUser.data?.name}
					</Text>
					{currentUser.data?.website && (
						<Pressable
							className="flex items-center gap-1 flex-row"
							onPress={() => {
								if (currentUser.data?.website) {
									Linking.openURL(currentUser.data.website);
								}
							}}
						>
							<Link2 strokeWidth={3} className="size-4 text-muted-foreground" />
							<Text className="font-extrabold text-coffee">
								{currentUser.data?.website}
							</Text>
						</Pressable>
					)}
					<View className="flex items-center gap-4 flex-row my-4">
						{followersCount > 0 && (
							<View className="flex items-center gap-1 flex-row">
								<Text className="text-sm font-extrabold">{followersCount}</Text>
								<Muted className="text-sm font-extrabold">Followers</Muted>
							</View>
						)}
						{followingCount > 0 && (
							<View className="flex items-center gap-1 flex-row">
								<Text className="text-sm font-extrabold">{followingCount}</Text>
								<Muted className="text-sm font-extrabold">Following</Muted>
							</View>
						)}
					</View>
					<Text className="text-secondary-foreground font-semibold">
						{currentUser.data?.bio}
					</Text>
				</View>
				<UserAvatar avatar={currentUser.data?.avatar} />
			</View>
			<Button onPress={openEditProfileModal} size="sm" variant={'secondary'}>
				<Text>{t`Edit Profile`}</Text>
			</Button>
		</View>
	);
}
