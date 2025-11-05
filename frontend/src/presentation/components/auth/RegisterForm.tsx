import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useRegister } from '#api/hooks/useAuth';

/**
 * Register form validation schema
 */
const registerSchema = z
    .object({
        email: z
            .string()
            .min(1, 'Email is required')
            .email('Invalid email format'),
        name: z
            .string()
            .min(1, 'Name is required')
            .max(255, 'Name must be less than 255 characters'),
        password: z
            .string()
            .min(1, 'Password is required')
            .min(8, 'Password must be at least 8 characters long'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Register form component
 * Handles user registration with email, name, and password
 */
export const RegisterForm = () => {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);
    const { mutate: registerMutate, isPending } = useRegister();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = (data: RegisterFormData) => {
        setServerError(null);
        registerMutate(
            {
                email: data.email,
                name: data.name,
                password: data.password,
            },
            {
                onSuccess: () => {
                    // Redirect to dashboard on successful registration
                    navigate('/dashboard');
                },
                onError: (error) => {
                    setServerError(
                        error instanceof Error
                            ? error.message
                            : 'Registration failed. Please try again.',
                    );
                },
            },
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                </div>

                <form
                    className="mt-8 space-y-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    {serverError && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        {serverError}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="name" className="sr-only">
                                Full Name
                            </label>
                            <input
                                {...register('name')}
                                id="name"
                                type="text"
                                autoComplete="name"
                                placeholder="Full Name"
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                                    errors.name ? 'border-red-300' : ''
                                }`}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                {...register('email')}
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="Email address"
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                                    errors.email ? 'border-red-300' : ''
                                }`}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                {...register('password')}
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Password"
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                                    errors.password ? 'border-red-300' : ''
                                }`}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="sr-only"
                            >
                                Confirm Password
                            </label>
                            <input
                                {...register('confirmPassword')}
                                id="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Confirm Password"
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                                    errors.confirmPassword
                                        ? 'border-red-300'
                                        : ''
                                }`}
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending
                                ? 'Creating account...'
                                : 'Create account'}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <a
                                href="/login"
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Sign in
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};
