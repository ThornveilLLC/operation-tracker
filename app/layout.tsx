import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OPERATION TRACKER — Real-Time Conflict Intelligence",
  description: "Real-time intelligence dashboard for the Iran/Israel/US conflict. All data sourced from verified external sources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        {children}
      </body>
    </html>
  );
}
