import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { z } from 'zod';
import { signInSchema, signUpSchema } from '~/lib/schemas';
import { supabase } from '~/utils/supabase';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { makeRedirectUri } from 'expo-auth-session';

const redirectTo = makeRedirectUri();

export const createSessionFromUrl = async (url: string) => {
	const { params, errorCode } = QueryParams.getQueryParams(url);

	if (errorCode) throw new Error(errorCode);
	const { access_token, refresh_token } = params;

	if (!access_token) return;

	const { data, error } = await supabase.auth.setSession({
		access_token,
		refresh_token,
	});
	if (error) throw error;
	return data.session;
};
type SignInFormFields = z.infer<typeof signInSchema>;

export const useSignIn = () => {
	return useMutation({
		mutationFn: async (values: SignInFormFields) => {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: values.email,
				password: values.password,
			});
			if (error) throw error;
		},
		onError: error => Alert.alert('Error', error.message),
	});
};

type SignUpFormFields = z.infer<typeof signUpSchema>;

export const useSignUp = () => {
	return useMutation({
		mutationFn: async (values: SignUpFormFields) => {
			console.log('redirectTo', redirectTo);
			const { data, error } = await supabase.auth.signUp({
				email: values.email,
				password: values.password,
				options: {
					data: {
						name: values.username,
					},
					emailRedirectTo: redirectTo,
				},
			});
			if (error) throw error;
			return data;
		},
		onError: error => Alert.alert('Error', error.message),
	});
};

export const useSignOut = () => {
	return useMutation({
		mutationFn: async () => {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
		},
		onError: error => Alert.alert('Error', error.message),
	});
};

export const useResendConfirmationEmail = (email: string | undefined) => {
	if (!email) return;
	return useMutation({
		mutationFn: async () => {
			const { error } = await supabase.auth.resend({
				type: 'signup',
				email,
				options: {
					emailRedirectTo: redirectTo,
				},
			});
			if (error) throw error;
		},
		onError: error => Alert.alert('Error', error.message),
	});
};
