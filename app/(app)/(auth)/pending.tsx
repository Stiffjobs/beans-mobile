import { View } from 'react-native';
import * as Linking from 'expo-linking';
import {
	createSessionFromUrl,
	useResendConfirmationEmail,
} from '~/state/queries/auth';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Button } from '~/components/ui/button';
import { H3 } from '~/components/ui/typography';
import { Text } from '~/components/ui/text';
import { Loader } from '~/components/Loader';

export default () => {
	const url = Linking.useURL();
	const { email } = useLocalSearchParams<{ email: string }>();
	const [countdown, setCountdown] = useState(30);
	const [canResend, setCanResend] = useState(false);
	const useResendMutation = useResendConfirmationEmail(email);

	const handleResend = async () => {
		if (!canResend || !useResendMutation) return;
		await useResendMutation.mutateAsync();
		setCountdown(30);
		setCanResend(false);
	};

	useEffect(() => {
		if (url) createSessionFromUrl(url);

		const timer = setInterval(() => {
			setCountdown(prev => {
				if (prev <= 1) {
					setCanResend(true);
					clearInterval(timer);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [url]);

	return (
		<View className="flex-1 justify-center items-center gap-4 p-4">
			<H3>Check your email</H3>
			<Text className="text-gray-600 text-center mb-4">
				Please check your email and click the link to verify your account.
			</Text>
			{canResend ? (
				useResendMutation?.isPending ? (
					<Loader />
				) : (
					<Button onPress={handleResend}>
						<Text>Resend verification email</Text>
					</Button>
				)
			) : (
				<Text className="text-sm text-gray-500">
					You can request another email in {countdown} seconds
				</Text>
			)}
		</View>
	);
};
