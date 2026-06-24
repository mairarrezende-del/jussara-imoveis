'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type Imovel = {
  id: string
  titulo: string
  descricao: string
  preco: number
  tipo: string
  zona: string
  cidade: string
  bairro: string
  endereco: string
  area: number
  quartos: number
  banheiros: number
  vagas: number
  fotos: string[]
  video_url: string
  slug: string
  destaque: boolean
  status: string
}

const TIPO_LABEL: Record<string, string> = {
  casa: 'Casa', apartamento: 'Apartamento', lote: 'Lote / Terreno',
  comercial: 'Comercial', chacara: 'Chácara / Sítio', fazenda: 'Fazenda'
}

const LOGO_URL = 'https://idyezzltmfyxlpljcetk.supabase.co/storage/v1/object/public/fotos/logo-jussara.png'
const WPP = '5535997461643'
const BASE_URL = 'https://www.jussararibeiro-imoveis.com.br'

const s = {
  verde: '#043137', verdeM: '#065460', ouro: '#DFC078',
  branco: '#FFFFFF', off: '#F8F6F2', cinza: '#7A7A7A',
  borda: 'rgba(223,192,120,0.22)'
}

function formatarPreco(preco: number): string {
  return preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ImovelPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [imovel, setImovel] = useState<Imovel | null>(null)
  const [fotoIdx, setFotoIdx] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) fetchImovel()
  }, [slug])

  async function fetchImovel() {
    const { data } = await supabase.from('imoveis').select('*').eq('slug', slug).single()
    if (data) setImovel(data)
    setLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: s.verde, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: s.ouro, fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem' }}>Carregando...</p>
    </div>
  )

  if (!imovel) return (
    <div style={{ minHeight: '100vh', background: s.verde, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <p style={{ color: s.ouro, fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>Imóvel não encontrado</p>
      <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', textDecoration: 'none' }}>← Voltar ao início</Link>
    </div>
  )

  const urlImovel = `${BASE_URL}/imoveis/${imovel.slug}`

  return (
    <div style={{ minHeight: '100vh', background: s.off, fontFamily: 'Open Sans, sans-serif' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 300, background: s.verde, borderBottom: `1px solid ${s.borda}`, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5vw' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <img src={LOGO_URL} alt="Jussara Ribeiro Imóveis" style={{ height: 88, width: 'auto', objectFit: 'contain' }} />
        </Link>
        <Link href="/#imoveis" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          ← Ver todos os imóveis
        </Link>
      </nav>

      {/* FOTOS */}
      <div style={{ background: s.verde, position: 'relative' }}>
        {imovel.fotos && imovel.fotos.length > 0 ? (
          <div style={{ position: 'relative' }}>
            <div style={{ width: '100%', height: '80vh', overflow: 'hidden', position: 'relative' }}>
              <img src={imovel.fotos[fotoIdx]} alt={imovel.titulo} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#021e22' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(4,49,55,0.9) 0%, rgba(4,49,55,0.3) 60%, transparent 100%)', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '40%' }}>
                <img src={LOGO_URL} alt="Jussara Ribeiro" style={{ height: 80, width: 'auto', objectFit: 'contain', opacity: 0.9 }} />
              </div>
            </div>
            {imovel.fotos.length > 1 && (
              <>
                <button onClick={() => setFotoIdx(i => Math.max(0, i - 1))} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(4,49,55,0.6)', border: `1px solid rgba(223,192,120,0.35)`, color: s.ouro, width: 46, height: 46, borderRadius: '50%', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: fotoIdx === 0 ? 0.3 : 1 }}>‹</button>
                <button onClick={() => setFotoIdx(i => Math.min(imovel.fotos.length - 1, i + 1))} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(4,49,55,0.6)', border: `1px solid rgba(223,192,120,0.35)`, color: s.ouro, width: 46, height: 46, borderRadius: '50%', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: fotoIdx === imovel.fotos.length - 1 ? 0.3 : 1 }}>›</button>
                <div style={{ position: 'absolute', bottom: '1rem', right: '1.5rem', background: 'rgba(4,49,55,0.7)', color: s.ouro, fontSize: '0.72rem', padding: '0.3rem 0.8rem', borderRadius: 1, letterSpacing: '0.1em' }}>
                  {fotoIdx + 1} / {imovel.fotos.length}
                </div>
              </>
            )}
            {imovel.fotos.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 5vw', background: s.verde, overflowX: 'auto' }}>
                {imovel.fotos.map((foto, i) => (
                  <img key={i} src={foto} alt={`Foto ${i + 1}`} onClick={() => setFotoIdx(i)} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 1, cursor: 'pointer', opacity: fotoIdx === i ? 1 : 0.5, border: fotoIdx === i ? `2px solid ${s.ouro}` : '2px solid transparent', flexShrink: 0 }} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ width: '100%', height: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(223,192,120,0.3)' }}>
            <p>Sem fotos disponíveis</p>
          </div>
        )}
      </div>

      {/* CONTEÚDO */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 5vw', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem', alignItems: 'start' }}>

        {/* DETALHES */}
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[TIPO_LABEL[imovel.tipo] || imovel.tipo, imovel.zona === 'rural' ? 'Rural' : 'Urbano', imovel.cidade].map(b => (
              <span key={b} style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.25rem 0.75rem', borderRadius: 1, background: s.verde, color: s.ouro, border: `1px solid rgba(4,49,55,0.15)` }}>{b}</span>
            ))}
            <span style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.25rem 0.75rem', borderRadius: 1, background: imovel.status === 'disponivel' ? 'rgba(50,200,100,0.1)' : 'rgba(200,50,50,0.1)', color: imovel.status === 'disponivel' ? '#2d8a4e' : '#c03030', border: `1px solid ${imovel.status === 'disponivel' ? 'rgba(50,200,100,0.3)' : 'rgba(200,50,50,0.3)'}` }}>{imovel.status}</span>
          </div>

          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 400, color: s.verde, marginBottom: '0.5rem', lineHeight: 1.2 }}>{imovel.titulo}</h1>
          <p style={{ fontSize: '0.9rem', color: s.cinza, marginBottom: '2rem' }}>{imovel.bairro}{imovel.bairro ? ', ' : ''}{imovel.cidade}{imovel.endereco ? ` — ${imovel.endereco}` : ''}</p>

          {/* STATS */}
          <div style={{ display: 'flex', gap: '2rem', padding: '1.5rem', background: s.branco, borderRadius: 2, border: `1px solid rgba(4,49,55,0.08)`, marginBottom: '2rem', flexWrap: 'wrap' }}>
            {imovel.area > 0 && (
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: s.verde, display: 'block' }}>{imovel.area}</span>
                <span style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: s.cinza }}>m²</span>
              </div>
            )}
            {imovel.quartos > 0 && (
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: s.verde, display: 'block' }}>{imovel.quartos}</span>
                <span style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: s.cinza }}>Quartos</span>
              </div>
            )}
            {imovel.banheiros > 0 && (
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: s.verde, display: 'block' }}>{imovel.banheiros}</span>
                <span style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: s.cinza }}>Banheiros</span>
              </div>
            )}
            {imovel.vagas > 0 && (
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: s.verde, display: 'block' }}>{imovel.vagas}</span>
                <span style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: s.cinza }}>Vagas</span>
              </div>
            )}
          </div>

          {/* DESCRIÇÃO */}
          {imovel.descricao && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 400, color: s.verde, marginBottom: '1rem' }}>Descrição</h2>
              <p style={{ fontSize: '0.9rem', color: s.cinza, lineHeight: 1.9, whiteSpace: 'pre-line' }}>{imovel.descricao}</p>
            </div>
          )}

          {/* VÍDEO */}
          {imovel.video_url && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 400, color: s.verde, marginBottom: '1rem' }}>Vídeo</h2>
              {imovel.video_url.includes('youtube') || imovel.video_url.includes('youtu.be') ? (
                <iframe src={`https://www.youtube.com/embed/${imovel.video_url.split('v=')[1]?.split('&')[0] || imovel.video_url.split('youtu.be/')[1]}`} style={{ width: '100%', height: 400, borderRadius: 2, border: 'none' }} allowFullScreen />
              ) : (
                <a href={imovel.video_url} target="_blank" style={{ color: s.ouro, fontSize: '0.85rem' }}>Ver vídeo →</a>
              )}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div style={{ position: 'sticky', top: '7rem' }}>
          <div style={{ background: s.verde, borderRadius: 2, padding: '2rem', color: s.branco }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(223,192,120,0.6)', marginBottom: '0.5rem' }}>Valor</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: s.ouro, marginBottom: '1.5rem', lineHeight: 1 }}>
              {imovel.preco > 0 ? `R$ ${formatarPreco(imovel.preco)}` : 'Consulte'}
            </p>
            <a
              href={`https://wa.me/${WPP}?text=${encodeURIComponent(`Olá, Jussara! Tenho interesse no imóvel: *${imovel.titulo}*\n${urlImovel}`)}`}
              target="_blank"
              style={{ display: 'block', background: '#25D366', color: s.branco, textAlign: 'center', padding: '1rem', borderRadius: 1, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}
            >
              💬 Falar no WhatsApp
            </a>
            <a href={`tel:+${WPP}`} style={{ display: 'block', background: 'transparent', color: s.ouro, textAlign: 'center', padding: '0.9rem', borderRadius: 1, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', border: `1px solid rgba(223,192,120,0.3)` }}>
              📞 (35) 99746-1643
            </a>
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: `1px solid rgba(223,192,120,0.12)` }}>
              <img src={LOGO_URL} alt="Jussara Ribeiro" style={{ height: 60, width: 'auto', objectFit: 'contain', opacity: 0.85, display: 'block', margin: '0 auto' }} />
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#021e22', padding: '1.75rem 5vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <img src={LOGO_URL} alt="Jussara Ribeiro Imóveis" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
        <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.18)', textAlign: 'center' }}>© 2026 • Campo Belo — Todos os direitos reservados</span>
        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.18)' }}>CRECI-MG 52583 • Jussara Ribeiro | CRECI-MG 46481 • Denison Rezende</span>
      </footer>
    </div>
  )
}
