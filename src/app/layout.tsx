import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = { title: "Banyan" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-gray-900 text-white antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
