import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { AppShell } from '@/components/app-shell'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0f1a',
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'GottaGO - Income protection for delivery partners',
  description: 'Weekly parametric income protection for Swiggy and Zomato delivery partners. Zero paperwork, automatic payouts in 2 hours when disruptions strike.',
  keywords: ['gig worker insurance', 'delivery partner income protection', 'parametric insurance India', 'swiggy zomato insurance'],
  openGraph: {
    title: 'Protect your earnings',
    description: 'Get paid automatically when rain, heat, or bandh destroys your earning day.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-surface text-text-primary antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
