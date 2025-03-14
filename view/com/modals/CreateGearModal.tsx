import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';
import { Text } from '~/components/ui/text';
import { useModalControls } from '~/state/modals';

export const snapPoints = ['fullscreen'];
export function Component() {
	return (
		<>
			<Header />
			<KeyboardAwareScrollView contentContainerClassName="p-4">
				<Label>Create Gear</Label>
			</KeyboardAwareScrollView>
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
			<Button size={'sm'} variant={'secondary'}>
				<Text>Create</Text>
			</Button>
		</View>
	);
}
