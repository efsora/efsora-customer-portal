import { LoginForm } from '#presentation/components/auth/LoginForm/LoginForm';
import styles from './Login.module.css'
/**
 * Login page
 * Displays the login form
 */
export function Login() {
    return (
        <div className={styles.container}>
            <LoginForm />
        </div>
    );
};
