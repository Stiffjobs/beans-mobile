import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useGetCurrentUser, useSignOut } from '~/state/queries/auth';
import { Text } from './ui/text';

export default function EditScreenInfo({ path }: { path: string }) {
	const currentUser = useGetCurrentUser();
	const signOutMutation = useSignOut();

	const handleSignOut = async () => {
		await signOutMutation.mutateAsync();
	};
	return (
		<View className="gap-4 items-center">
			<Avatar className="w-12 h-12" alt="Avatar">
				<AvatarImage className="w-12 h-12" src="" />
				<AvatarFallback>
					<Text className="text-lg font-semibold">
						{currentUser?.data?.name.slice(0, 2)}
					</Text>
				</AvatarFallback>
			</Avatar>
			<Button variant={'destructive'} onPress={handleSignOut}>
				<Text className="font-bold">Sign Out</Text>
			</Button>
		</View>
	);
}

const styles = StyleSheet.create({
	getStartedContainer: {
		alignItems: 'center',
		marginHorizontal: 50,
	},
	homeScreenFilename: {
		marginVertical: 7,
	},
	codeHighlightContainer: {
		borderRadius: 3,
		paddingHorizontal: 4,
	},
	getStartedText: {
		fontSize: 17,
		lineHeight: 24,
		textAlign: 'center',
	},
	helpContainer: {
		marginTop: 15,
		marginHorizontal: 20,
		alignItems: 'center',
	},
	helpLink: {
		paddingVertical: 15,
	},
	helpLinkText: {
		textAlign: 'center',
	},
});
