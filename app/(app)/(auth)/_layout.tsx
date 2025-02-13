import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default () => {
	const { isLoaded, isSignedIn } = useAuth();

	if (isSignedIn) {
		return <Redirect href={'/'} />;
	}

	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		/>
	);
};
