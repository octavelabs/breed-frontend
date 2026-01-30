import type { Metadata } from "next";
import { Inter, Calligraffitti } from 'next/font/google';
import "./globals.css";
import Navbar from "./components/landingPage/Navbar";
import Footer from "./components/landingPage/Footer";
import localFont from 'next/font/local'


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const calligraffitti = Calligraffitti({
  weight: '400',
  variable: "--font-calligraffitti",
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
        className={`${inter.variable}  ${aeonikFont.variable} ${calligraffitti.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
