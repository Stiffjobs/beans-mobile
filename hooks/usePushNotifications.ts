import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { Alert } from 'react-native';
import { tryCatch } from '~/utils/trycatch';
import { t } from '@lingui/core/macro';

export function usePushNotifications() {
	const registerDeviceToken = useMutation(
		api.device_tokens.registerDeviceToken
	);

	const handleRegistrationError = useCallback((message: string) => {
		console.error(t`Push Notification Error:`, message);
		Alert.alert(t`Push Notification Error`, message);
	}, []);

	const registerForPushNotificationsAsync = useCallback(async () => {
		if (Platform.OS === 'android') {
			await Notifications.setNotificationChannelAsync('default', {
				name: 'default',
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: '#FF231F7C',
			});
		}

		if (!Device.isDevice) {
			// handleRegistrationError(
			// 	t`Must use physical device for push notifications`,
			// );
			return;
		}

		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== 'granted') {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}
		if (finalStatus !== 'granted') {
			handleRegistrationError(t`Permission not granted for push notifications`);
			return;
		}

		const projectId =
			Constants?.expoConfig?.extra?.eas?.projectId ??
			Constants?.easConfig?.projectId;
		if (!projectId) {
			handleRegistrationError(t`Project ID not found`);
			return;
		}

		const promise = async () => {
			const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
				.data;

			// Register token with Convex
			await registerDeviceToken({
				token,
				platform: Platform.OS === 'ios' ? 'ios' : 'android',
			});

			return token;
		};
		const { error } = await tryCatch(promise());

		if (error) {
			handleRegistrationError(t`Failed to get push token: ${error}`);
		}
	}, [handleRegistrationError, registerDeviceToken]);

	return {
		registerForPushNotifications: registerForPushNotificationsAsync,
	};
}
