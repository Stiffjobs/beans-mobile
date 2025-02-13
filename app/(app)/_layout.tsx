import { router, Slot, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useSession } from '~/state/session';
export default () => {
	const segments = useSegments();
	// useEffect(() => {
	// 	if (isLoading) return;
	// 	const inAuth = segments[1] === '(auth)';
	// 	if (!session && !inAuth) {
	// 		router.replace('/signin');
	// 	} else if (session && inAuth) {
	// 		router.replace('/(app)/(stack)/(tabs)');
	// 	}
	// 	console.log('segments', segments);
	// }, [session, isLoading]);
	return <Slot />;
};
