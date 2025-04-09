import React, { memo, useCallback, useEffect } from 'react';
import { useGetAvatarUrl, useGetCurrentUser } from '~/state/queries/auth';
import { Pressable, View } from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { usePhotoLibraryPermission } from '~/lib/hooks/usePermissions';
import { openCropper, openPicker } from '~/lib/media/picker';
import { Image as CroppedImage } from 'react-native-image-crop-picker';
import { StyledIcon } from '../icons/StyledIcons';
import { CircleNativeWind, PathNativeWind, SvgNativeWind } from './images/svg';
import { cn } from '~/lib/utils';

interface BaseUserAvatarProps {
	shape?: 'circle' | 'square';
	avatar?: string | null;
	size?: 'sm' | 'md' | 'lg';
}

const getSize = (size: 'sm' | 'md' | 'lg') => {
	switch (size) {
		case 'sm':
			return 'w-8 h-8';
		case 'md':
			return 'w-20 h-20';
		case 'lg':
			return 'w-30 h-30';
	}
};

let UserAvatar = ({
	avatar,
	size = 'md',
}: BaseUserAvatarProps): React.ReactNode => {
	let sizeClass = getSize(size);
	return (
		<Avatar className={cn('overflow-visible', sizeClass)} alt="Avatar">
			{avatar && (
				<AvatarImage
					className={cn('rounded-full', sizeClass)}
					source={{ uri: avatar }}
				/>
			)}
			<AvatarFallback>
				<DefaultAvatar size={size} />
			</AvatarFallback>
		</Avatar>
	);
};

UserAvatar = memo(UserAvatar);

export { UserAvatar };

let DefaultAvatar = ({
	size = 'md',
}: {
	size?: 'sm' | 'md' | 'lg';
}): React.ReactNode => {
	const sizeClass = getSize(size);
	return (
		<SvgNativeWind
			testID="userAvatarFallback"
			className={sizeClass}
			viewBox="0 0 24 24"
			fill="none"
			stroke="none"
		>
			<CircleNativeWind cx="12" cy="12" r="12" className="fill-gray-500" />
			<CircleNativeWind cx="12" cy="9.5" r="3.5" fill="#fff" />
			<PathNativeWind
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="#fff"
				d="M 12.058 22.784 C 9.422 22.784 7.007 21.836 5.137 20.262 C 5.667 17.988 8.534 16.25 11.99 16.25 C 15.494 16.25 18.391 18.036 18.864 20.357 C 17.01 21.874 14.64 22.784 12.058 22.784 Z"
			/>
		</SvgNativeWind>
	);
};

DefaultAvatar = memo(DefaultAvatar);

export { DefaultAvatar };

interface EditableUserAvatarProps extends BaseUserAvatarProps {
	onSelectNewAvatar: (avatar: CroppedImage | null) => Promise<void>;
}

let EditableUserAvatar = ({
	onSelectNewAvatar,
	avatar,
}: EditableUserAvatarProps): React.ReactNode => {
	const currentUser = useGetCurrentUser();
	const { showActionSheetWithOptions } = useActionSheet();
	const { requestPhotoAccessIfNeeded } = usePhotoLibraryPermission();

	const onOpenLibrary = useCallback(async () => {
		if (!(await requestPhotoAccessIfNeeded())) return;
		const items = await openPicker({
			aspect: [1, 1],
		});
		const item = items[0];
		if (!item) return;

		try {
			const croppedImage = await openCropper({
				mediaType: 'photo',
				cropperCircleOverlay: true,
				height: 1000,
				width: 1000,
				path: item.path,
				cropping: true,
			});

			await onSelectNewAvatar(croppedImage);
		} catch (error) {
			if (!String(error).toLowerCase().includes('cancel')) {
				console.error('Failed to crop banner', { error: error });
			}
		}
	}, [requestPhotoAccessIfNeeded, onSelectNewAvatar]);

	const onRemoveAvatar = useCallback(() => {
		onSelectNewAvatar(null);
	}, [onSelectNewAvatar]);

	const onPress = useCallback(async () => {
		if (!currentUser.data?.avatar) {
			await onOpenLibrary();
			return;
		}
		let options;
		let destructiveButtonIndex: undefined | number;
		let selectFromLibraryButtonIndex: undefined | number;
		let cancelButtonIndex: undefined | number;
		options = ['Delete', 'Select from library', 'Cancel'];
		destructiveButtonIndex = 0;
		selectFromLibraryButtonIndex = 1;
		cancelButtonIndex = 2;
		showActionSheetWithOptions(
			{
				options,
				cancelButtonIndex,
				destructiveButtonIndex,
			},
			async (selectedIndex?: number) => {
				switch (selectedIndex) {
					case destructiveButtonIndex:
						//Delete
						onRemoveAvatar();
						break;
					case selectFromLibraryButtonIndex:
						//Select from library
						await onOpenLibrary();
						break;
					case cancelButtonIndex:
						//Cancel
						return;
					default:
						return;
				}
			},
		);
	}, [showActionSheetWithOptions]);
	return (
		<>
			<View className="w-20 h-20">
				<Pressable onPress={onPress}>
					<Avatar className="w-20 h-20 overflow-visible" alt="Avatar">
						{avatar && (
							<AvatarImage
								className="w-20 h-20 rounded-full"
								source={{ uri: avatar }}
							/>
						)}
						<AvatarFallback>
							<DefaultAvatar />
						</AvatarFallback>
						<View className="absolute right-0 bottom-0 p-1 rounded-full items-center justify-center bg-primary-foreground">
							<StyledIcon name="Camera" className="text-primary h-4 w-4" />
						</View>
					</Avatar>
				</Pressable>
			</View>
		</>
	);
};

EditableUserAvatar = memo(EditableUserAvatar);

export { EditableUserAvatar };
