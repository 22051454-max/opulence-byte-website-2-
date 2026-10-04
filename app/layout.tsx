import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Space_Grotesk, Space_Mono } from 'next/font/google'
import { Chatbot } from '@/components/chatbot'
import { Effects } from '@/components/effects'
import { Intro } from '@/components/intro'
import { SessionProvider } from '@/components/session'
import { themeScript } from '@/components/theme-toggle'
import { products } from '@/lib/products'
import { siteUrl } from '@/lib/site'
import './globals.css'

const body = DM_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' })
const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const code = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-code', display: 'swap' })


export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: 'Opulence Byte | Software, SaaS & AI for ambitious businesses', template: '%s | Opulence Byte' },
  description: 'Opulence Byte builds websites, apps, AI agents and ready-to-deploy SaaS: hospital ERP, hotel ERP, school ERP, CRM, HRMS and more.',
  applicationName: 'Opulence Byte',
  keywords: ['hospital ERP', 'hotel ERP', 'school ERP', 'SaaS India', 'web development Ranchi', 'AI chatbot', 'Opulence Byte'],
  openGraph: {
    type: 'website',
    siteName: 'Opulence Byte',
    title: 'Opulence Byte | Software, SaaS & AI',
    description: `Websites, apps, AI agents and ${products.length} ready-to-deploy SaaS products for hospitals, hotels, schools and more.`,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Opulence Byte' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og.png'] },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-dark-32x32.png', sizes: '32x32' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: '#05080f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" className={`${body.variable} ${display.variable} ${code.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Google AdSense site verification */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1014908022725289" crossOrigin="anonymous" />
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18494503314" />
        <script
          dangerouslySetInnerHTML={{
            __html: "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\n\ngtag('config', 'AW-18494503314');",
          }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <SessionProvider>
          <Effects />
          <Intro />
          {children}
          <Chatbot />
        </SessionProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
