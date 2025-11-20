import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useLogin } from '#api/hooks/useAuth';

import styles from './AuthForm.module.css';

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
    const [showPassword, setShowPassword] = useState(false);
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
                                <div className={styles.passwordInputWrapper}>
                                    <input
                                        {...register('password')}
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        placeholder="******"
                                        className={styles.input}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={styles.eyeButton}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <div>{errors.password.message}</div>
                                )}
                            </div>
                        </div>

                        <div className={styles.buttonContainer}>
                            <button
                                type="submit"
                                disabled={isPending}
                                className={styles.button}
                            >
                                {isPending ? 'Signing in...' : 'Sign in'}
                            </button>

                            <div>Don't have an account? Contact us.</div>
                        </div>
                    </form>
                </div>
            </div>

            <div className={styles.needHelp}>Need help? Contact support@efsora.com</div>
        </div>
    );
};
