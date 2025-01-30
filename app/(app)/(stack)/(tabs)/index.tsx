import { Pressable, View } from 'react-native';
import { useModalControls } from '~/state/modals';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { StyledIcon } from '~/view/com/icons/StyledIcons';
import { Link, Stack } from 'expo-router';
import { Button } from '~/components/ui/button';

export default function TabOneScreen() {
	const { openModal } = useModalControls();
	const openCreatePostModal = () => {
		openModal({
			name: 'create-post',
		});
	};
	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 12,
		right: 12,
	};
	return (
		<View className="bg-white flex-1">
			<Stack.Screen
				options={{
					headerLeft: () => (
						<Link asChild href={'/home/settings'}>
							<Button variant={'ghost'}>
								<StyledIcon name="Settings" className="text-black" />
							</Button>
						</Link>
					),
				}}
			/>
			<View className="flex-1">
				<Pressable
					className="absolute bottom-8 right-6"
					onPress={openCreatePostModal}
				>
					<View className="h-16 aspect-square bg-primary rounded-full items-center justify-center">
						<StyledIcon name="Plus" className="w-8 h-8 text-white" />
					</View>
				</Pressable>
				<Calendar enableSwipeMonths />
			</View>
		</View>
	);
}
