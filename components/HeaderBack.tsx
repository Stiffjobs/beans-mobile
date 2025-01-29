import { Pressable } from 'react-native';
import { StyledIcon } from '~/view/com/icons/StyledIcons';
import { router } from 'expo-router';
export function HeaderBack() {
	return (
		<Pressable onPress={() => router.back()}>
			<StyledIcon name="ChevronLeft" className="w-8 aspect-square" />
		</Pressable>
	);
}
