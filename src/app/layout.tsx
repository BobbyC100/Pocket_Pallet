import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { AppHeader } from '@/components/AppHeader';

export const metadata = { title: "Banyan" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen antialiased" suppressHydrationWarning>
          <AppHeader />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
