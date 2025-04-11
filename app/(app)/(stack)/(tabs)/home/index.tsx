import { View, FlatList, RefreshControl } from 'react-native';
import { useModalControls } from '~/state/modals';
import { Calendar, DateData } from 'react-native-calendars';
import { Text } from '~/components/ui/text';
import { Authenticated, Unauthenticated } from 'convex/react';
import { Loader } from '~/components/Loader';
import { useFetchFeed, useListPosts } from '~/state/queries/post';
import {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { formatDate, formatDateToString } from '~/lib/utils';
import { useCalendarTheme } from '~/hooks/useCalendarTheme';
import { TabBar } from '~/view/com/pager/TabBar';
import { ScrollView } from 'react-native-gesture-handler';
import { FAB } from '~/components/FAB';
import { PostFeedItem } from '~/view/com/posts/PostFeedItem';
import { BrewingCard } from '~/view/com/posts/BrewingCard';
import { Pager, PagerRef, RenderTabBarFnProps } from '~/view/com/pager/Pager';
import { Link } from 'expo-router';
import { Button } from '~/components/ui/button';
import React from 'react';
import { t } from '@lingui/core/macro';
import { FlashList } from '@shopify/flash-list';
const TAB_BAR_ITEMS = [t`Feed`, t`Calendar`];

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
			<FlashList
				estimatedItemSize={100}
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
const AuthenticatedContent = React.memo(function AuthenticatedContent({
	selectedDate,
	setSelectedDate,
}: {
	selectedDate: string;
	setSelectedDate: Dispatch<SetStateAction<string>>;
}) {
	const pagerRef = useRef<PagerRef>(null);
	const { openModal } = useModalControls();
	const openCreatePostModal = useCallback(() => {
		openModal({
			name: 'create-post',
			selectedDate: selectedDate,
		});
	}, [openModal, selectedDate]);
	const renderTabBar = useCallback((props: RenderTabBarFnProps) => {
		return <TabBar {...props} items={TAB_BAR_ITEMS} />;
	}, []);

	return (
		<>
			<Pager ref={pagerRef} renderTabBar={renderTabBar}>
				<FeedScreen />
				<CalendarScreen
					selectedDate={selectedDate}
					setSelectedDate={setSelectedDate}
				/>
			</Pager>
			<FAB iconName="Plus" onPress={openCreatePostModal} />
		</>
	);
});

export default function HomeScreen() {
	const [selectedDate, setSelectedDate] = useState<string>(
		formatDate(new Date().getTime())
	);

	return (
		<View className="flex-1">
			<Authenticated>
				<AuthenticatedContent
					selectedDate={selectedDate}
					setSelectedDate={setSelectedDate}
				/>
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
