import { useMutation, useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '~/convex/_generated/api';
import {
	useMutation as useConvexMutation,
	useQuery as useConvexQuery,
} from 'convex/react';
import { createGearSchema } from '~/lib/schemas';
import { z } from 'zod';
import { useModalControls } from '~/state/modals';
import * as Toast from '~/view/com/util/Toast';

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
