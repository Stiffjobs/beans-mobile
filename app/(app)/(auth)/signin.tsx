import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import React from 'react';

import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '~/components/ErrorMessage';
import { z } from 'zod';
import { signInSchema } from '~/lib/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { H3 } from '~/components/ui/typography';
import { Loader } from '~/components/Loader';
import { useSignIn } from '~/state/queries/auth';
export default function Page() {
	const router = useRouter();
	const form = useForm<z.infer<typeof signInSchema>>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});
	const signInMutation = useSignIn();

	const onSubmit = async (data: z.infer<typeof signInSchema>) => {
		await signInMutation.mutateAsync(data);
	};

	return (
		<KeyboardAwareScrollView contentContainerClassName="flex-1 justify-center px-6">
			<View className="gap-6">
				<H3>Sign in</H3>
				<Controller
					name="email"
					control={form.control}
					render={({ field: { onChange } }) => (
						<View className="gap-2">
							<Input
								autoCapitalize="none"
								keyboardType="email-address"
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
				<Button onPress={form.handleSubmit(onSubmit)}>
					{signInMutation.isPending ? <Loader /> : <Text>Sign in</Text>}
				</Button>
				<View className="flex-row justify-center items-center gap-2">
					<Text>Don't have an account?</Text>
					<Pressable onPress={() => router.replace('/signup')}>
						<Text className="text-blue-600 font-semibold">Sign up</Text>
					</Pressable>
				</View>
			</View>
		</KeyboardAwareScrollView>
	);
}
