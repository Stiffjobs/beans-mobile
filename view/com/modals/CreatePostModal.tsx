import { Pressable, View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Label } from '~/components/ui/label';
import * as z from 'zod';
import { useForm } from '@tanstack/react-form';
import { Input } from '~/components/input/Input';
import Slider from '@react-native-community/slider';
import { GEAR_TYPE, RoastLevelEnum } from '~/lib/constants';
import { ErrorMessage } from '~/components/ErrorMessage';
import { createPostSchema } from '~/lib/schemas';
import { useCreatePost } from '~/state/queries/post';
import { openPicker } from '~/lib/media/picker';
import { usePhotoLibraryPermission } from '~/lib/hooks/usePermissions';
import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import { ComposerImage, createComposerImage } from '~/state/gallery';
import { composerReducer, initialPostDraft } from '../composer/state/composer';
import { Gallery } from '../composer/photos/Gallery';
import { useModalControls } from '~/state/modals';
import { Pager, PagerRef } from '../pager/Pager';
import { TimeMaskInput } from '../time/TimeMaskInput';
import { H4 } from '~/components/ui/typography';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { WindowOverlay } from '../util/WindowOverlay';
import { PortalHost } from '@rn-primitives/portal';
import { Separator } from '~/components/ui/separator';
import PagerView from 'react-native-pager-view';
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
import { RequiredLabel } from '~/components/RequiredLabel';
import { SelectRoastLevel } from '~/components/select/SelectRoastLevel';
import { RecipeStep, RecipeStepsEditor } from '~/components/RecipeStepsEditor';
import { useListGears } from '~/state/queries/gears';
import { SelectComponent } from '~/components/select/Select';
import {
	BeanProfileListDialog,
	useBeanProfileListDialogControl,
} from '~/components/BeanProfileListDialog';
import {
	GearSelectDialog,
	useGearSelectDialogControl,
} from '~/components/GearSelectDialog';
import { Id } from '~/convex/_generated/dataModel';
import { useListBeanProfiles } from '~/state/queries/bean_profiles';
import { ChevronDown } from '~/lib/icons/ChevronDown';
import { ImagePlus } from '~/lib/icons/ImagePlus';
import { X } from '~/lib/icons';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import MaskInput from 'react-native-mask-input';
import { ratioMaskRegex, timeMaskInputClassName } from '~/lib/utils';

const CUSTOM_PORTAL_HOST_NAME = 'modal-select';
const CUSTOM_PORTAL_DIALOG = 'dialog';

export const snapPoints = ['fullscreen'];

export function Component({ selectedDate }: { selectedDate: string }) {
	const form = useForm({
		defaultValues: {
			createdDate: selectedDate,
			bean: '',
			roastLevel: '',
			coffeeIn: '',
			ratio: '',
			beanProfile: '' as Id<'bean_profiles'>,
			beverageWeight: '',
			brewTemperature: '',
			waterIn: '',
			filterPaper: '',
			filterPaperId: '' as Id<'gears'>,
			grinder: '',
			grinderId: '' as Id<'gears'>,
			grindSetting: '',
			bloomTime: '',
			totalDrawdownTime: '',
			recipeSteps: [] as RecipeStep[],
			images: [] as ComposerImage[],
			brewingWater: '',
			methodName: '',
			brewer: '',
			brewerId: '' as Id<'gears'>,
			otherTools: '',
			flavor: '',
			tds: undefined,
			ey: undefined,
		} as z.infer<typeof createPostSchema>,
		onSubmit: async ({ value }) => {
			await createPostMutation.mutateAsync({
				...value,
				images: state.embed.media.images,
			});
		},
		validators: {
			onMount: createPostSchema,
		},
	});
	const [state, dispatch] = useReducer(composerReducer, initialPostDraft);
	const [gearType, setGearType] = React.useState<GEAR_TYPE | undefined>(
		undefined
	);
	const beanProfileListDialogControl = useBeanProfileListDialogControl();
	const brewerSelectDialogControl = useGearSelectDialogControl();
	const grinderSelectDialogControl = useGearSelectDialogControl();
	const filterPaperSelectDialogControl = useGearSelectDialogControl();

	const [activePage, setActivePage] = React.useState(0);
	const pagerRef = useRef<PagerRef>(null);

	const { requestPhotoAccessIfNeeded } = usePhotoLibraryPermission();
	const { closeModal } = useModalControls();

	const onOpenBeanProfileListDialog = useCallback(() => {
		beanProfileListDialogControl.open();
	}, [beanProfileListDialogControl]);

	const onOpenBrewerSelectDialog = useCallback(() => {
		brewerSelectDialogControl.open();
	}, [brewerSelectDialogControl]);

	const onOpenGrinderSelectDialog = useCallback(() => {
		grinderSelectDialogControl.open();
	}, [grinderSelectDialogControl]);

	const onOpenFilterPaperSelectDialog = useCallback(() => {
		filterPaperSelectDialogControl.open();
	}, [filterPaperSelectDialogControl]);

	const onOpenLibrary = React.useCallback(async () => {
		if (!(await requestPhotoAccessIfNeeded())) {
			return;
		}

		const items = await openPicker({
			selectionLimit: 4 - state.embed.media.images.length,
			allowsMultipleSelection: true,
		});

		const results = await Promise.all(
			items.map(item => createComposerImage(item))
		);

		dispatch({
			type: 'ADD_IMAGES',
			images: results,
		});
	}, [state.embed.media.images]);
	const fetchGearList = useListGears();
	const fetchBeanProfiles = useListBeanProfiles();
	const createPostMutation = useCreatePost();

	const isSecondPage = activePage === 1;

	const handleScrollPage = useCallback(
		(index: number) => {
			pagerRef.current?.setPage(index);
		},
		[pagerRef]
	);

	const handleBeanProfileSelect = useCallback(
		(beanProfile: Id<'bean_profiles'>) => {
			form.setFieldValue('beanProfile', beanProfile);
		},
		[form]
	);

	return (
		<>
			<View className="flex flex-row justify-between p-4 items-center  bg-background">
				{isSecondPage ? (
					<Button onPress={() => handleScrollPage(0)} size="sm" variant="ghost">
						<Text>{t`Prev`}</Text>
					</Button>
				) : (
					<Button onPress={closeModal} variant={'ghost'} size="sm">
						<Text className="text-destructive">{t`Cancel`}</Text>
					</Button>
				)}
				<Text>{activePage + 1} / 2</Text>
				{isSecondPage ? (
					<form.Subscribe selector={state => [state.canSubmit, state.isValid]}>
						{([canSubmit, isValid]) => (
							<Button
								disabled={!isValid && !canSubmit}
								onPress={() => form.handleSubmit()}
								size="sm"
							>
								<Text>{t`Post`}</Text>
							</Button>
						)}
					</form.Subscribe>
				) : (
					<Button
						size="sm"
						variant={'secondary'}
						onPress={() => handleScrollPage(1)}
					>
						<Text>{t`Next`}</Text>
					</Button>
				)}
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
						<Label>{t`Created on`}</Label>
						<H4>{selectedDate}</H4>
						<Trans>
							<Text className="text-sm text-muted-foreground mb-2">
								Fields marked with <Text className="text-destructive">*</Text>{' '}
								are required
							</Text>
						</Trans>
						<form.Field name="beanProfile">
							{field => {
								return (
									<>
										<RequiredLabel>{t`Bean profile`}</RequiredLabel>
										<Pressable onPressIn={onOpenBeanProfileListDialog}>
											<View className="flex flex-row h-10 native:h-12 items-center justify-between rounded-md border border-input bg-background px-3 py-2 ">
												<Text className="native:text-lg text-sm text-foreground">
													{fetchBeanProfiles?.data?.find(
														e => e._id === field.state.value
													)?.origin ?? t`Select a bean profile`}
												</Text>
												<ChevronDown
													size={16}
													aria-hidden={true}
													className="text-foreground opacity-50"
												/>
											</View>
										</Pressable>
										<ErrorMessage
											message={field.state.meta.errors
												.map(e => e?.message)
												.join(', ')}
										/>
									</>
								);
							}}
						</form.Field>
						<form.Field name="roastLevel">
							{field => (
								<>
									<RequiredLabel>{t`Roast level`}</RequiredLabel>
									<SelectRoastLevel
										portalHost={CUSTOM_PORTAL_HOST_NAME}
										placeholder={t`Select a roast level`}
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
										<RequiredLabel>{t`Coffee in (g)`}</RequiredLabel>
										<Input
											numberOfLines={1}
											keyboardType="numeric"
											value={field.state.value}
											onChangeText={field.handleChange}
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
										<RequiredLabel>{t`Ratio`}</RequiredLabel>
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
										<Label>{t`Water in (g)`}</Label>
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
									<Label>{t`Beverage weight (g)`}</Label>
									<Input
										numberOfLines={1}
										value={field.state.value}
										onChangeText={field.handleChange}
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
									<RequiredLabel>{t`Brew temperature (°C)`}</RequiredLabel>
									<Input
										numberOfLines={1}
										value={field.state.value}
										onChangeText={field.handleChange}
										keyboardType="numeric"
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
									<RequiredLabel>{t`Brewer`}</RequiredLabel>
									<Pressable onPressIn={onOpenBrewerSelectDialog}>
										<View className="flex flex-row h-10 native:h-12 items-center justify-between rounded-md border border-input bg-background px-3 py-2 ">
											<Text className="native:text-lg text-sm text-foreground">
												{fetchGearList?.data?.find(
													e => e._id === field.state.value
												)?.name ?? t`Select your brewers`}
											</Text>
											<ChevronDown
												size={16}
												aria-hidden={true}
												className="text-foreground opacity-50"
											/>
										</View>
									</Pressable>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
									<GearSelectDialog
										control={brewerSelectDialogControl}
										params={{
											type: 'gear-select',
											gearType: GEAR_TYPE.Brewer,
											onSelect: field.handleChange,
											selected: field.state.value,
										}}
									/>
								</>
							)}
						</form.Field>
						<form.Field name="filterPaperId">
							{field => (
								<>
									<RequiredLabel>{t`Filter paper`}</RequiredLabel>
									<Pressable onPressIn={onOpenFilterPaperSelectDialog}>
										<View className="flex flex-row h-10 native:h-12 items-center justify-between rounded-md border border-input bg-background px-3 py-2 ">
											<Text className="native:text-lg text-sm text-foreground">
												{fetchGearList?.data?.find(
													e => e._id === field.state.value
												)?.name ?? t`Select your filter paper`}
											</Text>
											<ChevronDown
												size={16}
												aria-hidden={true}
												className="text-foreground opacity-50"
											/>
										</View>
									</Pressable>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
									<GearSelectDialog
										control={filterPaperSelectDialogControl}
										params={{
											type: 'gear-select',
											gearType: GEAR_TYPE['Filter paper'],
											onSelect: field.handleChange,
											selected: field.state.value,
										}}
									/>
								</>
							)}
						</form.Field>
						<form.Field name="grinderId">
							{field => (
								<>
									<RequiredLabel>{t`Grinder`}</RequiredLabel>
									<Pressable onPressIn={onOpenGrinderSelectDialog}>
										<View className="flex flex-row h-10 native:h-12 items-center justify-between rounded-md border border-input bg-background px-3 py-2 ">
											<Text className="native:text-lg text-sm text-foreground">
												{fetchGearList?.data?.find(
													e => e._id === field.state.value
												)?.name ?? t`Select your grinder`}
											</Text>
											<ChevronDown
												size={16}
												aria-hidden={true}
												className="text-foreground opacity-50"
											/>
										</View>
									</Pressable>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
									<GearSelectDialog
										control={grinderSelectDialogControl}
										params={{
											type: 'gear-select',
											gearType: GEAR_TYPE.Grinder,
											onSelect: field.handleChange,
											selected: field.state.value,
										}}
									/>
								</>
							)}
						</form.Field>
						<form.Field name="grindSetting">
							{field => (
								<>
									<RequiredLabel>{t`Grind setting`}</RequiredLabel>
									<Input
										value={field.state.value}
										onChangeText={field.handleChange}
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
									<RequiredLabel>{t`Bloom time`}</RequiredLabel>
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
									<RequiredLabel>{t`Total drawdown time`}</RequiredLabel>
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
									<Label>{t`Brewing water (ppm)`}</Label>
									<Input
										numberOfLines={1}
										value={field.state.value}
										onChangeText={field.handleChange}
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
									<Label>{t`Preparation`}</Label>
									<Input
										value={field.state.value}
										onChangeText={field.handleChange}
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
									<Label>{t`Other tools`}</Label>
									<Input
										value={field.state.value}
										onChangeText={field.handleChange}
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
									<Label>{t`Flavor`}</Label>
									<Input
										value={field.state.value}
										onChangeText={field.handleChange}
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
									<Label>{t`TDS`}</Label>
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
									<Label>{t`Extraction Yield (%)`}</Label>
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
						<Label>{t`Images`}</Label>
						<Gallery
							dispatch={dispatch}
							images={state.embed?.media?.images ?? []}
						/>
						<Button variant={'outline'} onPress={onOpenLibrary}>
							<View className="flex-row items-center gap-2">
								<ImagePlus className="text-primary size-6" />
								<Text>{t`Select Images`}</Text>
							</View>
						</Button>
						<View className="h-5" />
						<Dialog>
							<DialogTrigger asChild>
								<Button variant="destructive">
									<Text>{t`Discard post`}</Text>
								</Button>
							</DialogTrigger>
							<DialogContent
								portalHost={CUSTOM_PORTAL_DIALOG}
								className="sm:max-w-[425px]"
							>
								<DialogHeader>
									<DialogTitle>{t`Discard Post`}</DialogTitle>
									<DialogDescription>
										{t`Are you sure to discard this post?`}
									</DialogDescription>
								</DialogHeader>
								<DialogFooter>
									<Button onPress={closeModal} variant="destructive">
										<Text>{t`Discard`}</Text>
									</Button>
									<DialogClose asChild>
										<Button>
											<Text>{t`Cancel`}</Text>
										</Button>
									</DialogClose>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</View>
				</KeyboardAwareScrollView>
			</Pager>
			<WindowOverlay>
				<PortalHost name={CUSTOM_PORTAL_HOST_NAME} />
				<PortalHost name={CUSTOM_PORTAL_DIALOG} />
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
