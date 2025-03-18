import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Label } from '~/components/ui/label';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '~/components/input/Input';
import Slider from '@react-native-community/slider';
import { GEAR_TYPE, RoastLevelEnum } from '~/lib/constants';
import { ErrorMessage } from '~/components/ErrorMessage';
import { createPostSchema } from '~/lib/schemas';
import { useCreatePost } from '~/state/queries/post';
import { openPicker } from '~/lib/media/picker';
import { usePhotoLibraryPermission } from '~/lib/hooks/usePermissions';
import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import { createComposerImage } from '~/state/gallery';
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
import { RecipeStepsEditor } from '~/components/RecipeStepsEditor';
import { useListGears } from '~/state/queries/gears';
import { SelectComponent } from '~/components/select/Select';

type FormFields = z.infer<typeof createPostSchema>;

export const snapPoints = ['fullscreen'];
export function Component({ selectedDate }: { selectedDate: string }) {
	const form = useForm<FormFields>({
		resolver: zodResolver(createPostSchema),
		defaultValues: {
			createdDate: selectedDate,
			recipeSteps: [],
			images: [],
		},
	});
	const [state, dispatch] = useReducer(composerReducer, initialPostDraft);

	const [activePage, setActivePage] = React.useState(0);
	const pagerRef = useRef<PagerView>(null);

	const { requestPhotoAccessIfNeeded } = usePhotoLibraryPermission();
	const { closeModal } = useModalControls();

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
	async function onSubmit(values: FormFields) {
		console.log('data', values);
		await createPostMutation.mutateAsync({
			...values,
			ey: values.ey,
			images: state.embed.media.images,
		});
	}

	useEffect(() => {
		console.log('errors', form.formState.errors);
	}, [form.formState.errors]);

	const isSecondPage = activePage === 1;

	const handleScrollPage = useCallback(
		(index: number) => {
			pagerRef.current?.setPage(index);
		},
		[pagerRef]
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
					<Button onPress={form.handleSubmit(onSubmit)} size="sm">
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
						<Controller
							control={form.control}
							name="bean"
							render={({ field: { onChange } }) => {
								return (
									<>
										<RequiredLabel>Bean</RequiredLabel>
										<Input onChangeText={onChange} />
										{form.formState.errors?.bean && (
											<ErrorMessage
												message={form.formState?.errors?.bean.message}
											/>
										)}
									</>
								);
							}}
						/>
						<Controller
							control={form.control}
							name="roastLevel"
							render={({ field: { onChange } }) => (
								<>
									<RequiredLabel>Roast level</RequiredLabel>
									<SelectRoastLevel
										portalHost={CUSTOM_PORTAL_HOST_NAME}
										placeholder="Select a roast level"
										options={Object.values(RoastLevelEnum).map(value => ({
											label: value,
											value: value,
										}))}
										onChange={onChange}
									/>
									{form.formState.errors.roastLevel && (
										<ErrorMessage
											message={form.formState.errors.roastLevel.message}
										/>
									)}
								</>
							)}
						/>
						<Controller
							control={form.control}
							name="coffeeIn"
							render={({ field: { onChange } }) => (
								<>
									<RequiredLabel>Coffee in (g)</RequiredLabel>
									<Input numberOfLines={1} onChangeText={onChange} />
									{form.formState.errors.coffeeIn && (
										<ErrorMessage
											message={form.formState.errors.coffeeIn.message}
										/>
									)}
								</>
							)}
						/>
						<Controller
							control={form.control}
							name="ratio"
							render={({ field: { onChange } }) => (
								<>
									<RequiredLabel>Ratio</RequiredLabel>
									<Input numberOfLines={1} onChangeText={onChange} />
									{form.formState.errors.ratio && (
										<ErrorMessage
											message={form.formState.errors.coffeeIn?.message}
										/>
									)}
								</>
							)}
						/>
						<Controller
							control={form.control}
							name="beverageWeight"
							render={({ field: { onChange } }) => (
								<>
									<RequiredLabel>Beverage weight(g)</RequiredLabel>
									<Input numberOfLines={1} onChangeText={onChange} />
									{form.formState.errors.beverageWeight && (
										<ErrorMessage
											message={form.formState.errors.beverageWeight.message}
										/>
									)}
								</>
							)}
						/>
						<Controller
							control={form.control}
							name="brewTemperature"
							render={({ field: { onChange } }) => (
								<>
									<RequiredLabel>Brew temperature (°C)</RequiredLabel>
									<Input
										numberOfLines={1}
										onChangeText={onChange}
										keyboardType="numeric"
									/>
									{form.formState.errors.brewTemperature && (
										<ErrorMessage
											message={form.formState.errors.brewTemperature.message}
										/>
									)}
								</>
							)}
						/>
						{/* TODO: this should look like a dropdown with options */}
						<Controller
							name="filterPaper"
							control={form.control}
							render={({ field: { onChange } }) => (
								<>
									<RequiredLabel>Filter paper</RequiredLabel>
									<SelectComponent
										placeholder="Select your filter paper"
										portalHost={CUSTOM_PORTAL_HOST_NAME}
										options={filterPapers}
										onChange={onChange}
									/>
									{form.formState.errors.filterPaper && (
										<ErrorMessage
											message={form.formState.errors.filterPaper.message}
										/>
									)}
								</>
							)}
						/>
						{/* TODO: this should look like a dropdown with options */}
						<Controller
							control={form.control}
							name="grinder"
							render={({ field: { onChange } }) => (
								<>
									<RequiredLabel>Grinder</RequiredLabel>
									<SelectComponent
										placeholder="Select your grinder"
										portalHost={CUSTOM_PORTAL_HOST_NAME}
										options={grinders}
										onChange={onChange}
									/>
									{form.formState.errors.grinder && (
										<ErrorMessage
											message={form.formState.errors.grinder.message}
										/>
									)}
								</>
							)}
						/>
						{/* TODO: this should look like  */}
						<Controller
							control={form.control}
							name="grindSetting"
							render={({ field: { onChange, value } }) => (
								<>
									<RequiredLabel>Grind setting</RequiredLabel>
									<Input value={value} onChangeText={onChange} />
									{form.formState.errors.grindSetting && (
										<ErrorMessage
											message={form.formState.errors.grindSetting.message}
										/>
									)}
								</>
							)}
						/>
						<Controller
							control={form.control}
							name="bloomTime"
							render={({ field: { onChange, value } }) => {
								return (
									<>
										<RequiredLabel>Bloom time</RequiredLabel>
										<TimeMaskInput value={value} onChange={onChange} />
										{form.formState.errors.bloomTime && (
											<ErrorMessage
												message={form.formState.errors.bloomTime.message}
											/>
										)}
									</>
								);
							}}
						/>
						<Controller
							control={form.control}
							name="totalDrawdownTime"
							render={({ field: { onChange, value } }) => {
								return (
									<>
										<RequiredLabel>Total drawdown time</RequiredLabel>
										<TimeMaskInput value={value} onChange={onChange} />
										{form.formState.errors.totalDrawdownTime && (
											<ErrorMessage
												message={
													form.formState.errors.totalDrawdownTime.message
												}
											/>
										)}
									</>
								);
							}}
						/>
						{/* INFO: under is for optional fields */}
						<Controller
							control={form.control}
							name="brewer"
							render={({ field: { onChange } }) => (
								<>
									<Label>Brewer</Label>
									<SelectComponent
										placeholder="Select your brewers"
										portalHost={CUSTOM_PORTAL_HOST_NAME}
										onChange={onChange}
										options={brewers}
									/>
									{form.formState.errors.brewer && (
										<ErrorMessage
											message={form.formState.errors.brewer.message}
										/>
									)}
								</>
							)}
						/>
						<Controller
							control={form.control}
							name="brewingWater"
							render={({ field: { onChange } }) => (
								<>
									<Label>Brewing water (ppm)</Label>
									<Input numberOfLines={1} onChangeText={onChange} />
									{form.formState.errors.brewingWater && (
										<ErrorMessage
											message={form.formState.errors.brewingWater.message}
										/>
									)}
								</>
							)}
						/>
						<Controller
							control={form.control}
							name="methodName"
							render={({ field: { onChange } }) => (
								<>
									<Label>Preparation</Label>
									<Input onChangeText={onChange} />
									{form.formState.errors.methodName && (
										<ErrorMessage
											message={form.formState.errors.methodName.message}
										/>
									)}
								</>
							)}
						/>
						<Controller
							control={form.control}
							name="otherTools"
							render={({ field: { onChange } }) => (
								<>
									<Label>Other tools</Label>
									<Input onChangeText={onChange} />
									{form.formState.errors.otherTools && (
										<ErrorMessage
											message={form.formState.errors.otherTools.message}
										/>
									)}
								</>
							)}
						/>
						<Controller
							control={form.control}
							name="flavor"
							render={({ field: { onChange } }) => (
								<>
									<Label>Flavor</Label>
									<Input onChangeText={onChange} />
									{form.formState.errors.flavor && (
										<ErrorMessage
											message={form.formState.errors.flavor?.message}
										/>
									)}
								</>
							)}
						/>
						<Controller
							control={form.control}
							name="tds"
							render={({ field: { onChange, value } }) => (
								<>
									<Label>TDS</Label>
									<Slider
										minimumValue={1.0}
										maximumValue={2.0}
										step={0.01}
										onValueChange={newValue => {
											onChange(newValue);
											// Calculate and set EY when TDS changes
											const beverageWeight = parseFloat(
												form.getValues('beverageWeight') || '0'
											);
											const coffeeIn = parseFloat(
												form.getValues('coffeeIn') || '0'
											);
											if (beverageWeight && coffeeIn) {
												const ey = (newValue * beverageWeight) / coffeeIn;
												form.setValue('ey', ey);
											}
										}}
									/>
									<Text>{value?.toFixed(2)}</Text>
									{form.formState.errors.tds && (
										<ErrorMessage message={form.formState.errors.tds.message} />
									)}
								</>
							)}
						/>
						<Controller
							control={form.control}
							name="ey"
							render={({ field: { value } }) => (
								<>
									<Label>Extraction Yield (%)</Label>
									<H4>{value?.toFixed(2)}%</H4>
									{form.formState.errors.ey && (
										<ErrorMessage message={form.formState.errors.ey.message} />
									)}
								</>
							)}
						/>
					</View>
				</KeyboardAwareScrollView>
				<KeyboardAwareScrollView key={2}>
					<View className="flex-1 px-10 mt-6 mb-12 gap-2">
						<Controller
							control={form.control}
							name="recipeSteps"
							render={({ field: { onChange, value } }) => (
								<>
									<RecipeStepsEditor steps={value} setSteps={onChange} />
									{form.formState.errors.recipeSteps && (
										<ErrorMessage
											message={form.formState.errors.recipeSteps.message}
										/>
									)}
								</>
							)}
						/>
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
		</>
	);
}

const CUSTOM_PORTAL_HOST_NAME = 'modal-select';
const CUSTOM_PORTAL_DIALOG = 'dialog';
