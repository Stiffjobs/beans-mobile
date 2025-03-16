import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select';
import { Separator } from '~/components/ui/separator';
import { Text } from '~/components/ui/text';
import { useModalControls } from '~/state/modals';
import { WindowOverlay } from '../util/WindowOverlay';
import { PortalHost } from '@rn-primitives/portal';
import { GEAR_TYPE } from '~/lib/constants';
import { z } from 'zod';
import { createGearSchema } from '~/lib/schemas';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { H4 } from '~/components/ui/typography';
import { Input } from '~/components/input/Input';
import { useCreateGear } from '~/state/queries/gears';
import { useCallback } from 'react';
import { ErrorMessage } from '~/components/ErrorMessage';
import { StyledIcon } from '../icons/StyledIcons';

export const snapPoints = ['fullscreen'];
const SELECT_PORTAL_HOST = 'select-gear-portal';
type FormFields = z.infer<typeof createGearSchema>;
export function Component() {
	const form = useForm<FormFields>({
		resolver: zodResolver(createGearSchema),
	});
	const createGearMutation = useCreateGear();
	const handleSubmit = useCallback(
		async (values: FormFields) => {
			await createGearMutation.mutateAsync(values);
		},
		[createGearMutation]
	);
	return (
		<>
			<Header />
			<KeyboardAwareScrollView contentContainerClassName="p-4 gap-4">
				<H4>Create Gear</H4>
				<Separator />
				<View className="gap-4">
					<Controller
						control={form.control}
						name="name"
						render={({ field }) => {
							return (
								<>
									<Label>Name</Label>
									<Input
										maxLength={50}
										onChangeText={field.onChange}
										{...field}
									/>
									{form.formState.errors.name && (
										<ErrorMessage
											message={form.formState.errors.name?.message}
										/>
									)}
								</>
							);
						}}
					/>
					<Controller
						control={form.control}
						name="type"
						render={({ field }) => {
							return (
								<>
									<Label>Type</Label>
									<Select onValueChange={opt => field.onChange(opt?.value)}>
										<SelectTrigger>
											<SelectValue
												className="text-foreground"
												placeholder="Select gear type"
											/>
										</SelectTrigger>
										<SelectContent portalHost={SELECT_PORTAL_HOST}>
											<SelectGroup>
												{Object.entries(GEAR_TYPE).map(([key, value]) => (
													<SelectItem key={key} value={value} label={key}>
														{key}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
									{form.formState.errors.type && (
										<ErrorMessage
											message={form.formState.errors.type?.message}
										/>
									)}
								</>
							);
						}}
					/>
					<Controller
						control={form.control}
						name="details"
						render={({ field }) => {
							return (
								<>
									<Label>Details</Label>
									<Input onChangeText={field.onChange} {...field} />
									{form.formState.errors.details && (
										<ErrorMessage
											message={form.formState.errors.details?.message}
										/>
									)}
								</>
							);
						}}
					/>
				</View>
				<Button onPress={form.handleSubmit(handleSubmit)}>
					<Text>Submit</Text>
				</Button>
			</KeyboardAwareScrollView>
			<WindowOverlay>
				<PortalHost name={SELECT_PORTAL_HOST} />
			</WindowOverlay>
		</>
	);
}

function Header() {
	const { closeModal } = useModalControls();

	return (
		<View className="flex p-4 flex-row justify-between items-center">
			<View />
			<Button variant={'ghost'} size="icon" onPress={closeModal}>
				<StyledIcon name="X" className="text-primary" />
			</Button>
		</View>
	);
}
