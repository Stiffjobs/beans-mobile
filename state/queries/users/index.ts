import { useMutation as useConvexMutation } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { z } from 'zod';
import { updateProfileSchema } from '~/lib/schemas';
import { useMutation, useQuery } from '@tanstack/react-query';
import { uploadToStorage } from '~/utils/images';
import * as Toast from '~/view/com/util/Toast';
import { Image as CroppedImage } from 'react-native-image-crop-picker';
import { convexQuery } from '@convex-dev/react-query';
import { Id } from '~/convex/_generated/dataModel';
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
				bio: values.bio,
				isRemoveAvatar: values.isRemove,
				website: values.website,
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

export const useIsFollowingThisUser = (authorId: string | undefined) => {
	return useQuery(
		convexQuery(api.users.isFollowing, {
			authorId: authorId as Id<'users'>,
		})
	);
};

export const useFollowUser = () => {
	const mutation = useConvexMutation(api.users.followUser).withOptimisticUpdate(
		(localStore, args) => {
			const { userIdToFollow } = args;
			const isFollowing = localStore.getQuery(api.users.isFollowing, {
				authorId: userIdToFollow as Id<'users'>,
			});
			if (!isFollowing) {
				localStore.setQuery(
					api.users.isFollowing,
					{ authorId: userIdToFollow as Id<'users'> },
					true
				);
			}
		}
	);
	return useMutation({
		mutationFn: async (userId: Id<'users'>) => {
			await mutation({
				userIdToFollow: userId,
			});
		},
		onSuccess: () => {},
		onError: error => {
			Toast.show(`Error: ${error.message}`, 'CircleAlert', 'error');
		},
	});
};

export const useUnfollowUser = () => {
	const mutation = useConvexMutation(
		api.users.unfollowUser
	).withOptimisticUpdate((localStore, args) => {
		const { userIdToUnfollow } = args;
		const isFollowing = localStore.getQuery(api.users.isFollowing, {
			authorId: userIdToUnfollow as Id<'users'>,
		});
		if (isFollowing) {
			localStore.setQuery(
				api.users.isFollowing,
				{ authorId: userIdToUnfollow as Id<'users'> },
				false
			);
		}
	});
	return useMutation({
		mutationFn: async (userId: Id<'users'>) => {
			await mutation({
				userIdToUnfollow: userId,
			});
		},
		onSuccess: () => {},
		onError: error => {
			Toast.show(`Error: ${error.message}`, 'CircleAlert', 'error');
		},
	});
};

export const useGetUserById = (userId: string | undefined) => {
	return useQuery(
		convexQuery(api.users.getUserById, {
			userId: userId as Id<'users'>,
		})
	);
};
