import { View } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Authenticated, Unauthenticated } from 'convex/react';
import { Link } from 'expo-router';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

export default function TabTwoScreen() {
	return (
		<View className="flex-1 items-center justify-center">
			<Authenticated>
				<EditScreenInfo path="app/(tabs)/two.tsx" />
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
