import { useCallback } from 'react';
import { View } from 'react-native';
import { FAB } from '~/components/FAB';
import { Text } from '~/components/ui/text';
import { useModalControls } from '~/state/modals';

export default () => {
	const { openModal } = useModalControls();
	const handleOpenCreateBeanProfileModal = useCallback(() => {
		openModal({ name: 'create-bean-profile' });
	}, [openModal]);
	return (
		<View className="flex-1">
			<Text>beans</Text>
			<FAB iconName="CirclePlus" onPress={handleOpenCreateBeanProfileModal} />
		</View>
	);
};
