import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OpenPanelComponent } from "@openpanel/nextjs";
import { Providers } from "./providers";
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "PostsSky",
  description: "An ode to a community app by Read.cv",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Providers>
        <OpenPanelComponent
          clientId="5c738962-4cac-43d2-b7fc-04f1b4786a38"
          trackScreenViews={true}
          // trackAttributes={true}
          // trackOutgoingLinks={true}
          // If you have a user id, you can pass it here to identify the user
          // profileId={'123'}
        />
        <body className={`Root antialiased bg-background text-text-primary text-sm`}>
          {children}
        </body>
      </Providers>
    </html>
  );
}
