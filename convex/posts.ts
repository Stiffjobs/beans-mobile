import { ConvexError, v } from 'convex/values';
import { mutation, query, QueryCtx } from './_generated/server';
import { getCurrentUserOrThrow } from './users';
import { paginationOptsValidator } from 'convex/server';

export const createPost = mutation({
	args: {
		bean: v.string(),
		beanProfile: v.id('bean_profiles'),
		roastLevel: v.string(),
		coffeeIn: v.string(),
		ratio: v.string(),
		beverageWeight: v.string(),
		brewTemperature: v.string(),
		filterPaper: v.string(),
		grinder: v.string(),
		grindSetting: v.string(),
		bloomTime: v.string(),
		totalDrawdownTime: v.string(),
		recipeSteps: v.array(
			v.object({
				timestamp: v.string(),
				action: v.string(),
				value: v.number(),
			})
		),
		brewingWater: v.optional(v.string()),
		methodName: v.optional(v.string()),
		brewer: v.optional(v.string()),
		otherTools: v.optional(v.string()),
		flavor: v.optional(v.string()),
		tds: v.optional(v.number()),
		ey: v.optional(v.number()),
		createdDate: v.string(),
		images: v.array(
			v.object({
				storageId: v.id('_storage'),
				contentType: v.string(),
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

export const feed = query({
	args: { paginationOpts: paginationOptsValidator, refreshKey: v.number() },
	handler: async (ctx, args) => {
		const postRows = await ctx.db
			.query('posts')
			.order('desc')
			.paginate(args.paginationOpts);

		const postWithImages = await Promise.all(
			postRows.page.map(async post => {
				const author = await ctx.db.get(post.author);
				if (!author) throw new ConvexError('Author not found');
				let beanProfile = null;
				if (post.beanProfile) {
					beanProfile = await ctx.db.get(post.beanProfile);
				}
				let avatar = null;
				if (author.avatar) {
					avatar = await ctx.storage.getUrl(author?.avatar);
				}
				const images = await ctx.db
					.query('post_images')
					.withIndex('by_post', q => q.eq('postId', post._id))
					.collect();
				const imagesUrl = await Promise.all(
					images.map(async image => {
						const url = await ctx.storage.getUrl(image.storageId);
						return url;
					})
				);

				return {
					post: post,
					author: {
						...author,
						avatarUrl: avatar,
					},
					beanProfile: beanProfile,
					images: imagesUrl.filter(e => e !== null),
				};
			})
		);
		return {
			...postRows,
			page: postWithImages,
		};
	},
});

export const generateUploadUrl = mutation(async ctx => {
	await getCurrentUserOrThrow(ctx);
	return await ctx.storage.generateUploadUrl();
});

export const getPostById = query({
	args: {
		id: v.id('posts'),
	},
	handler: async (ctx, args) => {
		const post = await ctx.db.get(args.id);
		let beanProfile = null;
		if (post?.beanProfile) {
			beanProfile = await ctx.db.get(post?.beanProfile);
		}
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
			beanProfile: beanProfile,
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

export const updatePost = mutation({
	args: {
		id: v.id('posts'),
		bean: v.string(),
		roastLevel: v.string(),
		coffeeIn: v.string(),
		ratio: v.string(),
		beverageWeight: v.string(),
		brewTemperature: v.string(),
		filterPaper: v.string(),
		brewingWater: v.optional(v.string()),
		grinder: v.string(),
		grindSetting: v.string(),
		bloomTime: v.string(),
		totalDrawdownTime: v.optional(v.string()),
		methodName: v.optional(v.string()),
		brewer: v.optional(v.string()),
		otherTools: v.optional(v.string()),
		flavor: v.optional(v.string()),
		tds: v.optional(v.number()),
		ey: v.optional(v.number()),
		recipeSteps: v.array(
			v.object({
				timestamp: v.string(),
				action: v.string(),
				value: v.number(),
			})
		),
	},
	handler: async (ctx, args) => {
		await getCurrentUserOrThrow(ctx);
		const { id, ...postData } = args;
		await ctx.db.patch(id, {
			...postData,
		});
	},
});
