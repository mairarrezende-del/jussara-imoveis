ï»¿'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Imovel = {
  id?: string
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

type Slide = {
  id?: string
  imagem: string
  legenda: string
  subtitulo: string
  ordem: number
  ativo: boolean
}

const CIDADES = ['Campo Belo', 'Candeias', 'Cristais', 'Santana do JacarâÂ®', 'Lavras']
const TIPOS = { casa: 'Casa', apartamento: 'Apartamento', lote: 'Lote / Terreno', comercial: 'Comercial', chacara: 'ChâÃ­cara / SâÂ¡tio', fazenda: 'Fazenda' }

const s = {
  verde: '#043137', verdeM: '#065460', ouro: '#DFC078', ouroC: '#EDD49A',
  branco: '#FFFFFF', off: '#F8F6F2', cinza: '#7A7A7A',
  borda: 'rgba(223,192,120,0.22)'
}

const imovelVazio: Imovel = {
  titulo: '', descricao: '', preco: 0, tipo: 'casa', zona: 'urbano',
  cidade: 'Campo Belo', bairro: '', endereco: '', area: 0, quartos: 0,
  banheiros: 0, vagas: 0, fotos: [], video_url: '', slug: '', destaque: false, status: 'disponivel'
}

export default function AdminPage() {
  const [aba, setAba] = useState('imoveis')
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [slides, setSlides] = useState<Slide[]>([])
  const [editando, setEditando] = useState<Imovel | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchImoveis(); fetchSlides() }, [])

  async function fetchImoveis() {
    const { data } = await supabase.from('imoveis').select('*').order('created_at', { ascending: false })
    if (data) setImoveis(data)
  }

  async function fetchSlides() {
    const { data } = await supabase.from('carrossel').select('*').order('ordem')
    if (data) setSlides(data)
  }

  function gerarSlug(titulo: string) {
    return titulo.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
  }

  async function salvarImovel() {
    if (!editando) return
    setSalvando(true)
    const dados = { ...editando, slug: editando.slug || gerarSlug(editando.titulo) }
    let erro
    if (editando.id) {
      const r = await supabase.from('imoveis').update(dados).eq('id', editando.id)
      erro = r.error
    } else {
      const r = await supabase.from('imoveis').insert(dados)
      erro = r.error
    }
    setSalvando(false)
    if (erro) { setMsg('ÃÃÃ® Erro: ' + erro.message) }
    else { setMsg('ÃÂ£Ã  Imââvel salvo!'); setEditando(null); fetchImoveis() }
    setTimeout(() => setMsg(''), 3000)
  }

  async function excluirImovel(id: string) {
    if (!confirm('Excluir este imââvel?')) return
    await supabase.from('imoveis').delete().eq('id', id)
    fetchImoveis()
  }

  async function salvarSlide(slide: Slide) {
    setSalvando(true)
    let erro
    if (slide.id) {
      const r = await supabase.from('carrossel').update(slide).eq('id', slide.id)
      erro = r.error
    } else {
      const r = await supabase.from('carrossel').insert(slide)
      erro = r.error
    }
    setSalvando(false)
    if (erro) setMsg('ÃÃÃ® Erro: ' + erro.message)
    else { setMsg('ÃÂ£Ã  Slide salvo!'); fetchSlides() }
    setTimeout(() => setMsg(''), 3000)
  }

  async function excluirSlide(id: string) {
    if (!confirm('Excluir este slide?')) return
    await supabase.from('carrossel').delete().eq('id', id)
    fetchSlides()
  }

  async function uploadFoto(file: File, tipo: 'imovel' | 'carrossel'): Promise<string> {
    const nome = `${tipo}/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '-')}`
    const { data, error } = await supabase.storage.from('fotos').upload(nome, file, { upsert: true })
    if (error) throw error
    const { data: url } = supabase.storage.from('fotos').getPublicUrl(data.path)
    return url.publicUrl
  }

  async function handleFotosImovel(files: FileList) {
    if (!editando) return
    setSalvando(true)
    setMsg('ÃÃâ Enviando fotos...')
    const urls: string[] = []
    for (const file of Array.from(files)) {
      try { urls.push(await uploadFoto(file, 'imovel')) } catch (e) { console.error(e) }
    }
    setEditando({ ...editando, fotos: [...(editando.fotos || []), ...urls] })
    setSalvando(false)
    setMsg('ÃÂ£Ã  Fotos adicionadas!')
    setTimeout(() => setMsg(''), 2000)
  }

  async function handleFotoSlide(file: File, slide: Slide, idx: number) {
    setSalvando(true)
    setMsg('ÃÃâ Enviando imagem...')
    try {
      const url = await uploadFoto(file, 'carrossel')
      const novos = [...slides]
      novos[idx] = { ...slide, imagem: url }
      setSlides(novos)
      setMsg('ÃÂ£Ã  Imagem carregada! Clique em Salvar.')
    } catch { setMsg('ÃÃÃ® Erro ao enviar imagem') }
    setSalvando(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const inp = (style?: object) => ({ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(223,192,120,0.2)`, color: s.branco, padding: '0.7rem 0.9rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.85rem', fontWeight: 300, borderRadius: 1, outline: 'none', width: '100%', ...style })
  const lbl = { fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '0.35rem' }
  const campo = { display: 'flex', flexDirection: 'column' as const, gap: '0.35rem', marginBottom: '1rem' }

  return (
    <div style={{ minHeight: '100vh', background: s.verde, fontFamily: 'Open Sans, sans-serif' }}>

      {/* HEADER */}
      <div style={{ background: '#021e22', borderBottom: `1px solid ${s.borda}`, padding: '1rem 3vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', color: s.ouro, fontSize: '1.4rem', fontWeight: 400 }}>ÃÃÃ Painel Admin</h1>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.1rem' }}>Jussara Ribeiro Imââveis</p>
        </div>
        <a href="/" target="_blank" style={{ fontSize: '0.72rem', color: s.ouro, textDecoration: 'none', border: `1px solid rgba(223,192,120,0.3)`, padding: '0.4rem 0.9rem', borderRadius: 1 }}>Ver site ÃÃ¥Ã</a>
      </div>

      {/* MENSAGEM */}
      {msg && (
        <div style={{ background: msg.includes('ÃÃÃ®') ? 'rgba(200,50,50,0.15)' : 'rgba(50,200,100,0.15)', border: `1px solid ${msg.includes('ÃÃÃ®') ? 'rgba(200,50,50,0.3)' : 'rgba(50,200,100,0.3)'}`, color: s.branco, padding: '0.75rem 3vw', fontSize: '0.85rem' }}>
          {msg}
        </div>
      )}

      {/* ABAS */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${s.borda}`, padding: '0 3vw' }}>
        {[['imoveis', 'Â­ÆÃÃ¡ Imââveis'], ['carrossel', 'Â­ÆÃÃ¡ Carrossel'], ['novo', '+ Novo Imââvel']].map(([v, l]) => (
          <button key={v} onClick={() => { setAba(v); if (v === 'novo') setEditando({ ...imovelVazio }) }} style={{ background: 'transparent', border: 'none', borderBottom: aba === v ? `2px solid ${s.ouro}` : '2px solid transparent', color: aba === v ? s.ouro : 'rgba(255,255,255,0.4)', padding: '1rem 1.5rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: -1 }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ padding: '2rem 3vw' }}>

        {/* ABA IMâÃ´VEIS */}
        {aba === 'imoveis' && !editando && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', color: s.ouro, fontSize: '1.2rem', fontWeight: 400 }}>Imââveis cadastrados ({imoveis.length})</h2>
              <button onClick={() => { setAba('novo'); setEditando({ ...imovelVazio }) }} style={{ background: s.ouro, color: s.verde, border: 'none', padding: '0.6rem 1.2rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1 }}>+ Novo imââvel</button>
            </div>
            {imoveis.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)', border: `1.5px dashed rgba(223,192,120,0.2)`, borderRadius: 2 }}>
                <p style={{ fontSize: '0.9rem' }}>Nenhum imââvel cadastrado ainda.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Clique em "+ Novo imââvel" para comeâÂºar.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {imoveis.map(im => (
                  <div key={im.id} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(223,192,120,0.12)`, borderRadius: 2, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {im.fotos && im.fotos.length > 0 ? (
                        <img src={im.fotos[0]} alt={im.titulo} style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 1 }} />
                      ) : (
                        <div style={{ width: 64, height: 48, background: 'rgba(255,255,255,0.05)', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>Â­ÆÃÃ¡</div>
                      )}
                      <div>
                        <p style={{ color: s.branco, fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.2rem' }}>{im.titulo}</p>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>{im.cidade} â¬Ã {TIPOS[im.tipo as keyof typeof TIPOS] || im.tipo} â¬Ã {im.zona} â¬Ã {im.preco > 0 ? `R$ ${im.preco.toLocaleString('pt-BR')}` : 'Consulte'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderRadius: 1, background: im.status === 'disponivel' ? 'rgba(50,200,100,0.15)' : 'rgba(200,50,50,0.15)', color: im.status === 'disponivel' ? '#50c878' : '#ff8080', border: `1px solid ${im.status === 'disponivel' ? 'rgba(50,200,100,0.3)' : 'rgba(200,50,50,0.3)'}` }}>{im.status}</span>
                      <button onClick={() => { setEditando(im); setAba('editar') }} style={{ background: 'transparent', border: `1px solid rgba(223,192,120,0.3)`, color: s.ouro, padding: '0.35rem 0.8rem', borderRadius: 1, fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Editar</button>
                      <button onClick={() => excluirImovel(im.id!)} style={{ background: 'rgba(200,50,50,0.12)', border: `1px solid rgba(200,50,50,0.25)`, color: '#ff8080', padding: '0.35rem 0.8rem', borderRadius: 1, fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FORMULâÃ¼RIO IMâÃ´VEL (novo ou editar) */}
        {(aba === 'novo' || aba === 'editar') && editando && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <button onClick={() => { setEditando(null); setAba('imoveis') }} style={{ background: 'transparent', border: `1px solid rgba(223,192,120,0.3)`, color: 'rgba(255,255,255,0.5)', padding: '0.4rem 0.8rem', borderRadius: 1, fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>ÃÃ¥Ã Voltar</button>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', color: s.ouro, fontSize: '1.2rem', fontWeight: 400 }}>{editando.id ? 'Editar imââvel' : 'Novo imââvel'}</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <div style={campo}>
                  <label style={lbl}>TâÂ¡tulo *</label>
                  <input style={inp()} value={editando.titulo} onChange={e => setEditando({ ...editando, titulo: e.target.value, slug: gerarSlug(e.target.value) })} placeholder="Ex: Casa residencial 3 quartos" />
                </div>
                <div style={campo}>
                  <label style={lbl}>DescriâÂºâÃºo</label>
                  <textarea style={{ ...inp(), minHeight: 100, resize: 'vertical' }} value={editando.descricao} onChange={e => setEditando({ ...editando, descricao: e.target.value })} placeholder="Descreva o imââvel..." />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={campo}>
                    <label style={lbl}>Tipo</label>
                    <select style={{ ...inp(), background: s.verde }} value={editando.tipo} onChange={e => setEditando({ ...editando, tipo: e.target.value })}>
                      {Object.entries(TIPOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div style={campo}>
                    <label style={lbl}>Zona</label>
                    <select style={{ ...inp(), background: s.verde }} value={editando.zona} onChange={e => setEditando({ ...editando, zona: e.target.value })}>
                      <option value="urbano">Urbano</option>
                      <option value="rural">Rural</option>
                    </select>
                  </div>
                  <div style={campo}>
                    <label style={lbl}>Cidade</label>
                    <select style={{ ...inp(), background: s.verde }} value={editando.cidade} onChange={e => setEditando({ ...editando, cidade: e.target.value })}>
                      {CIDADES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={campo}>
                    <label style={lbl}>Bairro</label>
                    <input style={inp()} value={editando.bairro} onChange={e => setEditando({ ...editando, bairro: e.target.value })} placeholder="Ex: Centro" />
                  </div>
                  <div style={campo}>
                    <label style={lbl}>PreâÂºo (R$)</label>
                    <input style={inp()} type="number" value={editando.preco || ''} onChange={e => setEditando({ ...editando, preco: Number(e.target.value) })} placeholder="Ex: 380000" />
                  </div>
                  <div style={campo}>
                    <label style={lbl}>âÃ¼rea (mâ¬â)</label>
                    <input style={inp()} type="number" value={editando.area || ''} onChange={e => setEditando({ ...editando, area: Number(e.target.value) })} placeholder="Ex: 120" />
                  </div>
                  <div style={campo}>
                    <label style={lbl}>Quartos</label>
                    <input style={inp()} type="number" value={editando.quartos || ''} onChange={e => setEditando({ ...editando, quartos: Number(e.target.value) })} placeholder="Ex: 3" />
                  </div>
                  <div style={campo}>
                    <label style={lbl}>Banheiros</label>
                    <input style={inp()} type="number" value={editando.banheiros || ''} onChange={e => setEditando({ ...editando, banheiros: Number(e.target.value) })} placeholder="Ex: 2" />
                  </div>
                </div>
                <div style={campo}>
                  <label style={lbl}>Link do vâÂ¡deo (YouTube ou Instagram)</label>
                  <input style={inp()} value={editando.video_url} onChange={e => setEditando({ ...editando, video_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
                </div>
                <div style={campo}>
                  <label style={lbl}>Status</label>
                  <select style={{ ...inp(), background: s.verde }} value={editando.status} onChange={e => setEditando({ ...editando, status: e.target.value })}>
                    <option value="disponivel">DisponâÂ¡vel</option>
                    <option value="reservado">Reservado</option>
                    <option value="vendido">Vendido</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <input type="checkbox" id="destaque" checked={editando.destaque} onChange={e => setEditando({ ...editando, destaque: e.target.checked })} />
                  <label htmlFor="destaque" style={{ ...lbl, margin: 0, cursor: 'pointer' }}>Destacar este imââvel na pâÃ­gina inicial</label>
                </div>
              </div>

              <div>
                <div style={campo}>
                  <label style={lbl}>Fotos do imââvel</label>
                  <div style={{ border: `1.5px dashed rgba(223,192,120,0.25)`, borderRadius: 1, padding: '1.5rem', textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
                    <input type="file" multiple accept="image/*" onChange={e => e.target.files && handleFotosImovel(e.target.files)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>Â­ÆÃ´Ã Clique para adicionar fotos</p>
                    <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.3rem' }}>JPG, PNG, WEBP â¬Ã Mââltiplas fotos permitidas</p>
                  </div>
                  {editando.fotos && editando.fotos.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.75rem' }}>
                      {editando.fotos.map((url, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img src={url} alt={`Foto ${i + 1}`} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 1 }} />
                          <button onClick={() => setEditando({ ...editando, fotos: editando.fotos.filter((_, j) => j !== i) })} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(200,50,50,0.8)', border: 'none', color: 'white', width: 20, height: 20, borderRadius: '50%', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>ÃÂ£Ã²</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {editando.video_url && (
                  <div style={campo}>
                    <label style={lbl}>Preview do vâÂ¡deo</label>
                    {editando.video_url.includes('youtube') || editando.video_url.includes('youtu.be') ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${editando.video_url.split('v=')[1]?.split('&')[0] || editando.video_url.split('youtu.be/')[1]}`}
                        style={{ width: '100%', height: 200, borderRadius: 1, border: 'none' }}
                        allowFullScreen
                      />
                    ) : (
                      <a href={editando.video_url} target="_blank" style={{ color: s.ouro, fontSize: '0.8rem' }}>Ver vâÂ¡deo no Instagram ÃÃ¥Ã</a>
                    )}
                  </div>
                )}

                <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(223,192,120,0.1)`, borderRadius: 2, padding: '1rem', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>URL amigâÃ­vel (slug)</p>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', wordBreak: 'break-all' }}>/imoveis/{editando.slug || gerarSlug(editando.titulo) || 'sera-gerado-automaticamente'}</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: `1px solid rgba(223,192,120,0.1)` }}>
              <button onClick={salvarImovel} disabled={salvando} style={{ background: s.ouro, color: s.verde, border: 'none', padding: '0.9rem 2.5rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: salvando ? 'not-allowed' : 'pointer', borderRadius: 1, opacity: salvando ? 0.7 : 1 }}>
                {salvando ? 'Salvando...' : 'ÃÂ£Ã´ Salvar imââvel'}
              </button>
              <button onClick={() => { setEditando(null); setAba('imoveis') }} style={{ background: 'transparent', border: `1px solid rgba(223,192,120,0.2)`, color: 'rgba(255,255,255,0.45)', padding: '0.9rem 1.5rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.78rem', cursor: 'pointer', borderRadius: 1 }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* ABA CARROSSEL */}
        {aba === 'carrossel' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', color: s.ouro, fontSize: '1.2rem', fontWeight: 400 }}>Carrossel da pâÃ­gina inicial</h2>
              <button onClick={() => { const novo: Slide = { imagem: '', legenda: 'Novo slide', subtitulo: '', ordem: slides.length, ativo: true }; setSlides([...slides, novo]) }} style={{ background: s.ouro, color: s.verde, border: 'none', padding: '0.6rem 1.2rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1 }}>+ Novo slide</button>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.5rem' }}>Recomendado: imagens 1400 âÃ¹ 500 px, formato JPG ou PNG.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {slides.map((sl, idx) => (
                <div key={sl.id || idx} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(223,192,120,0.12)`, borderRadius: 2, padding: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr auto', gap: '1.5rem', alignItems: 'start' }}>
                    <div>
                      {sl.imagem ? (
                        <img src={sl.imagem} alt={sl.legenda} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 1, marginBottom: '0.5rem' }} />
                      ) : (
                        <div style={{ width: '100%', height: 100, background: 'rgba(255,255,255,0.05)', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Â­ÆÃ»âÂ´Â©Ã</div>
                      )}
                      <div style={{ position: 'relative' }}>
                        <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFotoSlide(e.target.files[0], sl, idx)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                        <button style={{ width: '100%', background: 'transparent', border: `1px solid rgba(223,192,120,0.25)`, color: 'rgba(255,255,255,0.5)', padding: '0.4rem', borderRadius: 1, fontSize: '0.65rem', cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          {sl.imagem ? 'Trocar imagem' : 'Adicionar imagem'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <div style={campo}>
                        <label style={lbl}>Legenda principal</label>
                        <input style={inp()} value={sl.legenda} onChange={e => { const n = [...slides]; n[idx] = { ...sl, legenda: e.target.value }; setSlides(n) }} placeholder="Ex: Imââveis exclusivos em Campo Belo" />
                      </div>
                      <div style={campo}>
                        <label style={lbl}>SubtâÂ¡tulo</label>
                        <input style={inp()} value={sl.subtitulo} onChange={e => { const n = [...slides]; n[idx] = { ...sl, subtitulo: e.target.value }; setSlides(n) }} placeholder="Ex: Compra e venda com quem entende" />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input type="checkbox" id={`ativo-${idx}`} checked={sl.ativo} onChange={e => { const n = [...slides]; n[idx] = { ...sl, ativo: e.target.checked }; setSlides(n) }} />
                        <label htmlFor={`ativo-${idx}`} style={{ ...lbl, margin: 0, cursor: 'pointer' }}>Slide ativo</label>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button onClick={() => salvarSlide(slides[idx])} disabled={salvando} style={{ background: s.ouro, color: s.verde, border: 'none', padding: '0.5rem 1rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1, whiteSpace: 'nowrap' }}>
                        Salvar
                      </button>
                      {sl.id && (
                        <button onClick={() => excluirSlide(sl.id!)} style={{ background: 'rgba(200,50,50,0.12)', border: `1px solid rgba(200,50,50,0.25)`, color: '#ff8080', padding: '0.5rem 1rem', borderRadius: 1, fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>
                          Excluir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {slides.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)', border: `1.5px dashed rgba(223,192,120,0.2)`, borderRadius: 2 }}>
                  <p>Nenhum slide. Clique em "+ Novo slide" para comeâÂºar.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
