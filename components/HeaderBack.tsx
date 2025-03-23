import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from '~/lib/icons/ChevronLeft';
export function HeaderBack() {
	return (
		<Pressable onPress={() => router.back()}>
			<ChevronLeft className="size-8" />
		</Pressable>
	);
}
