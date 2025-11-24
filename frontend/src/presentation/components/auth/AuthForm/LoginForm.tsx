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
        <div className={styles.container} data-testid="login-page-container">
            <div
                className={styles.formContainer}
                data-testid="login-form-wrapper"
            >
                <div className={styles.innerContainer}>
                    <div
                        className={styles.title}
                        data-testid="login-form-title"
                    >
                        <img src="efsora-labs-brand.svg" alt="efsora-brand" />
                        <div className={styles.subtitle}>
                            <div className={styles.welcome}>Welcome</div>
                            <div>Sign in to your account to continue.</div>
                        </div>
                    </div>

                    <form
                        className={styles.form}
                        data-testid="login-form"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        {serverError && (
                            <div
                                className="rounded-md bg-red-50 p-4"
                                data-testid="login-form-error-alert"
                            >
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3
                                            className="text-sm font-medium text-red-800"
                                            data-testid="login-form-error-message"
                                        >
                                            {serverError}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div
                            className={styles.inputContainers}
                            data-testid="login-form-inputs-container"
                        >
                            <div
                                className={styles.inputContainer}
                                data-testid="login-form-email-field"
                            >
                                <label htmlFor="email">Email</label>
                                <input
                                    {...register('email')}
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@company.com"
                                    className={styles.input}
                                    data-testid="login-form-email-input"
                                />
                                {errors.email && (
                                    <div
                                        className={styles.errorMessage}
                                        data-testid="login-form-email-error"
                                    >
                                        {errors.email.message}
                                    </div>
                                )}
                            </div>

                            <div
                                className={styles.inputContainer}
                                data-testid="login-form-password-field"
                            >
                                <label htmlFor="password">Password</label>
                                <div className={styles.passwordInputWrapper}>
                                    <input
                                        {...register('password')}
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        autoComplete="current-password"
                                        placeholder="******"
                                        className={styles.input}
                                        data-testid="login-form-password-input"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className={styles.eyeButton}
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                    >
                                        {showPassword ? (
                                            <img
                                                src="/auth/open-eye.svg"
                                                alt="open-eye"
                                            />
                                        ) : (
                                            <img
                                                src="/auth/closed-eye.svg"
                                                alt="closed-eye"
                                            />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p
                                        className={styles.errorMessage}
                                        data-testid="login-form-password-error"
                                    >
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div
                            className={styles.buttonContainer}
                            data-testid="login-form-submit-container"
                        >
                            <button
                                type="submit"
                                disabled={isPending}
                                className={styles.button}
                                data-testid="login-form-submit-button"
                            >
                                {isPending ? 'Signing In...' : 'Sign In'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className={styles.needHelp}>
                Need help? Contact{' '}
                <a
                    href="mailto:support@efsora.com"
                    className={styles.emailLink}
                >
                    support@efsora.com
                </a>
            </div>
        </div>
    );
};
