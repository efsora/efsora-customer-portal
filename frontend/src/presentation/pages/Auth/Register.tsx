import { RegisterForm } from '#presentation/components/auth/AuthForm/RegisterForm';

import styles from './Auth.module.css';

export const RegisterPage = () => {
    return (
        <div className={styles.container}>
            <RegisterForm />
        </div>
    );
};
