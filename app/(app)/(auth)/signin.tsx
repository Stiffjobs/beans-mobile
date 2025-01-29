import { View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema } from '~/lib/schemas';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { router } from 'expo-router';
import { useSignIn } from '~/state/queries/auth';
import { Loader } from '~/components/Loader';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SignInSchema = z.infer<typeof signInSchema>;

export default () => {
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<SignInSchema>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const signInMutation = useSignIn();

	const onSubmit = async (data: SignInSchema) => {
		// TODO: Implement sign-in logic
		console.log('Sign in with:', data);
		await signInMutation.mutateAsync(data);
	};
	const { top } = useSafeAreaInsets();
	return (
		<KeyboardAwareScrollView>
			<View className="flex-1 justify-center px-6" style={{ paddingTop: top }}>
				<Text className="text-3xl font-bold mb-8 text-center">Sign In</Text>
				<View className="gap-4">
					<View>
						<Text className="text-sm mb-1">Email</Text>
						<Controller
							control={control}
							name="email"
							render={({ field: { onChange, value } }) => (
								<Input
									className="border border-gray-300 rounded-lg p-3"
									placeholder="Enter your email"
									keyboardType="email-address"
									autoCapitalize="none"
									value={value}
									onChangeText={onChange}
								/>
							)}
						/>
						{errors.email && (
							<Text className="text-red-500 text-sm mt-1">
								{errors.email.message}
							</Text>
						)}
					</View>

					<View>
						<Text className="text-sm mb-1">Password</Text>
						<Controller
							control={control}
							name="password"
							render={({ field: { onChange, value } }) => (
								<Input
									className="border border-gray-300 rounded-lg p-3"
									placeholder="Enter your password"
									secureTextEntry
									value={value}
									onChangeText={onChange}
								/>
							)}
						/>
						{errors.password && (
							<Text className="text-red-500 text-sm mt-1">
								{errors.password.message}
							</Text>
						)}
					</View>

					{signInMutation.isPending ? (
						<Loader />
					) : (
						<Button onPress={handleSubmit(onSubmit)}>
							<Text className=" text-center font-semibold">Sign In</Text>
						</Button>
					)}
					<Button
						onPress={() => router.replace('/(app)/(auth)/signup')}
						variant={'link'}
					>
						<Text>
							Don't have an account? <Text className="font-bold">Sign up</Text>
						</Text>
					</Button>
				</View>
			</View>
		</KeyboardAwareScrollView>
	);
};
