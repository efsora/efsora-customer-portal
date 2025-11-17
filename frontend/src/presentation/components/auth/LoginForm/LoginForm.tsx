import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useLogin } from '#api/hooks/useAuth';

import styles from './LoginForm.module.css';

/**
 * Login form validation schema
 */
const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login form component
 * Handles user login with email and password
 */
export const LoginForm = () => {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);
    const { mutate: loginMutate, isPending } = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: LoginFormData) => {
        setServerError(null);
        loginMutate(data, {
            onSuccess: () => {
                // Redirect to home page on successful login
                navigate('/');
            },
            onError: (error) => {
                setServerError(
                    error instanceof Error
                        ? error.message
                        : 'Login failed. Please try again.',
                );
            },
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <div className={styles.innerContainer}>
                    <div className={styles.title}>
                        <img src="efsora-labs-brand.svg" alt="efsora-brand" />
                        <div className={styles.subtitle}>
                            <div className={styles.welcome}>Welcome</div>
                            <div>Sign in to your account to continue.</div>
                        </div>
                    </div>

                    <form
                        className={styles.form}
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

                        <div className={styles.inputContainers}>
                            <div className={styles.inputContainer}>
                                <label htmlFor="email">Email</label>
                                <input
                                    {...register('email')}
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@company.com"
                                    className={styles.input}
                                />
                                {errors.email && <p>{errors.email.message}</p>}
                            </div>

                            <div className={styles.inputContainer}>
                                <label htmlFor="password">Password</label>
                                <input
                                    {...register('password')}
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder="******"
                                    className={styles.input}
                                />
                                {errors.password && (
                                    <div>{errors.password.message}</div>
                                )}
                            </div>
                        </div>

                        <div className={styles.singInButtonContainer}>
                            <button
                                type="submit"
                                disabled={isPending}
                                className={styles.signInButton}
                            >
                                {isPending ? 'Signing in...' : 'Sign in'}
                            </button>

                            <div>
                                Don't have an account?{' '}
                                <a
                                    href="/register"
                                    className={styles.inlineLink}
                                >
                                    Contact us.
                                </a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div>Need help? Contact support@efsora.com</div>
        </div>
    );
};
