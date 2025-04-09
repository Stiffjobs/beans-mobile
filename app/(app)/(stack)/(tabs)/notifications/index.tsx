import { FlatList, RefreshControl, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { NovuProvider, useNotifications } from '@novu/react-native';
import { Authenticated, Unauthenticated } from 'convex/react';
import { useGetCurrentUser } from '~/state/queries/auth';
import { Button } from '~/components/ui/button';
import { t } from '@lingui/core/macro';
import { Loader } from '~/components/Loader';
import { NotificationItem } from '~/components/NotificationItem';
import { Notification } from '@novu/js';
import { Separator } from '~/components/ui/separator';

export default () => {
	const currentUser = useGetCurrentUser();

	return (
		<>
			<Authenticated>
				<NovuProvider
					applicationIdentifier="zwGYVlGv2fTk"
					subscriberId={currentUser.data?._id ?? ''}
				>
					<View className="flex-1">
						<NotificationComponent />
					</View>
				</NovuProvider>
			</Authenticated>
			<Unauthenticated>
				<View className="flex-1">
					<Button>
						<Text>{t`Sign in`}</Text>
					</Button>
				</View>
			</Unauthenticated>
		</>
	);
};

function NotificationComponent() {
	const { notifications, isLoading, fetchMore, hasMore, refetch } =
		useNotifications();

	const renderFooter = () => {
		if (!hasMore) return null;
		return <Loader />;
	};

	const renderItem = ({ item }: { item: Notification }) => {
		return <NotificationItem notification={item} />;
	};

	const renderEmpty = () => {
		return (
			<View className="flex-1 items-center justify-center">
				<Text>{t`No data yet`}</Text>
			</View>
		);
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<FlatList
			data={notifications}
			keyExtractor={(item) => item.id}
			renderItem={renderItem}
			ListFooterComponent={renderFooter}
			ItemSeparatorComponent={() => <Separator />}
			onEndReached={fetchMore}
			onEndReachedThreshold={0.5}
			ListEmptyComponent={renderEmpty}
			refreshControl={
				<RefreshControl refreshing={isLoading} onRefresh={refetch} />
			}
		/>
	);
}
