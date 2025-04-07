import { ConvexError, v } from 'convex/values';
import { mutation, query, QueryCtx } from './_generated/server';
import { getCurrentUserOrThrow } from './users';
import { paginationOptsValidator } from 'convex/server';
import { Id } from './_generated/dataModel';

export const createPost = mutation({
	args: {
		bean: v.string(),
		beanProfile: v.id('bean_profiles'),
		roastLevel: v.string(),
		coffeeIn: v.string(),
		ratio: v.string(),
		waterIn: v.optional(v.string()),
		beverageWeight: v.optional(v.string()),
		brewTemperature: v.string(),
		filterPaperId: v.id('gears'),
		filterPaper: v.string(),
		grinderId: v.id('gears'),
		grinder: v.string(),
		grindSetting: v.string(),
		bloomTime: v.string(),
		totalDrawdownTime: v.string(),
		recipeSteps: v.array(
			v.object({
				timestamp: v.string(),
				action: v.string(),
				value: v.number(),
			}),
		),
		brewingWater: v.optional(v.string()),
		methodName: v.optional(v.string()),
		brewer: v.string(),
		brewerId: v.id('gears'),
		otherTools: v.optional(v.string()),
		flavor: v.optional(v.string()),
		tds: v.optional(v.number()),
		ey: v.optional(v.number()),
		createdDate: v.string(),
		images: v.array(
			v.object({
				storageId: v.id('_storage'),
				contentType: v.string(),
			}),
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
	handler: async (ctx) => {
		const userId = await getCurrentUserOrThrow(ctx);
		if (!userId) {
			throw new Error('Unauthorized');
		}
		const posts = await ctx.db
			.query('posts')
			.withIndex('by_author', (q) => q.eq('author', userId._id))
			.order('desc')
			.collect();

		const postWithDetails = await Promise.all(
			posts.map(async (post) => {
				const author = await ctx.db.get(post.author);
				if (!author) throw new ConvexError('Author not found');

				let beanProfile = null;
				let filterPaperDetails = null;
				let grinderDetails = null;
				let brewerDetails = null;
				let avatar = null;

				if (post.beanProfile) {
					beanProfile = await ctx.db.get(post.beanProfile);
				}
				if (post.filterPaperId) {
					filterPaperDetails = await ctx.db.get(post.filterPaperId);
				}
				if (post.grinderId) {
					grinderDetails = await ctx.db.get(post.grinderId);
				}
				if (post.brewerId) {
					brewerDetails = await ctx.db.get(post.brewerId);
				}
				if (author.avatar) {
					avatar = await ctx.storage.getUrl(author.avatar);
				}

				const images = await ctx.db
					.query('post_images')
					.withIndex('by_post', (q) => q.eq('postId', post._id))
					.collect();
				const imagesUrl = await Promise.all(
					images.map(async (image) => {
						const url = await ctx.storage.getUrl(image.storageId);
						return url;
					}),
				);

				return {
					post,
					author: {
						...author,
						avatarUrl: avatar,
					},
					beanProfile,
					filterPaperDetails,
					comments: [],
					grinderDetails,
					brewerDetails,
					images: imagesUrl.filter((e) => e !== null),
				};
			}),
		);

		return postWithDetails;
	},
});

export const listByUserId = query({
	args: {
		userId: v.id('users'),
	},
	handler: async (ctx, args) => {
		const posts = await ctx.db
			.query('posts')
			.withIndex('by_author', (q) => q.eq('author', args.userId))
			.order('desc')
			.collect();

		const postWithDetails = await Promise.all(
			posts.map(async (post) => {
				const author = await ctx.db.get(post.author);
				if (!author) throw new ConvexError('Author not found');

				let beanProfile = null;
				let filterPaperDetails = null;
				let grinderDetails = null;
				let brewerDetails = null;
				let avatar = null;

				if (post.beanProfile) {
					beanProfile = await ctx.db.get(post.beanProfile);
				}
				if (post.filterPaperId) {
					filterPaperDetails = await ctx.db.get(post.filterPaperId);
				}
				if (post.grinderId) {
					grinderDetails = await ctx.db.get(post.grinderId);
				}
				if (post.brewerId) {
					brewerDetails = await ctx.db.get(post.brewerId);
				}
				if (author.avatar) {
					avatar = await ctx.storage.getUrl(author.avatar);
				}

				const images = await ctx.db
					.query('post_images')
					.withIndex('by_post', (q) => q.eq('postId', post._id))
					.collect();
				const imagesUrl = await Promise.all(
					images.map(async (image) => {
						const url = await ctx.storage.getUrl(image.storageId);
						return url!;
					}),
				);

				return {
					post,
					author: {
						...author,
						avatarUrl: avatar,
					},
					beanProfile,
					filterPaperDetails,
					grinderDetails,
					brewerDetails,
					images: imagesUrl.filter((e) => e !== null),
				};
			}),
		);

		return postWithDetails;
	},
});

export const feed = query({
	args: { paginationOpts: paginationOptsValidator, refreshKey: v.number() },
	handler: async (ctx, args) => {
		const postRows = await ctx.db
			.query('posts')
			.order('desc')
			.paginate(args.paginationOpts);

		const postWithDetails = await Promise.all(
			postRows.page.map(async (post) => {
				const author = await ctx.db.get(post.author);
				if (!author) throw new ConvexError('Author not found');
				let beanProfile = null;
				let filterPaperDetails = null;
				let grinderDetails = null;
				let brewerDetails = null;
				if (post.beanProfile) {
					beanProfile = await ctx.db.get(post.beanProfile);
				}
				if (post.filterPaperId) {
					filterPaperDetails = await ctx.db.get(post.filterPaperId);
				}
				if (post.grinderId) {
					grinderDetails = await ctx.db.get(post.grinderId);
				}
				if (post.brewerId) {
					brewerDetails = await ctx.db.get(post.brewerId);
				}
				let avatar = null;
				if (author.avatar) {
					avatar = await ctx.storage.getUrl(author?.avatar);
				}
				const images = await ctx.db
					.query('post_images')
					.withIndex('by_post', (q) => q.eq('postId', post._id))
					.collect();
				const imagesUrl = await Promise.all(
					images.map(async (image) => {
						const url = await ctx.storage.getUrl(image.storageId);
						return url;
					}),
				);

				const comments = await ctx.db
					.query('post_comments')
					.withIndex('by_post', (q) => q.eq('postId', post._id))
					.collect();

				return {
					post: post,
					author: {
						...author,
						avatarUrl: avatar,
					},
					beanProfile: beanProfile,
					filterPaperDetails: filterPaperDetails,
					grinderDetails: grinderDetails,
					brewerDetails: brewerDetails,
					comments,
					images: imagesUrl.filter((e) => e !== null),
				};
			}),
		);
		return {
			...postRows,
			page: postWithDetails,
		};
	},
});

export const generateUploadUrl = mutation(async (ctx) => {
	await getCurrentUserOrThrow(ctx);
	return await ctx.storage.generateUploadUrl();
});

export const getPostById = query({
	args: {
		id: v.id('posts'),
	},
	handler: async (ctx, args) => {
		const post = await ctx.db.get(args.id);
		if (!post) throw new ConvexError('Post not found');
		let beanProfile = null;
		let filterPaperDetails = null;
		let grinderDetails = null;
		let brewerDetails = null;
		if (post?.beanProfile) {
			beanProfile = await ctx.db.get(post?.beanProfile);
		}
		if (post?.filterPaperId) {
			filterPaperDetails = await ctx.db.get(post?.filterPaperId);
		}
		if (post?.grinderId) {
			grinderDetails = await ctx.db.get(post?.grinderId);
		}
		if (post?.brewerId) {
			brewerDetails = await ctx.db.get(post?.brewerId);
		}
		const author = await ctx.db.get(post.author);
		let avatar = null;
		if (author?.avatar) {
			avatar = await ctx.storage.getUrl(author?.avatar);
		}
		const images = await ctx.db
			.query('post_images')
			.withIndex('by_post', (q) => q.eq('postId', args.id))
			.collect();
		const imagesUrl = await Promise.all(
			images.map(async (image) => {
				const url = await ctx.storage.getUrl(image.storageId);
				return url;
			}),
		);
		return {
			...post,
			beanProfile: beanProfile,
			images: imagesUrl,
			filterPaperDetails,
			author: {
				...author,
				avatarUrl: avatar,
			},
			grinderDetails,
			brewerDetails,
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
			.withIndex('by_post', (q) => q.eq('postId', args.id))
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
		beanProfile: v.id('bean_profiles'),
		roastLevel: v.string(),
		coffeeIn: v.string(),
		ratio: v.string(),
		waterIn: v.optional(v.string()),
		beverageWeight: v.optional(v.string()),
		brewTemperature: v.string(),
		filterPaperId: v.id('gears'),
		filterPaper: v.string(),
		brewingWater: v.optional(v.string()),
		grinderId: v.id('gears'),
		grinder: v.string(),
		grindSetting: v.string(),
		bloomTime: v.string(),
		totalDrawdownTime: v.optional(v.string()),
		methodName: v.optional(v.string()),
		brewerId: v.id('gears'),
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
			}),
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

export const likePost = mutation({
	args: {
		postId: v.id('posts'),
	},
	async handler(ctx, args) {
		const user = await getCurrentUserOrThrow(ctx);

		const existingLike = await ctx.db
			.query('likes')
			.withIndex('unique_like', (q) =>
				q.eq('userId', user._id).eq('postId', args.postId),
			)
			.first();

		if (existingLike) {
			throw new Error('Already liked');
		}

		// Create like
		await ctx.db.insert('likes', {
			userId: user._id,
			postId: args.postId,
			createdAt: new Date().toISOString(),
		});

		// Increment post likes count
		const post = await ctx.db.get(args.postId);
		if (!post) {
			throw new Error('Post not found');
		}

		await ctx.db.patch(args.postId, {
			likesCount: (post.likesCount ?? 0) + 1,
		});

		return { success: true };
	},
});

export const unlikePost = mutation({
	args: {
		postId: v.id('posts'),
	},
	async handler(ctx, args) {
		const user = await getCurrentUserOrThrow(ctx);
		// Find and delete the like
		const existingLike = await ctx.db
			.query('likes')
			.withIndex('unique_like', (q) =>
				q.eq('userId', user._id).eq('postId', args.postId),
			)
			.first();

		if (!existingLike) {
			throw new Error('Like not found');
		}

		await ctx.db.delete(existingLike._id);

		// Decrement post likes count
		const post = await ctx.db.get(args.postId);
		if (!post) {
			throw new Error('Post not found');
		}

		await ctx.db.patch(args.postId, {
			likesCount: Math.max(0, (post.likesCount ?? 1) - 1),
		});

		return { success: true };
	},
});
