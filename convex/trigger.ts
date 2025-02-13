import { asyncMap } from 'convex-helpers';
import { Triggers } from 'convex-helpers/server/triggers';
import { getManyFrom } from 'convex-helpers/server/relationships';
import { mutation as rawMutation, query, QueryCtx } from './_generated/server';
import { DataModel } from './_generated/dataModel';
import {
	customCtx,
	customMutation,
} from 'convex-helpers/server/customFunctions';
const triggers = new Triggers<DataModel>();
triggers.register('posts', async (ctx, change) => {
	await asyncMap(
		await getManyFrom(ctx.db, 'post_images', 'by_post', change.id, 'postId'),
		postImage => ctx.db.delete(postImage._id)
	);
});
export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
