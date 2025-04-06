import { httpAction } from './_generated/server';
import { Novu } from '@novu/api';

export const novu = new Novu({
	secretKey: process.env['NOVU_SECRET_KEY'],
});

// novu.trigger({
// 	workflowId: 'app-notifications',
// 	to: {
// 		subscriberId: '67ee827cae5f1ea16f4e0166',
// 	},
// 	payload: {},
// });
//
export const helloWorld = httpAction(async () => {
	return new Response(
		JSON.stringify({
			message: 'Helloworld',
		})
	);
});
