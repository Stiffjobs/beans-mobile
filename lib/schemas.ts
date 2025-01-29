import { z } from 'zod';

export const signInSchema = z.object({
	email: z.string().email('Please enter a valid email'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z
	.object({
		email: z.string().email('Invalid email address'),
		password: z.string().min(8, 'Password must be at least 8 characters'),
		confirmPassword: z.string(),
		username: z.string().min(3, 'Username must be at least 3 characters'),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	});
