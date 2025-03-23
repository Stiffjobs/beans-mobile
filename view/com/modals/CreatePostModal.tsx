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
import { StyledIcon } from '../icons/StyledIcons';
import { Pager } from '../pager/Pager';
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
import { Id } from '~/convex/_generated/dataModel';
import { useListBeanProfiles } from '~/state/queries/bean_profiles';
import { ChevronDown } from '~/lib/icons/ChevronDown';

const CUSTOM_PORTAL_HOST_NAME = 'modal-select';
const CUSTOM_PORTAL_DIALOG = 'dialog';

type FormFields = z.infer<typeof createPostSchema>;

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
			filterPaper: '',
			grinder: '',
			grindSetting: '',
			bloomTime: '',
			totalDrawdownTime: '',
			recipeSteps: [] as RecipeStep[],
			images: [] as ComposerImage[],
			brewingWater: '',
			methodName: '',
			brewer: '',
			otherTools: '',
			flavor: '',
			tds: undefined,
			ey: undefined,
		} as z.infer<typeof createPostSchema>,
		onSubmit: async ({ value }) => {
			console.log('data', value);
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
	const beanProfileListDialogControl = useBeanProfileListDialogControl();

	const [activePage, setActivePage] = React.useState(0);
	const pagerRef = useRef<PagerView>(null);

	const { requestPhotoAccessIfNeeded } = usePhotoLibraryPermission();
	const { closeModal } = useModalControls();

	const onOpenBeanProfileListDialog = useCallback(() => {
		beanProfileListDialogControl.open();
	}, [beanProfileListDialogControl]);

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
	const brewers =
		fetchGearList.data
			?.filter(gear => gear.type === GEAR_TYPE.Brewer)
			.map(e => ({
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
				label: e.name,
				value: e.name,
			})) ?? [];
	const createPostMutation = useCreatePost();

	useEffect(() => {
		console.log('errors', form.state.errors.join(', '));
	}, [form.state.errors.join(', ')]);

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
						<Text>Prev</Text>
					</Button>
				) : (
					<Button onPress={closeModal} variant={'ghost'} size="sm">
						<Text className="text-destructive">Cancel</Text>
					</Button>
				)}
				<Text>{activePage + 1} / 2</Text>
				{isSecondPage ? (
					<Button onPress={() => form.handleSubmit()} size="sm">
						<Text>Post</Text>
					</Button>
				) : (
					<Button
						size="sm"
						variant={'secondary'}
						onPress={() => handleScrollPage(1)}
					>
						<Text>Next</Text>
					</Button>
				)}
			</View>
			<Separator />
			<Pager
				ref={pagerRef}
				onPageSelected={index => {
					setActivePage(index);
				}}
				initialPage={activePage}
			>
				<KeyboardAwareScrollView key={1}>
					<View className="flex-1 px-10 mt-6 mb-20 gap-2">
						<Label>Created on</Label>
						<H4>{selectedDate}</H4>
						<Text className="text-sm text-muted-foreground mb-2">
							Fields marked with <Text className="text-destructive">*</Text> are
							required
						</Text>
						<form.Field name="beanProfile">
							{field => {
								return (
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
								);
							}}
						</form.Field>
						<form.Field name="roastLevel">
							{field => (
								<>
									<RequiredLabel>Roast level</RequiredLabel>
									<SelectRoastLevel
										portalHost={CUSTOM_PORTAL_HOST_NAME}
										placeholder="Select a roast level"
										options={Object.values(RoastLevelEnum).map(value => ({
											label: value,
											value: value,
										}))}
										onChange={field.handleChange}
									/>
									<ErrorMessage message={field.state.meta.errors.join(', ')} />
								</>
							)}
						</form.Field>
						<form.Field name="coffeeIn">
							{field => (
								<>
									<RequiredLabel>Coffee in (g)</RequiredLabel>
									<Input
										numberOfLines={1}
										value={field.state.value}
										onChangeText={field.handleChange}
									/>
									<ErrorMessage message={field.state.meta.errors.join(', ')} />
								</>
							)}
						</form.Field>
						<form.Field name="ratio">
							{field => (
								<>
									<RequiredLabel>Ratio</RequiredLabel>
									<Input
										numberOfLines={1}
										value={field.state.value}
										onChangeText={field.handleChange}
									/>
									<ErrorMessage message={field.state.meta.errors.join(', ')} />
								</>
							)}
						</form.Field>
						<form.Field name="beverageWeight">
							{field => (
								<>
									<RequiredLabel>Beverage weight(g)</RequiredLabel>
									<Input
										numberOfLines={1}
										value={field.state.value}
										onChangeText={field.handleChange}
									/>
									<ErrorMessage message={field.state.meta.errors.join(', ')} />
								</>
							)}
						</form.Field>
						<form.Field name="brewTemperature">
							{field => (
								<>
									<RequiredLabel>Brew temperature (°C)</RequiredLabel>
									<Input
										numberOfLines={1}
										value={field.state.value}
										onChangeText={field.handleChange}
										keyboardType="numeric"
									/>
									<ErrorMessage message={field.state.meta.errors.join(', ')} />
								</>
							)}
						</form.Field>
						<form.Field name="brewer">
							{field => (
								<>
									<RequiredLabel>Brewer</RequiredLabel>
									<SelectComponent
										placeholder="Select your brewers"
										portalHost={CUSTOM_PORTAL_HOST_NAME}
										onChange={field.handleChange}
										options={brewers}
									/>
									<ErrorMessage message={field.state.meta.errors.join(', ')} />
								</>
							)}
						</form.Field>
						<form.Field name="filterPaper">
							{field => (
								<>
									<RequiredLabel>Filter paper</RequiredLabel>
									<SelectComponent
										placeholder="Select your filter paper"
										portalHost={CUSTOM_PORTAL_HOST_NAME}
										options={filterPapers}
										onChange={field.handleChange}
									/>
									<ErrorMessage message={field.state.meta.errors.join(', ')} />
								</>
							)}
						</form.Field>
						<form.Field name="grinder">
							{field => (
								<>
									<RequiredLabel>Grinder</RequiredLabel>
									<SelectComponent
										placeholder="Select your grinder"
										portalHost={CUSTOM_PORTAL_HOST_NAME}
										options={grinders}
										onChange={field.handleChange}
									/>
									<ErrorMessage message={field.state.meta.errors.join(', ')} />
								</>
							)}
						</form.Field>
						<form.Field name="grindSetting">
							{field => (
								<>
									<RequiredLabel>Grind setting</RequiredLabel>
									<Input
										value={field.state.value}
										onChangeText={field.handleChange}
									/>
									<ErrorMessage message={field.state.meta.errors.join(', ')} />
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
									<ErrorMessage message={field.state.meta.errors.join(', ')} />
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
									<ErrorMessage message={field.state.meta.errors.join(', ')} />
								</>
							)}
						</form.Field>
						<form.Field name="brewingWater">
							{field => (
								<>
									<Label>Brewing water (ppm)</Label>
									<Input
										numberOfLines={1}
										value={field.state.value}
										onChangeText={field.handleChange}
									/>
									<ErrorMessage message={field.state.meta.errors.join(', ')} />
								</>
							)}
						</form.Field>
						<form.Field name="methodName">
							{field => (
								<>
									<Label>Preparation</Label>
									<Input
										value={field.state.value}
										onChangeText={field.handleChange}
									/>
									<ErrorMessage message={field.state.meta.errors.join(', ')} />
								</>
							)}
						</form.Field>
						<form.Field name="otherTools">
							{field => (
								<>
									<Label>Other tools</Label>
									<Input
										value={field.state.value}
										onChangeText={field.handleChange}
									/>
									<ErrorMessage message={field.state.meta.errors.join(', ')} />
								</>
							)}
						</form.Field>
						<form.Field name="flavor">
							{field => (
								<>
									<Label>Flavor</Label>
									<Input
										value={field.state.value}
										onChangeText={field.handleChange}
									/>
									<ErrorMessage message={field.state.meta.errors.join(', ')} />
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
									<ErrorMessage message={field.state.meta.errors.join(', ')} />
								</>
							)}
						</form.Field>
						<form.Field name="ey">
							{field => (
								<>
									<Label>Extraction Yield (%)</Label>
									<H4>{field.state.value?.toFixed(2)}%</H4>
									<ErrorMessage message={field.state.meta.errors.join(', ')} />
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
									<ErrorMessage message={field.state.meta.errors.join(', ')} />
								</>
							)}
						</form.Field>
						<Label>Images</Label>
						<Gallery
							dispatch={dispatch}
							images={state.embed?.media?.images ?? []}
						/>
						<Button variant={'outline'} onPress={onOpenLibrary}>
							<View className="flex-row items-center gap-2">
								<StyledIcon name="ImagePlus" className="size-6 text-primary" />
								<Text>Select Images</Text>
							</View>
						</Button>
						<View className="h-5" />
						<Dialog>
							<DialogTrigger asChild>
								<Button variant="destructive">
									<Text>Discard post</Text>
								</Button>
							</DialogTrigger>
							<DialogContent
								portalHost={CUSTOM_PORTAL_DIALOG}
								className="sm:max-w-[425px]"
							>
								<DialogHeader>
									<DialogTitle>Discard Post</DialogTitle>
									<DialogDescription>
										Are you sure to discard this post?
									</DialogDescription>
								</DialogHeader>
								<DialogFooter>
									<Button onPress={closeModal} variant="destructive">
										<Text>Discard</Text>
									</Button>
									<DialogClose asChild>
										<Button>
											<Text>Cancel</Text>
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
				}}
				onSelect={handleBeanProfileSelect}
			/>
		</>
	);
}
