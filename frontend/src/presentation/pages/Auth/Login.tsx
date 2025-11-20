import { LoginForm } from '#presentation/components/auth/AuthForm/LoginForm';

import styles from './Auth.module.css';

export function Login() {
    return (
        <div className={styles.container}>
            <LoginForm />
        </div>
    );
}
