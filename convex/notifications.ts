import { internalAction } from './_generated/server';
import { v } from 'convex/values';
import { env } from './env';
import { Novu } from '@novu/api';

export const novu = new Novu({
	secretKey: env.NOVU_SECRET_KEY,
});
export const send = internalAction({
	args: {
		userId: v.id('users'),
		type: v.string(),
		message: v.string(),
		data: v.object({
			postId: v.id('posts'),
			commentId: v.id('post_comments'),
			commentor: v.union(
				v.null(),
				v.object({
					_id: v.id('users'),
					name: v.string(),
					avatar: v.optional(v.id('_storage')),
				})
			),
			commentContent: v.string(),
			redirectTo: v.string(),
		}),
	},
	handler: async (_, args) => {
		// Here you would integrate with your notification service (e.g., Firebase, OneSignal, etc.)
		// For now, we'll just log the notification
		console.log('reached here');
		const triggerRes = await novu.trigger({
			workflowId: 'app-notifications',
			to: {
				subscriberId: args.userId,
			},
			payload: {
				title: 'Beans',
				body: args.message,
				commentor: args.data.commentor,
				redirectTo: args.data.redirectTo,
			},
			overrides: {},
		});
		console.log(triggerRes.result);
	},
});
