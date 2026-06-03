'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Imovel = {
  id: string
  titulo: string
  descricao: string
  preco: number
  tipo: string
  zona: string
  cidade: string
  bairro: string
  area: number
  quartos: number
  banheiros: number
  fotos: string[]
  video_url: string
  slug: string
  destaque: boolean
  status: string
}

type Slide = {
  id: string
  imagem: string
  legenda: string
  subtitulo: string
  ordem: number
}

const TIPO_LABEL: Record<string, string> = {
  casa: 'Casa', apartamento: 'Apartamento', lote: 'Lote / Terreno',
  comercial: 'Comercial', chacara: 'Chácara / Sítio', fazenda: 'Fazenda'
}

const CIDADES = ['Campo Belo', 'Candeias', 'Cristais', 'Santana do Jacaré', 'Lavras']

export default function Home() {
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [slides, setSlides] = useState<Slide[]>([])
  const [filtro, setFiltro] = useState('')
  const [busca, setBusca] = useState({ texto: '', cidade: '', tipo: '', zona: '', vmin: '', vmax: '' })
  const [carIdx, setCarIdx] = useState(0)
  const [lbOpen, setLbOpen] = useState(false)
  const [lbImovel, setLbImovel] = useState<Imovel | null>(null)
  const [lbFotoIdx, setLbFotoIdx] = useState(0)
  const carTimer = useRef<NodeJS.Timeout | null>(null)
  const WPP = '5535997461643'

  useEffect(() => {
    fetchImoveis()
    fetchSlides()
  }, [])

  useEffect(() => {
    if (slides.length === 0) return
    carTimer.current = setInterval(() => setCarIdx(i => (i + 1) % slides.length), 5000)
    return () => { if (carTimer.current) clearInterval(carTimer.current) }
  }, [slides])

  async function fetchImoveis() {
    const { data } = await supabase.from('imoveis').select('*').eq('status', 'disponivel').order('created_at', { ascending: false })
    if (data) setImoveis(data)
  }

  async function fetchSlides() {
    const { data } = await supabase.from('carrossel').select('*').eq('ativo', true).order('ordem')
    if (data) setSlides(data)
  }

  function carNav(dir: number) {
    if (carTimer.current) clearInterval(carTimer.current)
    setCarIdx(i => ((i + dir) + slides.length) % slides.length)
    carTimer.current = setInterval(() => setCarIdx(i => (i + 1) % slides.length), 5000)
  }

  function abrirLb(im: Imovel, fotoIdx = 0) {
    setLbImovel(im); setLbFotoIdx(fotoIdx); setLbOpen(true)
    document.body.style.overflow = 'hidden'
  }

  function fecharLb() {
    setLbOpen(false); setLbImovel(null)
    document.body.style.overflow = ''
  }

  function enviarContato(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = e.currentTarget
    const nome = (f.querySelector('#f-nome') as HTMLInputElement).value
    const tel = (f.querySelector('#f-tel') as HTMLInputElement).value
    const email = (f.querySelector('#f-email') as HTMLInputElement).value
    const interesse = (f.querySelector('#f-int') as HTMLSelectElement).value
    const msg = (f.querySelector('#f-msg') as HTMLTextAreaElement).value
    const txt = encodeURIComponent(`Olá, Jussara! 👋\n\nMeu nome é *${nome}*.\n📞 ${tel}\n📧 ${email}\n🏠 ${interesse}\n\n${msg}`)
    window.open(`https://wa.me/${WPP}?text=${txt}`, '_blank')
  }

  function enviarCaptacao(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = e.currentTarget
    const get = (id: string) => (f.querySelector(`#${id}`) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)?.value || ''
    const txt = encodeURIComponent(`Olá, Jussara! Tenho um imóvel para vender. 🏡\n\n👤 *${get('cap-nome')}*\n📞 ${get('cap-tel')}\n\n📋 *Dados:*\n• Tipo: ${get('cap-tipo')}\n• Zona: ${get('cap-zona')}\n• Cidade: ${get('cap-cidade')}\n• Bairro: ${get('cap-bairro')}\n• Área: ${get('cap-area')} m²\n• Valor: R$ ${get('cap-valor')}\n\n📝 ${get('cap-desc')}`)
    window.open(`https://wa.me/${WPP}?text=${txt}`, '_blank')
  }

  const imoveisFiltrados = imoveis.filter(im => {
    if (filtro && im.tipo !== filtro && im.zona !== filtro) return false
    if (busca.texto && !`${im.titulo}${im.cidade}${im.bairro}`.toLowerCase().includes(busca.texto.toLowerCase())) return false
    if (busca.cidade && im.cidade !== busca.cidade) return false
    if (busca.tipo && im.tipo !== busca.tipo) return false
    if (busca.zona && im.zona !== busca.zona) return false
    if (busca.vmin && im.preco < Number(busca.vmin)) return false
    if (busca.vmax && im.preco > Number(busca.vmax)) return false
    return true
  })

  const s = {
    verde: '#043137', verdeM: '#065460', ouro: '#DFC078', ouroC: '#EDD49A',
    branco: '#FFFFFF', off: '#F8F6F2', cinza: '#7A7A7A',
    borda: 'rgba(223,192,120,0.22)'
  }

  return (
    <>
      {/* LIGHTBOX */}
      {lbOpen && lbImovel && (
        <div onClick={fecharLb} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(2,10,12,0.96)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={fecharLb} style={{ position: 'fixed', top: '1rem', right: '1.5rem', background: 'rgba(223,192,120,0.1)', border: '1px solid rgba(223,192,120,0.3)', color: s.ouro, width: 40, height: 40, borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          {lbImovel.fotos && lbImovel.fotos.length > 0 ? (
            <img src={lbImovel.fotos[lbFotoIdx]} alt={lbImovel.titulo} style={{ maxWidth: '90vw', maxHeight: '78vh', objectFit: 'contain', borderRadius: 2 }} onClick={e => e.stopPropagation()} />
          ) : (
            <div style={{ color: s.ouro, opacity: 0.4, textAlign: 'center' }}>Sem foto disponível</div>
          )}
          {lbImovel.fotos && lbImovel.fotos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setLbFotoIdx(i => Math.max(0, i - 1)) }} style={{ position: 'fixed', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(223,192,120,0.1)', border: '1px solid rgba(223,192,120,0.3)', color: s.ouro, width: 50, height: 50, borderRadius: '50%', fontSize: '1.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: lbFotoIdx === 0 ? 0.2 : 1 }}>‹</button>
              <button onClick={e => { e.stopPropagation(); setLbFotoIdx(i => Math.min((lbImovel.fotos?.length || 1) - 1, i + 1)) }} style={{ position: 'fixed', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(223,192,120,0.1)', border: '1px solid rgba(223,192,120,0.3)', color: s.ouro, width: 50, height: 50, borderRadius: '50%', fontSize: '1.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: lbFotoIdx === (lbImovel.fotos?.length || 1) - 1 ? 0.2 : 1 }}>›</button>
            </>
          )}
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', color: s.branco, fontSize: '1rem' }}>{lbImovel.titulo}</p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>{lbImovel.bairro} • {lbImovel.cidade}</p>
            {lbImovel.fotos && <p style={{ fontSize: '0.65rem', color: 'rgba(223,192,120,0.5)', marginTop: '0.3rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{lbFotoIdx + 1} de {lbImovel.fotos.length}</p>}
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 300, background: s.verde, borderBottom: `1px solid ${s.borda}`, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5vw', gap: '1rem' }}>
        <a href="#inicio" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: s.ouro, fontWeight: 600 }}>Jussara Ribeiro</span>
          <span style={{ fontSize: '0.65rem', color: 'rgba(223,192,120,0.6)', marginLeft: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Imóveis</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {['#inicio', '#sobre', '#imoveis', '#contato'].map((href, i) => (
            <a key={href} href={href} style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              {['Início', 'Sobre', 'Imóveis', 'Contato'][i]}
            </a>
          ))}
          <button onClick={() => document.getElementById('busca')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', border: `1px solid rgba(223,192,120,0.3)`, color: 'rgba(255,255,255,0.6)', padding: '0.38rem 0.9rem', borderRadius: 1, fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
            🔍 Buscar
          </button>
          <a href={`https://wa.me/${WPP}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: s.ouro, textDecoration: 'none', fontSize: '0.72rem' }}>
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <small style={{ fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(223,192,120,0.6)' }}>Fale conosco</small>
              <strong style={{ fontSize: '0.8rem', fontWeight: 500 }}>(35) 99746-1643</strong>
            </span>
          </a>
        </div>
      </nav>

      {/* CARROSSEL */}
      <div id="inicio" style={{ position: 'relative', width: '100%', height: 500, overflow: 'hidden', background: s.verdeM }}>
        {slides.length > 0 ? (
          <>
            <div style={{ display: 'flex', height: '100%', transition: 'transform 0.7s cubic-bezier(0.4,0,0.2,1)', transform: `translateX(-${carIdx * 100}%)` }}>
              {slides.map(sl => (
                <div key={sl.id} style={{ minWidth: '100%', height: '100%', position: 'relative', flexShrink: 0 }}>
                  {sl.imagem && <img src={sl.imagem} alt={sl.legenda} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,49,55,0.1) 0%, rgba(4,49,55,0.6) 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem 3rem', background: 'linear-gradient(to top, rgba(4,49,55,0.8), transparent)' }}>
                    <strong style={{ fontFamily: 'Cormorant Garamond, serif', color: s.branco, fontSize: '1.1rem', display: 'block' }}>{sl.legenda}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(223,192,120,0.8)', marginTop: '0.2rem', display: 'block' }}>{sl.subtitulo}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => carNav(-1)} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(4,49,55,0.45)', border: `1px solid rgba(223,192,120,0.35)`, color: s.ouro, width: 46, height: 46, borderRadius: '50%', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>‹</button>
            <button onClick={() => carNav(1)} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(4,49,55,0.45)', border: `1px solid rgba(223,192,120,0.35)`, color: s.ouro, width: 46, height: 46, borderRadius: '50%', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>›</button>
            <div style={{ position: 'absolute', bottom: '0.9rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.45rem', zIndex: 2 }}>
              {slides.map((_, i) => (
                <button key={i} onClick={() => setCarIdx(i)} style={{ width: i === carIdx ? 22 : 8, height: 8, borderRadius: i === carIdx ? 4 : '50%', background: i === carIdx ? s.ouro : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
              ))}
            </div>
          </>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(223,192,120,0.3)' }}>
            <p style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Adicione imagens pelo painel admin</p>
          </div>
        )}
      </div>

      <div style={{ width: '100%', height: 2, background: 'linear-gradient(90deg, transparent, #DFC078, transparent)' }} />

      {/* HERO */}
      <section style={{ minHeight: '80vh', background: s.verde, display: 'grid', gridTemplateColumns: '55% 45%', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '45%', height: '100%', background: s.verdeM, clipPath: 'polygon(8% 0, 100% 0, 100% 100%, 0% 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '6vw 4vw 6vw 7vw', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: s.ouro, marginBottom: '1.5rem' }}>
            <span style={{ display: 'block', width: 22, height: 1, background: s.ouro }} />
            Corretora Imobiliária • Campo Belo, MG
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 3.5vw, 3.2rem)', fontWeight: 400, lineHeight: 1.15, color: s.branco, marginBottom: '1.1rem' }}>
            Realizando o sonho<br />de cada <em style={{ fontStyle: 'italic', color: s.ouro }}>família</em><br />com confiança
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.85, maxWidth: 390, marginBottom: '2rem', fontWeight: 300 }}>
            Compra e venda de imóveis em Campo Belo e região. Atendimento personalizado, segurança e mais de 15 anos de experiência.
          </p>
          <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}>
            <a href="#imoveis" className="btn-ouro">Ver imóveis</a>
            <a href="#contato" className="btn-ghost">Fale comigo</a>
          </div>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem', paddingTop: '1.75rem', borderTop: `1px solid ${s.borda}`, flexWrap: 'wrap' }}>
            {[['+ 200', 'Negócios realizados'], ['15 +', 'Anos de experiência'], ['100%', 'Compromisso']].map(([n, l]) => (
              <div key={l}>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: s.ouro, lineHeight: 1, display: 'block' }}>{n}</span>
                <span style={{ fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', display: 'block', marginTop: '0.28rem' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '3rem 2.5rem 0' }}>
          <div style={{ width: '100%', maxWidth: 340, background: 'rgba(255,255,255,0.04)', border: `1px solid ${s.borda}`, borderBottom: 'none', borderRadius: '2px 2px 0 0', minHeight: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ textAlign: 'center', color: 'rgba(223,192,120,0.35)', padding: '2rem' }}>
              <p style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.6 }}>Adicione sua foto pelo painel admin</p>
            </div>
            <div style={{ position: 'absolute', bottom: '1.25rem', left: '-1rem', background: s.ouro, color: s.verde, padding: '0.65rem 1.1rem', borderRadius: 1 }}>
              <strong style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block' }}>CRECI 52583</strong>
              <span style={{ fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Registro Ativo • MG</span>
            </div>
          </div>
        </div>
      </section>

      <div className="divisor" />

      {/* BUSCA */}
      <div id="busca" style={{ background: s.verde, padding: '2rem 5vw' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${s.borda}`, borderRadius: 2, padding: '1.4rem 1.75rem' }}>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', color: s.ouro, fontSize: '1rem', fontWeight: 400, marginBottom: '1.1rem' }}>🔍 Buscar imóveis</p>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '0.65rem', alignItems: 'end' }}>
            {[
              { id: 'b-txt', label: 'Palavra-chave', placeholder: 'Ex: casa 3 quartos...', key: 'texto' },
            ].map(f => (
              <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.32rem' }}>
                <label style={{ fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>{f.label}</label>
                <input placeholder={f.placeholder} onChange={e => setBusca(b => ({ ...b, [f.key]: e.target.value }))} style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(223,192,120,0.18)`, color: s.branco, padding: '0.6rem 0.85rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.8rem', borderRadius: 1, outline: 'none', width: '100%' }} />
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.32rem' }}>
              <label style={{ fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>Cidade</label>
              <select onChange={e => setBusca(b => ({ ...b, cidade: e.target.value }))} style={{ background: s.verde, border: `1px solid rgba(223,192,120,0.18)`, color: s.branco, padding: '0.6rem 0.85rem', fontSize: '0.8rem', borderRadius: 1, outline: 'none', width: '100%' }}>
                <option value="">Todas</option>
                {CIDADES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.32rem' }}>
              <label style={{ fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>Tipo</label>
              <select onChange={e => setBusca(b => ({ ...b, tipo: e.target.value }))} style={{ background: s.verde, border: `1px solid rgba(223,192,120,0.18)`, color: s.branco, padding: '0.6rem 0.85rem', fontSize: '0.8rem', borderRadius: 1, outline: 'none', width: '100%' }}>
                <option value="">Todos</option>
                {Object.entries(TIPO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.32rem' }}>
              <label style={{ fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>Zona</label>
              <select onChange={e => setBusca(b => ({ ...b, zona: e.target.value }))} style={{ background: s.verde, border: `1px solid rgba(223,192,120,0.18)`, color: s.branco, padding: '0.6rem 0.85rem', fontSize: '0.8rem', borderRadius: 1, outline: 'none', width: '100%' }}>
                <option value="">Todas</option>
                <option value="urbano">Urbano</option>
                <option value="rural">Rural</option>
              </select>
            </div>
            <button onClick={() => document.getElementById('imoveis')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: s.ouro, color: s.verde, border: 'none', padding: '0.6rem 1.4rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1, height: 'fit-content' }}>
              Buscar
            </button>
          </div>
        </div>
      </div>

      <div className="divisor" />

      {/* SOBRE */}
      <section id="sobre" style={{ background: s.off, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5.5rem', alignItems: 'center', padding: '5.5rem 7vw' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ aspectRatio: '4/5', background: s.verde, borderRadius: 2, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '0.68rem', color: 'rgba(223,192,120,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Foto da corretora</p>
          </div>
          <div style={{ position: 'absolute', bottom: '-1.4rem', right: '-1.4rem', background: s.ouro, color: s.verde, padding: '1.35rem 1.85rem', borderRadius: 1, zIndex: 2 }}>
            <strong style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem', display: 'block', lineHeight: 1, fontWeight: 400 }}>15+</strong>
            <span style={{ fontSize: '0.64rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Anos no mercado</span>
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#B89A50', display: 'flex', alignItems: 'center', gap: 9, marginBottom: '0.7rem' }}>
            Sobre mim <span style={{ display: 'block', width: 22, height: 1, background: '#B89A50' }} />
          </span>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.7rem, 2.6vw, 2.6rem)', fontWeight: 400, lineHeight: 1.2, color: s.verde, marginBottom: '1rem' }}>Jussara Ribeiro</h2>
          <p style={{ color: s.cinza, fontSize: '0.88rem', lineHeight: 1.9, marginBottom: '1rem', fontWeight: 300 }}>
            Sou corretora imobiliária com mais de 15 anos de atuação em Campo Belo e região, especializada em compra e venda de imóveis residenciais e comerciais.
          </p>
          <p style={{ color: s.cinza, fontSize: '0.88rem', lineHeight: 1.9, marginBottom: '1.5rem', fontWeight: 300 }}>
            Meu trabalho é construído sobre dois pilares: transparência e confiança. Cada negociação é tratada com máxima atenção e responsabilidade.
          </p>
          {['Especialista em imóveis residenciais e comerciais', 'Atuação em Campo Belo, Candeias, Cristais, Lavras e região', 'Parceria com cartórios e assessoria jurídica', 'Avaliação gratuita do seu imóvel'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', fontSize: '0.82rem', color: s.verde, marginBottom: '0.65rem' }}>
              <span style={{ width: 5, height: 5, background: s.ouro, borderRadius: '50%', flexShrink: 0 }} />{item}
            </div>
          ))}
          <div style={{ marginTop: '1.75rem', padding: '0.9rem 1.4rem', borderLeft: `3px solid ${s.ouro}`, background: s.branco, borderRadius: '0 2px 2px 0' }}>
            <p style={{ fontSize: '0.75rem', color: s.cinza, marginBottom: '0.18rem' }}>Registros profissionais ativos</p>
            <strong style={{ fontSize: '0.82rem', color: s.verde, fontWeight: 600 }}>CRECI-MG 52583 • Jussara Ribeiro</strong><br />
            <span style={{ fontSize: '0.78rem', color: s.cinza }}>CRECI-MG 46481 • Denison Rezende</span>
          </div>
        </div>
      </section>

      <div className="divisor" />

      {/* IMÓVEIS */}
      <section id="imoveis" style={{ background: s.branco, padding: '5.5rem 7vw' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#B89A50', display: 'flex', alignItems: 'center', gap: 9, marginBottom: '0.7rem' }}>
              Portfólio <span style={{ display: 'block', width: 22, height: 1, background: '#B89A50' }} />
            </span>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.7rem, 2.6vw, 2.6rem)', fontWeight: 400, color: s.verde }}>Imóveis disponíveis</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[['', 'Todos'], ['casa', 'Casas'], ['apartamento', 'Apartamentos'], ['lote', 'Lotes'], ['rural', 'Rural']].map(([v, l]) => (
              <button key={v} onClick={() => setFiltro(v)} style={{ padding: '0.45rem 1.1rem', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', border: `1px solid ${filtro === v ? s.verde : 'rgba(4,49,55,0.18)'}`, background: filtro === v ? s.off : 'transparent', color: filtro === v ? s.verde : s.cinza, cursor: 'pointer', borderRadius: 1, fontFamily: 'Open Sans, sans-serif' }}>{l}</button>
            ))}
          </div>
        </div>

        {imoveisFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: s.cinza, border: `1.5px dashed rgba(4,49,55,0.1)`, borderRadius: 2 }}>
            <p style={{ fontSize: '0.85rem' }}>Nenhum imóvel encontrado. Adicione imóveis pelo painel admin.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(295px, 1fr))', gap: '1.6rem' }}>
            {imoveisFiltrados.map(im => (
              <div key={im.id} style={{ background: s.branco, border: `1px solid rgba(4,49,55,0.1)`, borderRadius: 2, overflow: 'hidden', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 14px 44px rgba(4,49,55,0.11)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '' }}>
                <div onClick={() => abrirLb(im)} style={{ aspectRatio: '16/10', background: s.verde, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {im.fotos && im.fotos.length > 0 ? (
                    <img src={im.fotos[0]} alt={im.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                  ) : (
                    <p style={{ fontSize: '0.62rem', color: 'rgba(223,192,120,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sem foto</p>
                  )}
                  <span style={{ position: 'absolute', top: '0.85rem', left: '0.85rem', background: s.ouro, color: s.verde, fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.28rem 0.75rem', borderRadius: 1, fontWeight: 600, zIndex: 2 }}>Venda</span>
                </div>
                <div style={{ padding: '1.15rem 1.4rem 1.4rem' }}>
                  <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                    {[TIPO_LABEL[im.tipo] || im.tipo, im.zona === 'rural' ? 'Rural' : 'Urbano', im.cidade].map(b => (
                      <span key={b} style={{ fontSize: '0.58rem', letterSpacing: '0.09em', textTransform: 'uppercase', padding: '0.18rem 0.55rem', borderRadius: 1, background: s.off, color: s.verde, border: `1px solid rgba(4,49,55,0.1)` }}>{b}</span>
                    ))}
                  </div>
                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', fontWeight: 600, color: s.verde, marginBottom: '0.28rem', lineHeight: 1.3 }}>{im.titulo}</p>
                  <p style={{ fontSize: '0.72rem', color: s.cinza, marginBottom: '0.75rem' }}>{im.bairro}{im.bairro ? ', ' : ''}{im.cidade}</p>
                  <div style={{ display: 'flex', gap: '0.9rem', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
                    {im.quartos > 0 && <span style={{ fontSize: '0.72rem', color: s.cinza }}>🛏 {im.quartos} quartos</span>}
                    {im.area > 0 && <span style={{ fontSize: '0.72rem', color: s.cinza }}>📐 {im.area} m²</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid rgba(4,49,55,0.07)`, paddingTop: '0.9rem' }}>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', color: s.verde, fontWeight: 600 }}>
                      {im.preco > 0 ? `R$ ${im.preco.toLocaleString('pt-BR')}` : 'Consulte'}
                    </p>
                    <Link href={`/imoveis/${im.slug}`} style={{ fontSize: '0.65rem', color: s.ouro, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Ver detalhes →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="divisor" />

      {/* CONTATO */}
      <section id="contato" style={{ background: s.verde, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5.5rem', alignItems: 'start', padding: '5.5rem 7vw' }}>
        <div>
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: s.ouro, display: 'flex', alignItems: 'center', gap: 9, marginBottom: '0.7rem' }}>
            Fale comigo <span style={{ display: 'block', width: 22, height: 1, background: s.ouro, opacity: 0.5 }} />
          </span>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.7rem, 2.6vw, 2.6rem)', fontWeight: 400, color: s.branco, marginBottom: '0.9rem' }}>Vamos encontrar<br />o imóvel ideal?</h2>
          <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: '0.88rem', lineHeight: 1.85, maxWidth: 520, fontWeight: 300, marginBottom: '2rem' }}>
            Entre em contato para agendar uma visita ou solicitar avaliação gratuita.
          </p>
          {[
            { icon: '📞', label: 'WhatsApp', value: '(35) 99746-1643', href: `https://wa.me/${WPP}` },
            { icon: '📷', label: 'Instagram', value: '@jussara_ribeirocorretora', href: 'https://www.instagram.com/jussara_ribeirocorretora/' },
            { icon: '📘', label: 'Facebook', value: 'Jussara Ribeiro Corretora', href: 'https://www.facebook.com/jussararibeirocorretora' },
            { icon: '📍', label: 'Localização', value: 'Campo Belo • MG e região', href: undefined },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start', marginBottom: '1.35rem' }}>
              <div style={{ width: 42, height: 42, flexShrink: 0, border: `1px solid rgba(223,192,120,0.28)`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1, fontSize: '1rem' }}>{item.icon}</div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: s.ouro, fontWeight: 600, marginBottom: '0.22rem' }}>{item.label}</strong>
                {item.href ? <a href={item.href} target="_blank" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.62)', textDecoration: 'none' }}>{item.value}</a> : <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.62)' }}>{item.value}</span>}
              </div>
            </div>
          ))}
          <div style={{ marginTop: '2rem', paddingTop: '1.35rem', borderTop: `1px solid rgba(223,192,120,0.12)`, fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em', lineHeight: 1.8 }}>
            CRECI-MG 52583 • Jussara Ribeiro | CRECI-MG 46481 • Denison Rezende<br />
            Registros profissionais ativos • Compra e Venda
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', gap: 0, marginBottom: 0, borderBottom: `1px solid rgba(223,192,120,0.18)` }}>
            {['Fale comigo', 'Quero vender meu imóvel'].map((label, i) => (
              <button key={label} id={`tab-${i}`} onClick={() => {
                document.getElementById('cp-0')!.style.display = i === 0 ? 'block' : 'none'
                document.getElementById('cp-1')!.style.display = i === 1 ? 'block' : 'none'
                document.querySelectorAll('[data-tab]').forEach((b, j) => (b as HTMLButtonElement).style.borderBottom = j === i ? `2px solid ${s.ouro}` : '2px solid transparent')
              }} data-tab style={{ background: 'transparent', border: 'none', borderBottom: i === 0 ? `2px solid ${s.ouro}` : '2px solid transparent', color: i === 0 ? s.ouro : 'rgba(255,255,255,0.38)', padding: '0.7rem 1.4rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: -1 }}>
                {label}
              </button>
            ))}
          </div>

          <div id="cp-0" style={{ paddingTop: '1.4rem' }}>
            <form onSubmit={enviarContato} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
                {[{ id: 'f-nome', label: 'Seu nome', placeholder: 'Nome completo', type: 'text', required: true }, { id: 'f-tel', label: 'Telefone', placeholder: '(00) 00000-0000', type: 'tel', required: false }].map(f => (
                  <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>{f.label}</label>
                    <input id={f.id} type={f.type} placeholder={f.placeholder} required={f.required} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(223,192,120,0.18)`, color: s.branco, padding: '0.75rem 0.9rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.85rem', fontWeight: 300, borderRadius: 1, outline: 'none' }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>E-mail</label>
                <input id="f-email" type="email" placeholder="seu@email.com" required style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(223,192,120,0.18)`, color: s.branco, padding: '0.75rem 0.9rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.85rem', fontWeight: 300, borderRadius: 1, outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>Interesse</label>
                <select id="f-int" style={{ background: s.verde, border: `1px solid rgba(223,192,120,0.18)`, color: s.branco, padding: '0.75rem 0.9rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.85rem', fontWeight: 300, borderRadius: 1, outline: 'none' }}>
                  <option>Comprar imóvel</option>
                  <option>Vender imóvel</option>
                  <option>Avaliação de imóvel</option>
                  <option>Outro</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>Mensagem</label>
                <textarea id="f-msg" placeholder="Descreva o que você procura..." rows={4} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(223,192,120,0.18)`, color: s.branco, padding: '0.75rem 0.9rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.85rem', fontWeight: 300, borderRadius: 1, outline: 'none', resize: 'vertical' }} />
              </div>
              <button type="submit" style={{ background: s.ouro, color: s.verde, border: 'none', padding: '0.9rem 2rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1, width: '100%' }}>
                Enviar pelo WhatsApp
              </button>
            </form>
          </div>

          <div id="cp-1" style={{ paddingTop: '1.4rem', display: 'none' }}>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.42)', marginBottom: '1.1rem', lineHeight: 1.7, fontWeight: 300 }}>Quer colocar seu imóvel à venda? Preencha o formulário e Jussara entrará em contato.</p>
            <form onSubmit={enviarCaptacao} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
                {[{ id: 'cap-nome', label: 'Seu nome', placeholder: 'Nome completo', type: 'text' }, { id: 'cap-tel', label: 'Telefone', placeholder: '(00) 00000-0000', type: 'tel' }].map(f => (
                  <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>{f.label}</label>
                    <input id={f.id} type={f.type} placeholder={f.placeholder} required style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(223,192,120,0.18)`, color: s.branco, padding: '0.75rem 0.9rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.85rem', fontWeight: 300, borderRadius: 1, outline: 'none' }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>Tipo do imóvel</label>
                  <select id="cap-tipo" style={{ background: s.verde, border: `1px solid rgba(223,192,120,0.18)`, color: s.branco, padding: '0.75rem 0.9rem', fontSize: '0.85rem', borderRadius: 1, outline: 'none' }}>
                    {Object.entries(TIPO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>Zona</label>
                  <select id="cap-zona" style={{ background: s.verde, border: `1px solid rgba(223,192,120,0.18)`, color: s.branco, padding: '0.75rem 0.9rem', fontSize: '0.85rem', borderRadius: 1, outline: 'none' }}>
                    <option value="urbano">Urbano</option>
                    <option value="rural">Rural</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
                {[{ id: 'cap-cidade', label: 'Cidade', placeholder: 'Ex: Campo Belo' }, { id: 'cap-bairro', label: 'Bairro', placeholder: 'Ex: Centro' }, { id: 'cap-area', label: 'Área (m²)', placeholder: 'Ex: 250' }, { id: 'cap-valor', label: 'Valor pretendido', placeholder: 'Ex: 350.000' }].map(f => (
                  <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>{f.label}</label>
                    <input id={f.id} placeholder={f.placeholder} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(223,192,120,0.18)`, color: s.branco, padding: '0.75rem 0.9rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.85rem', fontWeight: 300, borderRadius: 1, outline: 'none' }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>Descrição</label>
                <textarea id="cap-desc" placeholder="Quartos, banheiros, garagem, diferenciais..." rows={3} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(223,192,120,0.18)`, color: s.branco, padding: '0.75rem 0.9rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.85rem', fontWeight: 300, borderRadius: 1, outline: 'none', resize: 'vertical' }} />
              </div>
              <button type="submit" style={{ background: s.ouro, color: s.verde, border: 'none', padding: '0.9rem 2rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1, width: '100%' }}>
                Enviar pelo WhatsApp
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#021e22', padding: '1.75rem 5vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: s.ouro }}>Jussara Ribeiro Imóveis</span>
        <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.18)', textAlign: 'center' }}>© 2025 • Campo Belo — Todos os direitos reservados</span>
        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.18)' }}>CRECI-MG 52583 • Jussara Ribeiro | CRECI-MG 46481 • Denison Rezende</span>
      </footer>

      {/* WPP FLOAT */}
      <a href={`https://wa.me/${WPP}`} target="_blank" style={{ position: 'fixed', bottom: '1.75rem', right: '1.75rem', zIndex: 400, background: '#25D366', color: 'white', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxShadow: '0 4px 18px rgba(37,211,102,0.38)', fontSize: '1.5rem' }}>
        💬
      </a>
    </>
  )
}
