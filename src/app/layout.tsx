import type { Metadata } from 'next';

import { AuthProvider } from '@/contexts/auth-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'StakeLedger',
  description: 'Ledger y control de apuestas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="app-body">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
