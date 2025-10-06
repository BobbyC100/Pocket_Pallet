import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { AppHeader } from '@/components/AppHeader';

export const metadata = { title: "Banyan" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "bg-banyan-bg-surface shadow-banyan-high border border-banyan-border-default",
          headerTitle: "text-banyan-text-default",
          headerSubtitle: "text-banyan-text-subtle",
          socialButtonsBlockButton: "border-banyan-border-default hover:bg-banyan-mist text-banyan-text-default",
          socialButtonsBlockButtonText: "text-banyan-text-default",
          formButtonPrimary: "bg-banyan-primary hover:bg-banyan-primary-hover text-banyan-primary-contrast",
          formFieldInput: "border-banyan-border-default text-banyan-text-default bg-banyan-bg-surface",
          formFieldLabel: "text-banyan-text-default",
          footerActionLink: "text-banyan-primary hover:text-banyan-primary-hover",
          identityPreviewText: "text-banyan-text-default",
          identityPreviewEditButton: "text-banyan-primary",
          formFieldInputShowPasswordButton: "text-banyan-text-subtle hover:text-banyan-text-default",
          otpCodeFieldInput: "border-banyan-border-default text-banyan-text-default bg-banyan-bg-surface",
          formResendCodeLink: "text-banyan-primary hover:text-banyan-primary-hover",
          footerActionText: "text-banyan-text-subtle",
          badge: "bg-banyan-primary text-banyan-primary-contrast",
        },
        variables: {
          colorPrimary: '#2EAD7B',
          colorText: '#F5F7FA',
          colorBackground: '#13151A',
          colorInputBackground: '#13151A',
          colorInputText: '#F5F7FA',
        }
      }}
    >
      <html lang="en">
        <body className="min-h-screen antialiased bg-white dark:bg-black" suppressHydrationWarning>
          <AppHeader />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
