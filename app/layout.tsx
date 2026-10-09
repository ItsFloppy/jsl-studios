import type { Metadata } from 'next'

// Shared by the site and the embedded Studio, so it holds nothing either one would not
// want: the site's stylesheet, header and footer live in app/(site)/layout.tsx.
export const metadata: Metadata = {
  title: 'JSL Studios',
  icons: { icon: { url: '/favicon.svg', type: 'image/svg+xml' } },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
