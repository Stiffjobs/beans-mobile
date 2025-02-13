import { FlatList, View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Label } from '~/components/ui/label';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '~/components/ui/input';
import Slider from '@react-native-community/slider';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoastLevel, RoastLevelEnum } from '~/lib/constants';
import { ErrorMessage } from '~/components/ErrorMessage';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { createPostSchema } from '~/lib/schemas';
import { useCreatePost } from '~/state/queries/post';
import { openPicker } from '~/lib/media/picker';
import { usePhotoLibraryPermission } from '~/lib/hooks/usePermissions';
import React, { useEffect, useReducer } from 'react';
import { createComposerImage } from '~/state/gallery';
import { composerReducer, initialPostDraft } from '../composer/state/composer';
import { Gallery } from '../composer/photos/Gallery';
import { useModalControls } from '~/state/modals';
import { StyledIcon } from '../icons/StyledIcons';
import { parseRecipeTime } from '~/lib/recipes/utils';
import { formatRecipeTime } from '~/lib/recipes/utils';
import { Textarea } from '~/components/ui/textarea';
import { Pager } from '../pager/Pager';
import { TimeMaskInput } from '../time/TimeMaskInput';
import { H4 } from '~/components/ui/typography';

type FormFields = z.infer<typeof createPostSchema>;

export const snapPoints = ['90%'];
export function Component() {
	const form = useForm<FormFields>({
		resolver: zodResolver(createPostSchema),
		defaultValues: {
			steps: [],
			images: [],
		},
	});
	const [state, dispatch] = useReducer(composerReducer, initialPostDraft);

	const [activePage, setActivePage] = React.useState(0);

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

	return (
		<>
			<View className="flex flex-row justify-between px-4 py-2 items-center border-b-hairline border-b-gray-300">
				<Button onPress={closeModal} variant={'ghost'} size="sm">
					<Text className="text-red-600">Cancel</Text>
				</Button>
				<Text>{activePage + 1} / 2</Text>
				<Button
					onPress={form.handleSubmit(onSubmit)}
					className="rounded-full"
					size="sm"
				>
					<Text>Post</Text>
				</Button>
			</View>
			<Pager
				onPageSelected={index => {
					setActivePage(index);
				}}
				initialPage={activePage}
			>
				<BottomSheetScrollView key={1} style={{ flex: 1 }}>
					<View className="flex-1 px-10 mt-6 mb-12 gap-2">
						<Controller
							control={form.control}
							name="bean"
							render={({ field: { onChange } }) => {
								return (
									<>
										<Label>Bean</Label>
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
							name="flavor"
							render={({ field: { onChange } }) => {
								return (
									<>
										<Label>Flavor profile</Label>
										<Input onChangeText={onChange} />
									</>
								);
							}}
						/>
						{form.formState.errors?.flavor && (
							<ErrorMessage message={form.formState?.errors?.flavor.message} />
						)}
						<Controller
							control={form.control}
							name="roastLevel"
							render={({ field: { onChange } }) => (
								<>
									<Label>Roast level</Label>
									<SelectComponent
										placeholder="Select a roast level"
										options={[
											{
												label: RoastLevelEnum.Light,
												value: RoastLevelEnum.Light,
											},
											{
												label: RoastLevelEnum.Medium,
												value: RoastLevelEnum.Medium,
											},
											{
												label: RoastLevelEnum.Dark,
												value: RoastLevelEnum.Dark,
											},
										]}
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
									<Label>Coffee in</Label>
									<Input onChangeText={onChange} />
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
									<Label>Ratio</Label>
									<Input onChangeText={onChange} />
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
									<Label>Beverage weight(g)</Label>
									<Input onChangeText={onChange} />
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
								</>
							)}
						/>
						<Controller
							control={form.control}
							name="brewTemperature"
							render={({ field: { onChange } }) => (
								<>
									<Label>Brew temperature (°C)</Label>
									<Input onChangeText={onChange} keyboardType="numeric" />
									{form.formState.errors.brewTemperature && (
										<ErrorMessage
											message={form.formState.errors.brewTemperature.message}
										/>
									)}
								</>
							)}
						/>
						<Controller
							control={form.control}
							name="preparationMethod"
							render={({ field: { onChange } }) => (
								<>
									<Label>Preparation method</Label>
									<Input onChangeText={onChange} />
									{form.formState.errors.preparationMethod && (
										<ErrorMessage
											message={form.formState.errors.preparationMethod.message}
										/>
									)}
								</>
							)}
						/>
						{/* TODO: this should look like a dropdown with options */}
						<Controller
							control={form.control}
							name="others"
							render={({ field: { onChange } }) => (
								<>
									<Label>Others</Label>
									<Input onChangeText={onChange} />
									{form.formState.errors.others && (
										<ErrorMessage
											message={form.formState.errors.others.message}
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
									<Label>Filter paper</Label>
									<Input onChangeText={onChange} />
									{form.formState.errors.filterPaper && (
										<ErrorMessage
											message={form.formState.errors.filterPaper.message}
										/>
									)}
								</>
							)}
						/>
						<Controller
							control={form.control}
							name="water"
							render={({ field: { onChange } }) => (
								<>
									<Label>Water</Label>
									<Input onChangeText={onChange} />
									{form.formState.errors.water && (
										<ErrorMessage
											message={form.formState.errors.water.message}
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
									<Label>Grinder</Label>
									<Input onChangeText={onChange} />
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
							render={({ field: { onChange } }) => (
								<>
									<Label>Grind setting</Label>
									<Input onChangeText={onChange} />
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
							name="profile"
							render={({ field: { onChange } }) => (
								<>
									<Label>Profile</Label>
									<Input onChangeText={onChange} />
									{form.formState.errors.profile && (
										<ErrorMessage
											message={form.formState.errors.profile.message}
										/>
									)}
								</>
							)}
						/>
						<Controller
							control={form.control}
							name="time"
							render={({ field: { onChange, value } }) => {
								return (
									<>
										<Label>Time</Label>
										<TimeMaskInput value={value} onChange={onChange} />
										{form.formState.errors.time && (
											<ErrorMessage
												message={form.formState.errors.time.message}
											/>
										)}
									</>
								);
							}}
						/>
						{/* TODO: this should look like time picker  */}
						<Controller
							control={form.control}
							name="bloomTime"
							render={({ field: { onChange, value } }) => {
								return (
									<>
										<Label>Bloom time</Label>
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
						{/* TODO: this should look like a list of badges to toggle selection */}
						<Controller
							control={form.control}
							name="preparationTools"
							render={({ field: { onChange } }) => (
								<>
									<Label>Preparation tools</Label>
									<Textarea onChangeText={onChange} />
									{form.formState.errors.preparationTools && (
										<ErrorMessage
											message={form.formState.errors.preparationTools.message}
										/>
									)}
								</>
							)}
						/>
					</View>
				</BottomSheetScrollView>
				<BottomSheetScrollView key={2} className="flex-1">
					<View className="flex-1 px-10 mt-6 mb-12 gap-2">
						<Controller
							control={form.control}
							name="steps"
							render={({ field: { onChange, value } }) => (
								<>
									<RecipeStepsEditor steps={value} setSteps={onChange} />
									{form.formState.errors.steps && (
										<ErrorMessage
											message={form.formState.errors.steps.message}
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
						<Button size={'sm'} variant={'outline'} onPress={onOpenLibrary}>
							<View className="flex-row items-center gap-2">
								<StyledIcon
									name="ImagePlus"
									className="w-6 aspect-square color-gray-600"
								/>
								<Text>Select Images</Text>
							</View>
						</Button>
					</View>
				</BottomSheetScrollView>
			</Pager>
		</>
	);
}

function SelectComponent({
	placeholder,
	options,
	onChange,
}: {
	onChange: (...event: any[]) => void;
	placeholder?: string;
	options: RoastLevel[];
}) {
	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 12,
		right: 12,
	};
	return (
		<>
			<Select onValueChange={val => onChange(val?.value)}>
				<SelectTrigger className="w-[250px]">
					<SelectValue
						className="text-foreground text-sm native:text-lg"
						placeholder={placeholder ?? ''}
					/>
				</SelectTrigger>
				<SelectContent insets={contentInsets} className="w-[250px]">
					<SelectGroup>
						{options.map(option => (
							<SelectItem
								key={option.value}
								label={option.label}
								value={option.value}
							>
								{option.label}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</>
	);
}

type RecipeStep = {
	timestamp: string;
	action: string;
	value: number;
};

interface RecipeStepsEditorProps {
	steps: RecipeStep[];
	setSteps: (...event: any[]) => void;
}

function RecipeStepsEditor({ steps, setSteps }: RecipeStepsEditorProps) {
	const [currentTimestamp, setCurrentTimestamp] = React.useState<string>('');
	const [currentAction, setCurrentAction] = React.useState<string>('');
	const addRecipeStep = () => {
		const lastStep = steps[steps.length - 1];
		let newTimestamp = currentTimestamp;

		// Format input timestamp if needed
		if (!currentTimestamp.includes(':')) {
			newTimestamp = formatRecipeTime(parseInt(currentTimestamp));
		}

		if (lastStep) {
			// Parse the last timestamp and add current timestamp duration
			const lastTimeInSeconds = parseRecipeTime(lastStep.timestamp);
			const currentTimeInSeconds = parseRecipeTime(newTimestamp);
			newTimestamp = formatRecipeTime(lastTimeInSeconds + currentTimeInSeconds);
		}
		const newStep = {
			timestamp: newTimestamp,
			action: currentAction,
			value: parseInt(currentTimestamp),
		};
		console.log('new step', newStep);

		setSteps([...steps, newStep]);
		setCurrentTimestamp('');
		setCurrentAction('');
	};

	return (
		<>
			<Label>Recipe Steps</Label>
			<Input
				placeholder="seconds"
				value={currentTimestamp}
				keyboardType="numeric"
				onChangeText={setCurrentTimestamp}
			/>
			<Textarea
				placeholder="action"
				value={currentAction}
				onChangeText={setCurrentAction}
			/>
			<Button size={'sm'} variant={'outline'} onPress={addRecipeStep}>
				<Text>Add Step</Text>
			</Button>
			<FlatList
				data={steps}
				scrollEnabled={false}
				ItemSeparatorComponent={() => <View className="h-2" />}
				renderItem={({ item, index }) => (
					<View
						key={item.timestamp}
						className="flex-1 flex-row justify-between items-center"
					>
						<View className="flex-1 gap-1">
							<Text className="text-gray-500">{item.timestamp}</Text>
							<Text>{item.action}</Text>
						</View>
						<Button
							variant="ghost"
							size="sm"
							onPress={() => {
								const newSteps = steps.filter((_, i) => i !== index);
								setSteps(newSteps);
							}}
						>
							<StyledIcon
								name="Trash2"
								className="w-4 aspect-square color-red-500"
							/>
						</Button>
					</View>
				)}
			/>
		</>
	);
}
