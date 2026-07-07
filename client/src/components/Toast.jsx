import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className={`toast ${type === 'danger' ? 'toast-danger' : 'toast-success'}`}>
      {type === 'danger' ? <AlertCircle size={18} style={{ color: 'var(--accent-red)' }} /> : <CheckCircle2 size={18} style={{ color: 'var(--accent-green)' }} />}
      <span>{message}</span>
    </div>
  );
};

export default Toast;
export { Toast };
