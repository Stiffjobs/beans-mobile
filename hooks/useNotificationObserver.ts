import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { RelativePathString, router } from 'expo-router';

export function useNotificationObserver() {
	useEffect(() => {
		let isMounted = true;
		async function redirect(notification: Notifications.Notification) {
			const url = notification.request.content.data?.redirectTo as
				| string
				| undefined;
			if (url) {
				router.push(url as RelativePathString);
			}
		}

		Notifications.getLastNotificationResponseAsync().then((res) => {
			if (!isMounted || !res?.notification) {
				return;
			}
			redirect(res?.notification);
		});

		const subscribtion = Notifications.addNotificationResponseReceivedListener(
			(res) => {
				redirect(res.notification);
			},
		);

		return () => {
			isMounted = false;
			subscribtion.remove();
		};
	}, []);
}
