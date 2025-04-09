import { Slot, useSegments } from 'expo-router';
import { useNotificationObserver } from '~/hooks/useNotificationObserver';
export default () => {
	const segments = useSegments();
	useNotificationObserver();
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
