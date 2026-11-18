import { useContext } from 'react';
import { ToastContext } from '../components/ui/ToastProvider.jsx';

/**
 * Access the toast queue. Must be used inside ToastProvider.
 * @returns {{ show: (text: string) => void }}
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
