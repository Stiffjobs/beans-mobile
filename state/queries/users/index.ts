import { useMutation as useConvexMutation } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { z } from 'zod';
import { updateProfileSchema } from '~/lib/schemas';
import { useMutation } from '@tanstack/react-query';
import { uploadToStorage } from '~/utils/images';
import * as Toast from '~/view/com/util/Toast';
import { Image as CroppedImage } from 'react-native-image-crop-picker';
type UpdateProfileFormFields = z.infer<typeof updateProfileSchema>;

export const useUpdateProfile = ({ onSuccess }: { onSuccess?: () => void }) => {
	const getUploadUrl = useConvexMutation(api.posts.generateUploadUrl);
	const mutation = useConvexMutation(api.users.updateProfile);
	return useMutation({
		mutationFn: async (
			values: UpdateProfileFormFields & {
				avatar?: CroppedImage | null;
				isRemove: boolean;
			}
		) => {
			let uploadedImage;
			if (values.avatar) {
				uploadedImage = await uploadToStorage({
					path: values.avatar.path,
					uploadUrl: await getUploadUrl(),
					mime: values.avatar.mime,
				});
			}
			await mutation({
				avatar: uploadedImage,
				name: values.name,
				description: values.description,
				isRemoveAvatar: values.isRemove,
			});
		},
		onSuccess: () => {
			onSuccess?.();
			Toast.show('Profile updated successfully', 'CircleCheck', 'success');
		},
		onError: error => {
			Toast.show(`Error: ${error.message}`, 'CircleAlert', 'error');
		},
	});
};
