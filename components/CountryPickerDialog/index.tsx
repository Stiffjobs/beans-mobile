import { View } from 'react-native';
import { Text } from '../ui/text';
import React, { useCallback, useEffect, useState } from 'react';
import { CountryPickerDialogProps } from './type';
import * as Dialog from '~/components/Dialog';
import { Country, CountryDetails } from '~/lib/types';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { BottomSheetFlatList, TouchableOpacity } from '@gorhom/bottom-sheet';
import countriesData from 'data/countries.json'; // Assuming this path is correct relative to the build/runtime environment
import { useQuery } from '@tanstack/react-query';
import { t } from '@lingui/core/macro';
import { Button } from '../ui/button';
import { X } from '~/lib/icons';
import { Input } from '../input/Input';
import { searchCountries } from '~/utils/search';
import { Image } from 'expo-image';
import { getFlagEmoji } from '~/lib/utils';
export { useDialogControl as useCountryPickerDialogControl } from '~/components/Dialog';

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

const fetchCountries = async (): Promise<Country[]> => {
	const countryArray: Country[] = Object.entries(countriesData).map(
		([code, details]) => ({
			code,
			details: details as CountryDetails, // Cast the details part
		}),
	);
	// Sort alphabetically by common name for better UI
	countryArray.sort((a, b) =>
		a.details.name.common.localeCompare(b.details.name.common),
	);
	return countryArray;
};

function Inner(props: CountryPickerDialogProps) {
	const [search, setSearch] = useState('');
	const handleDismiss = useCallback(() => {
		props.control.close();
	}, [props.control]);
	const { data: countries } = useQuery<Country[], Error>({
		queryKey: ['countries'], // Unique key for this query
		queryFn: fetchCountries, // Function to fetch the data
	});
	const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);

	const handleSelect = useCallback(
		(country: Country) => {
			props.params.onSelect?.(country);
			handleDismiss();
		},
		[props.control],
	);

	useEffect(() => {
		setFilteredCountries(searchCountries(search, countries ?? []));
	}, [search, countries]);
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
					ItemSeparatorComponent={() => <View className="h-2" />}
					ListEmptyComponent={() => (
						<View className="flex flex-1 justify-center items-center">
							<Text>{t`No data yet`}</Text>
						</View>
					)}
					data={filteredCountries} // This is now the sorted array
					keyExtractor={(item) => item.code} // Use the country code as the key
					renderItem={({ item }) => (
						<TouchableOpacity
							onPress={() => handleSelect(item)}
							style={{
								padding: 15,
								borderBottomWidth: 1,
								borderBottomColor: '#eee',
							}}
						>
							{/* Access data via item.details */}
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
