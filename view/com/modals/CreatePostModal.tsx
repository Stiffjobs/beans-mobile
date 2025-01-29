import { View, Text } from 'react-native';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { H4 } from '~/components/ui/typography';
import { useModalControls } from '~/state/modals';
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
const schema = z.object({
	bean: z.string(),
	flavor: z.string(),
	roastLevel: z.custom<RoastLevel>(),
	coffeeIn: z.number(),
	ratio: z.number(),
	beverageWeight: z.number(),
	brewTemperature: z.string(),
	preparationMethod: z.string(),
	others: z.string(),
	filterPaper: z.string(),
	water: z.string(),
	grinder: z.string(),
	grindSetting: z.string(),
	profile: z.string(),
	tds: z.number(),
	ey: z.number(),
	bloomTime: z.number(),
	preparationTools: z.string().array(),
	time: z.string().time(),
});

type FormFields = z.infer<typeof schema>;

export const snapPoints = ['90%'];
export function Component() {
	const { openModal } = useModalControls();

	const openEditProfile = () => {
		openModal({
			name: 'edit-profile',
		});
	};

	const form = useForm<FormFields>({
		resolver: zodResolver(schema),
	});

	const onSubmit = (data: FormFields) => {
		console.log('data', data);
	};

	return (
		<BottomSheetScrollView style={{ flex: 1 }}>
			<View className="flex-1 px-10 mb-12 gap-2">
				<Controller
					control={form.control}
					name="bean"
					render={({ field: { value, onChange } }) => {
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
					render={({ field: { value, onChange } }) => {
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
					render={({ field: { onChange, value } }) => (
						<>
							<Label>Roast level</Label>
							<SelectComponent
								placeholder="Select a roast level"
								options={[
									{ label: RoastLevelEnum.Light, value: RoastLevelEnum.Light },
									{
										label: RoastLevelEnum.Medium,
										value: RoastLevelEnum.Medium,
									},
									{ label: RoastLevelEnum.Dark, value: RoastLevelEnum.Dark },
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
								onValueChange={onChange}
							/>
							<Text>{value?.toFixed(2)}</Text>
							{form.formState.errors.tds && (
								<ErrorMessage message={form.formState.errors.tds.message} />
							)}
						</>
					)}
				/>
				{form.watch('tds') &&
					form.watch('beverageWeight') &&
					form.watch('coffeeIn') && (
						<Text>
							EY:
							{(form.watch('tds') * form.watch('beverageWeight')) /
								form.watch('coffeeIn')}
						</Text>
					)}
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
								<ErrorMessage message={form.formState.errors.others.message} />
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
								<ErrorMessage message={form.formState.errors.water.message} />
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
								<ErrorMessage message={form.formState.errors.grinder.message} />
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
								<ErrorMessage message={form.formState.errors.profile.message} />
							)}
						</>
					)}
				/>
				{/* TODO: this should look like time picker  */}
				<Controller
					control={form.control}
					name="bloomTime"
					render={({ field: { onChange, value } }) => {
						return (
							<>
								<Label>Bloom time (seconds)</Label>
								<Input onChangeText={onChange} keyboardType="numeric" />
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
							<Input onChangeText={onChange} />
						</>
					)}
				/>
				<Button onPress={form.handleSubmit(onSubmit)}>
					<H4 className="text-white">Submit</H4>
				</Button>
			</View>
		</BottomSheetScrollView>
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
			<Select onValueChange={val => onChange(val)}>
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
