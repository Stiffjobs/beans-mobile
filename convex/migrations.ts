import { Migrations } from '@convex-dev/migrations';
import { components, internal } from './_generated/api';
import { DataModel } from './_generated/dataModel';
import { DatabaseReader, DatabaseWriter } from './_generated/server';
import { GEAR_TYPE } from './constant';
export const migrations = new Migrations<DataModel>(components.migrations);

export const migrationForFilterPaperId = migrations.define({
	table: 'posts',
	migrateOne: async (ctx, doc) => {
		if (!doc.filterPaper || doc.filterPaperId) return;

		const gear = await ctx.db
			.query('gears')
			.withIndex('by_owner', q => q.eq('owner', doc.author))
			.filter(q =>
				q.and(
					q.eq(q.field('name'), doc.filterPaper),
					q.eq(q.field('type'), GEAR_TYPE['Filter paper'])
				)
			)
			.first();

		if (gear) {
			await ctx.db.patch(doc._id, {
				filterPaperId: gear._id,
			});
		}
	},
});

export const migartionForBrewerId = migrations.define({
	table: 'posts',
	migrateOne: async (ctx, doc) => {
		if (!doc.brewer || doc.brewerId) return;

		const brewer = await ctx.db
			.query('gears')
			.withIndex('by_owner', q => q.eq('owner', doc.author))
			.filter(q =>
				q.and(
					q.eq(q.field('name'), doc.brewer),
					q.eq(q.field('type'), GEAR_TYPE.Brewer)
				)
			)
			.first();

		if (brewer) {
			await ctx.db.patch(doc._id, {
				brewerId: brewer._id,
			});
		}
	},
});

export const migrationForGrinderId = migrations.define({
	table: 'posts',
	migrateOne: async (ctx, doc) => {
		if (!doc.grinder || doc.grinderId) return;

		const grinder = await ctx.db
			.query('gears')
			.withIndex('by_owner', q => q.eq('owner', doc.author))
			.filter(q => q.eq(q.field('name'), doc.grinder))
			.first();

		if (grinder) {
			await ctx.db.patch(doc._id, {
				grinderId: grinder._id,
			});
		}
	},
});

export const run = migrations.runner([
	internal.migrations.migrationForFilterPaperId,
	internal.migrations.migartionForBrewerId,
	internal.migrations.migrationForGrinderId,
]);
