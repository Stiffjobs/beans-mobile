import { Id } from '~/convex/_generated/dataModel';

interface UploadToStorageParams {
	path: string;
	uploadUrl: string;
	mime: string;
}

interface UploadToStorageRes {
	storageId: Id<'_storage'>;
	contentType: string;
}
export async function uploadToStorage(
	params: UploadToStorageParams
): Promise<UploadToStorageRes> {
	const { path, uploadUrl, mime } = params;
	const response = await fetch(path);
	const blob = await response.blob();
	const uploadRes = await fetch(uploadUrl, {
		method: 'POST',
		headers: {
			'Content-Type': mime,
		},
		body: blob,
	});
	const json = await uploadRes.json();
	if (!uploadRes.ok) {
		throw new Error(`Failed to upload image: ${JSON.stringify(json)}`);
	}
	const { storageId } = json as { storageId: Id<'_storage'> };
	return { storageId, contentType: mime };
}
