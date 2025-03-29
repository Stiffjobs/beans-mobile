import { z } from 'zod';
import { GEAR_TYPE, RoastLevel } from './constants';
import { ComposerImage } from '~/state/gallery';
import { Doc, Id } from '~/convex/_generated/dataModel';

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
	bean: z.string().min(1, 'Bean is required'),
	roastLevel: z.string().min(1, 'Roast level is required'),
	coffeeIn: z.string().min(1, 'Coffee in is required'),
	beanProfile: z
		.custom<Id<'bean_profiles'>>()
		.refine(id => id.length > 0, 'Bean profile is required'),
	ratio: z.string().min(1, 'Ratio is required'),
	beverageWeight: z.string().optional(),
	waterIn: z.string().optional(),
	brewTemperature: z.string().min(1, 'Brew temperature is required'),
	filterPaper: z.string().min(1, 'Filter paper is required'),
	filterPaperId: z
		.custom<Id<'gears'>>()
		.refine(id => id.length > 0, 'Filter paper is required'),
	grinder: z.string().min(1, 'Grinder is required'),
	grinderId: z
		.custom<Id<'gears'>>()
		.refine(id => id.length > 0, 'Grinder is required'),
	grindSetting: z.string().min(1, 'Grind setting is required'),
	bloomTime: z.string().min(1, 'Bloom time is required'),
	totalDrawdownTime: z.string().min(1, 'Total drawdown time is required'),
	brewer: z.string().min(1, 'Brewer is required'),
	brewerId: z
		.custom<Id<'gears'>>()
		.refine(id => id.length > 0, 'Brewer is required'),
	recipeSteps: z.array(
		z.object({
			timestamp: z.string(),
			action: z.string(),
			value: z.number(),
		})
	),
	brewingWater: z.string().optional(),
	methodName: z.string().optional(),
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

export const createGearSchema = z.object({
	name: z.string().min(1),
	type: z.nativeEnum(GEAR_TYPE),
	details: z.string().optional(),
});

export const updateGearSchema = createGearSchema.omit({
	type: true,
});

export const createBeanProfileSchema = z.object({
	origin: z.string().min(1, 'Origin is required'),
	producer: z.string().min(1, 'Producer is required'),
	roaster: z.string().min(1, 'Roaster is required'),
	farm: z.string().min(1, 'Farm is required'),
	process: z.string().min(1, 'Process is required'),
	variety: z.string().min(1, 'Variety is required'),
	elevation: z.string().min(1, 'Elevation is required'),
	finished: z.boolean(),
	description: z.string().optional(),
});

export const editBeanProfileSchema = createBeanProfileSchema;
