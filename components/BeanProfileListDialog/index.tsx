import { BottomSheetFlatList, TouchableOpacity } from '@gorhom/bottom-sheet';
import { BeanProfileListDialogProps } from './type';
import * as Dialog from '~/components/Dialog';
import { Text } from '../ui/text';
import { useListBeanProfiles } from '~/state/queries/bean_profiles';
import { View } from 'react-native';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../ui/card';
export { useDialogControl as useBeanProfileListDialogControl } from '~/components/Dialog';

export function BeanProfileListDialog(props: BeanProfileListDialogProps) {
	return (
		<Dialog.Outer control={props.control}>
			<Inner {...props} />
		</Dialog.Outer>
	);
}

function Inner(props: BeanProfileListDialogProps) {
	const beanProfiles = useListBeanProfiles();

	if (beanProfiles.isLoading) {
		return (
			<Dialog.Inner>
				<Text>Loading...</Text>
			</Dialog.Inner>
		);
	}

	return (
		<Dialog.Inner>
			<View className="gap-2">
				<Text className="text-lg font-semibold mb-2">Select Bean Profile</Text>
				<BottomSheetFlatList
					data={beanProfiles.data ?? []}
					renderItem={({ item: profile }) => (
						<TouchableOpacity
							key={profile._id}
							onPress={() => {
								props.params?.onSelect?.(profile._id);
								props.control.close();
							}}
						>
							<Card>
								<CardHeader>
									<CardTitle>{profile.origin}</CardTitle>
									<CardDescription>{profile.producer}</CardDescription>
								</CardHeader>
								<CardContent className="py-2">
									<View className="flex-row justify-between">
										<Text className="text-muted-foreground">Variety</Text>
										<Text>{profile.variety}</Text>
									</View>
									<View className="flex-row justify-between">
										<Text className="text-muted-foreground">Process</Text>
										<Text>{profile.process}</Text>
									</View>
								</CardContent>
							</Card>
						</TouchableOpacity>
					)}
				/>
			</View>
		</Dialog.Inner>
	);
}
