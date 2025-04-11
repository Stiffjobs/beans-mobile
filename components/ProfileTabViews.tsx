import { FlashList } from '@shopify/flash-list';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useListPosts } from '~/state/queries/post';
import { PostFeedItem } from '~/view/com/posts/PostFeedItem';
import { Pager, RenderTabBarFnProps } from '~/view/com/pager/Pager';
import { TabBar } from '~/view/com/pager/TabBar';
import { t } from '@lingui/core/macro';

export function ProfileTabViews() {
	const renderTabBar = useCallback((props: RenderTabBarFnProps) => {
		return <TabBar {...props} items={[t`Posts`]} />;
	}, []);
	return (
		<View className="flex-1">
			<Pager renderTabBar={renderTabBar}>
				<PostsTab />
			</Pager>
		</View>
	);
}

function PostsTab() {
	const fetchListPosts = useListPosts();
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
			renderItem={({ item }) => <PostFeedItem item={item} hideLike />}
			refreshing={refreshing}
			onRefresh={handleRefresh}
		/>
	);
}
