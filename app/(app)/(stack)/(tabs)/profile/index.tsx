import { View } from 'react-native';
import ProfileInfo from '~/components/ProfileInfo';
import { Authenticated, Unauthenticated } from 'convex/react';
import { Link, Stack } from 'expo-router';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import React from 'react';
import { Hamburger } from '~/view/com/util/Hamburger';
import { ProfileTabViews } from '~/components/ProfileTabViews';
import NewLayout from '~/components/NewLayout';
export default function ProfileScreen() {
	return (
		<View className="flex-1">
			<Authenticated>
				<Stack.Screen
					options={{
						headerLeft: () => <Hamburger />,
					}}
				/>
				<ProfileInfo />
				<ProfileTabViews />
				{/* <NewLayout /> */}
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
