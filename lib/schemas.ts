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
	bean: z.string().max(256),
	flavor: z.string().max(256),
	roastLevel: z.string().max(256),
	coffeeIn: z.string().refine(e => !isNaN(Number(e)), 'Invalid coffee in'),
	ratio: z.string(),
	beverageWeight: z
		.string()
		.refine(e => !isNaN(Number(e)), 'Invalid beverage weight'),
	brewTemperature: z.string().max(256),
	preparationMethod: z.string().max(256),
	others: z.string().max(256),
	filterPaper: z.string().max(256),
	water: z.string().max(256),
	grinder: z.string().max(256),
	grindSetting: z.string().max(256),
	profile: z.string().max(256),
	tds: z.number().min(0),
	ey: z.number().min(0),
	bloomTime: z.string(),
	time: z.string(),
	preparationTools: z.string().max(256),
	images: z.custom<ComposerImage>().array(),
	steps: z.array(
		z.object({
			timestamp: z.string(),
			action: z.string().max(256),
			value: z.number().min(0),
		})
	),
});
