import { useMutation, useQuery } from '@tanstack/react-query';
import { createPostSchema, editPostSchema } from '~/lib/schemas';
import { z } from 'zod';
import {
	useMutation as useConvexMutation,
	useQuery as useConvexQuery,
} from 'convex/react';
import * as Toast from '~/view/com/util/Toast';
import { api } from '~/convex/_generated/api';
import { useModalControls } from '~/state/modals';
import { convexQuery } from '@convex-dev/react-query';
import { Id } from '~/convex/_generated/dataModel';
import { router } from 'expo-router';
import { uploadToStorage } from '~/utils/images';
type CreatePostFormFields = z.infer<typeof createPostSchema>;

export const useCreatePost = () => {
	const { closeModal } = useModalControls();
	const mutation = useConvexMutation(api.posts.createPost);
	const getUploadUrl = useConvexMutation(api.posts.generateUploadUrl);
	return useMutation({
		mutationFn: async (values: CreatePostFormFields) => {
			const storageIds = await Promise.all(
				values.images.map(async e => {
					const ids = await uploadToStorage({
						path: e.path,
						uploadUrl: await getUploadUrl(),
						mime: e.mime,
					});
					return ids;
				})
			);

			await mutation({
				...values,
				images: storageIds,
			});
		},
		onSuccess: () => {
			Toast.show('Post created successfully', 'CheckCheck', 'success');
			closeModal();
		},
		onError: error => {
			Toast.show(`Error: ${error.message}`, 'CircleAlert', 'error');
			console.error(error);
		},
	});
};

export const useListPosts = () => {
	// return useQueryWithStatus(api.posts.list, {});
	return useQuery(convexQuery(api.posts.list, {}));
};

export const useGetPostById = (id: string) => {
	return useQuery(
		convexQuery(api.posts.getPostById, { id: id as Id<'posts'> })
	);
};

export const useDeletePost = (id: string) => {
	const mutation = useConvexMutation(api.posts.deletePost);
	return useMutation({
		mutationFn: async () => {
			await mutation({ id: id as Id<'posts'> });
		},
		onSuccess: () => {
			Toast.show('Post deleted successfully', 'CircleAlert', 'success');
			router.back();
		},
		onError: error => {
			Toast.show(`Error: ${error.message}`, 'CircleAlert', 'error');
		},
	});
};

type EditPostFormFields = z.infer<typeof editPostSchema>;
export const useEditPost = ({
	id,
	onSuccess,
}: {
	id: string;
	onSuccess?: () => void;
}) => {
	const mutation = useConvexMutation(api.posts.updatePost);
	return useMutation({
		mutationFn: async (values: EditPostFormFields) => {
			await mutation({
				id: id as Id<'posts'>,
				...values,
			});
		},
		onSuccess: () => {
			Toast.show('Post updated successfully', 'CircleCheck', 'success');
			onSuccess?.();
		},
		onError: error => {
			Toast.show(`Error: ${error.message}`, 'CircleAlert', 'error');
		},
	});
};
