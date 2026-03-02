import type { Metadata } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';

import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'StakeLedger',
  description: 'Ledger, control de bank y registro de apuestas con datos reales.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={cn(spaceGrotesk.variable, manrope.variable)}>
      <body className="min-h-screen bg-background text-foreground font-body antialiased">
        <AuthProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
