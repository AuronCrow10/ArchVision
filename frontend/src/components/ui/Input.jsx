import clsx from 'clsx';
import styles from './Input.module.css';

export default function Input({ label, error, className, ...props }) {
  return (
    <div className={clsx(styles.wrapper, className)}>
      {label && <label className={styles.label}>{label}</label>}
      <input className={clsx(styles.input, error && styles.hasError)} {...props} />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
