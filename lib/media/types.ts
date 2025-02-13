import { openCropper } from 'react-native-image-crop-picker';

export type CropperOptions = Parameters<typeof openCropper>[0];

export interface ImageDimensions {
	height: number;
	width: number;
}
