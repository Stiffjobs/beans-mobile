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
	handler: async (ctx) => {
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

export const getUserById = query({
	args: { userId: v.id('users') },
	handler: async (ctx, args) => {
		const thisUser = await ctx.db.get(args.userId);
		if (thisUser?.avatar) {
			return {
				...thisUser,
				avatar: await ctx.storage.getUrl(thisUser?.avatar),
			};
		}
		return thisUser;
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
				`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
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
		.withIndex('by_token', (q) => q.eq('tokenIdentifier', externalId))
		.unique();
}

export const updateProfile = mutation({
	args: {
		avatar: v.optional(
			v.object({
				storageId: v.id('_storage'),
				contentType: v.string(),
			}),
		),
		name: v.optional(v.string()),
		isRemoveAvatar: v.boolean(),
		bio: v.optional(v.string()),
		website: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);
		const { avatar, website, name, bio, isRemoveAvatar } = args;
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
		if (bio) {
			attributes.bio = bio;
		}
		if (website) {
			attributes.website = website;
		}
		await ctx.db.patch(user._id, attributes);
	},
});

export const getAvatarUrl = query({
	args: {},
	handler: async (ctx) => {
		const user = await getCurrentUserOrThrow(ctx);
		if (user.avatar) {
			return await ctx.storage.getUrl(user.avatar);
		}
		return null;
	},
});

export const followUser = mutation({
	args: {
		userIdToFollow: v.id('users'),
	},
	async handler(ctx, args) {
		const user = await getCurrentUserOrThrow(ctx);
		// Check if already following
		const existingFollow = await ctx.db
			.query('follows')
			.withIndex('unique_follow', (q) =>
				q.eq('followerId', user._id).eq('followingId', args.userIdToFollow),
			)
			.first();

		if (existingFollow) {
			throw new Error('Already following');
		}

		// Create follow relationship
		await ctx.db.insert('follows', {
			followerId: user._id,
			followingId: args.userIdToFollow,
			createdAt: new Date().toISOString(),
		});

		// Update follower and following counts
		await ctx.db.patch(user._id, {
			followingCount: (user.followingCount ?? 0) + 1,
		});

		const userToFollow = await ctx.db.get(args.userIdToFollow);
		if (!userToFollow) {
			throw new Error('User to follow not found');
		}

		await ctx.db.patch(args.userIdToFollow, {
			followersCount: (userToFollow.followersCount ?? 0) + 1,
		});

		return { success: true };
	},
});

export const unfollowUser = mutation({
	args: {
		userIdToUnfollow: v.id('users'),
	},
	async handler(ctx, args) {
		const user = await getCurrentUserOrThrow(ctx);
		const existingFollow = await ctx.db
			.query('follows')
			.withIndex('unique_follow', (q) =>
				q.eq('followerId', user._id).eq('followingId', args.userIdToUnfollow),
			)
			.first();

		if (!existingFollow) {
			throw new Error('Not following');
		}

		await ctx.db.delete(existingFollow._id);

		// Update follower and following counts
		await ctx.db.patch(user._id, {
			followingCount: Math.max(0, (user.followingCount ?? 1) - 1),
		});

		const userToUnfollow = await ctx.db.get(args.userIdToUnfollow);
		if (!userToUnfollow) {
			throw new Error('User to unfollow not found');
		}

		await ctx.db.patch(args.userIdToUnfollow, {
			followersCount: Math.max(0, (userToUnfollow.followersCount ?? 1) - 1),
		});

		return { success: true };
	},
});

export const isFollowing = query({
	args: {
		authorId: v.id('users'),
	},
	async handler(ctx, args) {
		const currentUser = await getCurrentUserOrThrow(ctx);

		const follow = await ctx.db
			.query('follows')
			.withIndex('unique_follow', (q) =>
				q.eq('followerId', currentUser._id).eq('followingId', args.authorId),
			)
			.first();

		return !!follow;
	},
});

export const hasLikedPost = query({
	args: {
		postId: v.id('posts'),
	},
	async handler(ctx, args) {
		const user = await getCurrentUserOrThrow(ctx);

		const like = await ctx.db
			.query('likes')
			.withIndex('unique_like', (q) =>
				q.eq('userId', user._id).eq('postId', args.postId),
			)
			.first();

		return !!like;
	},
});

export const getFollowers = query({
	args: {},
	async handler(ctx, args) {
		const user = await getCurrentUserOrThrow(ctx);
		const followers = await ctx.db
			.query('follows')
			.withIndex('by_following', (q) => q.eq('followingId', user._id))
			.collect();

		// Get user details for each follower
		const followersWithDetails = await Promise.all(
			followers.map(async (follow) => {
				const user = await ctx.db.get(follow.followerId);
				if (!user) return null;
				const avatar = user.avatar
					? await ctx.storage.getUrl(user.avatar)
					: null;
				return {
					_id: user._id,
					name: user.name,
					avatar,
				};
			}),
		);

		return followersWithDetails.filter(Boolean);
	},
});
