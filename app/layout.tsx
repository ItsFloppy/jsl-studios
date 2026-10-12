import type { Metadata } from 'next'

// Shared by the site and the embedded Studio, so it holds nothing either one would not
// want: the site's stylesheet, header and footer live in app/(site)/layout.tsx. The icons
// are app/favicon.ico, icon.png and apple-icon.png, made from brand/jsl-logo.png.
export const metadata: Metadata = {
  title: 'JSL Studios',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
