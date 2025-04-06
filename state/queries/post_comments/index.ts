import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import {
	useMutation as useConvexMutation,
	useQuery as useConvexQuery,
} from 'convex/react';
import { t } from '@lingui/core/macro';
import { Id } from '~/convex/_generated/dataModel';
import { convexQuery, useConvexPaginatedQuery } from '@convex-dev/react-query';
import { api } from '~/convex/_generated/api';
import * as Toast from '~/view/com/util/Toast';
import {
	createPostCommentSchema,
	deletePostCommentSchema,
} from '~/lib/schemas';
import * as Crypto from 'expo-crypto';

export function useFetchPostComments(postId: string) {
	return useQuery(
		convexQuery(api.post_comments.list, {
			postId: postId as Id<'posts'>,
		})
	);
}
type CreateCommentFormFields = z.infer<typeof createPostCommentSchema>;
export function useCreatePostComment() {
	const mutation = useConvexMutation(
		api.post_comments.create
	).withOptimisticUpdate((localStore, args) => {
		const currentUser = localStore.getQuery(api.users.current);
		const postComments =
			localStore.getQuery(api.post_comments.list, {
				postId: args.postId,
			}) || [];
		if (!currentUser) return;
		try {
			const now = Date.now();
			const newComment = {
				_id: Crypto.randomUUID() as Id<'post_comments'>,
				_creationTime: now,
				content: args.content,
				postId: args.postId as Id<'posts'>,
				user: {
					_id: currentUser._id,
					_creationTime: currentUser._creationTime,
					name: currentUser.name,
					avatar: null,
					tokenIdentifier: currentUser.tokenIdentifier,
				},
				userId: currentUser._id,
				createdAt: now.toString(),
				mentionedUsers: [],
				mentionData: [],
			};
			return postComments.length > 0
				? [...postComments, newComment]
				: [newComment];
		} catch (error) {
			console.error('Error creating optimistic comment:', error);
			throw error;
		}
	});
	return useMutation({
		mutationFn: async (values: CreateCommentFormFields) => {
			await mutation({
				postId: values.postId as Id<'posts'>,
				content: values.content,
			});
		},
		onError: error => {
			Toast.show(t`Error: ${error.message}`, 'CircleAlert', 'error');
		},
	});
}

type DeleteCommentFormFields = z.infer<typeof deletePostCommentSchema>;
export function useDeletePostComment() {
	const mutation = useConvexMutation(api.post_comments.remove);
	return useMutation({
		mutationFn: async (values: DeleteCommentFormFields) => {
			await mutation({ commentId: values.commentId as Id<'post_comments'> });
		},
		onError: error => {
			Toast.show(t`Error: ${error.message}`, 'CircleAlert', 'error');
		},
	});
}
