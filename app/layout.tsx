import type { Metadata, Viewport } from "next";
import { Inter, Calligraffitti, Courgette } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const calligraffitti = Calligraffitti({
  weight: "400",
  variable: "--font-calligraffitti",
  subsets: ["latin"],
  display: "swap",
});

const courgette = Courgette({
  weight: "400",
  variable: "--font-courgette",
  subsets: ["latin"],
  display: "swap",
});

const aeonikFont = localFont({
  src: [
    {
      path: "../fonts/AeonikTRIAL-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/AeonikTRIAL-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-aeonik",
  display: "swap",
});

const SITE_NAME = "Breed";
const SITE_URL = "https://joinbreed.com";
const SITE_DESCRIPTION =
  "A spiritual companion app built to help you stay consistent in your walk with God";
const OG_IMAGE_URL =
  "https://res.cloudinary.com/dbdgevqyn/image/upload/v1772413025/breed/breed-logo.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,

  applicationName: SITE_NAME,
  referrer: "origin-when-cross-origin",
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  // If you later add per-route canonical URLs, Next will still generate sensible defaults.
  alternates: {
    canonical: "/",
  },

  keywords: [
    "Breed app",
    "joinbreed",
    "Christian growth app",
    "Christian discipleship app",
    "Christian theology courses",
    "online Christian theology classes",
    "Bible doctrine courses",
    "Christian education platform",
    "Christian mentorship app",
    "spiritual mentorship platform",
    "discipleship training app",
    "Christian leadership training",
    "faith-based learning platform",
    "Christian community app",
    "online Christian community",
    "Christian accountability groups",
    "prayer groups app",
    "Bible study community",
    "spiritual growth program",
    "tools for consistent walk with God",
  ],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} logo`,
      },
    ],
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_URL],
  },

  icons: {
    icon: [{ url: "/favicon.ico" }],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png" }],
  },

  manifest: "/site.webmanifest",

  category: "technology",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${aeonikFont.variable} ${calligraffitti.variable} ${courgette.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
