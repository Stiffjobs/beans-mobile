import { v } from 'convex/values';
import {
	action,
	internalQuery,
	mutation,
	query,
	internalAction,
} from './_generated/server';
import { internal } from './_generated/api';
import { novu } from './notifications';
import { getCurrentUserOrThrow } from './users';
import { tryCatch } from './utils';
import { ErrorDto } from '@novu/api/models/errors';
import { SubscribersControllerGetSubscriberResponse } from '@novu/api/models/operations';

export const retrieveNovuSubscriber = internalAction({
	args: {
		userId: v.id('users'),
	},
	async handler(ctx, args) {
		const { data, error } = await tryCatch<
			SubscribersControllerGetSubscriberResponse,
			ErrorDto
		>(novu.subscribers.retrieve(args.userId));
		if (error) {
			console.error('Error retrieving subscriber:', error);
			if (error.statusCode === 404) {
				// Create new subscriber if not found
				const { data: newSubscriber, error: createError } = await tryCatch(
					novu.subscribers.create({
						subscriberId: args.userId,
						email: undefined,
						firstName: undefined,
					})
				);
				console.log('newSubscriber', newSubscriber);
				if (createError) {
					console.error('Error creating subscriber:', createError);
					return null;
				}
				return newSubscriber;
			}
			return null;
		}
		return data;
	},
});

export const updateNovuSubscriberTokens = internalAction({
	args: {
		userId: v.id('users'),
	},
	async handler(ctx, args) {
		const tokens = await ctx.runQuery(
			internal.device_tokens.getUserDeviceTokens,
			{
				userId: args.userId,
			}
		);
		const subscriber = await ctx.runAction(
			internal.device_tokens.retrieveNovuSubscriber,
			{
				userId: args.userId,
			}
		);
		// Then update the subscriber's credentials
		if (subscriber) {
			const { data: _, error: updateDeviceTokenError } = await tryCatch(
				novu.subscribers.credentials.update(
					{
						providerId: 'expo',
						credentials: {
							deviceTokens: tokens.map(t => t.token),
						},
					},
					args.userId
				)
			);
			if (updateDeviceTokenError) {
				console.error(
					'Error updating subscriber credentials:',
					updateDeviceTokenError
				);
			}
		}
	},
});

export const getUserDeviceTokens = internalQuery({
	args: {
		userId: v.id('users'),
	},
	async handler(ctx, args) {
		return await ctx.db
			.query('device_tokens')
			.withIndex('by_user', q => q.eq('userId', args.userId))
			.collect();
	},
});
export const registerDeviceToken = mutation({
	args: {
		token: v.string(),
		platform: v.union(v.literal('ios'), v.literal('android')),
	},
	async handler(ctx, args) {
		const user = await getCurrentUserOrThrow(ctx);

		// Check if token already exists for this user
		const existingToken = await ctx.db
			.query('device_tokens')
			.withIndex('by_token', q => q.eq('token', args.token))
			.first();

		const currentTokenUser = existingToken?.userId;

		// If token already exists for this user, return
		if (existingToken && currentTokenUser === user._id) return;

		// If token already exists for another user, delete it
		if (existingToken && currentTokenUser) {
			// update novu subscriber
			await ctx.db.delete(existingToken._id);
			await ctx.scheduler.runAfter(
				0,
				internal.device_tokens.updateNovuSubscriberTokens,
				{ userId: currentTokenUser }
			);
		}

		// Create new token
		const tokenId = await ctx.db.insert('device_tokens', {
			userId: user._id,
			token: args.token,
			platform: args.platform,
		});

		// Update Novu
		await ctx.scheduler.runAfter(
			0,
			internal.device_tokens.updateNovuSubscriberTokens,
			{
				userId: user._id,
			}
		);

		return tokenId;
	},
});
