import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jussara Ribeiro | Corretora Imobiliária',
  description: 'Compra e venda de imóveis em Campo Belo e região.',
  openGraph: {
    title: 'Jussara Ribeiro | Corretora Imobiliária',
    description: 'Compra e venda de imóveis em Campo Belo e região.',
    locale: 'pt_BR',
    type: 'website',
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