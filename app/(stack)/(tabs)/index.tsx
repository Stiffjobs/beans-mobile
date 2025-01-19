import { StyleSheet, Text, View } from 'react-native';

import { Button } from '~/components/ui/button';
import { H4 } from '~/components/ui/typography';
import { useModalControls } from '~/state/modals';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';

export default function TabOneScreen() {
	const { openModal } = useModalControls();
	const openCreatePostModal = () => {
		openModal({
			name: 'create-post',
		});
	};
	return (
		<View className="bg-white flex-1">
			<View className="flex-1">
				<Button className="mx-20 rounded-xl" onPress={openCreatePostModal}>
					<H4 className="text-lg text-white">Open create post</H4>
				</Button>
			</View>
		</View>
	);
}
