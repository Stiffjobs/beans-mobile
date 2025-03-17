import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { StyledIcon } from '../icons/StyledIcons';
import { useModalControls } from '~/state/modals';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { createBeanProfileSchema } from '~/lib/schemas';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/input/Input';
import { ErrorMessage } from '~/components/ErrorMessage';
export const snapPoints = ['fullscreen'];

export function Component() {
	const form = useForm({
		defaultValues: { name: '', confirm_name: '' },
		validators: {
			onChange: createBeanProfileSchema,
		},
		onSubmit: async ({ value }) => {
			console.log('data', value);
		},
	});
	return (
		<>
			<Header />
			<KeyboardAwareScrollView>
				<View className="flex-1 px-10"></View>
				<form.Field name="name">
					{field => (
						<>
							<Label>Name</Label>
							<Input
								value={field.state.value}
								onChangeText={field.handleChange}
							/>
							<ErrorMessage message={field.state.meta.errors.join(', ')} />
						</>
					)}
				</form.Field>
				<form.Field
					name="confirm_name"
					validators={{
						onChangeListenTo: ['name'],
						onChange: ({ value, fieldApi }) => {
							if (value !== fieldApi.form.getFieldValue('name')) {
								return 'Names do not match';
							}
							return undefined;
						},
					}}
				>
					{field => (
						<>
							<Label>Confirm Name</Label>
							<Input
								value={field.state.value}
								onChangeText={field.handleChange}
							/>
							<ErrorMessage message={field.state.meta.errors.join(', ')} />
						</>
					)}
				</form.Field>
				<form.Subscribe
					selector={state => [state.canSubmit, state.isSubmitting]}
					children={([canSubmit, isSubmitting]) => (
						<Button onPress={form.handleSubmit} disabled={!canSubmit}>
							<Text>Submit</Text>
						</Button>
					)}
				/>
			</KeyboardAwareScrollView>
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
