import { View, Text } from 'react-native';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { H4 } from '~/components/ui/typography';
import { useModalControls } from '~/state/modals';

export const snapPoints = ['90%'];
export function Component() {
	const { openModal } = useModalControls();

	const openEditProfile = () => {
		openModal({
			name: 'edit-profile',
		});
	};

	return (
		<View className="flex-1 px-20 ">
			<H4 className="text-blue-300">HI there</H4>
			<Button onPress={openEditProfile}>
				<Text>open editprofile</Text>
			</Button>
		</View>
	);
}
