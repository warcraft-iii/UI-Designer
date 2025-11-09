import { useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface AlertOptions {
  title?: string;
  message: string;
  type?: 'info' | 'warning' | 'danger';
}

export const useAlert = () => {
  const [alert, setAlert] = useState<AlertOptions | null>(null);

  const showAlert = (options: AlertOptions | string) => {
    if (typeof options === 'string') {
      setAlert({ message: options, type: 'info' });
    } else {
      setAlert(options);
    }
  };

  const AlertComponent = alert ? (
    <ConfirmDialog
      title={alert.title || '提示'}
      message={alert.message}
      confirmText="确定"
      type={alert.type || 'info'}
      onConfirm={() => setAlert(null)}
    />
  ) : null;

  return { showAlert, AlertComponent };
};
