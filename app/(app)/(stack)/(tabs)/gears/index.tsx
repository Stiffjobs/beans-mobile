import { FlashList } from '@shopify/flash-list';
import { Authenticated, Unauthenticated } from 'convex/react';
import { Link } from 'expo-router';
import { useCallback, useState } from 'react';
import {
	Pressable,
	RefreshControl,
	useWindowDimensions,
	View,
} from 'react-native';
import { FAB } from '~/components/FAB';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { H4, Small } from '~/components/ui/typography';
import { Text } from '~/components/ui/text';
import { GEAR_TYPE } from '~/lib/constants';
import { GearData } from '~/lib/types';
import { useModalControls } from '~/state/modals';
import { useListGears } from '~/state/queries/gears';
import { Brewer, FilterPaper, Grinder } from '~/view/com/icons/SvgIcons';
import {
	NavigationState,
	Route,
	SceneRendererProps,
	TabDescriptor,
	TabView,
} from 'react-native-tab-view';
import { BlockDrawerGesture } from '~/view/shell/BlockDrawerGesture';
import { CustomTabBar } from '~/view/com/pager/TabBar';
import { Pager } from '~/view/com/pager/Pager';
type ScreenProps = {
	data: GearData[];
	refreshing: boolean;
	handlePTR: () => void;
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
export default function Gears() {
	const { openModal } = useModalControls();
	const openCreateGearModal = useCallback(() => {
		openModal({ name: 'create-gear' });
	}, [openModal]);
	const fetchListGears = useListGears();
	const [refreshing, setRefreshing] = useState(false);
	const handleRefresh = useCallback(() => {
		setRefreshing(true);
		fetchListGears.refetch();
		setRefreshing(false);
	}, [fetchListGears]);
	const [index, setIndex] = useState(0);
	const routes = [
		{ key: 'brewer', title: 'Brewer' },
		{ key: 'filterPaper', title: 'Filter Paper' },
		{ key: 'grinder', title: 'Grinder' },
	];
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
				case 'brewer':
					return (
						<BrewerScreen
							refreshing={refreshing}
							handlePTR={handleRefresh}
							data={
								fetchListGears.data?.filter(e => e.type === GEAR_TYPE.Brewer) ??
								[]
							}
						/>
					);
				case 'filterPaper':
					return (
						<FilterPaperScreen
							refreshing={refreshing}
							handlePTR={handleRefresh}
							data={
								fetchListGears.data?.filter(
									e => e.type === GEAR_TYPE['Filter paper']
								) ?? []
							}
						/>
					);
				case 'grinder':
					return (
						<GrinderScreen
							refreshing={refreshing}
							handlePTR={handleRefresh}
							data={
								fetchListGears.data?.filter(
									e => e.type === GEAR_TYPE.Grinder
								) ?? []
							}
						/>
					);
			}
		},
		[fetchListGears.data]
	);

	return (
		<View className="flex-1">
			<Authenticated>
				<Pager
					index={index}
					initialLayout={layout}
					navigationState={{ index, routes }}
					renderScene={renderScene}
					renderTabBar={renderTabBar}
					onIndexChange={setIndex}
				/>
				<FAB iconName="PackagePlus" onPress={openCreateGearModal} />
			</Authenticated>
			<Unauthenticated>
				<Link asChild href={'/signin'}>
					<Button>
						<Text>Sign In</Text>
					</Button>
				</Link>
			</Unauthenticated>
		</View>
	);
}

function BrewerScreen({ data, refreshing, handlePTR }: ScreenProps) {
	return (
		<FlashList
			data={data}
			estimatedItemSize={80}
			renderItem={({ item }) => <GearCard gear={item} />}
			ItemSeparatorComponent={() => <Separator />}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={handlePTR} />
			}
		/>
	);
}
function FilterPaperScreen({ data, refreshing, handlePTR }: ScreenProps) {
	return (
		<FlashList
			data={data}
			ItemSeparatorComponent={() => <Separator />}
			estimatedItemSize={80}
			renderItem={({ item }) => <GearCard gear={item} />}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={handlePTR} />
			}
		/>
	);
}

function GrinderScreen({ data, refreshing, handlePTR }: ScreenProps) {
	return (
		<FlashList
			data={data}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={handlePTR} />
			}
			ItemSeparatorComponent={() => <Separator />}
			estimatedItemSize={80}
			renderItem={({ item }) => <GearCard gear={item} />}
		/>
	);
}

function GearCard({ gear }: { gear: GearData }) {
	const { openModal } = useModalControls();
	const openEditGearModal = useCallback(() => {
		openModal({ name: 'edit-gear', id: gear._id });
	}, [openModal, gear._id]);
	return (
		<Pressable onPress={openEditGearModal}>
			<View className="p-4 justify-between flex flex-row">
				<View className="gap-4">
					<H4>{gear.name}</H4>
					<Small className="">{gear.type}</Small>
				</View>
				<GearTypeIcon type={gear.type as GEAR_TYPE} />
			</View>
		</Pressable>
	);
}

function GearTypeIcon({ type }: { type: GEAR_TYPE }) {
	switch (type) {
		case GEAR_TYPE.Brewer:
			return <Brewer className="size-12" />;
		case GEAR_TYPE['Filter paper']:
			return <FilterPaper className="size-12" />;
		default:
			return <Grinder className="size-12" />;
	}
}
