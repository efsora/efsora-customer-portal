import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useRegister } from '#api/hooks/useAuth';

import styles from './AuthForm.module.css';

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
        surname: z
            .string()
            .min(1, 'Surname is required')
            .max(255, 'Surname must be less than 255 characters'),
        password: z
            .string()
            .min(1, 'Password is required')
            .min(12, 'Password must be at least 12 characters long'),
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
                surname: data.surname,
                password: data.password,
            },
            {
                onSuccess: () => {
                    // Redirect to home page on successful registration
                    navigate('/');
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
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <div className={styles.innerContainer}>

                    <div className={styles.title}>
                        <img src="efsora-labs-brand.svg" alt="efsora-brand" />
                        <div className={styles.subtitle}>
                            <div className={styles.welcome}>Welcome</div>
                            <div>Register your account to continue.</div>
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
                                <label htmlFor="name">Name</label>
                                <input
                                    {...register('name')}
                                    id="name"
                                    type="text"
                                    autoComplete="given-name"
                                    placeholder="e.g., John"
                                    className={styles.input}
                                />
                                {errors.name && (
                                    <p className={styles.errorMessage}>{errors.name.message}</p>
                                )}
                            </div>

                            <div className={styles.inputContainer}>
                                <label htmlFor="surname">Surname</label>
                                <input
                                    {...register('surname')}
                                    id="surname"
                                    type="text"
                                    autoComplete="family-name"
                                    placeholder="e.g., Doe"
                                    className={styles.input}
                                />
                                {errors.surname && (
                                    <p className={styles.errorMessage}>{errors.surname.message}</p>
                                )}
                            </div>

                            <div className={styles.inputContainer}>
                                <label htmlFor="email">Email</label>
                                <input
                                    {...register('email')}
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className={styles.input}
                                />
                                {errors.email && (
                                    <p className={styles.errorMessage}>{errors.email.message}</p>
                                )}
                            </div>

                            <div className={styles.inputContainer}>
                                <label htmlFor="password">
                                    Password
                                    <span className={styles.hint}>Minimum 12 characters</span>
                                </label>
                                <div className={styles.passwordInputWrapper}>
                                    <input
                                        {...register('password')}
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
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
                                            <img src="/auth/open-eye.svg" alt="open-eye" />
                                        ) : (
                                            <img src="/auth/closed-eye.svg" alt="closed-eye" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className={styles.errorMessage}>{errors.password.message}</p>
                                )}
                            </div>

                            <div className={styles.inputContainer}>
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className={styles.passwordInputWrapper}>
                                    <input
                                        {...register('confirmPassword')}
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="******"
                                        className={styles.input}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className={styles.eyeButton}
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirmPassword ? (
                                            <img src="/auth/open-eye.svg" alt="open-eye" />
                                        ) : (
                                            <img src="/auth/closed-eye.svg" alt="closed-eye" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className={styles.errorMessage}>{errors.confirmPassword.message}</p>
                                )}
                            </div>
                        </div>

                        <div className={styles.buttonContainer}>
                            <button
                                type="submit"
                                disabled={isPending}
                                className={styles.button}
                            >
                                {isPending ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className={styles.needHelp}>
                Need help? Contact{' '}
                <a href="mailto:support@efsora.com" className={styles.emailLink}>
                    support@efsora.com
                </a>
            </div>

        </div>
    );
};
