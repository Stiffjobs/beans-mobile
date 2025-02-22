import { Image } from 'react-native-image-crop-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { isAndroid } from '~/platform/detection';
import uuid from 'react-native-uuid';
import {
	cacheDirectory,
	copyAsync,
	deleteAsync,
	getInfoAsync,
} from 'expo-file-system';
import { POST_IMG_MAX } from '../constants';
export async function compressIfNeeded(
	img: Image,
	maxSize: number = 1000000
): Promise<Image> {
	const origUri = `file://${img.path}`;
	if (img.size < maxSize) {
		return img;
	}
	const resizedImage = await doResize(origUri, {
		width: img.width,
		height: img.height,
		mode: 'stretch',
		maxSize,
	});
	const finalImageMovedPath = await moveToPermanentPath(
		resizedImage.path,
		'.jpg'
	);
	const finalImg = {
		...resizedImage,
		path: finalImageMovedPath,
	};
	return finalImg;
}
async function doResize(localUri: string, opts: DoResizeOpts): Promise<Image> {
	// We need to get the dimensions of the image before we resize it. Previously, the library we used allowed us to enter
	// a "max size", and it would do the "best possible size" calculation for us.
	// Now instead, we have to supply the final dimensions to the manipulation function instead.
	// Performing an "empty" manipulation lets us get the dimensions of the original image. React Native's Image.getSize()
	// does not work for local files...
	const imageRes = await ImageManipulator.manipulateAsync(localUri, [], {});
	const newDimensions = getResizedDimensions({
		width: imageRes.width,
		height: imageRes.height,
	});

	for (let i = 0; i < 9; i++) {
		// nearest 10th
		const quality = Math.round((1 - 0.1 * i) * 10) / 10;
		const resizeRes = await ImageManipulator.manipulateAsync(
			localUri,
			[{ resize: newDimensions }],
			{
				format: SaveFormat.JPEG,
				compress: quality,
			}
		);

		const fileInfo = await getInfoAsync(resizeRes.uri);
		if (!fileInfo.exists) {
			throw new Error(
				'The image manipulation library failed to create a new image.'
			);
		}
		if (fileInfo.size < opts.maxSize) {
			safeDeleteAsync(imageRes.uri);
			return {
				path: normalizePath(resizeRes.uri),
				mime: 'image/jpeg',
				size: fileInfo.size,
				width: resizeRes.width,
				height: resizeRes.height,
			};
		} else {
			safeDeleteAsync(resizeRes.uri);
		}
	}
	throw new Error(
		`This image is too big! We couldn't compress it down to ${opts.maxSize} bytes`
	);
}
function normalizePath(str: string, allPlatforms = false): string {
	if (isAndroid || allPlatforms) {
		if (!str.startsWith('file://')) {
			return `file://${str}`;
		}
	}
	return str;
}
export async function safeDeleteAsync(path: string) {
	// Normalize is necessary for Android, otherwise it doesn't delete.
	const normalizedPath = normalizePath(path);
	try {
		await deleteAsync(normalizedPath, { idempotent: true });
	} catch (e) {
		console.error('Failed to delete file', e);
	}
}
export function getResizedDimensions(originalDims: {
	width: number;
	height: number;
}) {
	if (
		originalDims.width <= POST_IMG_MAX.width &&
		originalDims.height <= POST_IMG_MAX.height
	) {
		return originalDims;
	}

	const ratio = Math.min(
		POST_IMG_MAX.width / originalDims.width,
		POST_IMG_MAX.height / originalDims.height
	);

	return {
		width: Math.round(originalDims.width * ratio),
		height: Math.round(originalDims.height * ratio),
	};
}
function joinPath(a: string, b: string) {
	if (a.endsWith('/')) {
		if (b.startsWith('/')) {
			return a.slice(0, -1) + b;
		}
		return a + b;
	} else if (b.startsWith('/')) {
		return a + b;
	}
	return a + '/' + b;
}
async function moveToPermanentPath(path: string, ext: string): Promise<string> {
	/*
    Since this package stores images in a temp directory, we need to move the file to a permanent location.
    Relevant: IOS bug when trying to open a second time:
    https://github.com/ivpusic/react-native-image-crop-picker/issues/1199
    */
	const filename = uuid.v4();

	// cacheDirectory will not ever be null on native, but it could be on web. This function only ever gets called on
	// native so we assert as a string.
	const destinationPath = joinPath(cacheDirectory as string, filename + ext);
	await copyAsync({
		from: normalizePath(path),
		to: normalizePath(destinationPath),
	});
	safeDeleteAsync(path);
	return normalizePath(destinationPath);
}
interface DoResizeOpts {
	width: number;
	height: number;
	mode: 'contain' | 'cover' | 'stretch';
	maxSize: number;
}
