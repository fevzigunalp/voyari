import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const siteDescription =
  "AI destekli kişiselleştirilmiş tatil planlayıcısı — gulet, road trip, karavan, cruise ve daha fazlası.";

export const metadata: Metadata = {
  metadataBase: new URL("https://voyari.ocianix.com"),
  title: {
    default: "Voyari — Hayalinizdeki Tatili Tasarlayalım",
    template: "%s | Voyari",
  },
  description: siteDescription,
  applicationName: "Voyari",
  authors: [{ name: "Ocianix" }],
  alternates: {
    canonical: "/",
  },
  keywords: [
    "Voyari",
    "tatil planlayıcı",
    "AI seyahat",
    "gulet",
    "road trip",
    "karavan",
    "cruise",
    "kültür turu",
    "wellness tatil",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    siteName: "Voyari",
    title: "Voyari — Hayalinizdeki Tatili Tasarlayalım",
    description: siteDescription,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Voyari — Hayalinizdeki Tatili Tasarlayalım",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Voyari — Hayalinizdeki Tatili Tasarlayalım",
    description: siteDescription,
    images: [
      {
        url: "/og-image.svg",
        alt: "Voyari — Hayalinizdeki Tatili Tasarlayalım",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.svg",
    apple: "/logo-mark.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#D4A853",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${playfair.variable} ${dmSans.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary">
        {children}
      </body>
    </html>
  );
}
