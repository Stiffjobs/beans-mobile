import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	Image,
	TouchableOpacity,
	Linking,
	Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '@novu/js';
import { cn } from '~/lib/utils';
import { RelativePathString, router } from 'expo-router';

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
		console.log('notification', notification.redirect);
		handleRedirect(notification.redirect);
	};

	const handleLongPress = () => {
		Alert.alert(
			'Notification Options',
			'Choose an action',
			[
				{
					text: notification.isRead ? 'Mark as Unread' : 'Mark as Read',
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
							Alert.alert('Error', 'Failed to update notification status');
						}
					},
				},
				{
					text: 'Archive',
					onPress: async () => {
						try {
							await notification.archive();
							// Update local state or trigger a refresh here
						} catch (error) {
							console.error('Error archiving notification:', error);
							Alert.alert('Error', 'Failed to archive notification');
						}
					},
				},
				{ text: 'Cancel', style: 'cancel' },
			],
			{ cancelable: true }
		);
	};

	const renderAction = (action: Action, isPrimary: boolean) => {
		const isDisabled = action.isCompleted;
		return (
			<TouchableOpacity
				style={[
					styles.actionButton,
					isPrimary ? styles.primaryAction : styles.secondaryAction,
					action.isCompleted && styles.completedAction,
				]}
				onPress={() => handleRedirect(action.redirect)}
				disabled={isDisabled}
			>
				<Text
					style={[
						styles.actionText,
						isPrimary ? styles.primaryActionText : styles.secondaryActionText,
						action.isCompleted && styles.completedActionText,
					]}
					numberOfLines={1}
					ellipsizeMode="tail"
				>
					{action.label}
				</Text>
				{action.isCompleted && (
					<Ionicons
						name="checkmark-circle"
						size={18}
						color={COLORS.button.text.primary}
						style={styles.actionIcon}
					/>
				)}
			</TouchableOpacity>
		);
	};

	return (
		<TouchableOpacity
			style={[
				notification.isRead ? styles.readContainer : styles.unreadContainer,
			]}
			className={cn('flex-row items-center rounded-lg p-4')}
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
				<Text className="text-lg font-semibold">{notification.body}</Text>
				<Text className="text-muted-foreground">
					{formatRelativeTime(notification.createdAt)}
				</Text>
				<View>
					{notification.primaryAction &&
						renderAction(notification.primaryAction, true)}
					{notification.secondaryAction &&
						renderAction(notification.secondaryAction, false)}
				</View>
			</View>
		</TouchableOpacity>
	);
};

// Define color constants
const COLORS = {
	primary: '#2196F3',
	secondary: '#757575',
	background: '#FFFFFF',
	unreadBackground: '#F0F8FF',
	border: '#E0E0E0',
	text: {
		primary: '#000000',
		secondary: '#757575',
	},
	archived: {
		background: '#FFC107',
		text: '#FFFFFF',
	},
	button: {
		primary: '#2196F3',
		secondary: '#FFFFFF',
		text: {
			primary: '#FFFFFF',
			secondary: '#2196F3',
		},
		disabled: '#E0E0E0',
		completed: '#4CAF50',
	},
};

// Define spacing constants
const SPACING = {
	xs: 4,
	sm: 8,
	md: 12,
	lg: 16,
};

// Define font size constants
const FONT_SIZES = {
	xs: 10,
	sm: 12,
	md: 14,
	lg: 16,
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		padding: SPACING.lg,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
		alignItems: 'center', // Center items vertically
	},
	readContainer: {
		backgroundColor: COLORS.background,
	},
	unreadContainer: {
		backgroundColor: COLORS.unreadBackground,
	},
	archivedContainer: {
		opacity: 0.7,
	},
	contentContainer: {
		flex: 1,
	},
	subject: {
		fontSize: FONT_SIZES.lg,
		fontWeight: 'bold',
		marginBottom: SPACING.xs,
		color: COLORS.text.primary,
	},
	body: {
		fontSize: FONT_SIZES.md,
		marginBottom: SPACING.sm,
		color: COLORS.text.primary,
	},
	timestamp: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.text.secondary,
		marginBottom: SPACING.sm,
	},
	tagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: SPACING.sm,
	},
	actionsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between', // Changed from 'flex-start' to 'space-between'
		marginTop: SPACING.sm, // Add some top margin
	},
	actionButton: {
		flex: 1, // Make buttons expand to fill available space
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: SPACING.sm,
		paddingHorizontal: SPACING.md,
		borderRadius: 8,
		height: 40,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		marginHorizontal: SPACING.xs, // Add horizontal margin
	},
	primaryAction: {
		backgroundColor: COLORS.button.primary,
	},
	secondaryAction: {
		backgroundColor: COLORS.button.secondary,
		borderWidth: 1,
		borderColor: COLORS.button.primary,
	},
	completedAction: {
		backgroundColor: COLORS.button.completed,
	},
	actionText: {
		fontSize: FONT_SIZES.md,
		fontWeight: '500',
		textAlign: 'center',
		letterSpacing: 0.25,
	},
	primaryActionText: {
		color: COLORS.button.text.primary,
	},
	secondaryActionText: {
		color: COLORS.button.text.secondary,
	},
	completedActionText: {
		color: COLORS.button.text.primary,
	},
	actionIcon: {
		marginLeft: SPACING.sm,
	},
	archivedBadge: {
		position: 'absolute',
		top: 0,
		right: 0,
		backgroundColor: COLORS.archived.background,
		paddingVertical: SPACING.xs,
		paddingHorizontal: SPACING.sm,
		borderRadius: 4,
	},
	archivedText: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.archived.text,
	},
});
