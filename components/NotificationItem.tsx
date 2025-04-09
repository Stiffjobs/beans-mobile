import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { Notification } from '@novu/js';
import { cn } from '~/lib/utils';
import { RelativePathString, router } from 'expo-router';
import { t } from '@lingui/core/macro';

type Redirect = {
	url: string;
	target?: '_self' | '_blank' | '_parent' | '_top' | '_unfencedTop';
};

type Action = {
	label: string;
	isCompleted: boolean;
	redirect?: Redirect;
};
const formatRelativeTime = (timestamp: string): string => {
	const date = new Date(timestamp);
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
	if (diffInSeconds < 604800)
		return `${Math.floor(diffInSeconds / 86400)}d ago`;

	return date.toLocaleDateString();
};

export const NotificationItem: React.FC<{ notification: Notification }> = ({
	notification,
}) => {
	const handleRedirect = (redirect?: Redirect) => {
		if (redirect?.url) {
			router.push(redirect.url as RelativePathString);
		}
	};

	const handlePress = async () => {
		if (!notification.isRead) {
			try {
				await notification.read();
				// Update local state or trigger a refresh here
			} catch (error) {
				console.error('Error marking notification as read:', error);
				Alert.alert('Error', 'Failed to mark notification as read');
			}
		}
		handleRedirect(notification.redirect);
	};

	const handleLongPress = () => {
		Alert.alert(
			'Notification Options',
			'Choose an action',
			[
				{
					text: notification.isRead ? t`Mark as Unread` : t`Mark as Read`,
					onPress: async () => {
						try {
							if (notification.isRead) {
								await notification.unread();
							} else {
								await notification.read();
							}
							// Update local state or trigger a refresh here
						} catch (error) {
							console.error('Error updating notification read status:', error);
							Alert.alert(t`Error`, t`Failed to update notification status`);
						}
					},
				},
				// {
				// 	text: 'Archive',
				// 	onPress: async () => {
				// 		try {
				// 			await notification.archive();
				// 			// Update local state or trigger a refresh here
				// 		} catch (error) {
				// 			console.error('Error archiving notification:', error);
				// 			Alert.alert('Error', 'Failed to archive notification');
				// 		}
				// 	},
				// },
				{ text: t`Cancel`, style: 'cancel' },
			],
			{ cancelable: true },
		);
	};

	return (
		<TouchableOpacity
			className={cn(
				'flex-row items-center p-4',
				notification.isRead ? 'bg-current' : 'bg-secondary',
			)}
			onPress={handlePress}
			onLongPress={handleLongPress}
		>
			{notification.avatar ? (
				<Image
					source={{ uri: notification.avatar }}
					className="w-12 h-12 rounded-full"
				/>
			) : (
				<Text>No Image</Text>
			)}
			<View className="ml-4 flex-1  gap-2">
				<Text className="text-lg text-primary font-semibold">
					{notification.body}
				</Text>
				<Text className="text-muted-foreground">
					{formatRelativeTime(notification.createdAt)}
				</Text>
			</View>
		</TouchableOpacity>
	);
};

// Define color constants
