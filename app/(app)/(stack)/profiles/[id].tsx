import { t } from '@lingui/core/macro';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, Pressable, useWindowDimensions, View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Id } from '~/convex/_generated/dataModel';
import { Link2 } from '~/lib/icons';
import { useGetCurrentUser } from '~/state/queries/auth';
import { useListPostsByUserId } from '~/state/queries/post';
import {
	useFollowUser,
	useGetUserById,
	useIsFollowingThisUser,
	useUnfollowUser,
} from '~/state/queries/users';
import { Pager, RenderTabBarFnProps } from '~/view/com/pager/Pager';
import { TabBar } from '~/view/com/pager/TabBar';
import { PostFeedItem } from '~/view/com/posts/PostFeedItem';
import { UserAvatar } from '~/view/com/util/UserAvatar';

interface PagePropsBase {
	profileId: string;
}

export default function ProfileDetailsPage() {
	const { id: profileId } = useLocalSearchParams<{ id: string }>();
	const fetchUserById = useGetUserById(profileId);
	const { data: isFollowing } = useIsFollowingThisUser(profileId);
	const routes = [{ key: 'posts', title: t`Posts` }];
	const [index, setIndex] = useState(0);
	const layout = useWindowDimensions();
	const followMutation = useFollowUser();
	const unfollowMutation = useUnfollowUser();
	const currentUser = useGetCurrentUser();
	const isMe = currentUser.data?._id === profileId;
	const handleFollow = useCallback(async () => {
		await followMutation.mutateAsync(profileId as Id<'users'>);
	}, [followMutation.mutateAsync, profileId]);
	const handleUnFollow = useCallback(async () => {
		await unfollowMutation.mutateAsync(profileId as Id<'users'>);
	}, [unfollowMutation.mutateAsync, profileId]);
	const renderTabBar = useCallback((props: RenderTabBarFnProps) => {
		return <TabBar {...props} items={[t`Posts`]} />;
	}, []);
	return (
		<View className="flex-1 gap-4 px-4">
			<View className="items-start justify-between flex flex-row ">
				<View className="flex-1 gap-2">
					<Text className="text-2xl font-bold text-foreground">
						{fetchUserById.data?.name}
					</Text>
					{fetchUserById.data?.website && (
						<Pressable
							className="flex items-center gap-1 flex-row"
							onPress={async () => {
								if (fetchUserById.data?.website) {
									await Linking.openURL(fetchUserById.data.website);
								}
							}}
						>
							<Link2 strokeWidth={3} className="size-4 text-muted-foreground" />
							<Text className="font-extrabold text-coffee">
								{fetchUserById.data?.website}
							</Text>
						</Pressable>
					)}
					<Text className="text-secondary-foreground font-semibold">
						{fetchUserById.data?.bio}
					</Text>
				</View>
				<UserAvatar avatar={fetchUserById.data?.avatar} />
			</View>
			{isMe ? null : isFollowing ? (
				<Button
					onPress={handleUnFollow}
					size={'sm'}
					weight={'semibold'}
					variant={'muted'}
				>
					<Text>{t`Following`}</Text>
				</Button>
			) : (
				<Button onPress={handleFollow} size={'sm'} weight={'semibold'}>
					<Text>{t`Follow`}</Text>
				</Button>
			)}
			<Pager renderTabBar={renderTabBar}>
				<PostsTab profileId={profileId} />
			</Pager>
		</View>
	);
}

function PostsTab({ profileId }: PagePropsBase) {
	const fetchListPosts = useListPostsByUserId(profileId);
	const [refreshing, setRefreshing] = useState(false);
	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		await fetchListPosts.refetch();
		setRefreshing(false);
	}, [fetchListPosts]);
	return (
		<FlashList
			data={fetchListPosts.data}
			estimatedItemSize={80}
			renderItem={({ item }) => <PostFeedItem item={item} />}
			refreshing={refreshing}
			onRefresh={handleRefresh}
		/>
	);
}
