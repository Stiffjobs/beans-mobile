import { z } from 'zod';
import { RoastLevel } from './constants';
import { ComposerImage } from '~/state/gallery';

export const signInSchema = z.object({
	email: z.string().email('Please enter a valid email'),
	password: z.string().min(8, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.refine(
			password => password.length <= 64,
			'Password must not exceed 64 characters'
		),
	username: z.string().min(3, 'Username must be at least 3 characters'),
});

export const createPostSchema = z.object({
	createdDate: z.string(),
	bean: z.string(),
	roastLevel: z.string(),
	coffeeIn: z.string(),
	ratio: z.string(),
	beverageWeight: z.string(),
	brewTemperature: z.string(),
	filterPaper: z.string(),
	brewingWater: z.string(),
	grinder: z.string(),
	grindSetting: z.string(),
	bloomTime: z.string(),
	totalDrawdownTime: z.string(),
	recipeSteps: z.array(
		z.object({
			timestamp: z.string(),
			action: z.string(),
			value: z.number(),
		})
	),
	methodName: z.string().optional(),
	brewer: z.string().optional(),
	otherTools: z.string().optional(),
	flavor: z.string().optional(),
	tds: z.number().min(0).optional(),
	ey: z.number().min(0).optional(),
	images: z.custom<ComposerImage>().array(),
});
export const editPostSchema = createPostSchema.omit({
	images: true,
	createdDate: true,
});

export const updateProfileSchema = z.object({
	name: z.string().min(3, 'Name must be at least 3 characters').optional(),
	description: z.string().optional(),
});
