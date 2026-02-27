import type { Metadata } from "next";
import { Inter, Calligraffitti, Courgette } from 'next/font/google';
import "./globals.css";
import localFont from 'next/font/local'
import { Analytics } from "@vercel/analytics/next";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const calligraffitti = Calligraffitti({
  weight: '400',
  variable: "--font-calligraffitti",
  subsets: ["latin"],
});

const courgette = Courgette({
  weight: '400',
  variable: "--font-courgette",
  subsets: ["latin"],
});


const aeonikFont = localFont({
  src: [
    {
      path: '../fonts/AeonikTRIAL-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/AeonikTRIAL-Bold.otf',
      weight: '700',
      style: 'normal',
    },
 
  ],
  variable: '--font-aeonik', 
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Breed",
  description: "A spiritual companion app built to help you stay consistent in your walk with God",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable}  ${aeonikFont.variable} ${calligraffitti.variable} ${courgette.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
