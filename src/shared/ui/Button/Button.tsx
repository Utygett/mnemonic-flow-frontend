import React from 'react';
// @ts-ignore: CSS module without type declarations
import styles from './Button.module.css';
import { cn } from '../../../components/ui/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
};

export function Button({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  const variantClass = variant === 'primary' ? 'btn--primary' : 'btn--secondary';
  const sizeClass = size === 'small' ? 'btn--small' : size === 'large' ? 'btn--large' : 'btn--medium';
  const fullClass = fullWidth ? 'btn--full' : '';

  const classes = cn(styles.button, variantClass, sizeClass, fullClass, className);

  return (
    <button className={classes} type={type} {...rest}>
      {children}
    </button>
  );
}
