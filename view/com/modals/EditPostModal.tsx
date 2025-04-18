import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { Label } from '~/components/ui/label';
import { H4 } from '~/components/ui/typography';
import { Text } from '~/components/ui/text';
import { ErrorMessage } from '~/components/ErrorMessage';
import { Input } from '~/components/input/Input';
import { RequiredLabel } from '~/components/RequiredLabel';
import { editPostSchema } from '~/lib/schemas';
import { z } from 'zod';
import { TimeMaskInput } from '../time/TimeMaskInput';
import Slider from '@react-native-community/slider';
import { SelectRoastLevel } from '~/components/select/SelectRoastLevel';
import { GEAR_TYPE } from '~/lib/constants';
import { useModalControls } from '~/state/modals';
import { Button } from '~/components/ui/button';
import { WindowOverlay } from '../util/WindowOverlay';
import { PortalHost } from '@rn-primitives/portal';
import { Separator } from '@rn-primitives/select';
import { Pager, PagerRef } from '../pager/Pager';
import { useEditPost, useGetPostById } from '~/state/queries/post';
import { Loader } from '~/components/Loader';
import { RecipeStepsEditor } from '~/components/RecipeStepsEditor';
import { useForm } from '@tanstack/react-form';
import { useListBeanProfiles } from '~/state/queries/bean_profiles';
import {
	BeanProfileListDialog,
	useBeanProfileListDialogControl,
} from '~/components/BeanProfileListDialog';
import { Id } from '~/convex/_generated/dataModel';
import { ChevronDown } from '~/lib/icons/ChevronDown';
import { SelectComponent } from '~/components/select/Select';
import { useListGears } from '~/state/queries/gears';
import { X } from '~/lib/icons';
import MaskInput from 'react-native-mask-input';
import { ratioMaskRegex, timeMaskInputClassName } from '~/lib/utils';

export const snapPoints = ['fullscreen'];
type FormFields = z.infer<typeof editPostSchema>;

export function Component({ id }: { id: string }) {
	const postDetails = useGetPostById(id);
	const fetchBeanProfiles = useListBeanProfiles();
	const form = useForm({
		defaultValues: {
			bean: postDetails.data?.bean ?? '',
			roastLevel: postDetails.data?.roastLevel ?? '',
			coffeeIn: postDetails.data?.coffeeIn ?? '',
			ratio: postDetails.data?.ratio ?? '',
			beverageWeight: postDetails.data?.beverageWeight ?? '',
			brewTemperature: postDetails.data?.brewTemperature ?? '',
			waterIn: postDetails.data?.waterIn ?? '',
			filterPaper: postDetails.data?.filterPaper ?? '',
			filterPaperId: postDetails.data?.filterPaperId ?? '',
			brewingWater: postDetails.data?.brewingWater ?? '',
			grinder: postDetails.data?.grinder ?? '',
			grinderId: postDetails.data?.grinderId ?? '',
			grindSetting: postDetails.data?.grindSetting ?? '',
			bloomTime: postDetails.data?.bloomTime ?? '',
			totalDrawdownTime: postDetails.data?.totalDrawdownTime ?? '',
			methodName: postDetails.data?.methodName ?? '',
			brewer: postDetails.data?.brewer ?? '',
			brewerId: postDetails.data?.brewerId ?? '',
			otherTools: postDetails.data?.otherTools ?? '',
			flavor: postDetails.data?.flavor ?? '',
			tds: postDetails.data?.tds,
			ey: postDetails.data?.ey,
			recipeSteps: postDetails.data?.recipeSteps ?? [],
			beanProfile: postDetails.data?.beanProfile?._id ?? '',
		} as FormFields,
		onSubmit: async ({ value }) => {
			await editPostMutation.mutateAsync(value);
		},
		validators: {
			onMount: editPostSchema,
		},
	});
	const beanProfileListDialogControl = useBeanProfileListDialogControl();
	const onOpenBeanProfileListDialog = useCallback(() => {
		beanProfileListDialogControl.open();
	}, [beanProfileListDialogControl]);
	const [activePage, setActivePage] = React.useState(0);
	const pagerRef = useRef<PagerRef>(null);
	const { closeModal } = useModalControls();
	const fetchGearList = useListGears();
	const editPostMutation = useEditPost({
		id,
		onSuccess: () => {
			closeModal();
		},
	});
	const brewers =
		fetchGearList.data
			?.filter(gear => gear.type === GEAR_TYPE.Brewer)
			.map(e => ({
				id: e._id,
				label: e.name,
				value: e.name,
			})) ?? [];
	const grinders =
		fetchGearList.data
			?.filter(gear => gear.type === GEAR_TYPE.Grinder)
			.map(e => ({
				label: e.name,
				value: e.name,
				id: e._id,
			})) ?? [];
	const filterPapers =
		fetchGearList.data
			?.filter(gear => gear.type === GEAR_TYPE['Filter paper'])
			.map(e => ({
				id: e._id,
				label: e.name,
				value: e.name,
			})) ?? [];
	const handleBeanProfileSelect = useCallback(
		(beanProfile: Id<'bean_profiles'>) => {
			form.setFieldValue('beanProfile', beanProfile);
		},
		[form]
	);

	if (postDetails.isLoading) {
		return (
			<View className="flex-1 items-center justify-center">
				<Loader />
			</View>
		);
	}

	return (
		<>
			<View className="flex flex-row justify-between p-4 bg-background">
				<Button onPress={closeModal} variant={'ghost'} size="sm">
					<Text className="text-destructive">Cancel</Text>
				</Button>
				<Text>{activePage + 1}/2</Text>
				<form.Subscribe
					selector={state => [state.isPristine]}
					children={([isPristine]) => (
						<Button
							disabled={isPristine}
							onPress={() => form.handleSubmit()}
							variant={'secondary'}
							size="sm"
						>
							<Text>Save</Text>
						</Button>
					)}
				/>
			</View>
			<Separator />
			<Pager
				ref={pagerRef}
				renderTabBar={_ => <View />}
				onPageSelected={index => {
					setActivePage(index);
				}}
				initialPage={activePage}
			>
				<KeyboardAwareScrollView key={1}>
					<View className="flex-1 px-10 mt-6 mb-20 gap-2">
						<Label>Created on</Label>
						<Text className="text-sm text-muted-foreground mb-2">
							Fields marked with <Text className="text-destructive">*</Text> are
							required
						</Text>
						<form.Field name="beanProfile">
							{field => (
								<>
									<RequiredLabel>Bean profile</RequiredLabel>
									<Pressable onPressIn={onOpenBeanProfileListDialog}>
										<View className="flex flex-row h-10 native:h-12 items-center justify-between rounded-md border border-input bg-background px-3 py-2 ">
											<Text className="native:text-lg text-sm text-foreground">
												{fetchBeanProfiles?.data?.find(
													e => e._id === field.state.value
												)?.origin ?? 'Select a bean profile'}
											</Text>
											<ChevronDown
												size={16}
												aria-hidden={true}
												className="text-foreground opacity-50"
											/>
										</View>
									</Pressable>
								</>
							)}
						</form.Field>
						<form.Field name="roastLevel">
							{field => (
								<>
									<RequiredLabel>Roast level</RequiredLabel>
									<SelectRoastLevel
										portalHost={EDIT_POST_SELECT_PORTAL}
										placeholder="Select a roast level"
										onChange={field.handleChange}
										value={field.state.value}
									/>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
								</>
							)}
						</form.Field>
						<View className="flex flex-row gap-2 items-center">
							<form.Field
								name="coffeeIn"
								listeners={{
									onChange: e => {
										const ratio = parseFloat(form.getFieldValue('ratio'));
										const coffeeIn = parseFloat(e.value);
										if (!coffeeIn) return;
										const waterIn = Math.round(coffeeIn * ratio);
										if (isNaN(waterIn)) return;
										form.setFieldValue('waterIn', waterIn.toString());
									},
								}}
							>
								{field => (
									<View className="flex-1">
										<RequiredLabel>Coffee in (g)</RequiredLabel>
										<Input
											numberOfLines={1}
											onChangeText={field.handleChange}
											keyboardType="numeric"
											value={field.state.value}
										/>
										<ErrorMessage
											message={field.state.meta.errors
												.map(e => e?.message)
												.join(', ')}
										/>
									</View>
								)}
							</form.Field>
							<X className="text-primary size-6" />
							<form.Field
								name="ratio"
								listeners={{
									onChange: e => {
										const coffeeIn = parseFloat(form.getFieldValue('coffeeIn'));
										const ratio = parseFloat(e.value);
										if (!coffeeIn) return;
										const waterIn = Math.round(coffeeIn * ratio);
										if (isNaN(waterIn)) return;
										form.setFieldValue('waterIn', waterIn.toString());
									},
								}}
							>
								{field => (
									<View className="flex-1">
										<RequiredLabel>Ratio</RequiredLabel>
										<MaskInput
											onChangeText={field.handleChange}
											value={field.state.value}
											mask={ratioMaskRegex}
											placeholder="00.00"
											keyboardType="numeric"
											className={timeMaskInputClassName}
										/>
										<ErrorMessage
											message={field.state.meta.errors
												.map(e => e?.message)
												.join(', ')}
										/>
									</View>
								)}
							</form.Field>
						</View>
						<form.Subscribe
							selector={state => [state.values.coffeeIn, state.values.ratio]}
						>
							{([coffeeIn, ratio]) => {
								const waterIn = Math.round(
									parseFloat(coffeeIn) * parseFloat(ratio)
								);
								return (
									<>
										<Label>Water in (g)</Label>
										<Input
											editable={false}
											editableShowPrimary
											value={waterIn ? waterIn.toString() : ''}
										/>
									</>
								);
							}}
						</form.Subscribe>
						<form.Field name="beverageWeight">
							{field => (
								<>
									<Label>Beverage weight (g)</Label>
									<Input
										numberOfLines={1}
										onChangeText={field.handleChange}
										value={field.state.value}
									/>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
								</>
							)}
						</form.Field>
						<form.Field name="brewTemperature">
							{field => (
								<>
									<RequiredLabel>Brew temperature (°C)</RequiredLabel>
									<Input
										numberOfLines={1}
										onChangeText={field.handleChange}
										keyboardType="numeric"
										value={field.state.value}
									/>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
								</>
							)}
						</form.Field>
						<form.Field name="brewerId">
							{field => (
								<>
									<RequiredLabel>Brewer</RequiredLabel>
									<SelectComponent
										placeholder="Select your brewer"
										portalHost={EDIT_POST_SELECT_PORTAL}
										options={brewers}
										onChange={field.handleChange}
										value={field.state.value}
									/>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
								</>
							)}
						</form.Field>
						<form.Field name="filterPaperId">
							{field => (
								<>
									<RequiredLabel>Filter paper</RequiredLabel>
									<SelectComponent
										placeholder="Select your filter paper"
										portalHost={EDIT_POST_SELECT_PORTAL}
										options={filterPapers}
										value={field.state.value}
										onChange={field.handleChange}
									/>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
								</>
							)}
						</form.Field>
						<form.Field name="grinderId">
							{field => (
								<>
									<RequiredLabel>Grinder</RequiredLabel>
									<SelectComponent
										placeholder="Select your grinder"
										portalHost={EDIT_POST_SELECT_PORTAL}
										options={grinders}
										value={field.state.value}
										onChange={field.handleChange}
									/>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
								</>
							)}
						</form.Field>
						<form.Field name="grindSetting">
							{field => (
								<>
									<RequiredLabel>Grind setting</RequiredLabel>
									<Input
										numberOfLines={1}
										onChangeText={field.handleChange}
										value={field.state.value}
									/>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
								</>
							)}
						</form.Field>
						<form.Field name="bloomTime">
							{field => (
								<>
									<RequiredLabel>Bloom time</RequiredLabel>
									<TimeMaskInput
										value={field.state.value}
										onChange={field.handleChange}
									/>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
								</>
							)}
						</form.Field>
						<form.Field name="totalDrawdownTime">
							{field => (
								<>
									<RequiredLabel>Total drawdown time</RequiredLabel>
									<TimeMaskInput
										value={field.state.value}
										onChange={field.handleChange}
									/>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
								</>
							)}
						</form.Field>
						<form.Field name="brewingWater">
							{field => (
								<>
									<Label>Brewing water (ppm)</Label>
									<Input
										numberOfLines={1}
										onChangeText={field.handleChange}
										value={field.state.value}
									/>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
								</>
							)}
						</form.Field>
						<form.Field name="methodName">
							{field => (
								<>
									<Label>Preparation</Label>
									<Input
										onChangeText={field.handleChange}
										value={field.state.value}
									/>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
								</>
							)}
						</form.Field>
						<form.Field name="otherTools">
							{field => (
								<>
									<Label>Other tools</Label>
									<Input
										onChangeText={field.handleChange}
										value={field.state.value}
									/>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
								</>
							)}
						</form.Field>
						<form.Field name="flavor">
							{field => (
								<>
									<Label>Flavor</Label>
									<Input
										onChangeText={field.handleChange}
										value={field.state.value}
									/>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
								</>
							)}
						</form.Field>
						<form.Field name="tds">
							{field => (
								<>
									<Label>TDS</Label>
									<Slider
										minimumValue={1.0}
										maximumValue={2.0}
										step={0.01}
										value={field.state.value}
										onValueChange={newValue => {
											field.handleChange(newValue);
											// Calculate and set EY when TDS changes
											const beverageWeight = parseFloat(
												form.getFieldValue('beverageWeight') || '0'
											);
											const coffeeIn = parseFloat(
												form.getFieldValue('coffeeIn') || '0'
											);
											if (beverageWeight && coffeeIn) {
												const ey = (newValue * beverageWeight) / coffeeIn;
												form.setFieldValue('ey', ey);
											}
										}}
									/>
									<Text>{field.state.value?.toFixed(2)}</Text>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
								</>
							)}
						</form.Field>
						<form.Field name="ey">
							{field => (
								<>
									<Label>Extraction Yield (%)</Label>
									<H4>{field.state.value?.toFixed(2)}%</H4>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
								</>
							)}
						</form.Field>
					</View>
				</KeyboardAwareScrollView>
				<KeyboardAwareScrollView key={2}>
					<View className="flex-1 px-10 mt-6 mb-12 gap-2">
						<form.Field name="recipeSteps">
							{field => (
								<>
									<RecipeStepsEditor
										steps={field.state.value}
										setSteps={field.handleChange}
									/>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
								</>
							)}
						</form.Field>
						<View className="h-5" />
					</View>
				</KeyboardAwareScrollView>
			</Pager>
			<WindowOverlay>
				<PortalHost name={EDIT_POST_SELECT_PORTAL} />
			</WindowOverlay>
			<BeanProfileListDialog
				control={beanProfileListDialogControl}
				params={{
					type: 'bean-profile-list',
					onSelect: handleBeanProfileSelect,
				}}
			/>
		</>
	);
}
const EDIT_POST_SELECT_PORTAL = 'edit-post-select';
