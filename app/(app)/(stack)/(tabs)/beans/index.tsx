import { Pressable, useWindowDimensions, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useState } from 'react';
import { useModalControls } from '~/state/modals';
import { FAB } from '~/components/FAB';
import { useListBeanProfiles } from '~/state/queries/bean_profiles';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { RefreshControl } from 'react-native';
import { BeanProfileProps } from '~/lib/types';
import { Route, SceneRendererProps, TabView } from 'react-native-tab-view';
import { Muted } from '~/components/ui/typography';
import { Authenticated, Unauthenticated } from 'convex/react';
import { Link } from 'expo-router';
import { Button } from '~/components/ui/button';
import { t } from '@lingui/core/macro';
import { Pager } from '~/view/com/pager/Pager';

interface ScreenProps {
	data: BeanProfileProps[];
	refreshing: boolean;
	handlePTR: () => void;
}
export default function Beans() {
	const { openModal } = useModalControls();
	const openCreateBeanProfileModal = useCallback(() => {
		openModal({ name: 'create-bean-profile' });
	}, [openModal]);

	const fetchListBeanProfiles = useListBeanProfiles();
	const [refreshing, setRefreshing] = useState(false);

	const handleRefresh = useCallback(() => {
		setRefreshing(true);
		fetchListBeanProfiles.refetch();
		setRefreshing(false);
	}, [fetchListBeanProfiles]);
	const finished =
		fetchListBeanProfiles.data?.filter(profile => profile.finished) ?? [];
	const unfinished =
		fetchListBeanProfiles.data?.filter(profile => !profile.finished) ?? [];

	return (
		<View className="flex-1">
			<Authenticated>
				<Pager tabBarItems={['Unfinished', 'Finished']}>
					<UnFinishedBeanProfiles
						data={unfinished}
						refreshing={refreshing}
						handlePTR={handleRefresh}
					/>
					<FinishedBeanProfiles
						data={finished}
						refreshing={refreshing}
						handlePTR={handleRefresh}
					/>
				</Pager>
				<FAB iconName="PackagePlus" onPress={openCreateBeanProfileModal} />
			</Authenticated>
			<Unauthenticated>
				<Link asChild href={'/signin'}>
					<Button>
						<Text>{t`Sign In`}</Text>
					</Button>
				</Link>
			</Unauthenticated>
		</View>
	);
}

function UnFinishedBeanProfiles({ data, refreshing, handlePTR }: ScreenProps) {
	return (
		<FlashList
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={handlePTR} />
			}
			contentContainerClassName="pt-6"
			estimatedItemSize={200}
			ItemSeparatorComponent={() => <View className="h-2" />}
			data={data}
			ListEmptyComponent={() => (
				<Muted className="text-center">{t`No data yet`}</Muted>
			)}
			renderItem={({ item }) => <BeanProfileCard {...item} />}
		/>
	);
}
function FinishedBeanProfiles({ data, refreshing, handlePTR }: ScreenProps) {
	return (
		<FlashList
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={handlePTR} />
			}
			estimatedItemSize={200}
			ListEmptyComponent={() => (
				<Muted className="text-center">{t`No data yet`}</Muted>
			)}
			ItemSeparatorComponent={() => <View className="h-2" />}
			contentContainerClassName="pt-6"
			data={data}
			renderItem={({ item }) => <BeanProfileCard {...item} />}
		/>
	);
}

function BeanProfileCard(profile: BeanProfileProps) {
	const { openModal } = useModalControls();
	const handlePress = useCallback(() => {
		openModal({
			name: 'edit-bean-profile',
			id: profile._id,
		});
	}, [profile._id]);

	return (
		<Pressable onPress={handlePress}>
			<Card className="mx-4">
				<CardHeader>
					<View className="flex flex-col">
						<CardTitle className="text-primary">{profile.roaster}</CardTitle>
						<CardDescription>{profile.origin}</CardDescription>
					</View>
				</CardHeader>

				<CardContent className="py-1 gap-2">
					<View className="flex-row justify-between">
						<Text className="text-muted-foreground">{t`Producer`}</Text>
						<Text className="text-foreground">{profile.producer}</Text>
					</View>
					<View className="flex-row justify-between">
						<Text className="text-muted-foreground">{t`Farm`}</Text>
						<Text className="text-foreground">{profile.farm}</Text>
					</View>
					<View className="flex-row justify-between">
						<Text className="text-muted-foreground">{t`Varietal`}</Text>
						<Text className="text-foreground">{profile.variety}</Text>
					</View>
					<View className="flex-row justify-between">
						<Text className="text-muted-foreground">{t`Process`}</Text>
						<Text className="text-foreground">{profile.process}</Text>
					</View>
					<View className="flex-row justify-between">
						<Text className="text-muted-foreground">{t`Elevation (masl)`}</Text>
						<Text className="text-foreground">{profile.elevation}</Text>
					</View>
				</CardContent>

				<CardFooter></CardFooter>
			</Card>
		</Pressable>
	);
}
