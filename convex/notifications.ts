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
		data: v.object({
			subject: v.string(),
			body: v.string(),
			avatar: v.union(v.string(), v.null()),
			redirectTo: v.string(),
			senderId: v.id('users'),
		}),
	},
	handler: async (_, args) => {
		// Here you would integrate with your notification service (e.g., Firebase, OneSignal, etc.)
		// For now, we'll just log the notification
		const triggerRes = await novu.trigger({
			workflowId: 'app-notifications',
			to: {
				subscriberId: args.userId,
			},
			payload: {
				subject: args.data.subject,
				body: args.data.body,
				avatar: args.data.avatar,
				senderId: args.data.senderId,
				redirectTo: args.data.redirectTo,
			},
			overrides: {},
		});
		console.log(triggerRes.result);
	},
});
