import { Pressable, View } from 'react-native';
import { IconName, StyledIcon } from '~/view/com/icons/StyledIcons';

export function FAB({
	onPress,
	iconName,
}: {
	onPress: () => void;
	iconName: IconName;
}) {
	return (
		<View className="absolute bottom-4  right-4 ">
			<Pressable
				className="h-16 aspect-square bg-primary active:opacity-90 rounded-full items-center justify-center"
				onPress={onPress}
			>
				<StyledIcon
					name={iconName}
					className="w-8 h-8 text-primary-foreground"
				/>
			</Pressable>
		</View>
	);
}
