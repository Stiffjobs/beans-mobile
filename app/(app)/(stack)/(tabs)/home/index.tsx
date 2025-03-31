import {
	Pressable,
	useWindowDimensions,
	View,
	FlatList,
	RefreshControl,
	GestureResponderEvent,
} from 'react-native';
import { useModalControls } from '~/state/modals';
import { Calendar, DateData } from 'react-native-calendars';
import { Link, router } from 'expo-router';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Authenticated, Unauthenticated } from 'convex/react';
import { Loader } from '~/components/Loader';
import { useFetchFeed, useListPosts } from '~/state/queries/post';
import {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { formatDate, formatDateToString } from '~/lib/utils';
import { useCalendarTheme } from '~/hooks/useCalendarTheme';
import {
	NavigationState,
	SceneRendererProps,
	TabDescriptor,
	TabView,
} from 'react-native-tab-view';
import { CustomTabBar } from '~/view/com/pager/TabBar';
import { ScrollView } from 'react-native-gesture-handler';
import { BlockDrawerGesture } from '~/view/shell/BlockDrawerGesture';
import { FAB } from '~/components/FAB';
import { useLingui } from '@lingui/react/macro';
import { PostFeedItem } from '~/view/com/posts/PostFeedItem';
import { FeedPost } from '~/convex/types';
import { BrewingCard } from '~/view/com/posts/BrewingCard';

function CalendarScreen({
	setSelectedDate,
	selectedDate,
}: {
	selectedDate: string;
	setSelectedDate: Dispatch<SetStateAction<string>>;
}) {
	const fetchListPosts = useListPosts();
	const markedDates = fetchListPosts.data?.reduce((acc, item) => {
		const date = item.post.createdDate;
		return {
			...acc,
			[date]: { marked: true },
			[selectedDate]: { marked: date === selectedDate, selected: true },
		};
	}, {}) || { [selectedDate]: { selected: true } };
	const { key, theme } = useCalendarTheme();
	if (fetchListPosts.isLoading) {
		return (
			<View className="flex-1 items-center justify-center">
				<Loader />
			</View>
		);
	}
	return (
		<ScrollView className="flex-1">
			<Calendar
				key={key}
				theme={theme}
				maxDate={formatDateToString(new Date())}
				enableSwipeMonths={false}
				markedDates={markedDates}
				onDayPress={(day: DateData) => {
					setSelectedDate(day.dateString);
				}}
			/>
			{fetchListPosts.data?.map(
				item =>
					formatDate(item.post._creationTime) === selectedDate && (
						<BrewingCard key={item.post._id} feedPost={item} />
					)
			)}
		</ScrollView>
	);
}

function FeedScreen() {
	const [refreshKey, setRefreshKey] = useState(0);
	const [refreshing, setRefreshing] = useState(false);
	const fetchFeed = useFetchFeed({ refreshKey });
	const handlePullToRefresh = useCallback(() => {
		setRefreshKey(prev => prev + 1);
	}, [setRefreshKey]);
	useEffect(() => {
		if (fetchFeed.isLoading) {
			setRefreshing(true);
		} else {
			setRefreshing(false);
		}
	}, [fetchFeed.isLoading]);
	const handleLoadMore = useCallback(() => {
		if (fetchFeed.status === 'Exhausted') {
			return;
		}
		fetchFeed.loadMore(10);
	}, [fetchFeed]);

	return (
		<View className="flex-1 px-4">
			<FlatList
				data={fetchFeed.results}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handlePullToRefresh}
					/>
				}
				onEndReached={handleLoadMore}
				onEndReachedThreshold={0.1}
				ItemSeparatorComponent={() => <View className="h-4" />}
				ListFooterComponent={() => {
					if (fetchFeed.status === 'Exhausted') {
						return (
							<Text className="text-center text-gray-400 ">No more data</Text>
						);
					}
				}}
				renderItem={({ item }) => <PostFeedItem item={item} />}
			/>
		</View>
	);
}

type Route = {
	key: string;
	title: string;
};

const renderTabBar = (
	props: SceneRendererProps & {
		navigationState: NavigationState<Route>;
		options: Record<string, TabDescriptor<Route>> | undefined;
	}
) => {
	const { options, ...rest } = props;
	return (
		<BlockDrawerGesture>
			<CustomTabBar
				className="bg-background"
				tabStyle={{ width: 'auto' }}
				activeClassName="text-primary"
				inactiveClassName="text-primary/50"
				indicatorClassName="bg-primary/75"
				{...rest}
			/>
		</BlockDrawerGesture>
	);
};

export default function HomeScreen() {
	const { openModal } = useModalControls();
	const [selectedDate, setSelectedDate] = useState<string>(
		formatDate(new Date().getTime())
	);
	const renderScene = useCallback(
		(
			props: SceneRendererProps & {
				route: {
					key: string;
					title: string;
				};
			}
		) => {
			switch (props.route.key) {
				case 'feed':
					return <FeedScreen />;
				case 'calendar':
					return (
						<CalendarScreen
							selectedDate={selectedDate}
							setSelectedDate={setSelectedDate}
						/>
					);
			}
		},
		[selectedDate]
	);

	const openCreatePostModal = useCallback(() => {
		openModal({
			name: 'create-post',
			selectedDate: selectedDate,
		});
	}, [openModal, selectedDate]);
	const layout = useWindowDimensions();
	const { t } = useLingui();

	const [index, setIndex] = useState(0);
	const routes = [
		{ key: 'feed', title: t`Feed` },
		{ key: 'calendar', title: t`Calendar` },
	];

	return (
		<View className="flex-1">
			<Authenticated>
				<TabView
					renderScene={renderScene}
					renderTabBar={renderTabBar}
					onIndexChange={setIndex}
					initialLayout={{ width: layout.width }}
					navigationState={{ index, routes }}
				/>
				<FAB iconName="Plus" onPress={openCreatePostModal} />
			</Authenticated>
			<Unauthenticated>
				<View className="flex-1 items-center justify-center">
					<Link asChild href={'/signin'}>
						<Button>
							<Text>Login</Text>
						</Button>
					</Link>
				</View>
			</Unauthenticated>
		</View>
	);
}
