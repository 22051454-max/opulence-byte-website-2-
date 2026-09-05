import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Opulence Byte — Digital Craft With A Point Of View',
  description: 'Opulence Byte designs and engineers digital experiences for companies ready to move with intention.',
  generator: 'Opulence Byte',
  icons: {
    icon: '/OB.png',
    apple: '/OB.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: '#080c12',
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
