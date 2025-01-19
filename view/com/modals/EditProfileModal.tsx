import { View } from 'react-native';
import { H4 } from '~/components/ui/typography';
import { useModalControls } from '~/state/modals';

export const snapPoints = ['60%'];
export function Component() {
	const { closeModal, openModal } = useModalControls();

	const onPressCancel = () => {
		closeModal();
	};

	return (
		<View className="flex-1 items-center justify-center bg-yellow-400">
			<H4 className="text-green-300">Edit Profile </H4>
		</View>
	);
}
