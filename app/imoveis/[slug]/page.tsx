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

function formatarPreco(preco: number): string {
  return preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ImovelPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [imovel, setImovel] = useState<Imovel | null>(null)
  const [config, setConfig] = useState<Record<string, string>>({})
  const [fotoIdx, setFotoIdx] = useState(0)
  const [loading, setLoading] = useState(true)

  const WPP = config.whatsapp || '5535997461643'

  useEffect(() => {
    if (slug) fetchImovel()
    fetchConfig()
  }, [slug])

  async function fetchImovel() {
    setLoading(true)
    const { data } = await supabase.from('imoveis').select('*').eq('slug', slug).single()
    if (data) setImovel(data)
    setLoading(false)
  }

  async function fetchConfig() {
    const { data } = await supabase.from('configuracoes').select('*')
    if (data) {
      const cfg: Record<string, string> = {}
      data.forEach((row: { chave: string; valor: string }) => { cfg[row.chave] = row.valor })
      setConfig(cfg)
    }
  }

  const s = {
    verde: config.cor_principal || '#043137',
    verdeM: '#065460',
    ouro: config.cor_destaque || '#DFC078',
    branco: '#FFFFFF',
    off: '#F8F6F2',
    cinza: '#7A7A7A',
    borda: 'rgba(223,192,120,0.22)',
    ftitulo: config.fonte_titulo || 'Cormorant Garamond',
    ftexto: config.fonte_texto || 'Open Sans',
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: s.verde, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: s.ouro, fontFamily: 'Open Sans, sans-serif', fontSize: '0.85rem', letterSpacing: '0.1em' }}>Carregando...</p>
      </div>
    )
  }

  if (!imovel) {
    return (
      <div style={{ minHeight: '100vh', background: s.verde, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
        <p style={{ color: s.ouro, fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>Imóvel não encontrado</p>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', textDecoration: 'none' }}>← Voltar ao início</Link>
      </div>
    )
  }

  const msgWpp = encodeURIComponent(`Olá, Jussara! Tenho interesse no imóvel:\n\n*${imovel.titulo}*\n📍 ${imovel.bairro ? imovel.bairro + ', ' : ''}${imovel.cidade}\n💰 ${imovel.preco > 0 ? 'R$ ' + formatarPreco(imovel.preco) : 'Consultar valor'}\n\n🔗 ${typeof window !== 'undefined' ? window.location.href : ''}`)

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${s.off}; }
        @media (max-width: 768px) {
          .imovel-grid { grid-template-columns: 1fr !important; }
          .imovel-nav { padding: 0 1rem !important; height: 70px !important; }
          .imovel-galeria { height: 260px !important; }
          .imovel-miniaturas { padding: 0.5rem 1rem !important; }
          .imovel-content { padding: 1.5rem 1rem !important; }
          .imovel-sidebar { padding: 1.5rem 1rem !important; }
          .imovel-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* NAV */}
      <nav className="imovel-nav" style={{ background: s.verde, borderBottom: `1px solid ${s.borda}`, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5vw', position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <img src={LOGO_URL} alt="Jussara Ribeiro" style={{ height: 60, width: 'auto', objectFit: 'contain' }} />
        </a>
        <Link href="/#imoveis" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Open Sans, sans-serif' }}>
          ← Ver todos os imóveis
        </Link>
      </nav>

      {/* GALERIA */}
      <div style={{ background: s.verde, position: 'relative' }}>
        <div className="imovel-galeria" style={{ height: 420, position: 'relative', overflow: 'hidden' }}>
          {imovel.fotos && imovel.fotos.length > 0 ? (
            <>
              <img src={imovel.fotos[fotoIdx]} alt={imovel.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(4,49,55,0.8) 100%)' }} />
              {imovel.fotos.length > 1 && (
                <>
                  <button onClick={() => setFotoIdx(i => Math.max(0, i - 1))} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(4,49,55,0.6)', border: `1px solid rgba(223,192,120,0.35)`, color: s.ouro, width: 40, height: 40, borderRadius: '50%', fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: fotoIdx === 0 ? 0.3 : 1 }}>‹</button>
                  <button onClick={() => setFotoIdx(i => Math.min(imovel.fotos.length - 1, i + 1))} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(4,49,55,0.6)', border: `1px solid rgba(223,192,120,0.35)`, color: s.ouro, width: 40, height: 40, borderRadius: '50%', fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: fotoIdx === imovel.fotos.length - 1 ? 0.3 : 1 }}>›</button>
                  <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(4,49,55,0.7)', color: s.ouro, fontSize: '0.72rem', padding: '0.3rem 0.7rem', borderRadius: 1 }}>{fotoIdx + 1} / {imovel.fotos.length}</div>
                </>
              )}
              <div style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
                <img src={LOGO_URL} alt="Jussara Ribeiro" style={{ height: 44, width: 'auto', objectFit: 'contain', opacity: 0.9 }} />
              </div>
            </>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
              <img src={LOGO_URL} alt="Jussara Ribeiro" style={{ height: 80, opacity: 0.4 }} />
              <p style={{ color: 'rgba(223,192,120,0.4)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sem fotos disponíveis</p>
            </div>
          )}
        </div>

        {/* MINIATURAS */}
        {imovel.fotos && imovel.fotos.length > 1 && (
          <div className="imovel-miniaturas" style={{ background: s.verde, padding: '0.75rem 5vw', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
            {imovel.fotos.map((foto, i) => (
              <img key={i} src={foto} alt={`Foto ${i + 1}`} onClick={() => setFotoIdx(i)} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 1, cursor: 'pointer', flexShrink: 0, border: i === fotoIdx ? `2px solid ${s.ouro}` : '2px solid transparent', opacity: i === fotoIdx ? 1 : 0.6, transition: 'all 0.2s' }} />
            ))}
          </div>
        )}
      </div>

      {/* CONTEÚDO */}
      <div className="imovel-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 0, maxWidth: 1200, margin: '0 auto', alignItems: 'start' }}>

        {/* COLUNA ESQUERDA */}
        <div className="imovel-content" style={{ padding: '2.5rem 3rem 3rem 5vw' }}>

          {/* TAGS */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {[TIPO_LABEL[imovel.tipo] || imovel.tipo, imovel.zona === 'rural' ? 'Rural' : 'Urbano', imovel.cidade].filter(Boolean).map(tag => (
              <span key={tag} style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.2rem 0.65rem', borderRadius: 1, background: s.verde, color: s.ouro, fontFamily: 'Open Sans, sans-serif' }}>{tag}</span>
            ))}
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.2rem 0.65rem', borderRadius: 1, background: imovel.status === 'disponivel' ? 'rgba(50,200,100,0.15)' : 'rgba(200,50,50,0.15)', color: imovel.status === 'disponivel' ? '#50c878' : '#ff8080', border: `1px solid ${imovel.status === 'disponivel' ? 'rgba(50,200,100,0.3)' : 'rgba(200,50,50,0.3)'}`, fontFamily: 'Open Sans, sans-serif' }}>{imovel.status}</span>
          </div>

          {/* TÍTULO */}
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 400, color: s.verde, lineHeight: 1.2, marginBottom: '0.5rem' }}>{imovel.titulo}</h1>

          {/* LOCALIZAÇÃO */}
          {(imovel.bairro || imovel.cidade) && (
            <p style={{ fontSize: '0.85rem', color: s.cinza, marginBottom: '1.5rem', fontFamily: 'Open Sans, sans-serif' }}>
              📍 {[imovel.bairro, imovel.cidade].filter(Boolean).join(', ')}
              {imovel.endereco ? ` • ${imovel.endereco}` : ''}
            </p>
          )}

          {/* ESTATÍSTICAS */}
          <div className="imovel-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', background: s.off, borderRadius: 2, border: `1px solid rgba(4,49,55,0.08)` }}>
            {[
              { icon: '📐', valor: imovel.area > 0 ? `${imovel.area} m²` : null, label: 'Área' },
              { icon: '🛏', valor: imovel.quartos > 0 ? String(imovel.quartos) : null, label: 'Quartos' },
              { icon: '🚿', valor: imovel.banheiros > 0 ? String(imovel.banheiros) : null, label: 'Banheiros' },
              { icon: '🚗', valor: imovel.vagas > 0 ? String(imovel.vagas) : null, label: 'Vagas' },
            ].filter(item => item.valor).map(item => (
              <div key={item.label} style={{ textAlign: 'center', padding: '0.75rem 0.5rem', background: s.branco, borderRadius: 1, border: `1px solid rgba(4,49,55,0.06)` }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{item.icon}</div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 600, color: s.verde, lineHeight: 1 }}>{item.valor}</div>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: s.cinza, marginTop: '0.2rem', fontFamily: 'Open Sans, sans-serif' }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* DESCRIÇÃO */}
          {imovel.descricao && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 400, color: s.verde, marginBottom: '0.75rem' }}>Descrição</h2>
              <p style={{ fontSize: '0.88rem', color: s.cinza, lineHeight: 1.9, fontFamily: 'Open Sans, sans-serif', fontWeight: 300, whiteSpace: 'pre-line' }}>{imovel.descricao}</p>
            </div>
          )}

          {/* VÍDEO */}
          {imovel.video_url && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 400, color: s.verde, marginBottom: '0.75rem' }}>Vídeo do imóvel</h2>
              <div style={{ position: 'relative', paddingBottom: '56.25%', borderRadius: 2, overflow: 'hidden' }}>
                <iframe src={`https://www.youtube.com/embed/${imovel.video_url.split('v=')[1]?.split('&')[0] || imovel.video_url.split('youtu.be/')[1]}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen />
              </div>
            </div>
          )}

          {/* REGISTROS */}
          <div style={{ padding: '1rem 1.25rem', borderLeft: `3px solid ${s.ouro}`, background: s.branco, borderRadius: '0 2px 2px 0', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.72rem', color: s.cinza, marginBottom: '0.2rem', fontFamily: 'Open Sans, sans-serif' }}>Intermediação</p>
            <strong style={{ fontSize: '0.82rem', color: s.verde, fontWeight: 600, fontFamily: 'Open Sans, sans-serif' }}>Jussara Ribeiro • CRECI-MG 52583</strong>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="imovel-sidebar" style={{ padding: '2.5rem 2rem', position: 'sticky', top: 80 }}>
          <div style={{ background: s.verde, borderRadius: 2, padding: '1.75rem', color: s.branco }}>

            {/* PREÇO */}
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.35rem', fontFamily: 'Open Sans, sans-serif' }}>Valor</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: s.ouro, fontWeight: 400, marginBottom: '0.25rem' }}>
              {imovel.preco > 0 ? `R$ ${formatarPreco(imovel.preco)}` : 'Consulte'}
            </p>
            <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.5rem', fontFamily: 'Open Sans, sans-serif', fontStyle: 'italic' }}>* Valor sujeito a alteração</p>

            {/* BOTÃO WHATSAPP */}
            <a href={`https://wa.me/${WPP}?text=${msgWpp}`} target="_blank" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', background: '#25D366', color: s.branco, padding: '1rem', borderRadius: 1, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Open Sans, sans-serif', marginBottom: '0.75rem' }}>
              💬 Falar no WhatsApp
            </a>

            {/* BOTÃO LIGAR */}
            <a href={`tel:+${WPP}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', background: 'transparent', color: 'rgba(255,255,255,0.7)', padding: '0.9rem', borderRadius: 1, textDecoration: 'none', fontSize: '0.78rem', letterSpacing: '0.08em', fontFamily: 'Open Sans, sans-serif', border: `1px solid rgba(255,255,255,0.15)`, marginBottom: '1.5rem' }}>
              📞 (35) 99746-1643
            </a>

            {/* LOGO */}
            <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: `1px solid rgba(223,192,120,0.15)` }}>
              <img src={LOGO_URL} alt="Jussara Ribeiro" style={{ height: 60, width: 'auto', objectFit: 'contain', opacity: 0.85 }} />
              <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.35rem', fontFamily: 'Open Sans, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase' }}>CRECI-MG 52583</p>
            </div>
          </div>

          {/* COMPARTILHAR */}
          <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', background: s.off, borderRadius: 2, border: `1px solid rgba(4,49,55,0.08)` }}>
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: s.cinza, marginBottom: '0.75rem', fontFamily: 'Open Sans, sans-serif' }}>Compartilhar</p>
            <a href={`https://wa.me/?text=${encodeURIComponent(`Olá! Veja este imóvel: ${imovel.titulo}\n${typeof window !== 'undefined' ? window.location.href : ''}`)}`} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#25D366', color: s.branco, padding: '0.5rem 1rem', borderRadius: 1, textDecoration: 'none', fontSize: '0.72rem', fontFamily: 'Open Sans, sans-serif' }}>
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#021e22', padding: '1.5rem 5vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: s.ouro }}>Jussara Ribeiro Imóveis</span>
        <Link href="/" style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontFamily: 'Open Sans, sans-serif' }}>← Voltar ao início</Link>
        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.18)', fontFamily: 'Open Sans, sans-serif' }}>CRECI-MG 52583 • Jussara Ribeiro</span>
      </footer>

      {/* WPP FLOAT */}
      <a href={`https://wa.me/${WPP}?text=${msgWpp}`} target="_blank" style={{ position: 'fixed', bottom: '1.75rem', right: '1.75rem', zIndex: 400, background: '#25D366', color: 'white', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxShadow: '0 4px 18px rgba(37,211,102,0.38)', fontSize: '1.5rem' }}>💬</a>
    </>
  )
}
