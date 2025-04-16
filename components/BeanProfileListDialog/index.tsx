import { BottomSheetFlatList, TouchableOpacity } from '@gorhom/bottom-sheet';
import { BeanProfileListDialogProps } from './type';
import * as Dialog from '~/components/Dialog';
import { Text } from '../ui/text';
import { useListBeanProfiles } from '~/state/queries/bean_profiles';
import { Pressable, View } from 'react-native';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../ui/card';
import { t } from '@lingui/core/macro';
import { Button } from '../ui/button';
import { X } from '~/lib/icons';
import { useCallback, useEffect, useState } from 'react';
import { Id } from '~/convex/_generated/dataModel';
import { BeanProfileProps } from '~/lib/types';
import { searchBeanProfiles } from '~/utils/search';
import { Input } from '../ui/input';
import Animated from 'react-native-reanimated';
import {
	KeyboardAvoidingView,
	useReanimatedKeyboardAnimation,
} from 'react-native-keyboard-controller';
export { useDialogControl as useBeanProfileListDialogControl } from '~/components/Dialog';

export function BeanProfileListDialog(props: BeanProfileListDialogProps) {
	return (
		<Dialog.Outer
			snapPoints={Dialog.BottomSheetSnapPoint.Full}
			hideBackdrop
			containsList
			control={props.control}
		>
			<Inner {...props} />
		</Dialog.Outer>
	);
}

function Inner(props: BeanProfileListDialogProps) {
	const beanProfiles = useListBeanProfiles();
	const [search, setSearch] = useState('');
	const [profiles, setProfiles] = useState<BeanProfileProps[]>([]);
	useEffect(() => {
		setProfiles(searchBeanProfiles(search, beanProfiles.data ?? []));
	}, [search, beanProfiles.data]);

	const handleDismiss = useCallback(() => {
		props.control.close();
	}, [props.control]);
	const handleSelect = useCallback(
		(profileId: Id<'bean_profiles'>) => {
			props.params.onSelect?.(profileId);
			handleDismiss();
		},
		[props.control],
	);
	if (beanProfiles.isLoading) {
		return (
			<Dialog.Inner>
				<Text>{t`Loading...`}</Text>
			</Dialog.Inner>
		);
	}

	return (
		<Dialog.Inner {...props}>
			<View className="py-2 gap-1">
				<View className="flex-row  justify-between items-center">
					<Text className="text-lg font-semibold mb-2">
						{t`Select Bean Profile`}
					</Text>
					<Button onPress={handleDismiss} size={'icon'} variant={'ghost'}>
						<View className="rounded-full items-center p-2 bg-secondary">
							<X strokeWidth={3} className="text-primary size-5" />
						</View>
					</Button>
				</View>
				<View className="flex-row justify-between items-center">
					<Input className="flex-1" onChangeText={setSearch} maxLength={40} />
				</View>
			</View>
			<KeyboardAvoidingView behavior="padding" className="flex-1">
				<BottomSheetFlatList
					data={profiles.filter((e) => !e.finished) ?? []}
					ItemSeparatorComponent={() => <View className="h-2" />}
					ListEmptyComponent={() => (
						<View className="flex flex-1 justify-center items-center">
							<Text>{t`No data yet`}</Text>
						</View>
					)}
					contentContainerClassName={'pb-20'}
					renderItem={({ item: profile }) => (
						<TouchableOpacity
							key={profile._id}
							onPress={() => handleSelect(profile._id)}
						>
							<Card>
								<CardHeader>
									<CardTitle>{profile.roaster}</CardTitle>
									<CardDescription>{profile.origin}</CardDescription>
								</CardHeader>
								<CardContent className="py-2">
									<Details label="Farm" value={profile.farm} />
									<Details label="Varietal" value={profile.variety} />
									<Details label="Process" value={profile.process} />
								</CardContent>
							</Card>
						</TouchableOpacity>
					)}
				/>
			</KeyboardAvoidingView>
		</Dialog.Inner>
	);
}

function Details({ label, value }: { label: string; value?: string }) {
	return (
		<View className="flex-row justify-between">
			<Text className="text-muted-foreground">{label}</Text>
			<Text>{value}</Text>
		</View>
	);
}
