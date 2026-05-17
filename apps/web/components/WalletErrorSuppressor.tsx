'use client';

import { useEffect } from 'react';

// Suppresses browser-extension errors that pollute the Next.js overlay.
// These are not application errors — they come from wallet extensions
// (MetaMask, OKX, etc.) conflicting over window.ethereum.
const SUPPRESSED = [
  'Cannot redefine property: ethereum',
  'Failed to connect to MetaMask',
  'evmAsk',
  'inpage.js',
];

export default function WalletErrorSuppressor() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const msg = event.message ?? '';
      const src = event.filename ?? '';
      if (SUPPRESSED.some(s => msg.includes(s) || src.includes(s))) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const msg = String(event.reason?.message ?? event.reason ?? '');
      if (SUPPRESSED.some(s => msg.includes(s))) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleRejection, true);
    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleRejection, true);
    };
  }, []);

  return null;
}
