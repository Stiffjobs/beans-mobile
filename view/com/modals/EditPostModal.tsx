import React, { useCallback, useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import PagerView from 'react-native-pager-view';
import { Label } from '~/components/ui/label';
import { H4 } from '~/components/ui/typography';
import { Text } from '~/components/ui/text';
import { ErrorMessage } from '~/components/ErrorMessage';
import { Input } from '~/components/ui/input';
import { RequiredLabel } from '~/components/RequiredLabel';
import { editPostSchema } from '~/lib/schemas';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TimeMaskInput } from '../time/TimeMaskInput';
import Slider from '@react-native-community/slider';
import { SelectRoastLevel } from '~/components/SelectRoastLevel';
import { RoastLevelEnum } from '~/lib/constants';
import { useModalControls } from '~/state/modals';
import { Button } from '~/components/ui/button';
import { WindowOverlay } from '../util/WindowOverlay';
import { PortalHost } from '@rn-primitives/portal';
import { Separator } from '@rn-primitives/select';
import { Pager } from '../pager/Pager';
import { useEditPost, useGetPostById } from '~/state/queries/post';
import { Loader } from '~/components/Loader';
import { RecipeStepsEditor } from '~/components/RecipeStepsEditor';

export const snapPoints = ['fullscreen'];
type FormFields = z.infer<typeof editPostSchema>;

export function Component({ id }: { id: string }) {
	const postDetails = useGetPostById(id);
	const form = useForm<FormFields>({
		resolver: zodResolver(editPostSchema),
		defaultValues: {
			bean: postDetails.data?.bean,
			roastLevel: Object.values(RoastLevelEnum).find(
				e => e === postDetails.data?.roastLevel
			),
			coffeeIn: postDetails.data?.coffeeIn,
			ratio: postDetails.data?.ratio,
			beverageWeight: postDetails.data?.beverageWeight,
			brewTemperature: postDetails.data?.brewTemperature,
			filterPaper: postDetails.data?.filterPaper,
			brewingWater: postDetails.data?.brewingWater,
			grinder: postDetails.data?.grinder,
			grindSetting: postDetails.data?.grindSetting,
			bloomTime: postDetails.data?.bloomTime,
			totalDrawdownTime: postDetails.data?.totalDrawdownTime,
			methodName: postDetails.data?.methodName,
			brewer: postDetails.data?.brewer,
			otherTools: postDetails.data?.otherTools,
			flavor: postDetails.data?.flavor,
			tds: postDetails.data?.tds,
			ey: postDetails.data?.ey,
			recipeSteps: postDetails.data?.recipeSteps,
		},
	});
	const [activePage, setActivePage] = React.useState(0);
	const pagerRef = useRef<PagerView>(null);
	const { closeModal } = useModalControls();
	const editPostMutation = useEditPost({
		id,
		onSuccess: () => {
			closeModal();
		},
	});

	const handleSave = useCallback(
		async (data: FormFields) => {
			await editPostMutation.mutateAsync(data);
		},
		[editPostMutation]
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
				<Button
					disabled={!form.formState.isDirty}
					onPress={form.handleSubmit(handleSave)}
					variant={'secondary'}
					size="sm"
				>
					<Text>Save</Text>
				</Button>
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
						<Text className="text-sm text-muted-foreground mb-2">
							Fields marked with <Text className="text-destructive">*</Text> are
							required
						</Text>
						<Controller
							control={form.control}
							name="bean"
							render={({ field: { onChange, value } }) => {
								return (
									<>
										<RequiredLabel>Bean</RequiredLabel>
										<Input
											multiline={false}
											numberOfLines={1}
											value={value}
											onChangeText={onChange}
										/>
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
							render={({ field: { onChange, value } }) => (
								<>
									<RequiredLabel>Roast level</RequiredLabel>
									<SelectRoastLevel
										portalHost={EDIT_POST_SELECT_PORTAL}
										placeholder="Select a roast level"
										options={Object.values(RoastLevelEnum).map(value => ({
											label: value,
											value: value,
										}))}
										onChange={onChange}
										value={value}
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
							render={({ field: { onChange, value } }) => (
								<>
									<RequiredLabel>Coffee in (g)</RequiredLabel>
									<Input
										numberOfLines={1}
										onChangeText={onChange}
										value={value}
									/>
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
							render={({ field: { onChange, value } }) => (
								<>
									<Label>Ratio</Label>
									<Input
										numberOfLines={1}
										onChangeText={onChange}
										value={value}
									/>
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
							render={({ field: { onChange, value } }) => (
								<>
									<RequiredLabel>Beverage weight(g)</RequiredLabel>
									<Input
										numberOfLines={1}
										onChangeText={onChange}
										value={value}
									/>
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
							render={({ field: { onChange, value } }) => (
								<>
									<RequiredLabel>Brew temperature (°C)</RequiredLabel>
									<Input
										numberOfLines={1}
										onChangeText={onChange}
										keyboardType="numeric"
										value={value}
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
							render={({ field: { onChange, value } }) => (
								<>
									<RequiredLabel>Filter paper</RequiredLabel>
									<Input
										numberOfLines={1}
										onChangeText={onChange}
										value={value}
									/>
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
							name="brewingWater"
							render={({ field: { onChange, value } }) => (
								<>
									<RequiredLabel>Brewing water (ppm)</RequiredLabel>
									<Input
										numberOfLines={1}
										onChangeText={onChange}
										value={value}
									/>
									{form.formState.errors.brewingWater && (
										<ErrorMessage
											message={form.formState.errors.brewingWater.message}
										/>
									)}
								</>
							)}
						/>
						{/* TODO: this should look like a dropdown with options */}
						<Controller
							control={form.control}
							name="grinder"
							render={({ field: { onChange, value } }) => (
								<>
									<RequiredLabel>Grinder</RequiredLabel>
									<Input
										numberOfLines={1}
										onChangeText={onChange}
										value={value}
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
									<Input
										numberOfLines={1}
										onChangeText={onChange}
										value={value}
									/>
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
							name="methodName"
							render={({ field: { onChange, value } }) => (
								<>
									<Label>Preparation method</Label>
									<Input onChangeText={onChange} value={value} />
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
							name="brewer"
							render={({ field: { onChange, value } }) => (
								<>
									<Label>Brewer</Label>
									<Input onChangeText={onChange} value={value} />
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
							name="otherTools"
							render={({ field: { onChange, value } }) => (
								<>
									<Label>Other tools</Label>
									<Input onChangeText={onChange} value={value} />
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
							render={({ field: { onChange, value } }) => (
								<>
									<Label>Flavor</Label>
									<Input onChangeText={onChange} value={value} />
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
										value={value}
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
						<View className="h-5" />
					</View>
				</KeyboardAwareScrollView>
			</Pager>
			<WindowOverlay>
				<PortalHost name={EDIT_POST_SELECT_PORTAL} />
			</WindowOverlay>
		</>
	);
}
const EDIT_POST_SELECT_PORTAL = 'edit-post-select';
