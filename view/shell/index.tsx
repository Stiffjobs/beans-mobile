import { View } from 'react-native';
import { ModalsContainer } from '../com/modals/Modal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function ShellInner() {
	return <></>;
}
export function Shell() {
	return (
		<View className="h-full">
			<ShellInner />
		</View>
	);
}
