import * as React from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Controller, useForm } from 'react-hook-form';
import { signUpSchema } from '~/lib/schemas';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorMessage } from '~/components/ErrorMessage';
import { H3 } from '~/components/ui/typography';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSignUp, useVerifyEmail } from '~/state/queries/auth';

export default function SignUpScreen() {
	const router = useRouter();
	const form = useForm<z.infer<typeof signUpSchema>>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			email: '',
			password: '',
			username: '',
		},
	});

	const [pendingVerification, setPendingVerification] = React.useState(false);
	const [code, setCode] = React.useState('');

	// Handle submission of sign-up form
	const useSignUpMutation = useSignUp({
		onSuccess: () => setPendingVerification(true),
	});
	const useVerifyMutation = useVerifyEmail();
	const onVerifyPress = async () => {
		await useVerifyMutation.mutateAsync(code);
	};
	const onSignUpPress = async (data: z.infer<typeof signUpSchema>) => {
		await useSignUpMutation.mutateAsync(data);
	};

	if (pendingVerification) {
		return (
			<KeyboardAwareScrollView contentContainerClassName="flex-1 justify-center px-6">
				<View className="gap-6">
					<Text>Verify your email</Text>
					<Input
						value={code}
						placeholder="Enter your verification code"
						onChangeText={code => setCode(code)}
					/>
					<Button onPress={onVerifyPress}>
						<Text>Verify</Text>
					</Button>
				</View>
			</KeyboardAwareScrollView>
		);
	}

	return (
		<KeyboardAwareScrollView contentContainerClassName="flex-1 justify-center px-6">
			<View className="gap-6">
				<H3>Sign up</H3>
				<Controller
					name="email"
					control={form.control}
					render={({ field: { onChange } }) => (
						<View className="gap-2">
							<Input
								autoCapitalize="none"
								placeholder="Enter email"
								onChangeText={onChange}
							/>
							{form.formState.errors.email && (
								<ErrorMessage message={form.formState.errors.email?.message} />
							)}
						</View>
					)}
				/>
				<Controller
					name="password"
					control={form.control}
					render={({ field: { onChange } }) => (
						<View className="gap-2">
							<Input
								placeholder="Enter password"
								secureTextEntry={true}
								onChangeText={onChange}
							/>
							{form.formState.errors.password && (
								<ErrorMessage
									message={form.formState.errors.password?.message}
								/>
							)}
						</View>
					)}
				/>
				<Controller
					name="username"
					control={form.control}
					render={({ field: { onChange } }) => (
						<View className="gap-2">
							<Input placeholder="Enter username" onChangeText={onChange} />
							{form.formState.errors.username && (
								<ErrorMessage
									message={form.formState.errors.username?.message}
								/>
							)}
						</View>
					)}
				/>
				<Button onPress={form.handleSubmit(onSignUpPress)}>
					<Text>Continue</Text>
				</Button>
				<View className="flex-row justify-center items-center gap-2">
					<Text>Already have an account?</Text>
					<Pressable onPress={() => router.replace('/signin')}>
						<Text className="text-blue-600 font-semibold">Sign in</Text>
					</Pressable>
				</View>
			</View>
		</KeyboardAwareScrollView>
	);
}
