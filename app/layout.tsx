import type { Metadata } from 'next'
import { Sora, Space_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'

import './globals.css'

const sora = Sora({ subsets: ['latin'], variable: '--font-sora', weight: ['400', '500', '600', '700'] })
const spaceMono = Space_Mono({ subsets: ['latin'], variable: '--font-space-mono', weight: ['400', '700'] })

export const metadata: Metadata = {
  title: 'Opulence Byte - Digital Innovation & Security Solutions',
  description: 'Enterprise technology solutions for secure, scalable digital transformation. Led by Avinash Singh Munda.',
  generator: 'v0.app',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${sora.variable} ${spaceMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem forcedTheme={undefined}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
