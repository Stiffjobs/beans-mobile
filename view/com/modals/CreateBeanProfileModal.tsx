import { Pressable, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useModalControls } from '~/state/modals';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { createBeanProfileSchema } from '~/lib/schemas';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/input/Input';
import { ErrorMessage } from '~/components/ErrorMessage';
import { RequiredLabel } from '~/components/RequiredLabel';
import { useCreateBeanProfile } from '~/state/queries/bean_profiles';
import { X } from '~/lib/icons';
import {
	CountryPickerDialog,
	useCountryPickerDialogControl,
} from '~/components/CountryPickerDialog';
import { useState } from 'react';
import { Country } from '~/lib/types';
import { getFlagEmoji } from '~/lib/utils';
import { t } from '@lingui/core/macro';
export const snapPoints = ['fullscreen'];

export function Component() {
	const createBeanProfileMutation = useCreateBeanProfile();
	const control = useCountryPickerDialogControl();
	const [selectedCountry, setSelectedCountry] = useState<Country | undefined>();
	const form = useForm({
		defaultValues: {
			origin: '',
			roaster: '',
			producer: '',
			farm: '',
			process: '',
			variety: '',
			elevation: '',
			description: undefined,
			finished: false,
			country: undefined,
		} as z.infer<typeof createBeanProfileSchema>,
		validators: {
			onMount: createBeanProfileSchema,
		},
		onSubmit: async ({ value }) => {
			console.log(value);
			await createBeanProfileMutation.mutateAsync({ ...value });
		},
	});
	return (
		<>
			<Header />
			<KeyboardAwareScrollView>
				<View className="flex-1 px-10 gap-4">
					<form.Field name="origin">
						{(field) => (
							<View className="gap-2">
								<RequiredLabel>{t`Origin`}</RequiredLabel>
								<Input
									value={field.state.value}
									onChangeText={field.handleChange}
									placeholder="e.g. Alishan, Chiayi, Taiwan"
								/>
								<ErrorMessage
									message={field.state.meta.errors
										.map((e) => e?.message)
										.join(', ')}
								/>
							</View>
						)}
					</form.Field>
					<View className="gap-2">
						<Label>{t`Country`}</Label>
						<Pressable onPressIn={() => control.open()}>
							<View className="flex flex-row h-10 native:h-12 items-center justify-between rounded-md border border-input bg-background px-3 py-2 ">
								{selectedCountry ? (
									<Text className="native:text-lg text-sm text-foreground">
										{selectedCountry.details.name.common} (
										{selectedCountry.code})
									</Text>
								) : (
									<Text className="native:text-lg text-sm text-muted-foreground">
										Select a country
									</Text>
								)}
							</View>
						</Pressable>
					</View>
					<form.Field name="roaster">
						{(field) => (
							<View className="gap-2">
								<RequiredLabel>{t`Roaster`}</RequiredLabel>
								<Input
									value={field.state.value}
									onChangeText={field.handleChange}
									placeholder="e.g. SEY"
								/>
								<ErrorMessage
									message={field.state.meta.errors
										.map((e) => e?.message)
										.join(', ')}
								/>
							</View>
						)}
					</form.Field>
					<form.Field name="producer">
						{(field) => (
							<View className="gap-2">
								<RequiredLabel>{t`Producer`}</RequiredLabel>
								<Input
									value={field.state.value}
									onChangeText={field.handleChange}
									placeholder="e.g. Cheng-Lun Fang"
								/>
								<ErrorMessage
									message={field.state.meta.errors
										.map((e) => e?.message)
										.join(', ')}
								/>
							</View>
						)}
					</form.Field>
					<form.Field name="farm">
						{(field) => (
							<View className="gap-2">
								<RequiredLabel>{t`Farm`}</RequiredLabel>
								<Input
									value={field.state.value}
									onChangeText={field.handleChange}
									placeholder="e.g. Zou Zhou Yuan Estate"
								/>
								<ErrorMessage
									message={field.state.meta.errors
										.map((e) => e?.message)
										.join(', ')}
								/>
							</View>
						)}
					</form.Field>
					<form.Field name="process">
						{(field) => (
							<View className="gap-2">
								<RequiredLabel>{t`Process`}</RequiredLabel>
								<Input
									value={field.state.value}
									onChangeText={field.handleChange}
									placeholder="e.g. Washed"
								/>
								<ErrorMessage
									message={field.state.meta.errors
										.map((e) => e?.message)
										.join(', ')}
								/>
							</View>
						)}
					</form.Field>
					<form.Field name="variety">
						{(field) => (
							<View className="gap-2">
								<RequiredLabel>{t`Varietal`}</RequiredLabel>
								<Input
									value={field.state.value}
									onChangeText={field.handleChange}
									placeholder="e.g. Gesha"
								/>
								<ErrorMessage
									message={field.state.meta.errors
										.map((e) => e?.message)
										.join(', ')}
								/>
							</View>
						)}
					</form.Field>
					<form.Field name="elevation">
						{(field) => (
							<View className="gap-2">
								<RequiredLabel>{t`Elevation (masl)`}</RequiredLabel>
								<Input
									value={field.state.value}
									onChangeText={field.handleChange}
									placeholder="e.g. 1300"
								/>
								<ErrorMessage
									message={field.state.meta.errors
										.map((e) => e?.message)
										.join(', ')}
								/>
							</View>
						)}
					</form.Field>
					<form.Field name="description">
						{(field) => (
							<View className="gap-2">
								<Label>{t`Description (Optional)`}</Label>
								<Input
									value={field.state.value}
									onChangeText={field.handleChange}
									placeholder="Add any additional notes about the bean"
									multiline
									numberOfLines={4}
								/>
								<ErrorMessage
									message={field.state.meta.errors
										.map((e) => e?.message)
										.join(', ')}
								/>
							</View>
						)}
					</form.Field>

					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
						children={([canSubmit, isSubmitting]) => (
							<Button
								onPress={form.handleSubmit}
								disabled={!canSubmit || isSubmitting}
							>
								<Text>{isSubmitting ? t`Submitting...` : t`Submit`}</Text>
							</Button>
						)}
					/>
				</View>
			</KeyboardAwareScrollView>
			<CountryPickerDialog
				control={control}
				params={{
					type: 'country-picker',
					selected: selectedCountry,
					onSelect: (country) => {
						setSelectedCountry(country);
						form.setFieldValue('country', country.code);
					},
				}}
			/>
		</>
	);
}

function Header() {
	const { closeModal } = useModalControls();

	return (
		<View className="flex-row justify-between items-center p-4">
			<View />
			<Button variant={'ghost'} size={'icon'} onPress={closeModal}>
				<X className="text-primary" />
			</Button>
		</View>
	);
}
