import { t } from '@lingui/core/macro';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useState } from 'react';
import { Text } from './ui/text';
import { useWindowDimensions, View } from 'react-native';
import { SceneRendererProps, TabView } from 'react-native-tab-view';
import { useListPosts } from '~/state/queries/post';
import { PostFeedItem } from '~/view/com/posts/PostFeedItem';
import { Pager } from '~/view/com/pager/Pager';

export function ProfileTabViews() {
	return (
		<View className="flex-1">
			<Pager tabBarItems={['Posts']}>
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
