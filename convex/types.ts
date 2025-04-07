import { Doc, Id } from './_generated/dataModel';

export type BeanProfile = Doc<'bean_profiles'>;
export type Post = Doc<'posts'>;
export type User = Doc<'users'>;
export type Gear = Doc<'gears'>;

export type FeedPost = {
	post: Post;
	author: {
		_id: Id<'users'>;
		name: string;
		description?: string;
		avatar?: Id<'_storage'>;
		tokenIdentifier: string;
		avatarUrl: string | null;
	};
	beanProfile: BeanProfile | null;
	filterPaperDetails: Gear | null;
	grinderDetails: Gear | null;
	brewerDetails: Gear | null;
	comments: Doc<'post_comments'>[];
	images: (string | null)[];
};

export type FeedResponse = {
	page: FeedPost[];
	isDone: boolean;
	continueCursor?: string;
};
