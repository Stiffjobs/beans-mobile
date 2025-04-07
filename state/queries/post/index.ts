import { useMutation, useQuery } from '@tanstack/react-query';
import {
	createPostSchema,
	editPostSchema,
	likePostSchema,
	unlikePostSchema,
} from '~/lib/schemas';
import { z } from 'zod';
import {
	optimisticallyUpdateValueInPaginatedQuery,
	useMutation as useConvexMutation,
	useQuery as useConvexQuery,
} from 'convex/react';
import * as Toast from '~/view/com/util/Toast';
import { api } from '~/convex/_generated/api';
import { useModalControls } from '~/state/modals';
import { convexQuery, useConvexPaginatedQuery } from '@convex-dev/react-query';
import { Id } from '~/convex/_generated/dataModel';

import { router } from 'expo-router';
import { uploadToStorage } from '~/utils/images';
import { t } from '@lingui/core/macro';
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

export const useFetchFeed = ({ refreshKey }: { refreshKey: number }) => {
	return useConvexPaginatedQuery(
		api.posts.feed,
		{ refreshKey },
		{ initialNumItems: 10 }
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

type LikePostFormFields = z.infer<typeof likePostSchema>;
export function useLikePost() {
	const mutation = useConvexMutation(api.posts.likePost).withOptimisticUpdate(
		(localStore, args) => {
			const { postId, refreshKey } = args;
			// Update like status
			const hasLiked = localStore.getQuery(api.users.hasLikedPost, {
				postId: postId as Id<'posts'>,
			});

			if (!hasLiked) {
				localStore.setQuery(
					api.users.hasLikedPost,
					{
						postId: postId as Id<'posts'>,
					},
					true
				);
			}

			optimisticallyUpdateValueInPaginatedQuery(
				localStore,
				api.posts.feed,
				{ refreshKey },
				curr => {
					if (curr.post._id === postId) {
						return {
							...curr,
							post: {
								...curr.post,
								likesCount: (curr.post.likesCount ?? 0) + 1,
							},
						};
					}
					return curr;
				}
			);
		}
	);
	return useMutation({
		mutationFn: async (values: LikePostFormFields & { refreshKey: number }) => {
			await mutation({
				postId: values.postId as Id<'posts'>,
				refreshKey: values.refreshKey,
			});
		},
		onSuccess: () => {},
		onError: error => {
			Toast.show(`Error: ${error.message}`, 'CircleAlert', 'error');
		},
	});
}

type UnlikePostFormFields = z.infer<typeof unlikePostSchema>;
export function useUnlikePost() {
	const mutation = useConvexMutation(api.posts.unlikePost).withOptimisticUpdate(
		(localStore, args) => {
			const { postId, refreshKey } = args;
			// Update like status
			const hasLiked = localStore.getQuery(api.users.hasLikedPost, {
				postId: postId as Id<'posts'>,
			});
			if (hasLiked) {
				localStore.setQuery(
					api.users.hasLikedPost,
					{
						postId: postId as Id<'posts'>,
					},
					false
				);
			}

			/**
			 * Updates the like count in the feed query when a user unlikes a post
			 * Uses a helper function to optimistically update the paginated query before the server responds
			 * Decrements the like count by 1, ensuring it never goes below 0
			 * @param localStore - The local store instance for optimistic updates
			 * @param api.posts.feed - The feed query to update
			 * @param refreshKey - Key used to refresh the feed
			 * @param curr - Current post item in the feed
			 */
			optimisticallyUpdateValueInPaginatedQuery(
				localStore,
				api.posts.feed,
				{ refreshKey },
				curr => {
					if (curr.post._id === postId) {
						return {
							...curr,
							post: {
								...curr.post,
								likesCount: Math.max(0, (curr.post.likesCount ?? 1) - 1),
							},
						};
					}
					return curr;
				}
			);
		}
	);
	return useMutation({
		mutationFn: async (
			values: UnlikePostFormFields & { refreshKey: number }
		) => {
			await mutation({
				postId: values.postId as Id<'posts'>,
				refreshKey: values.refreshKey,
			});
		},
		onSuccess: () => {},
		onError: error => {
			Toast.show(t`Error: ${error.message}`, 'CircleAlert', 'error');
		},
	});
}

export function useListPostsByUserId(userId: string) {
	return useQuery(
		convexQuery(api.posts.listByUserId, { userId: userId as Id<'users'> })
	);
}

export function useFetchFollowers() {
	return useQuery(convexQuery(api.users.getFollowers, {}));
}
