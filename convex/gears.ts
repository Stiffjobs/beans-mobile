import { mutation, query } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { getCurrentUserOrThrow } from './users';

export const createGear = mutation({
	args: {
		name: v.string(),
		type: v.string(),
		details: v.optional(v.string()),
		settings: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUserOrThrow(ctx);
		await ctx.db.insert('gears', {
			owner: user._id,
			name: args.name,
			type: args.type,
			details: args.details,
			settings: args.settings,
		});
	},
});

export const list = query({
	args: {},
	handler: async ctx => {
		const user = await getCurrentUserOrThrow(ctx);
		const gears = await ctx.db
			.query('gears')
			.withIndex('by_owner', q => q.eq('owner', user._id))
			.collect();
		return gears;
	},
});

export const getGearById = query({
	args: {
		id: v.id('gears'),
	},
	handler: async (ctx, args) => {
		const gear = await ctx.db.get(args.id);
		return gear;
	},
});

export const updateGear = mutation({
	args: {
		id: v.id('gears'),
		name: v.string(),
		type: v.string(),
		details: v.optional(v.string()),
		settings: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		await getCurrentUserOrThrow(ctx);
		const { id, ...data } = args;
		await ctx.db.patch(id, data);
	},
});

export const deleteGear = mutation({
	args: {
		id: v.id('gears'),
	},
	handler: async (ctx, args) => {
		await getCurrentUserOrThrow(ctx);
		await ctx.db.delete(args.id);
	},
});
