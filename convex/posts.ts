import { ConvexError, v } from 'convex/values';
import { mutation, query, QueryCtx } from './_generated/server';
import { Triggers } from 'convex-helpers/server/triggers';
import { getCurrentUserOrThrow } from './users';
import { asyncMap } from 'convex-helpers';

const triggers = new Triggers();

export const createPost = mutation({
	args: {
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
		images: v.array(
			v.object({
				storageId: v.id('_storage'),
				contentType: v.string(),
			})
		),
		steps: v.array(
			v.object({
				timestamp: v.string(),
				action: v.string(),
				value: v.number(),
			})
		),
	},
	handler: async (ctx, args) => {
		const userId = await getCurrentUserOrThrow(ctx);

		if (!userId) {
			throw new Error('Unauthorized');
		}
		const { images, ...postData } = args;
		const postId = await ctx.db.insert('posts', {
			...postData,
			author: userId._id,
		});

		// Insert each image into post_images table
		for (const image of images) {
			await ctx.db.insert('post_images', {
				postId,
				storageId: image.storageId,
				contentType: image.contentType,
			});
		}
	},
});

export const list = query({
	args: {},
	handler: async ctx => {
		const userId = await getCurrentUserOrThrow(ctx);
		if (!userId) {
			throw new Error('Unauthorized');
		}
		const posts = await ctx.db
			.query('posts')
			.withIndex('by_author', q => q.eq('author', userId._id))
			.collect();

		return posts;
	},
});

export const generateUploadUrl = mutation(async ctx => {
	const identity = await getCurrentUserOrThrow(ctx);
	return await ctx.storage.generateUploadUrl();
});

export const getPostById = query({
	args: {
		id: v.id('posts'),
	},
	handler: async (ctx, args) => {
		const post = await ctx.db.get(args.id);
		const images = await ctx.db
			.query('post_images')
			.withIndex('by_post', q => q.eq('postId', args.id))
			.collect();
		const imagesUrl = await Promise.all(
			images.map(async image => {
				const url = await ctx.storage.getUrl(image.storageId);
				return url;
			})
		);
		return {
			...post,
			images: imagesUrl,
		};
	},
});

export const deletePost = mutation({
	args: {
		id: v.id('posts'),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);
		if (!user) {
			throw new ConvexError('Unauthorized');
		}
		const postImages = await ctx.db
			.query('post_images')
			.withIndex('by_post', q => q.eq('postId', args.id))
			.collect();
		for (const image of postImages) {
			await ctx.storage.delete(image.storageId);
		}
		await ctx.db.delete(args.id);
	},
});
