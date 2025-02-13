import {
	useAuth,
	useSignUp as useClerkSignUp,
	useSignIn as useClerkSignIn,
} from '@clerk/clerk-expo';
import { convexQuery } from '@convex-dev/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useQuery as useConvexQuery } from 'convex/react';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { z } from 'zod';
import { api } from '~/convex/_generated/api';
import { signInSchema, signUpSchema } from '~/lib/schemas';

export const useSignOut = () => {
	const { signOut } = useAuth();
	return useMutation({
		mutationFn: async () => {
			await signOut();
		},
		onSuccess: () => {
			router.navigate('/');
		},
	});
};

export const useSignUp = ({ onSuccess }: { onSuccess?: () => void }) => {
	const { isLoaded, signUp, setActive } = useClerkSignUp();

	return useMutation({
		mutationFn: async (data: z.infer<typeof signUpSchema>) => {
			if (!isLoaded) return;
			await signUp.create({
				emailAddress: data.email,
				password: data.password,
				username: data.username,
			});

			await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
		},
		onSuccess: () => onSuccess?.(),
		onError: error => Alert.alert('Error', error.message),
	});
};

export const useVerifyEmail = () => {
	const { isLoaded, signUp, setActive } = useClerkSignUp();

	return useMutation({
		mutationFn: async (code: string) => {
			if (!isLoaded) return;
			const signUpAttempt = await signUp.attemptEmailAddressVerification({
				code,
			});
			if (signUpAttempt.status === 'complete') {
				await setActive({ session: signUpAttempt.createdSessionId });
				router.replace('/');
			} else {
				throw new Error(JSON.stringify(signUpAttempt, null, 2));
			}
		},
		onSuccess: () => {
			router.replace('/');
		},
		onError: error => Alert.alert('Error', error.message),
	});
};

export const useSignIn = () => {
	const { signIn, setActive, isLoaded } = useClerkSignIn();
	return useMutation({
		mutationFn: async (data: z.infer<typeof signInSchema>) => {
			if (!isLoaded) return;
			const signInAttempt = await signIn.create({
				identifier: data.email,
				password: data.password,
			});
			if (signInAttempt.status === 'complete') {
				await setActive({ session: signInAttempt.createdSessionId });
				router.replace('/');
			} else {
				// If the status isn't complete, check why. User might need to
				// complete further steps.
				console.error(JSON.stringify(signInAttempt, null, 2));
			}
		},
		onError: error => {
			console.error(error);
			Alert.alert('Error', 'Invalid email or password');
		},
	});
};

export const useGetCurrentUser = () => {
	return useQuery(convexQuery(api.users.current, {}));
};
