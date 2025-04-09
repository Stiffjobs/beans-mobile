import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { usePushNotifications } from '../hooks/usePushNotifications';

export function PushNotificationManager() {
	const { isSignedIn } = useUser();
	const { registerForPushNotifications } = usePushNotifications();

	useEffect(() => {
		if (isSignedIn) {
			registerForPushNotifications();
		}
	}, [isSignedIn, registerForPushNotifications]);

	return null;
}
