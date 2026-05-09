import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Semester 2 CHEFS Online Registration",
  description: "CHEFS Semester 2 online registration form",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
