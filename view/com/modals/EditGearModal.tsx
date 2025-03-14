import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useModalControls } from '~/state/modals';

export const snapPoints = ['fullscreen'];

export function Component() {
	return (
		<>
			<Header />
		</>
	);
}

function Header() {
	const { closeModal } = useModalControls();

	return (
		<View className="flex p-4 flex-row justify-between items-center">
			<Button size={'sm'} variant={'destructive'} onPress={closeModal}>
				<Text>Cancel</Text>
			</Button>
			<View />
		</View>
	);
}
