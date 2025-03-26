import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { BeanProfileProps } from '~/lib/types';
import { StyledIcon } from '../icons/StyledIcons';
import { useModalControls } from '~/state/modals';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useForm } from '@tanstack/react-form';
import { editBeanProfileSchema } from '~/lib/schemas';
import { Text } from '~/components/ui/text';
import { z } from 'zod';
import {
	useDeleteBeanProfile,
	useGetBeanProfileById,
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
import { useCallback } from 'react';
import { Checkbox } from '~/components/ui/checkbox';

export const snapPoints = ['fullscreen'];
const CUSTOM_PORTAL_HOST_NAME = 'edit-bean-profile-modal';

type EditBeanProfileModalProps = {
	id: string;
};

export function Component({ id }: EditBeanProfileModalProps) {
	const fetchBeanProfileById = useGetBeanProfileById(id);
	const updateBeanProfile = useUpdateBeanProfile({ id });
	const { closeModal } = useModalControls();
	const deleteMutation = useDeleteBeanProfile();
	const handleDelete = useCallback(async () => {
		await deleteMutation.mutateAsync(id);
	}, [deleteMutation]);
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
		} as z.infer<typeof editBeanProfileSchema>,
		validators: {
			onMount: editBeanProfileSchema,
		},
		onSubmit: async data => {
			await updateBeanProfile.mutateAsync({ ...data.value });
			closeModal();
		},
	});
	if (fetchBeanProfileById.isLoading) {
		return <Loader />;
	}
	return (
		<>
			<Header />
			<KeyboardAwareScrollView className="flex-1">
				<View className="flex-1 px-4 gap-4">
					<form.Field name="origin">
						{field => (
							<View className="gap-2">
								<RequiredLabel>Origin</RequiredLabel>
								<Input
									value={field.state.value}
									onChangeText={field.handleChange}
									placeholder="e.g. Alishan, Chiayi, Taiwan"
								/>
								<ErrorMessage
									message={field.state.meta.errors
										.map(e => e?.message)
										.join(', ')}
								/>
							</View>
						)}
					</form.Field>
					<form.Field name="roaster">
						{field => (
							<View className="gap-2">
								<RequiredLabel>Roaster</RequiredLabel>
								<Input
									value={field.state.value}
									onChangeText={field.handleChange}
									placeholder="e.g. SEY"
								/>
							</View>
						)}
					</form.Field>
					<form.Field name="producer">
						{field => (
							<View className="gap-2">
								<RequiredLabel>Producer</RequiredLabel>
								<Input
									value={field.state.value}
									onChangeText={field.handleChange}
									placeholder="e.g. Cheng-Lun Fang"
								/>
								<ErrorMessage
									message={field.state.meta.errors
										.map(e => e?.message)
										.join(', ')}
								/>
							</View>
						)}
					</form.Field>
					<form.Field name="farm">
						{field => (
							<View className="gap-2">
								<RequiredLabel>Farm</RequiredLabel>
								<Input
									value={field.state.value}
									onChangeText={field.handleChange}
									placeholder="e.g. Zou Zhou Yuan Estate"
								/>
								<ErrorMessage
									message={field.state.meta.errors
										.map(e => e?.message)
										.join(', ')}
								/>
							</View>
						)}
					</form.Field>
					<form.Field name="process">
						{field => (
							<View className="gap-2">
								<RequiredLabel>Process</RequiredLabel>
								<Input
									value={field.state.value}
									onChangeText={field.handleChange}
									placeholder="e.g. Washed"
								/>
								<ErrorMessage
									message={field.state.meta.errors
										.map(e => e?.message)
										.join(', ')}
								/>
							</View>
						)}
					</form.Field>
					<form.Field name="variety">
						{field => (
							<View className="gap-2">
								<RequiredLabel>Varietal</RequiredLabel>
								<Input
									value={field.state.value}
									onChangeText={field.handleChange}
									placeholder="e.g. Gesha"
								/>
								<ErrorMessage
									message={field.state.meta.errors
										.map(e => e?.message)
										.join(', ')}
								/>
							</View>
						)}
					</form.Field>
					<form.Field name="elevation">
						{field => (
							<View className="gap-2">
								<RequiredLabel>Elevation (masl)</RequiredLabel>
								<Input
									value={field.state.value}
									onChangeText={field.handleChange}
									placeholder="e.g. 1300 masl"
								/>
								<ErrorMessage
									message={field.state.meta.errors
										.map(e => e?.message)
										.join(', ')}
								/>
							</View>
						)}
					</form.Field>
					<form.Field name="finished">
						{field => (
							<View className="gap-2">
								<Label>Finished</Label>
								<Checkbox
									checked={field.state.value}
									onCheckedChange={field.handleChange}
								/>
							</View>
						)}
					</form.Field>
					<form.Field name="description">
						{field => (
							<View className="gap-2">
								<Label>Description (Optional)</Label>
								<Input
									value={field.state.value}
									onChangeText={field.handleChange}
									placeholder="Add any additional notes about the bean"
									multiline
									numberOfLines={4}
								/>
								<ErrorMessage
									message={field.state.meta.errors
										.map(e => e?.message)
										.join(', ')}
								/>
							</View>
						)}
					</form.Field>

					<View className="flex flex-row gap-2">
						<Dialog className="flex-1">
							<DialogTrigger asChild>
								<Button variant="destructive">
									<Text>Delete</Text>
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
											<Text>Cancel</Text>
										</Button>
									</DialogClose>
									<Button onPress={handleDelete} variant="destructive">
										<Text>Delete</Text>
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
						<form.Subscribe
							selector={state => [
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
