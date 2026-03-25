import { ButtonHTMLAttributes, forwardRef } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: 'primary' | 'secondary' | 'danger';
  variant?: 'solid' | 'outlined';
  commandfor?: string;
  command?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', color = 'primary', variant = 'solid', children, commandfor, command, ...props }, ref) => {
    const combinedClassName = `${styles.button} ${styles[color]} ${styles[variant]} ${className}`.trim();

    // Handling the new commandfor/command properties natively
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const invokerProps = commandfor || command ? { commandfor, command } as any : {};

    return (
      <button
        ref={ref}
        className={combinedClassName}
        {...invokerProps}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
