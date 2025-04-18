import { Pressable, View } from 'react-native';
import { Button } from '~/components/ui/button';
import { BeanProfileProps, Country } from '~/lib/types';
import { StyledIcon } from '../icons/StyledIcons';
import { useModalControls } from '~/state/modals';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useForm, useStore } from '@tanstack/react-form';
import { editBeanProfileSchema } from '~/lib/schemas';
import { Text } from '~/components/ui/text';
import { z } from 'zod';
import {
	useDeleteBeanProfile,
	useGetBeanProfileById,
	useListCountries,
	useUpdateBeanProfile,
} from '~/state/queries/bean_profiles';
import { Loader } from '~/components/Loader';
import { RequiredLabel } from '~/components/RequiredLabel';
import { Input } from '~/components/input/Input';
import { ErrorMessage } from '~/components/ErrorMessage';
import { Label } from '~/components/ui/label';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog';
import { PortalHost } from '@rn-primitives/portal';
import { useCallback, useEffect, useState } from 'react';
import { Checkbox } from '~/components/ui/checkbox';
import {
	CountryPickerDialog,
	useCountryPickerDialogControl,
} from '~/components/CountryPickerDialog';
import { t } from '@lingui/core/macro';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { formatDateToString } from '~/lib/utils';
export const snapPoints = ['fullscreen'];
const CUSTOM_PORTAL_HOST_NAME = 'edit-bean-profile-modal';

type EditBeanProfileModalProps = {
	id: string;
};

export function Component({ id }: EditBeanProfileModalProps) {
	const [selectedCountry, setSelectedCountry] = useState<Country | undefined>();
	const fetchBeanProfileById = useGetBeanProfileById({
		id,
		setCountry: setSelectedCountry,
	});
	const updateBeanProfile = useUpdateBeanProfile({ id });
	const { closeModal } = useModalControls();
	const [showDatePicker, setShowDatePicker] = useState(false);
	const deleteMutation = useDeleteBeanProfile();
	const handleDelete = useCallback(async () => {
		await deleteMutation.mutateAsync(id);
		closeModal();
	}, [deleteMutation, closeModal]);
	const control = useCountryPickerDialogControl();
	const form = useForm({
		defaultValues: {
			origin: fetchBeanProfileById.data?.origin ?? '',
			producer: fetchBeanProfileById.data?.producer ?? '',
			roaster: fetchBeanProfileById.data?.roaster ?? '',
			farm: fetchBeanProfileById.data?.farm ?? '',
			process: fetchBeanProfileById.data?.process ?? '',
			variety: fetchBeanProfileById.data?.variety ?? '',
			elevation: fetchBeanProfileById.data?.elevation ?? '',
			description: fetchBeanProfileById.data?.description ?? '',
			finished: fetchBeanProfileById.data?.finished ?? false,
			countryCode: fetchBeanProfileById.data?.countryCode ?? undefined,
			roastDate:
				fetchBeanProfileById.data?.roastDate ?? formatDateToString(new Date()),
		} as z.infer<typeof editBeanProfileSchema>,
		validators: {
			onSubmit: editBeanProfileSchema,
		},
		onSubmit: async (data) => {
			await updateBeanProfile.mutateAsync({ ...data.value });
			closeModal();
		},
	});
	const onOpenModal = useCallback(() => {
		setShowDatePicker(true);
	}, [setShowDatePicker]);
	const onCancel = useCallback(() => {
		setShowDatePicker(false);
	}, [setShowDatePicker]);
	const onConfirm = useCallback(
		(date: Date) => {
			form.setFieldValue('roastDate', formatDateToString(date));
			onCancel();
		},
		[form.setFieldValue, onCancel],
	);
	if (fetchBeanProfileById.isLoading || fetchBeanProfileById.isPending) {
		return <Loader />;
	}
	return (
		<>
			<Header />
			<KeyboardAwareScrollView className="flex-1">
				<View className="flex-1 px-4 gap-4">
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
										{t`Select a country`}
									</Text>
								)}
							</View>
						</Pressable>
					</View>
					<form.Field name="roastDate">
						{(field) => (
							<View>
								<Label>{t`Roast date`}</Label>
								<Pressable onPressIn={onOpenModal}>
									<View className="flex flex-row h-10 native:h-12 items-center justify-between rounded-md border border-input bg-background px-3 py-2 ">
										{field.state.value ? (
											<Text className="native:text-lg text-sm text-foreground">
												{field.state.value}
											</Text>
										) : (
											<Text className="native:text-lg text-sm text-muted-foreground">
												{t`Select roast date`}
											</Text>
										)}
									</View>
								</Pressable>
							</View>
						)}
					</form.Field>
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
								<RequiredLabel>Producer</RequiredLabel>
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
									placeholder="e.g. 1300 masl"
								/>
								<ErrorMessage
									message={field.state.meta.errors
										.map((e) => e?.message)
										.join(', ')}
								/>
							</View>
						)}
					</form.Field>
					<form.Field name="finished">
						{(field) => (
							<View className="gap-2">
								<Label>{t`Finished`}</Label>
								<Checkbox
									checked={field.state.value}
									onCheckedChange={field.handleChange}
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

					<View className="flex flex-row gap-2">
						<Dialog className="flex-1">
							<DialogTrigger asChild>
								<Button variant="destructive">
									<Text>{t`Delete`}</Text>
								</Button>
							</DialogTrigger>
							<DialogContent
								portalHost={CUSTOM_PORTAL_HOST_NAME}
								className="sm:max-w-[425px]"
							>
								<DialogHeader>
									<DialogTitle>Delete bean</DialogTitle>
									<DialogDescription>
										Are you sure you want to delete this bean?
									</DialogDescription>
								</DialogHeader>
								<DialogFooter>
									<DialogClose asChild>
										<Button variant={'outline'}>
											<Text>{t`Cancel`}</Text>
										</Button>
									</DialogClose>
									<Button onPress={handleDelete} variant="destructive">
										<Text>{t`Delete`}</Text>
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
						<form.Subscribe
							selector={(state) => [
								state.canSubmit,
								state.isDirty,
								state.isSubmitting,
							]}
							children={([canSubmit, isDirty, isSubmitting]) => (
								<Button
									onPress={form.handleSubmit}
									className="flex-1"
									disabled={!canSubmit || isSubmitting || !isDirty}
								>
									<Text>{isSubmitting ? 'Updating...' : 'Update'}</Text>
								</Button>
							)}
						/>
					</View>
				</View>
			</KeyboardAwareScrollView>
			<DateTimePickerModal
				isVisible={showDatePicker}
				mode="date"
				pickerContainerStyleIOS={{ alignItems: 'center' }}
				onConfirm={onConfirm}
				onCancel={onCancel}
			/>
			<CountryPickerDialog
				control={control}
				params={{
					type: 'country-picker',
					selected: selectedCountry,
					onSelect: (country) => {
						setSelectedCountry(country);
						form.setFieldValue('countryCode', country.code);
					},
				}}
			/>
			<PortalHost name={CUSTOM_PORTAL_HOST_NAME} />
		</>
	);
}

function Header() {
	const { closeModal } = useModalControls();

	return (
		<View className="flex-row justify-between items-center p-4">
			<View />
			<Button variant={'ghost'} size={'icon'} onPress={closeModal}>
				<StyledIcon name="X" className="text-primary" />
			</Button>
		</View>
	);
}
