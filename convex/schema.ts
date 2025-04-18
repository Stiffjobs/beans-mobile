import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	users: defineTable({
		name: v.string(),
		avatar: v.optional(v.id('_storage')),
		bio: v.optional(v.string()),
		website: v.optional(v.string()),
		tokenIdentifier: v.string(),
		followersCount: v.optional(v.number()),
		followingCount: v.optional(v.number()),
		postsCount: v.optional(v.number()),
	}).index('by_token', ['tokenIdentifier']),
	likes: defineTable({
		userId: v.id('users'),
		postId: v.id('posts'),
		createdAt: v.string(),
	})
		.index('by_user', ['userId'])
		.index('by_post', ['postId'])
		.index('unique_like', ['userId', 'postId']),
	follows: defineTable({
		followerId: v.id('users'),
		followingId: v.id('users'),
		createdAt: v.string(),
	})
		.index('by_follower', ['followerId'])
		.index('by_following', ['followingId'])
		.index('unique_follow', ['followerId', 'followingId']),
	posts: defineTable({
		author: v.id('users'),
		createdDate: v.string(),
		bean: v.string(),
		roastLevel: v.string(),
		coffeeIn: v.string(),
		ratio: v.string(),
		waterIn: v.optional(v.string()),
		beanProfile: v.optional(v.id('bean_profiles')),
		beverageWeight: v.optional(v.string()),
		brewTemperature: v.string(),
		filterPaper: v.string(),
		filterPaperId: v.optional(v.id('gears')),
		brewer: v.string(),
		brewerId: v.optional(v.id('gears')),
		grinder: v.string(),
		grinderId: v.optional(v.id('gears')),
		grindSetting: v.string(),
		bloomTime: v.string(),
		totalDrawdownTime: v.optional(v.string()),
		brewingWater: v.optional(v.string()),
		recipeSteps: v.optional(
			v.array(
				v.object({
					timestamp: v.string(),
					action: v.string(),
					value: v.number(),
				}),
			),
		),
		methodName: v.optional(v.string()),
		otherTools: v.optional(v.string()),
		flavor: v.optional(v.string()),
		tds: v.optional(v.number()),
		ey: v.optional(v.number()),
		likesCount: v.optional(v.number()),
	}).index('by_author', ['author']),
	post_images: defineTable({
		postId: v.id('posts'),
		storageId: v.id('_storage'),
		contentType: v.string(),
	}).index('by_post', ['postId']),
	gears: defineTable({
		name: v.string(),
		type: v.string(),
		details: v.optional(v.string()),
		owner: v.id('users'),
	}).index('by_owner', ['owner']),
	bean_profiles: defineTable({
		origin: v.string(),
		producer: v.string(),
		farm: v.string(),
		roaster: v.string(),
		process: v.string(),
		roastDate: v.optional(v.string()),
		variety: v.string(),
		elevation: v.string(),
		owner: v.id('users'),
		description: v.optional(v.string()),
		finished: v.boolean(),
		countryCode: v.optional(v.string()),
	}).index('by_owner', ['owner']),
	post_comments: defineTable({
		postId: v.id('posts'),
		userId: v.id('users'),
		content: v.string(),
		createdAt: v.string(),
		likesCount: v.optional(v.number()),
		mentions: v.optional(v.array(v.id('users'))),
	})
		.index('by_post', ['postId'])
		.index('by_user', ['userId'])
		.index('by_post_time', ['postId', 'createdAt']),
	device_tokens: defineTable({
		userId: v.id('users'),
		token: v.string(),
		platform: v.union(v.literal('ios'), v.literal('android')),
	})
		.index('by_user', ['userId'])
		.index('by_token', ['token'])
		.index('by_user_and_token', ['userId', 'token']),
});
