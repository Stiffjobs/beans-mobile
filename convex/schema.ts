import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	users: defineTable({
		name: v.string(),
		tokenIdentifier: v.string(),
	}).index('by_token', ['tokenIdentifier']),
	posts: defineTable({
		bean: v.string(),
		flavor: v.string(),
		roastLevel: v.string(),
		coffeeIn: v.string(),
		ratio: v.string(),
		beverageWeight: v.string(),
		brewTemperature: v.string(),
		preparationMethod: v.string(),
		others: v.string(),
		filterPaper: v.string(),
		water: v.string(),
		grinder: v.string(),
		grindSetting: v.string(),
		profile: v.string(),
		tds: v.number(),
		ey: v.number(),
		bloomTime: v.string(),
		preparationTools: v.string(),
		time: v.string(),
		steps: v.array(
			v.object({
				timestamp: v.string(),
				action: v.string(),
				value: v.number(),
			})
		),
		author: v.id('users'),
	}).index('by_author', ['author']),
	post_images: defineTable({
		postId: v.id('posts'),
		storageId: v.id('_storage'),
		contentType: v.string(),
	}).index('by_post', ['postId']),
});
