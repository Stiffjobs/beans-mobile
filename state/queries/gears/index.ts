import { useMutation, useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '~/convex/_generated/api';
import {
	useMutation as useConvexMutation,
	useQuery as useConvexQuery,
} from 'convex/react';
import { createGearSchema, updateGearSchema } from '~/lib/schemas';
import { z } from 'zod';
import { useModalControls } from '~/state/modals';
import * as Toast from '~/view/com/util/Toast';
import { Id } from '~/convex/_generated/dataModel';

export const useListGears = () => {
	return useQuery(convexQuery(api.gears.list, {}));
};

type CreateGearFormFields = z.infer<typeof createGearSchema>;
export const useCreateGear = () => {
	const { closeModal } = useModalControls();
	const mutation = useConvexMutation(api.gears.createGear);
	return useMutation({
		mutationFn: async (values: CreateGearFormFields) => {
			await mutation(values);
		},
		onSuccess: () => {
			closeModal();
		},
		onError: error => {
			Toast.show(`Error: ${error.message}`, 'CircleAlert', 'error');
			console.error(error);
		},
	});
};

export const useDeleteGear = () => {
	const mutation = useConvexMutation(api.gears.deleteGear);
	return useMutation({
		mutationFn: async (id: string) => {
			await mutation({ id: id as Id<'gears'> });
		},
		onSuccess: () => {
			Toast.show('Gear deleted', 'CircleCheck', 'success');
		},
		onError: error => {
			Toast.show(`Error: ${error.message}`, 'CircleAlert', 'error');
		},
	});
};

type EditGearFormFields = z.infer<typeof updateGearSchema>;
export const useUpdateGear = ({
	id,
	onSuccess,
}: {
	id: string;
	onSuccess?: () => void;
}) => {
	const mutation = useConvexMutation(api.gears.updateGear);
	return useMutation({
		mutationFn: async (values: EditGearFormFields) => {
			await mutation({ id: id as Id<'gears'>, ...values });
		},
		onSuccess: () => {
			Toast.show('Gear updated', 'CircleCheck', 'success');
			onSuccess?.();
		},
		onError: error => {
			Toast.show(`Error: ${error.message}`, 'CircleAlert', 'error');
		},
	});
};

export const useGetGearById = (id: string) => {
	console.log('====================================');
	console.log(id);
	console.log('====================================');
	return useQuery(
		convexQuery(api.gears.getGearById, { id: id as Id<'gears'> })
	);
};
