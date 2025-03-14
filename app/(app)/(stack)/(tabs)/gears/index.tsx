import { FlashList } from '@shopify/flash-list';
import { useCallback, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { FAB } from '~/components/FAB';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { Text } from '~/components/ui/text';
import { H4 } from '~/components/ui/typography';
import { GEAR_TYPE } from '~/lib/constants';
import { useModalControls } from '~/state/modals';
import { useListGears } from '~/state/queries/gears';
import { Brewer, Grinder } from '~/view/com/icons/SvgIcons';

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
								name: item.name,
								type: item.type as GEAR_TYPE,
								details: item.details,
								settings: item.settings,
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
	return (
		<View className="p-4 justify-between flex flex-row">
			<View className="">
				<H4>{gear.name}</H4>
				<Text className="text-secondary">{gear.type}</Text>
			</View>
			<GearTypeIcon type={gear.type} />
		</View>
	);
}

function GearTypeIcon({ type }: { type: GEAR_TYPE }) {
	switch (type) {
		case GEAR_TYPE.Brewer:
			return <Brewer className="size-12" />;
		default:
			return <Grinder className="size-12" />;
	}
}

interface GearData {
	name: string;
	type: GEAR_TYPE;
	details?: string;
	settings?: string;
}
