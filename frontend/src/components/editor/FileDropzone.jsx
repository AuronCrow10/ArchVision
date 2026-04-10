import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';
import styles from './FileDropzone.module.css';

export default function FileDropzone({ label, hint, value, onFile, accept = 'image/*' }) {
  const [preview, setPreview] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: accept === 'image/*'
      ? { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }
      : { [accept]: [] },
    multiple: false,
    onDrop: (files) => files[0] && onFile(files[0]),
  });

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>{label}</span>

      {value ? (
        <div className={styles.preview}>
          <img src={preview} alt={label} className={styles.previewImg} />
          <button className={styles.remove} onClick={() => onFile(null)} title="Rimuovi">
            <X size={14} />
          </button>
          <span className={styles.filename}>{value.name}</span>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}
        >
          <input {...getInputProps()} />
          <UploadCloud size={24} className={styles.icon} />
          <p className={styles.text}>
            {isDragActive ? 'Rilascia qui' : 'Trascina e rilascia oppure fai clic per caricare'}
          </p>
          {hint && <p className={styles.hint}>{hint}</p>}
        </div>
      )}
    </div>
  );
}
