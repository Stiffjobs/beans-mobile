import { useCallback } from 'react';
import { View } from 'react-native';
import { FAB } from '~/components/FAB';
import { Text } from '~/components/ui/text';
import { useModalControls } from '~/state/modals';

export default function Gears() {
	const { openModal } = useModalControls();
	const openCreateGearModal = useCallback(() => {
		openModal({ name: 'create-gear' });
	}, [openModal]);
	return (
		<View className="flex-1">
			<FAB iconName="PackagePlus" onPress={openCreateGearModal} />
		</View>
	);
}
