import { Link, router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { FeedPost } from '~/convex/types';
import { useLikePost, useUnlikePost } from '~/state/queries/post';
import { api } from '~/convex/_generated/api';
import { UserAvatar } from '../util/UserAvatar';
import { Text } from '~/components/ui/text';
import { timeAgo } from '~/utils/time';
import { useQuery } from 'convex/react';
import { cn } from '~/lib/utils';
import { Heart, MessageCircle } from '~/lib/icons';
export function PostFeedItem({
	item,
	hideLike = false,
}: {
	item: FeedPost;
	hideLike?: boolean;
}) {
	const hasLiked = useQuery(api.users.hasLikedPost, { postId: item.post._id });
	const handleLike = useCallback(() => {
		if (hasLiked) {
			unlikePost.mutate({ postId: item.post._id });
		} else {
			likePost.mutate({ postId: item.post._id });
		}
	}, [hasLiked, item.post._id]);
	const likePost = useLikePost();
	const unlikePost = useUnlikePost();
	const postLikesCount = useMemo(() => {
		return item.post.likesCount ?? 0;
	}, [item.post.likesCount]);

	return (
		<Link push asChild href={`/posts/${item.post._id}`}>
			<Pressable>
				<View className="p-4 bg-background rounded-md">
					<View className="flex-row items-center gap-2">
						<UserAvatar size="sm" avatar={item.author.avatarUrl} />
						<Text>{item.author?.name}</Text>
					</View>
					{item.beanProfile ? (
						<Text>
							{`${item.beanProfile.roaster} ${item.beanProfile.origin} ${item.beanProfile.farm} ${item.beanProfile.process} ${item.beanProfile.variety}`}
						</Text>
					) : (
						<Text>{item.post.bean}</Text>
					)}
					<Text>{item.brewerDetails?.name ?? item.post.brewer}</Text>
					<View className="flex-row justify-between mt-2 items-center">
						{hideLike ? (
							<View />
						) : (
							<View className="flex-row gap-4 flex-1">
								<View className="flex-row items-center gap-1">
									<Pressable onPress={handleLike} hitSlop={8}>
										<View className="flex-row items-center gap-1">
											<Heart
												className={cn(
													'size-6',
													hasLiked
														? 'text-red-500 fill-red-500'
														: 'text-muted-foreground fill-background'
												)}
											/>
										</View>
									</Pressable>
									{postLikesCount > 0 && (
										<Text className="font-semibold text-sm text-muted-foreground">
											{postLikesCount}
										</Text>
									)}
								</View>
								<View className="flex-row items-center gap-1">
									<MessageCircle className="size-6 text-muted-foreground" />
									{item.comments.length > 0 && (
										<Text className="font-semibold text-sm text-muted-foreground">
											{item.comments.length}
										</Text>
									)}
								</View>
							</View>
						)}
						<Text className="text-muted-foreground">
							{timeAgo(item.post._creationTime)}
						</Text>
					</View>
				</View>
			</Pressable>
		</Link>
	);
}
