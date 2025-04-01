import { Stack } from 'expo-router';
import { HeaderBack } from '~/components/HeaderBack';
import { t } from '@lingui/core/macro';

export default () => {
	return (
		<Stack
			screenOptions={{
				headerBackVisible: true,
				headerLeft: () => <HeaderBack />,
			}}
		>
			<Stack.Screen
				name="[id]"
				options={{
					headerTitle: t`Post`,
				}}
			/>
		</Stack>
	);
};
