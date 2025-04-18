import { View } from 'react-native';
import { Text } from '../ui/text';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { CountryPickerDialogProps } from './type';
import * as Dialog from '~/components/Dialog';
import { Country, CountryDetails } from '~/lib/types';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { BottomSheetFlatList, TouchableOpacity } from '@gorhom/bottom-sheet';
import { t } from '@lingui/core/macro';
import { Button } from '../ui/button';
import { X } from '~/lib/icons';
import { Input } from '../input/Input';
import { searchCountries } from '~/utils/search';
import { Image } from 'expo-image';
import { getFlagEmoji } from '~/lib/utils';
import Animated, {
	useAnimatedStyle,
	withTiming,
} from 'react-native-reanimated';
import { useListCountries } from '~/state/queries/bean_profiles';
export { useDialogControl as useCountryPickerDialogControl } from '~/components/Dialog';
const AnimatedButton = Animated.createAnimatedComponent(Button);

export function CountryPickerDialog(props: CountryPickerDialogProps) {
	return (
		<Dialog.Outer
			snapPoints={Dialog.BottomSheetSnapPoint.Full}
			hideBackdrop
			control={props.control}
		>
			<Inner {...props} />
		</Dialog.Outer>
	);
}

function Inner(props: CountryPickerDialogProps) {
	const [search, setSearch] = useState('');
	const handleDismiss = useCallback(() => {
		props.control.close();
	}, [props.control]);

	const countries = useListCountries();

	const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);

	const scaleAnim = useAnimatedStyle(() => {
		const scaleValue = search.length > 0 ? 1 : 0;
		return {
			transform: [{ scale: withTiming(scaleValue, { duration: 300 }) }],
		};
	});

	const handleSelect = useCallback(
		(country: Country) => {
			props.params.onSelect?.(country);
			handleDismiss();
		},
		[props.control, handleDismiss],
	);

	useEffect(() => {
		setFilteredCountries(searchCountries(search, countries ?? []));
	}, [search, countries]);

	return (
		<Dialog.Inner {...props}>
			<View className="py-2 gap-1">
				<View className="flex-row  justify-between items-center">
					<Text className="text-lg font-semibold mb-2">
						{t`Choose country`}
					</Text>
					<Button onPress={handleDismiss} size={'icon'} variant={'ghost'}>
						<View className="rounded-full items-center p-2 bg-secondary">
							<X strokeWidth={3} className="text-primary size-5" />
						</View>
					</Button>
				</View>
				<View className="flex-row justify-between items-center gap-2">
					<Input
						className="flex-1"
						value={search}
						onChangeText={setSearch}
						maxLength={40}
						placeholder={t`Search countries...`}
					/>
					{search.length > 0 && (
						<AnimatedButton
							style={scaleAnim}
							onPress={() => setSearch('')}
							className="p-2"
							variant={'ghost'}
						>
							<Text className="text-destructive">{t`Clear`}</Text>
						</AnimatedButton>
					)}
				</View>
			</View>
			<KeyboardAvoidingView behavior="padding" className="flex-1">
				<BottomSheetFlatList
					ItemSeparatorComponent={() => <View className="h-2" />}
					ListEmptyComponent={() => (
						<View className="flex flex-1 justify-center items-center">
							<Text>{t`No data yet`}</Text>
						</View>
					)}
					data={filteredCountries}
					keyExtractor={(item) => item.code}
					renderItem={({ item }) => (
						<TouchableOpacity
							onPress={() => handleSelect(item)}
							style={{
								padding: 15,
								borderBottomWidth: 1,
								borderBottomColor: '#eee',
							}}
						>
							<View className="flex-row items-center justify-between">
								<Text>
									{item.details.name.common} ({item.code})
								</Text>
								<Image
									source={{ uri: item.details.flag }}
									style={{ width: 20 }}
								/>
								<Text>{getFlagEmoji(item.details.flag)} </Text>
							</View>
						</TouchableOpacity>
					)}
				/>
			</KeyboardAvoidingView>
		</Dialog.Inner>
	);
}
