import { Stack } from 'expo-router';
import { HeaderBack } from '~/components/HeaderBack';

export default () => {
	return (
		<Stack
			screenOptions={{
				headerBackVisible: true,
				headerLeft: () => <HeaderBack />,
			}}
		>
			<Stack.Screen name="settings" />
		</Stack>
	);
};
