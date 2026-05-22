import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { AuthBoundary } from "./auth-boundary";
import "./globals.css";

const appName = "爱上背单词";
const appDescription = "AI 陪伴式 K12 背单词应用，覆盖刷词、SRS 复习、AI 故事、PK、OCR 和家长周报。";
const siteUrl = "https://aishang-vocab.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: appName,
  title: {
    default: appName,
    template: `%s · ${appName}`
  },
  description: appDescription,
  keywords: ["K12 背单词", "AI 英语学习", "中高考词汇", "SRS 复习", "英语单词 App"],
  authors: [{ name: appName }],
  creator: appName,
  publisher: appName,
  category: "education",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }]
  },
  appleWebApp: {
    capable: true,
    title: appName,
    statusBarStyle: "default"
  },
  openGraph: {
    title: appName,
    description: appDescription,
    url: siteUrl,
    siteName: appName,
    locale: "zh_CN",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "爱上背单词 AI 陪伴式 K12 背单词应用"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description: appDescription,
    images: ["/og-image.svg"]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F1FF" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1340" }
  ]
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" data-theme="purple">
      <body>
        <AnalyticsProvider />
        <AuthBoundary>{children}</AuthBoundary>
      </body>
    </html>
  );
}
