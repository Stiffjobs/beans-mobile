import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { Id } from './_generated/dataModel';
import { getCurrentUserOrThrow } from './users';
import { QueryCtx } from './_generated/server';

// Helper function to extract mentions and find user IDs
async function processMentions(ctx: QueryCtx, content: string) {
	const mentions = content.match(/@(\w+)/g) || [];
	const userIds = new Set<Id<'users'>>();

	for (const mention of mentions) {
		const username = mention.slice(1); // Remove @ symbol
		const user = await ctx.db
			.query('users')
			.filter(q => q.eq(q.field('name'), username))
			.first();
		if (user) {
			userIds.add(user._id);
		}
	}

	return Array.from(userIds);
}

export const create = mutation({
	args: {
		postId: v.id('posts'),
		content: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);

		// Verify the post exists
		const post = await ctx.db.get(args.postId);
		if (!post) {
			throw new Error('Post not found');
		}

		// Process mentions in the content
		const mentions = await processMentions(ctx, args.content);

		return await ctx.db.insert('post_comments', {
			postId: args.postId,
			userId: user._id,
			content: args.content,
			createdAt: new Date().toISOString(),
			likesCount: 0,
			mentions: mentions.length > 0 ? mentions : undefined,
		});
	},
});

export const remove = mutation({
	args: {
		commentId: v.id('post_comments'),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);

		// Get the comment
		const comment = await ctx.db.get(args.commentId);
		if (!comment) {
			throw new Error('Comment not found');
		}

		// Check if the user is the comment author
		if (comment.userId !== user._id) {
			throw new Error('Not authorized to delete this comment');
		}

		await ctx.db.delete(args.commentId);
		return { success: true };
	},
});

export const list = query({
	args: {
		postId: v.id('posts'),
	},
	handler: async (ctx, args) => {
		const comments = await ctx.db
			.query('post_comments')
			.withIndex('by_post', q => q.eq('postId', args.postId))
			.order('desc')
			.collect();

		// Fetch user information for each comment
		const commentsWithUser = await Promise.all(
			comments.map(async comment => {
				const user = await ctx.db.get(comment.userId);
				const userAvatar = user?.avatar
					? await ctx.storage.getUrl(user.avatar)
					: null;

				// Get mentioned users' information
				const mentionedUsers = comment.mentions
					? await Promise.all(
							comment.mentions.map(async userId => {
								const mentionedUser = await ctx.db.get(userId);
								return mentionedUser
									? {
											_id: mentionedUser._id,
											name: mentionedUser.name,
										}
									: null;
							})
						)
					: [];

				// Format content with mentions
				let formattedContent = comment.content;
				const mentions = comment.content.match(/@(\w+)/g) || [];
				const mentionData = await Promise.all(
					mentions.map(async mention => {
						const username = mention.slice(1);
						const mentionedUser = await ctx.db
							.query('users')
							.filter(q => q.eq(q.field('name'), username))
							.first();
						return {
							mention,
							username,
							userId: mentionedUser?._id,
						};
					})
				);

				return {
					...comment,
					user: user
						? {
								...user,
								avatar: userAvatar,
							}
						: null,
					mentionedUsers: mentionedUsers.filter(Boolean),
					mentionData,
				};
			})
		);

		return commentsWithUser;
	},
});
