import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const fontHeading = localFont({
  src: "./fonts/Inter-Bold.woff2",
  variable: "--font-heading",
  weight: "700",
});

const fontBody = localFont({
  src: "./fonts/Arimo-Regular.woff2",
  variable: "--font-body",
  weight: "400",
});

export const metadata: Metadata = {
  title: "CDN Survey Application",
  description: "A mobile-first field data collection survey tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontHeading.variable} ${fontBody.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
