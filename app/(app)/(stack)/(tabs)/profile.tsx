import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import ProfileInfo from '~/components/ProfileInfo';
import { Authenticated, Unauthenticated } from 'convex/react';
import { Link, Stack } from 'expo-router';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import React, { useState } from 'react';
import { Hamburger } from '~/view/com/util/Hamburger';
import { Image } from 'expo-image';
import { usePhotoLibraryPermission } from '~/lib/hooks/usePermissions';
import { openCropper, openPicker } from '~/lib/media/picker';
export default function ProfileScreen() {
	return (
		<View className="flex-1 items-center justify-center">
			<Authenticated>
				<Stack.Screen
					options={{
						headerLeft: () => <Hamburger />,
					}}
				/>
				<ProfileInfo path="app/(tabs)/two.tsx" />
			</Authenticated>
			<Unauthenticated>
				<Link asChild href={'/signin'}>
					<Button>
						<Text>Sign In</Text>
					</Button>
				</Link>
			</Unauthenticated>
		</View>
	);
}
