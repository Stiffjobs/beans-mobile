import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Button } from '~/components/ui/button';
import { StyledIcon } from '../icons/StyledIcons';
import { useModalControls } from '~/state/modals';

export const snapPoints = ['fullscreen'];

export function Component() {
	return (
		<>
			<Header />
			<KeyboardAwareScrollView>
				<View className="flex-1 px-10"></View>
			</KeyboardAwareScrollView>
		</>
	);
}

function Header() {
	const { closeModal } = useModalControls();

	return (
		<View className="flex-row justify-between items-center p-4">
			<View />
			<Button variant={'ghost'} size={'icon'} onPress={closeModal}>
				<StyledIcon name="X" className="text-primary" />
			</Button>
		</View>
	);
}
