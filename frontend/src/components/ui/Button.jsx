import clsx from 'clsx';
import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  ...props
}) {
  return (
    <button
      className={clsx(styles.btn, styles[variant], styles[size], loading && styles.loading, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className={styles.spinner} />}
      {children}
    </button>
  );
}
