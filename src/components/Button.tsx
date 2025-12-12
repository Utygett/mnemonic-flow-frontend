// @ts-ignore: CSS module without type declarations
import styles from './Button.module.css';
import { cn } from './ui/utils';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({ children, onClick, variant = 'primary', size = 'medium', fullWidth = false, disabled = false, className = '' }: ButtonProps) {
  const variantClass = variant === 'primary' ? 'btn--primary' : 'btn--secondary';
  const sizeClass = size === 'small' ? 'btn--small' : size === 'large' ? 'btn--large' : 'btn--medium';
  const fullClass = fullWidth ? 'btn--full' : '';

  const classes = cn(styles.button, variantClass, sizeClass, fullClass, className);

  return (
    <button className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
