import { SafeAreaView, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema } from '~/lib/schemas';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { router } from 'expo-router';
import { useSignUp } from '~/state/queries/auth';
import { ErrorMessage } from '~/components/ErrorMessage';
import { Loader } from '~/components/Loader';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
type SignUpSchema = z.infer<typeof signUpSchema>;

export default () => {
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<SignUpSchema>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			email: '',
			password: '',
			confirmPassword: '',
			username: '',
		},
	});

	const signUpMutation = useSignUp();

	const onSubmit = async (data: SignUpSchema) => {
		await signUpMutation.mutateAsync(data);
		router.push({
			pathname: '/(app)/(auth)/pending',
			params: { email: data.email },
		});
	};
	const { top } = useSafeAreaInsets();

	return (
		<KeyboardAwareScrollView>
			<View className="flex-1 justify-center px-6" style={{ paddingTop: top }}>
				<Text className="text-3xl font-bold mb-8 text-center">
					Create Account
				</Text>

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
									onChangeText={onChange}
								/>
							)}
						/>
						{errors.email && <ErrorMessage message={errors.email.message} />}
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
									onChangeText={onChange}
								/>
							)}
						/>
						{errors.password && (
							<ErrorMessage message={errors.password.message} />
						)}
					</View>

					<View>
						<Text className="text-sm mb-1">Confirm Password</Text>
						<Controller
							control={control}
							name="confirmPassword"
							render={({ field: { onChange, value } }) => (
								<Input
									className="border border-gray-300 rounded-lg p-3"
									placeholder="Confirm your password"
									secureTextEntry
									onChangeText={onChange}
								/>
							)}
						/>
						{errors.confirmPassword && (
							<ErrorMessage message={errors.confirmPassword.message} />
						)}
					</View>

					<View>
						<Text className="text-sm mb-1">Username</Text>
						<Controller
							control={control}
							name="username"
							render={({ field: { onChange } }) => (
								<Input
									className="border border-gray-300 rounded-lg p-3"
									onChangeText={onChange}
									placeholder="Enter your username"
								/>
							)}
						/>
					</View>

					{signUpMutation.isPending ? (
						<Loader />
					) : (
						<Button onPress={handleSubmit(onSubmit)}>
							<Text className=" text-center font-semibold">Sign Up</Text>
						</Button>
					)}
					<Button
						onPress={() => router.replace('/(app)/(auth)/signin')}
						variant={'link'}
					>
						<Text>
							Already have an account?{' '}
							<Text className="font-bold">Sign in</Text>
						</Text>
					</Button>
				</View>
			</View>
		</KeyboardAwareScrollView>
	);
};
