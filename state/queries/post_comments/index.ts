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

export function useFetchPostComments(postId: string) {
	return useQuery(
		convexQuery(api.post_comments.list, {
			postId: postId as Id<'posts'>,
		}),
	);
}
type CreateCommentFormFields = z.infer<typeof createPostCommentSchema>;
export function useCreatePostComment() {
	const mutation = useConvexMutation(api.post_comments.create);
	return useMutation({
		mutationFn: async (values: CreateCommentFormFields) => {
			await mutation({
				postId: values.postId as Id<'posts'>,
				content: values.content,
			});
		},
		onError: (error) => {
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
		onError: (error) => {
			Toast.show(t`Error: ${error.message}`, 'CircleAlert', 'error');
		},
	});
}
