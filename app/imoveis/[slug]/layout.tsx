import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const LOGO_URL = 'https://idyezzltmfyxlpljcetk.supabase.co/storage/v1/object/public/fotos/logo-jussara.png'
const BASE_URL = 'https://www.jussararibeiro-imoveis.com.br'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const { data: imovel } = await supabase
    .from('imoveis')
    .select('titulo, descricao, preco, cidade, bairro, quartos, area, fotos, slug')
    .eq('slug', params.slug)
    .single()

  if (!imovel) {
    return {
      title: 'Imóvel | Jussara Ribeiro Imóveis',
      description: 'Confira nossos imóveis disponíveis em Campo Belo e região.',
    }
  }

  const foto = imovel.fotos?.[0] || LOGO_URL
  const preco = imovel.preco > 0
    ? `R$ ${imovel.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : 'Consulte o valor'

  const detalhes = [
    imovel.quartos > 0 ? `${imovel.quartos} quartos` : null,
    imovel.area > 0 ? `${imovel.area} m²` : null,
    imovel.bairro ? imovel.bairro : null,
    imovel.cidade ? imovel.cidade : null,
  ].filter(Boolean).join(' • ')

  const descricao = imovel.descricao
    ? imovel.descricao.slice(0, 150)
    : `${preco}${detalhes ? ` • ${detalhes}` : ''}`

  const url = `${BASE_URL}/imoveis/${imovel.slug}`

  return {
    title: `${imovel.titulo} | Jussara Ribeiro Imóveis`,
    description: descricao,
    openGraph: {
      title: imovel.titulo,
      description: descricao,
      url,
      type: 'website',
      locale: 'pt_BR',
      images: [
        {
          url: foto,
          width: 1200,
          height: 630,
          alt: imovel.titulo,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: imovel.titulo,
      description: descricao,
      images: [foto],
    },
    alternates: {
      canonical: url,
    },
  }
}

export default function ImovelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
