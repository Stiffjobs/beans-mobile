import { useMutation, useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '~/convex/_generated/api';
import {
	useMutation as useConvexMutation,
	useQuery as useConvexQuery,
} from 'convex/react';
import { createBeanProfileSchema } from '~/lib/schemas';
import { z } from 'zod';
import { useModalControls } from '~/state/modals';
import * as Toast from '~/view/com/util/Toast';
import { Id } from '~/convex/_generated/dataModel';

// List all bean profiles for the current user
export const useListBeanProfiles = () => {
	return useQuery(convexQuery(api.bean_profiles.list, {}));
};

// Get a single bean profile by ID
export const useGetBeanProfileById = (id: string) => {
	return useQuery(
		convexQuery(api.bean_profiles.getById, { id: id as Id<'bean_profiles'> })
	);
};

// Create a new bean profile
type CreateBeanProfileFields = z.infer<typeof createBeanProfileSchema>;
export const useCreateBeanProfile = () => {
	const { closeModal } = useModalControls();
	const mutation = useConvexMutation(api.bean_profiles.create);

	return useMutation({
		mutationFn: async (values: CreateBeanProfileFields) => {
			await mutation(values);
		},
		onSuccess: () => {
			Toast.show('Bean profile created', 'CircleCheck', 'success');
			closeModal();
		},
		onError: error => {
			Toast.show(`Error: ${error.message}`, 'CircleAlert', 'error');
			console.error(error);
		},
	});
};

// Update an existing bean profile
export const useUpdateBeanProfile = ({ id }: { id: string }) => {
	const mutation = useConvexMutation(api.bean_profiles.update);

	return useMutation({
		mutationFn: async (values: CreateBeanProfileFields) => {
			await mutation({ id: id as Id<'bean_profiles'>, ...values });
		},
		onSuccess: () => {
			Toast.show('Bean profile updated', 'CircleCheck', 'success');
		},
		onError: error => {
			Toast.show(`Error: ${error.message}`, 'CircleAlert', 'error');
		},
	});
};

// Delete a bean profile
export const useDeleteBeanProfile = () => {
	const mutation = useConvexMutation(api.bean_profiles.remove);

	return useMutation({
		mutationFn: async (id: string) => {
			await mutation({ id: id as Id<'bean_profiles'> });
		},
		onSuccess: () => {
			Toast.show('Bean profile deleted', 'CircleCheck', 'success');
		},
		onError: error => {
			Toast.show(`Error: ${error.message}`, 'CircleAlert', 'error');
		},
	});
};
