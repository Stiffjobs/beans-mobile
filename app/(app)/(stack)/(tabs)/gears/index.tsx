import { FlashList } from '@shopify/flash-list';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, View } from 'react-native';
import { FAB } from '~/components/FAB';
import { Separator } from '~/components/ui/separator';
import { H4, Small } from '~/components/ui/typography';
import { GEAR_TYPE } from '~/lib/constants';
import { GearData } from '~/lib/types';
import { useModalControls } from '~/state/modals';
import { useListGears } from '~/state/queries/gears';
import { Brewer, FilterPaper, Grinder } from '~/view/com/icons/SvgIcons';

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
	return (
		<View className="flex-1">
			<FlashList
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
				}
				estimatedItemSize={80}
				ItemSeparatorComponent={() => <Separator />}
				data={fetchListGears.data}
				renderItem={({ item }) => {
					return (
						<GearCard
							gear={{
								...item,
								type: item.type as GEAR_TYPE,
							}}
						/>
					);
				}}
			/>
			<FAB iconName="PackagePlus" onPress={openCreateGearModal} />
		</View>
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
				<GearTypeIcon type={gear.type} />
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
