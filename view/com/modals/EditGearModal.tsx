import { zodResolver } from '@hookform/resolvers/zod';
import { PortalHost } from '@rn-primitives/portal';
import { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { z } from 'zod';
import { ErrorMessage } from '~/components/ErrorMessage';
import { Loader } from '~/components/Loader';
import { SelectComponent } from '~/components/select/Select';
import { Button } from '~/components/ui/button';
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
import { Label } from '~/components/ui/label';
import { Text } from '~/components/ui/text';
import { GEAR_TYPE } from '~/lib/constants';
import { Input } from '~/components/input/Input';
import { updateGearSchema } from '~/lib/schemas';
import { useModalControls } from '~/state/modals';
import {
	useDeleteGear,
	useGetGearById,
	useUpdateGear,
} from '~/state/queries/gears';
import { StyledIcon } from '../icons/StyledIcons';

export const snapPoints = ['fullscreen'];

type EditGearModalProps = {
	id: string;
};
type FormFields = z.infer<typeof updateGearSchema>;
const CUSTOM_PORTAL_HOST_NAME = 'edit-gear-modal';
const SELECT_PORTAL_HOST = 'select-gear-portal';
export function Component(props: EditGearModalProps) {
	const fetchGearDetails = useGetGearById(props.id);
	const { closeModal } = useModalControls();
	const form = useForm<FormFields>({
		resolver: zodResolver(updateGearSchema),
		defaultValues: {
			name: '',
			details: '',
		},
	});
	// Update form values when data is fetched
	useEffect(() => {
		if (fetchGearDetails.data) {
			form.reset({
				name: fetchGearDetails.data.name,
				details: fetchGearDetails.data.details || '', // Handle null/undefined
			});
		}
	}, [fetchGearDetails.data]);
	const updateGearMutation = useUpdateGear({
		id: props.id,
		onSuccess: () => closeModal(),
	});
	const onSubmit = useCallback(
		async (values: FormFields) => {
			await updateGearMutation.mutateAsync(values);
		},
		[updateGearMutation]
	);
	if (fetchGearDetails.isLoading) {
		return <Loader />;
	}
	return (
		<>
			<Header {...props} portalHost={CUSTOM_PORTAL_HOST_NAME} />
			<KeyboardAwareScrollView
				className="flex-1"
				contentContainerClassName="p-4 gap-4"
			>
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
									value={field.value}
								/>
								{form.formState.errors.name && (
									<ErrorMessage message={form.formState.errors.name.message} />
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
			</KeyboardAwareScrollView>
			<Footer
				{...props}
				onSubmit={form.handleSubmit(onSubmit)}
				isDirty={form.formState.isDirty}
			/>
			<PortalHost name={CUSTOM_PORTAL_HOST_NAME} />
			<PortalHost name={SELECT_PORTAL_HOST} />
		</>
	);
}

type HeaderProps = EditGearModalProps & {
	portalHost: string;
};
function Header({ id, portalHost }: HeaderProps) {
	const { closeModal } = useModalControls();
	const deleteGearMutation = useDeleteGear();
	const handleDelete = useCallback(async () => {
		await deleteGearMutation.mutateAsync(id);
	}, [deleteGearMutation]);
	return (
		<View className="flex p-4 flex-row justify-between items-center">
			<Button size={'icon'} variant={'ghost'} onPress={closeModal}>
				<StyledIcon name="X" className="text-primary" />
			</Button>
			<Dialog>
				<DialogTrigger asChild>
					<Button size={'icon'} variant={'ghost'}>
						<StyledIcon name="Trash2" className="text-destructive" />
					</Button>
				</DialogTrigger>
				<DialogContent portalHost={portalHost} className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Delete gear</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this gear?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant={'outline'}>
								<Text>Cancel</Text>
							</Button>
						</DialogClose>
						<Button onPress={handleDelete} variant={'destructive'}>
							<Text>Delete</Text>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</View>
	);
}

type FooterProps = EditGearModalProps & {
	isDirty: boolean;
	onSubmit: Function;
};

function Footer({ isDirty, onSubmit }: FooterProps) {
	const handleSubmit = useCallback(() => {
		onSubmit();
	}, [onSubmit]);
	return (
		<View className="p-4 px-8">
			<Button size={'lg'} disabled={!isDirty} onPress={handleSubmit}>
				<Text>Save</Text>
			</Button>
		</View>
	);
}
