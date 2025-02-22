import { ImagePickerOptions, launchImageLibraryAsync } from 'expo-image-picker';
import {
	Image as RNImage,
	openCamera as openCameraFn,
	openCropper as openCropperFn,
} from 'react-native-image-crop-picker';
import { getDataUriSize } from './util';
import { CropperOptions } from './types';
export async function openPicker(opts?: ImagePickerOptions) {
	const response = await launchImageLibraryAsync({
		exif: false,
		mediaTypes: 'images',
		quality: 1,
		...opts,
		legacy: true,
	});

	return (response.assets ?? [])
		.slice(0, 4)
		.filter(asset => {
			if (asset.mimeType?.startsWith('image/')) return true;
			return false;
		})
		.map(image => ({
			mime: image.mimeType || 'image/jpeg',
			height: image.height,
			width: image.width,
			path: image.uri,
			size: getDataUriSize(image.uri),
		}));
}

export async function openCropper(opts: CropperOptions) {
	const item = await openCropperFn({
		...opts,
		forceJpg: true, //ios only
	});
	return {
		path: item.path,
		mime: item.mime,
		size: item.size,
		width: item.width,
		height: item.height,
	};
}
