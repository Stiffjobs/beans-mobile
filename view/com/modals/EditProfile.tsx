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
import { Input } from '~/components/input/Input';
import { ErrorMessage } from '~/components/ErrorMessage';
import { User } from '~/lib/auth/types';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { compressIfNeeded } from '~/lib/media/manip';
import { Loader } from '~/components/Loader';
import { useForm } from '@tanstack/react-form';
import { t } from '@lingui/core/macro';

type FormFields = z.infer<typeof updateProfileSchema>;

export const snapPoints = ['form'];
export function Component({ user }: { user: User }) {
	const { closeModal } = useModalControls();
	const [newUserAvatar, setNewUserAvatar] = useState<CroppedImage | null>();
	const [userAvatar, setUserAvatar] = useState<string | null>(
		user.avatar ?? null
	);
	const [imageError, setImageError] = useState<string>('');
	const updateProfileMutation = useUpdateProfile({
		onSuccess: () => closeModal(),
	});

	const form = useForm({
		defaultValues: {
			name: user.name,
			bio: user.bio ?? '',
			website: user.website ?? '',
		} as FormFields,
		onSubmit: async ({ value }) => {
			const isRemove = newUserAvatar === null;
			await updateProfileMutation.mutateAsync({
				...value,
				avatar: newUserAvatar,
				isRemove,
			});
		},
		validators: {
			onMount: updateProfileSchema,
			onChange: updateProfileSchema,
		},
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

	return (
		<View className="flex-1">
			<View className="flex-row justify-between p-4 pb-2 ">
				<Button variant={'ghost'} size={'sm'} onPress={onPressCancel}>
					<Text className="text-destructive">{t`Cancel`}</Text>
				</Button>
				<H4>{t`Edit Profile`}</H4>
				<form.Subscribe selector={state => [state.isPristine, state.isValid]}>
					{([isPristine, isValid]) => (
						<Button
							variant={'ghost'}
							disabled={isPristine || !isValid}
							size={'sm'}
							onPress={form.handleSubmit}
						>
							{updateProfileMutation.isPending ? (
								<Loader />
							) : (
								<Text className="text-primary">{t`Save`}</Text>
							)}
						</Button>
					)}
				</form.Subscribe>
			</View>
			<Separator />
			<KeyboardAwareScrollView>
				<View className="px-8 py-6 gap-2">
					<EditableUserAvatar
						avatar={userAvatar}
						onSelectNewAvatar={onSelectNewAvatar}
					/>
					<View className="gap-2">
						<form.Field name="name">
							{field => (
								<View className="gap-2">
									<Label>{t`Display Name`}</Label>
									<Input
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
						<form.Field name="website">
							{field => (
								<View className="gap-2">
									<Label>{t`Website`}</Label>
									<Input
										value={field.state.value}
										onChangeText={field.handleChange}
										placeholder="https://www.example.com"
									/>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
								</View>
							)}
						</form.Field>
						<form.Field name="bio">
							{field => (
								<View className="gap-2">
									<Label>{t`Bio`}</Label>
									<Textarea
										value={field.state.value}
										maxLength={80}
										onChangeText={field.handleChange}
										placeholder={t`Tell us about yourself`}
										className="h-32"
									/>
									<Text className="text-sm text-muted-foreground">
										{field.state.value?.length ?? 0} / 80
									</Text>
									<ErrorMessage
										message={field.state.meta.errors
											.map(e => e?.message)
											.join(', ')}
									/>
								</View>
							)}
						</form.Field>
					</View>
				</View>
			</KeyboardAwareScrollView>
		</View>
	);
}
