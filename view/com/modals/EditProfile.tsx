import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { H4 } from '~/components/ui/typography';
import { useModalControls } from '~/state/modals';
import { Text } from '~/components/ui/text';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Separator } from '~/components/ui/separator';
import { EditableUserAvatar } from '../util/UserAvatar';
import { useCallback, useState } from 'react';
import { Image as CroppedImage } from 'react-native-image-crop-picker';
import { useUpdateProfile } from '~/state/queries/users';
import { updateProfileSchema } from '~/lib/schemas';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '~/components/input/Input';
import { ErrorMessage } from '~/components/ErrorMessage';
import { User } from '~/lib/auth/types';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { compressIfNeeded } from '~/lib/media/manip';
import { Loader } from '~/components/Loader';

type FormFields = z.infer<typeof updateProfileSchema>;

export const snapPoints = ['form'];
export function Component({ user }: { user: User }) {
	const { closeModal } = useModalControls();
	const form = useForm<FormFields>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: {
			name: user.name,
			description: user.description ?? '',
		},
	});
	const [newUserAvatar, setNewUserAvatar] = useState<CroppedImage | null>();
	const [userAvatar, setUserAvatar] = useState<string | null>(
		user.avatar ?? null
	);
	const [imageError, setImageError] = useState<string>('');
	const updateProfileMutation = useUpdateProfile({
		onSuccess: () => closeModal(),
	});

	const onSelectNewAvatar = useCallback(
		async (img: CroppedImage | null) => {
			if (img === null) {
				setNewUserAvatar(null);
				setUserAvatar(null);
				return;
			}
			try {
				const finalImg = await compressIfNeeded(img);
				setNewUserAvatar(finalImg);
				setUserAvatar(finalImg.path);
			} catch (error) {
				setImageError(String(error));
			}
		},
		[setImageError, setUserAvatar, setNewUserAvatar]
	);
	const onPressCancel = useCallback(() => {
		closeModal();
	}, [closeModal]);
	async function onPressSave(data: FormFields) {
		const isRemove = newUserAvatar === null;
		await updateProfileMutation.mutateAsync({
			...data,
			avatar: newUserAvatar,
			isRemove,
		});
	}
	return (
		<View className="flex-1">
			<View className="flex-row justify-between p-4 pb-2 ">
				<Button variant={'ghost'} size={'sm'} onPress={onPressCancel}>
					<Text className="text-destructive">Cancel</Text>
				</Button>
				<H4>Edit Profile</H4>
				<Button
					variant={'ghost'}
					disabled={
						(!form.formState.isDirty && newUserAvatar === user.avatar) ||
						updateProfileMutation.isPending
					}
					size={'sm'}
					onPress={form.handleSubmit(onPressSave)}
				>
					{updateProfileMutation.isPending ? (
						<Loader />
					) : (
						<Text className="text-primary">Save</Text>
					)}
				</Button>
			</View>
			<Separator />
			<KeyboardAwareScrollView>
				<View className="px-8 py-6 gap-2">
					<EditableUserAvatar
						avatar={userAvatar}
						onSelectNewAvatar={onSelectNewAvatar}
					/>
					<View className="gap-2">
						<Controller
							control={form.control}
							name={'name'}
							render={({ field: { onChange, value } }) => (
								<>
									<Label>Display Name</Label>
									<Input value={value} onChangeText={onChange} />
									{form.formState.errors.name && (
										<ErrorMessage
											message={form.formState.errors.name.message}
										/>
									)}
								</>
							)}
						/>
						<Controller
							control={form.control}
							name={'description'}
							render={({ field: { onChange, value } }) => (
								<>
									<Label>Description</Label>
									<Textarea value={value} onChangeText={onChange} />
									{form.formState.errors.description && (
										<ErrorMessage
											message={form.formState.errors.description.message}
										/>
									)}
								</>
							)}
						/>
					</View>
				</View>
			</KeyboardAwareScrollView>
		</View>
	);
}
