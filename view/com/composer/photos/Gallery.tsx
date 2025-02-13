import React from 'react';
import {
	ImageStyle,
	LayoutChangeEvent,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
	ViewStyle,
} from 'react-native';
import { ImageDimensions } from '~/lib/media/types';
import { isMobile } from '~/platform/detection';
import { ComposerImage } from '~/state/gallery';
import { Image } from 'expo-image';
import { StyledIcon } from '../../icons/StyledIcons';
import { ComposerAction } from '../state/composer';

interface GalleryProps {
	images: ComposerImage[];
	dispatch: (action: ComposerAction) => void;
}
export let Gallery = (props: GalleryProps): React.ReactNode => {
	const [containerInfo, setContainerInfo] = React.useState<ImageDimensions>();

	const onLayout = (evt: LayoutChangeEvent) => {
		const { width, height } = evt.nativeEvent.layout;
		setContainerInfo({
			width,
			height,
		});
	};

	return (
		<View onLayout={onLayout}>
			{containerInfo ? (
				<GalleryInner {...props} containerInfo={containerInfo} />
			) : undefined}
		</View>
	);
};
Gallery = React.memo(Gallery);

interface GalleryInnerProps extends GalleryProps {
	containerInfo: ImageDimensions;
}

const GalleryInner = (props: GalleryInnerProps) => {
	const { containerInfo, images } = props;
	const dispatch = props.dispatch;

	if (props.images.length === 0) {
		return null;
	}
	const { imageControlsStyle, imageStyle } = React.useMemo(() => {
		const side =
			images.length === 1
				? 250
				: (containerInfo.width - 4 * (images.length - 1)) / images.length;

		const isOverflow = isMobile && images.length > 2;

		return {
			imageControlsStyle: {
				display: 'flex' as const,
				flexDirection: 'row' as const,
				position: 'absolute' as const,
				...(isOverflow
					? { top: 4, right: 4, gap: 4 }
					: !isMobile && images.length < 3
						? { top: 8, right: 8, gap: 8 }
						: { top: 4, right: 4, gap: 4 }),
				zIndex: 1,
			},
			imageStyle: {
				height: side,
				width: side,
			},
		};
	}, [images.length, containerInfo, isMobile]);
	return (
		<View className="flex-1 flex-row gap-2 mt-4">
			{props.images.map(image => {
				return (
					<GalleryItem
						imageControlsStyle={imageControlsStyle}
						imageStyle={imageStyle}
						key={image.id}
						onChange={() => {}}
						onRemove={() => {
							dispatch({
								type: 'REMOVE_IMAGE',
								imageId: image.id,
							});
						}}
						image={image}
					/>
				);
			})}
		</View>
	);
};

type GalleryItemProps = {
	onChange: (...event: any[]) => void;
	image: ComposerImage;
	imageStyle?: ImageStyle;
	imageControlsStyle: ViewStyle;
	onRemove: () => void;
};

const GalleryItem = (props: GalleryItemProps) => {
	return (
		<View style={props.imageStyle as ViewStyle}>
			<View style={props.imageControlsStyle}>
				<TouchableOpacity
					className="h-6 w-6 rounded-xl bg-black/75 items-center justify-center"
					onPress={props.onRemove}
				>
					<StyledIcon name="X" className="h-4 w-4 text-white" />
				</TouchableOpacity>
			</View>
			<Image
				contentFit="cover"
				style={[styles.image, props.imageStyle]}
				source={{ uri: props.image.path }}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	image: {
		borderRadius: 8,
	},
	imageControl: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: 'rgba(0, 0, 0, 0.75)',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
