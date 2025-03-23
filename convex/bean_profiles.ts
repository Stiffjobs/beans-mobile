import { mutation, query } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { getCurrentUserOrThrow } from './users';

export const create = mutation({
	args: {
		origin: v.string(),
		producer: v.string(),
		farm: v.string(),
		process: v.string(),
		variety: v.string(),
		elevation: v.string(),
		description: v.optional(v.string()),
		finished: v.boolean(),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);
		const beanProfileId = await ctx.db.insert('bean_profiles', {
			...args,
			owner: user._id,
		});
		return beanProfileId;
	},
});

export const list = query({
	args: {},
	handler: async ctx => {
		const user = await getCurrentUserOrThrow(ctx);
		const beanProfiles = await ctx.db
			.query('bean_profiles')
			.withIndex('by_owner', q => q.eq('owner', user._id))
			.order('desc')
			.collect();
		return beanProfiles;
	},
});

export const getById = query({
	args: {
		id: v.id('bean_profiles'),
	},
	handler: async (ctx, args) => {
		const beanProfile = await ctx.db.get(args.id);
		if (!beanProfile) {
			throw new ConvexError('Bean profile not found');
		}
		return beanProfile;
	},
});

/**
 * @param id - The id of the bean profile to update
 * @param origin - The origin of the bean profile
 * @param producer - The producer of the bean profile
 * @param farm - The farm of the bean profile
 * @param process - The process of the bean profile
 * @param variety - The variety of the bean profile
 * @param elevation - The elevation of the bean profile
 * @param description - The description of the bean profile
 */
export const update = mutation({
	args: {
		id: v.id('bean_profiles'),
		origin: v.optional(v.string()),
		producer: v.optional(v.string()),
		farm: v.optional(v.string()),
		process: v.optional(v.string()),
		variety: v.optional(v.string()),
		elevation: v.optional(v.string()),
		description: v.optional(v.string()),
		finished: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);
		const { id, ...updates } = args;

		// Verify ownership
		const existingProfile = await ctx.db.get(id);
		if (!existingProfile) {
			throw new ConvexError('Bean profile not found');
		}
		if (existingProfile.owner !== user._id) {
			throw new ConvexError('Not authorized to update this bean profile');
		}

		await ctx.db.patch(id, updates);
		return id;
	},
});

export const remove = mutation({
	args: {
		id: v.id('bean_profiles'),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);

		// Verify ownership
		const existingProfile = await ctx.db.get(args.id);
		if (!existingProfile) {
			throw new ConvexError('Bean profile not found');
		}
		if (existingProfile.owner !== user._id) {
			throw new ConvexError('Not authorized to delete this bean profile');
		}

		await ctx.db.delete(args.id);
		return args.id;
	},
});
