import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PowerScale Assistant',
  description: 'Deterministic power scaling evaluator based only on provided evidence.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
