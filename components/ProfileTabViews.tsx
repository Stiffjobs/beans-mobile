import { t } from '@lingui/core/macro';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useState } from 'react';
import { Text } from './ui/text';
import { useWindowDimensions, View } from 'react-native';
import { SceneRendererProps, TabView } from 'react-native-tab-view';
import { useListPosts } from '~/state/queries/post';
import { renderTabBar } from '~/view/com/pager/TabBar';
import { PostFeedItem } from '~/view/com/posts/PostFeedItem';
import { Pager } from '~/view/com/pager/Pager';

export function ProfileTabViews() {
	const routes = [{ key: 'posts', title: t`Posts` }];
	const [index, setIndex] = useState(0);
	const layout = useWindowDimensions();

	const renderScene = useCallback(
		(
			props: SceneRendererProps & {
				route: {
					key: string;
				};
			}
		) => {
			switch (props.route.key) {
				case 'posts':
					return <PostsTab />;
			}
		},
		[]
	);

	return (
		<View className="flex-1">
			<Pager
				index={index}
				navigationState={{ index, routes }}
				renderTabBar={renderTabBar}
				renderScene={renderScene}
				onIndexChange={setIndex}
				initialLayout={{ width: layout.width }}
			/>
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
