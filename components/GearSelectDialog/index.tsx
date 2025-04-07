import { GearSelectDialogProps } from './type';
import * as Dialog from '~/components/Dialog';
import { Text } from '../ui/text';
import { useListGears } from '~/state/queries/gears';
import { BottomSheetFlatList, TouchableOpacity } from '@gorhom/bottom-sheet';
import { Separator } from '../ui/separator';
import { View } from 'react-native';
import { t } from '@lingui/core/macro';
import { Check } from '~/lib/icons';
import { cn } from '~/lib/utils';
import { H3 } from '../ui/typography';
export { useDialogControl as useGearSelectDialogControl } from '~/components/Dialog';

export function GearSelectDialog(props: GearSelectDialogProps) {
	return (
		<Dialog.Outer control={props.control}>
			<Inner {...props} />
		</Dialog.Outer>
	);
}

function Inner(props: GearSelectDialogProps) {
	const fetchListGear = useListGears();
	return (
		<Dialog.Inner {...props}>
			<H3 className="my-2">Gear Select</H3>
			<BottomSheetFlatList
				data={fetchListGear.data?.filter(e => e.type === props.params.gearType)}
				ItemSeparatorComponent={() => <Separator />}
				ListEmptyComponent={() => (
					<View className="flex-1 flex justify-center items-center">
						<Text>{t`No data yet`}</Text>
					</View>
				)}
				renderItem={({ item }) => (
					<TouchableOpacity
						onPress={() => {
							props.params.onSelect?.(item._id);
							props.control.close();
						}}
					>
						<View className="flex-row justify-between px-2 py-4">
							<Text className="font-semibold text-lg">{item.name}</Text>
							<View
								className={cn(
									props.params.selected === item._id ? 'visible' : 'invisible'
								)}
							>
								<Check className="text-coffee" />
							</View>
						</View>
					</TouchableOpacity>
				)}
			/>
		</Dialog.Inner>
	);
}
