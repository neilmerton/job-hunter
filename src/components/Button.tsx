import { ButtonHTMLAttributes, forwardRef } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  commandfor?: string;
  command?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', children, commandfor, command, ...props }, ref) => {
    const combinedClassName = `${styles.button} ${styles[variant]} ${className}`.trim();

    // Handling the new commandfor/command properties natively
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
