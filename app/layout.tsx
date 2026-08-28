import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jussara Ribeiro | Corretora Imobiliária',
  description: 'Compra e venda de imóveis em Campo Belo e região.',
  openGraph: {
    title: 'Jussara Ribeiro | Corretora Imobiliária',
    description: 'Compra e venda de imóveis em Campo Belo e região.',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: 'https://idyezzltmfyxlpljcetk.supabase.co/storage/v1/object/public/fotos/logo-jussara.png',
        width: 1200,
        height: 630,
        alt: 'Jussara Ribeiro Imóveis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jussara Ribeiro | Corretora Imobiliária',
    description: 'Compra e venda de imóveis em Campo Belo e região.',
    images: ['https://idyezzltmfyxlpljcetk.supabase.co/storage/v1/object/public/fotos/logo-jussara.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Open Sans', sans-serif" }}>
        {children}
      </body>
    </html>
  )
}