import {
	internalMutation,
	mutation,
	query,
	QueryCtx,
} from './_generated/server';
import { UserJSON } from '@clerk/backend';
import { v, Validator } from 'convex/values';
import { DataModel } from './_generated/dataModel';

export const current = query({
	args: {},
	handler: async ctx => {
		const user = await getCurrentUser(ctx);
		if (user?.avatar) {
			return {
				...user,
				avatar: await ctx.storage.getUrl(user.avatar),
			};
		}
		return user;
	},
});

export const upsertFromClerk = internalMutation({
	args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
	async handler(ctx, { data }) {
		const userAttributes = {
			name: data.username ?? 'Anonymous',
			tokenIdentifier: data.id,
		};

		const user = await userByExternalId(ctx, data.id);
		if (user === null) {
			await ctx.db.insert('users', userAttributes);
		} else {
			await ctx.db.patch(user._id, userAttributes);
		}
	},
});

export const deleteFromClerk = internalMutation({
	args: { clerkUserId: v.string() },
	async handler(ctx, { clerkUserId }) {
		const user = await userByExternalId(ctx, clerkUserId);

		if (user !== null) {
			await ctx.db.delete(user._id);
		} else {
			console.warn(
				`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`
			);
		}
	},
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
	const userRecord = await getCurrentUser(ctx);
	if (!userRecord) throw new Error("Can't get current user");
	return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
	const identity = await ctx.auth.getUserIdentity();
	if (identity === null) {
		return null;
	}
	return await userByExternalId(ctx, identity.subject);
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
	return await ctx.db
		.query('users')
		.withIndex('by_token', q => q.eq('tokenIdentifier', externalId))
		.unique();
}

export const updateProfile = mutation({
	args: {
		avatar: v.optional(
			v.object({
				storageId: v.id('_storage'),
				contentType: v.string(),
			})
		),
		name: v.optional(v.string()),
		isRemoveAvatar: v.boolean(),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);
		const { avatar, name, description, isRemoveAvatar } = args;
		const attributes: Partial<DataModel['users']['document']> = {};
		if (avatar) {
			attributes.avatar = avatar.storageId;
			//INFO: if there is a new avatar, remove the old one
			if (user.avatar) {
				await ctx.storage.delete(user.avatar);
			}
		}
		if (isRemoveAvatar) {
			attributes.avatar = undefined;
			if (user.avatar) {
				await ctx.storage.delete(user.avatar);
			}
		}
		if (name) {
			attributes.name = name;
		}
		if (description) {
			attributes.description = description;
		}
		await ctx.db.patch(user._id, attributes);
	},
});

export const getAvatarUrl = query({
	args: {},
	handler: async ctx => {
		const user = await getCurrentUserOrThrow(ctx);
		if (user.avatar) {
			return await ctx.storage.getUrl(user.avatar);
		}
		return null;
	},
});
