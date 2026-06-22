'use client'
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

type Config = Record<string, string>

const CIDADES = ['Campo Belo', 'Candeias', 'Cristais', 'Santana do Jacaré', 'Lavras']
const TIPOS = { casa: 'Casa', apartamento: 'Apartamento', lote: 'Lote / Terreno', comercial: 'Comercial', chacara: 'Chácara / Sítio', fazenda: 'Fazenda' }
const FONTES_TITULO = ['Cormorant Garamond', 'Playfair Display', 'Merriweather', 'Lora', 'Georgia']
const FONTES_TEXTO = ['Open Sans', 'Lato', 'Roboto', 'Montserrat', 'Raleway']

const s = {
  verde: '#043137', ouro: '#DFC078', branco: '#FFFFFF',
  borda: 'rgba(223,192,120,0.22)'
}

const imovelVazio: Imovel = {
  titulo: '', descricao: '', preco: 0, tipo: 'casa', zona: 'urbano',
  cidade: 'Campo Belo', bairro: '', endereco: '', area: 0, quartos: 0,
  banheiros: 0, vagas: 0, fotos: [], video_url: '', slug: '', destaque: false, status: 'disponivel'
}

const GRUPOS_TEXTO = [
  {
    grupo: '🏠 Navegação',
    campos: [
      { chave: 'nav_nome', label: 'Nome no menu' },
      { chave: 'nav_subtitulo', label: 'Subtítulo no menu' },
    ]
  },
  {
    grupo: '🌟 Seção Principal (Hero)',
    campos: [
      { chave: 'hero_tag', label: 'Tag acima do título' },
      { chave: 'hero_titulo', label: 'Título principal', grande: true },
      { chave: 'hero_subtitulo', label: 'Subtítulo / descrição', grande: true },
      { chave: 'hero_stat1_num', label: 'Estatística 1 — número' },
      { chave: 'hero_stat1_label', label: 'Estatística 1 — label' },
      { chave: 'hero_stat2_num', label: 'Estatística 2 — número' },
      { chave: 'hero_stat2_label', label: 'Estatística 2 — label' },
      { chave: 'hero_stat3_num', label: 'Estatística 3 — número' },
      { chave: 'hero_stat3_label', label: 'Estatística 3 — label' },
    ]
  },
  {
    grupo: '👤 Seção Sobre',
    campos: [
      { chave: 'sobre_titulo', label: 'Nome da corretora' },
      { chave: 'sobre_anos', label: 'Anos de experiência (destaque)' },
      { chave: 'sobre_p1', label: 'Parágrafo 1', grande: true },
      { chave: 'sobre_p2', label: 'Parágrafo 2', grande: true },
    ]
  },
  {
    grupo: '⚖️ Seção Jurídico',
    campos: [
      { chave: 'juridico_titulo', label: 'Título da seção' },
      { chave: 'juridico_subtitulo', label: 'Subtítulo', grande: true },
      { chave: 'juridico_advogada', label: 'Nome da advogada' },
      { chave: 'juridico_oab', label: 'Descrição / OAB' },
    ]
  },
  {
    grupo: '📬 Seção Contato',
    campos: [
      { chave: 'contato_titulo', label: 'Título' },
      { chave: 'contato_subtitulo', label: 'Subtítulo', grande: true },
      { chave: 'localizacao', label: 'Localização' },
    ]
  },
  {
    grupo: '📱 Redes Sociais',
    campos: [
      { chave: 'whatsapp', label: 'WhatsApp (só números, com DDI)' },
      { chave: 'instagram', label: 'Instagram (só o @, sem @)' },
      { chave: 'facebook', label: 'Facebook (URL completa)' },
    ]
  },
  {
    grupo: '📄 Rodapé',
    campos: [
      { chave: 'footer_texto', label: 'Texto do rodapé' },
      { chave: 'footer_creci', label: 'CRECI / registros' },
    ]
  },
  {
    grupo: '🎬 Vídeo da Cidade',
    campos: [
      { chave: 'video_cidade', label: 'Link do vídeo (YouTube) ou URL do arquivo' },
    ]
  },
]

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false)
  const [senhaInput, setSenhaInput] = useState('')
  const [erroSenha, setErroSenha] = useState(false)
  const [senhaAdmin, setSenhaAdmin] = useState('jussara2025')

  const [aba, setAba] = useState('imoveis')
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [slides, setSlides] = useState<Slide[]>([])
  const [config, setConfig] = useState<Config>({})
  const [editando, setEditando] = useState<Imovel | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const ok = sessionStorage.getItem('admin_auth')
    if (ok === 'true') setAutenticado(true)
    fetchConfig()
  }, [])

  async function fetchConfig() {
    const { data } = await supabase.from('configuracoes').select('*')
    if (data) {
      const cfg: Config = {}
      data.forEach((row: { chave: string; valor: string }) => { cfg[row.chave] = row.valor })
      setConfig(cfg)
      if (cfg.senha_admin) setSenhaAdmin(cfg.senha_admin)
    }
  }

  function entrar() {
    if (senhaInput === senhaAdmin) {
      setAutenticado(true)
      sessionStorage.setItem('admin_auth', 'true')
      setErroSenha(false)
      fetchImoveis()
      fetchSlides()
    } else {
      setErroSenha(true)
    }
  }

  useEffect(() => {
    if (autenticado) { fetchImoveis(); fetchSlides() }
  }, [autenticado])

  async function fetchImoveis() {
    const { data } = await supabase.from('imoveis').select('*').order('created_at', { ascending: false })
    if (data) setImoveis(data)
  }

  async function fetchSlides() {
    const { data } = await supabase.from('carrossel').select('*').order('ordem')
    if (data) setSlides(data)
  }

  function gerarSlug(titulo: string) {
    const base = titulo.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
    const sufixo = Date.now().toString(36).slice(-4)
    return `${base}-${sufixo}`
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
    if (erro) { setMsg('❌ Erro: ' + erro.message) }
    else { setMsg('✅ Imóvel salvo!'); setEditando(null); fetchImoveis() }
    setTimeout(() => setMsg(''), 3000)
  }

  async function excluirImovel(id: string) {
    if (!confirm('Excluir este imóvel?')) return
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
    if (erro) setMsg('❌ Erro: ' + erro.message)
    else { setMsg('✅ Slide salvo!'); fetchSlides() }
    setTimeout(() => setMsg(''), 3000)
  }

  async function excluirSlide(id: string) {
    if (!confirm('Excluir este slide?')) return
    await supabase.from('carrossel').delete().eq('id', id)
    fetchSlides()
  }

  async function salvarConfig() {
    setSalvando(true)
    try {
      for (const [chave, valor] of Object.entries(config)) {
        const { data } = await supabase.from('configuracoes').select('id').eq('chave', chave).single()
        if (data) {
          await supabase.from('configuracoes').update({ valor }).eq('chave', chave)
        } else {
          await supabase.from('configuracoes').insert({ chave, valor })
        }
      }
      setMsg('✅ Configurações salvas! Recarregue o site para ver as mudanças.')
    } catch {
      setMsg('❌ Erro ao salvar configurações')
    }
    setSalvando(false)
    setTimeout(() => setMsg(''), 4000)
  }

  async function uploadVideo(file: File): Promise<string> {
    const nome = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '-')}`
    const { data, error } = await supabase.storage.from('videos').upload(nome, file, { upsert: true })
    if (error) throw error
    const { data: url } = supabase.storage.from('videos').getPublicUrl(data.path)
    return url.publicUrl
  }

  async function handleVideoUpload(file: File) {
    setSalvando(true)
    setMsg('⏳ Enviando vídeo...')
    try {
      const url = await uploadVideo(file)
      setConfig(c => ({ ...c, video_cidade: url, video_cidade_tipo: 'upload' }))
      setMsg('✅ Vídeo carregado! Clique em Salvar configurações.')
    } catch { setMsg('❌ Erro ao enviar vídeo') }
    setSalvando(false)
    setTimeout(() => setMsg(''), 4000)
  }

  async function converterParaJpg(file: File): Promise<File> {
    if (!file.type.includes('heic') && !file.type.includes('heif') && !file.name.toLowerCase().endsWith('.heic') && !file.name.toLowerCase().endsWith('.heif')) {
      return file
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const heic2any = (await import('https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js' as any)).default
          const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 })
          const jpgFile = new File([blob as Blob], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), { type: 'image/jpeg' })
          resolve(jpgFile)
        } catch {
          reject(new Error('Erro ao converter HEIC'))
        }
      }
      reader.readAsArrayBuffer(file)
    })
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
    setMsg('⏳ Enviando fotos...')
    const urls: string[] = []
    for (const file of Array.from(files)) {
      try {
        const fileConvertido = await converterParaJpg(file)
        urls.push(await uploadFoto(fileConvertido, 'imovel'))
      } catch (e) { console.error(e) }
    }
    setEditando({ ...editando, fotos: [...(editando.fotos || []), ...urls] })
    setSalvando(false)
    setMsg('✅ Fotos adicionadas!')
    setTimeout(() => setMsg(''), 2000)
  }

  async function handleFotoSlide(file: File, slide: Slide, idx: number) {
    setSalvando(true)
    setMsg('⏳ Enviando imagem...')
    try {
      const url = await uploadFoto(file, 'carrossel')
      const novos = [...slides]
      novos[idx] = { ...slide, imagem: url }
      setSlides(novos)
      setMsg('✅ Imagem carregada! Clique em Salvar.')
    } catch { setMsg('❌ Erro ao enviar imagem') }
    setSalvando(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const inp = (style?: object) => ({ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(223,192,120,0.2)`, color: s.branco, padding: '0.7rem 0.9rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.85rem', fontWeight: 300, borderRadius: 1, outline: 'none', width: '100%', ...style })
  const lbl = { fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '0.35rem' }
  const campo = { display: 'flex', flexDirection: 'column' as const, gap: '0.35rem', marginBottom: '1rem' }

  if (!autenticado) {
    return (
      <div style={{ minHeight: '100vh', background: s.verde, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Open Sans, sans-serif' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(223,192,120,0.2)`, borderRadius: 2, padding: '3rem 2.5rem', width: '100%', maxWidth: 380, textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', color: s.ouro, fontSize: '1.6rem', fontWeight: 400, marginBottom: '0.5rem' }}>Painel Admin</h1>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginBottom: '2rem' }}>Jussara Ribeiro Imóveis</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'left' }}>
              <label style={lbl}>Senha de acesso</label>
              <input type="password" placeholder="Digite a senha..." value={senhaInput} onChange={e => setSenhaInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && entrar()} style={{ ...inp(), border: erroSenha ? '1px solid rgba(200,50,50,0.6)' : `1px solid rgba(223,192,120,0.2)` }} />
              {erroSenha && <p style={{ fontSize: '0.72rem', color: '#ff8080', marginTop: '0.25rem' }}>Senha incorreta. Tente novamente.</p>}
            </div>
            <button onClick={entrar} style={{ background: s.ouro, color: s.verde, border: 'none', padding: '0.9rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1 }}>Entrar</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: s.verde, fontFamily: 'Open Sans, sans-serif' }}>

      {/* HEADER */}
      <div style={{ background: '#021e22', borderBottom: `1px solid ${s.borda}`, padding: '1rem 3vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', color: s.ouro, fontSize: '1.4rem', fontWeight: 400 }}>🏠 Painel Admin</h1>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.1rem' }}>Jussara Ribeiro Imóveis</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a href="/" target="_blank" style={{ fontSize: '0.72rem', color: s.ouro, textDecoration: 'none', border: `1px solid rgba(223,192,120,0.3)`, padding: '0.4rem 0.9rem', borderRadius: 1 }}>Ver site →</a>
          <button onClick={() => { sessionStorage.removeItem('admin_auth'); setAutenticado(false) }} style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', background: 'transparent', border: `1px solid rgba(255,255,255,0.15)`, padding: '0.4rem 0.9rem', borderRadius: 1, cursor: 'pointer' }}>Sair</button>
        </div>
      </div>

      {/* MENSAGEM */}
      {msg && (
        <div style={{ background: msg.includes('❌') ? 'rgba(200,50,50,0.15)' : 'rgba(50,200,100,0.15)', border: `1px solid ${msg.includes('❌') ? 'rgba(200,50,50,0.3)' : 'rgba(50,200,100,0.3)'}`, color: s.branco, padding: '0.75rem 3vw', fontSize: '0.85rem' }}>
          {msg}
        </div>
      )}

      {/* ABAS */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${s.borda}`, padding: '0 3vw', overflowX: 'auto' }}>
        {[['imoveis', '🏡 Imóveis'], ['carrossel', '🖼️ Carrossel'], ['novo', '+ Novo Imóvel'], ['textos', '✏️ Textos'], ['configuracoes', '⚙️ Visual']].map(([v, l]) => (
          <button key={v} onClick={() => { setAba(v); if (v === 'novo') setEditando({ ...imovelVazio }) }} style={{ background: 'transparent', border: 'none', borderBottom: aba === v ? `2px solid ${s.ouro}` : '2px solid transparent', color: aba === v ? s.ouro : 'rgba(255,255,255,0.4)', padding: '1rem 1.5rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: -1, whiteSpace: 'nowrap' }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ padding: '2rem 3vw' }}>

        {/* ABA IMÓVEIS */}
        {aba === 'imoveis' && !editando && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', color: s.ouro, fontSize: '1.2rem', fontWeight: 400 }}>Imóveis cadastrados ({imoveis.length})</h2>
              <button onClick={() => { setAba('novo'); setEditando({ ...imovelVazio }) }} style={{ background: s.ouro, color: s.verde, border: 'none', padding: '0.6rem 1.2rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1 }}>+ Novo imóvel</button>
            </div>
            {imoveis.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)', border: `1.5px dashed rgba(223,192,120,0.2)`, borderRadius: 2 }}>
                <p style={{ fontSize: '0.9rem' }}>Nenhum imóvel cadastrado ainda.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Clique em "+ Novo imóvel" para começar.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {imoveis.map(im => (
                  <div key={im.id} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(223,192,120,0.12)`, borderRadius: 2, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {im.fotos && im.fotos.length > 0 ? (
                        <img src={im.fotos[0]} alt={im.titulo} style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 1 }} />
                      ) : (
                        <div style={{ width: 64, height: 48, background: 'rgba(255,255,255,0.05)', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏡</div>
                      )}
                      <div>
                        <p style={{ color: s.branco, fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.2rem' }}>{im.titulo}</p>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>{im.cidade} • {TIPOS[im.tipo as keyof typeof TIPOS] || im.tipo} • {im.zona} • {im.preco > 0 ? `R$ ${im.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Consulte'}</p>
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

        {/* FORMULÁRIO IMÓVEL */}
        {(aba === 'novo' || aba === 'editar') && editando && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <button onClick={() => { setEditando(null); setAba('imoveis') }} style={{ background: 'transparent', border: `1px solid rgba(223,192,120,0.3)`, color: 'rgba(255,255,255,0.5)', padding: '0.4rem 0.8rem', borderRadius: 1, fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>← Voltar</button>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', color: s.ouro, fontSize: '1.2rem', fontWeight: 400 }}>{editando.id ? 'Editar imóvel' : 'Novo imóvel'}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <div style={campo}><label style={lbl}>Título *</label><input style={inp()} value={editando.titulo} onChange={e => setEditando({ ...editando, titulo: e.target.value, slug: gerarSlug(e.target.value) })} placeholder="Ex: Casa residencial 3 quartos" /></div>
                <div style={campo}><label style={lbl}>Descrição</label><textarea style={{ ...inp(), minHeight: 100, resize: 'vertical' }} value={editando.descricao} onChange={e => setEditando({ ...editando, descricao: e.target.value })} placeholder="Descreva o imóvel..." /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={campo}><label style={lbl}>Tipo</label><select style={{ ...inp(), background: s.verde }} value={editando.tipo} onChange={e => setEditando({ ...editando, tipo: e.target.value })}>{Object.entries(TIPOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
                  <div style={campo}><label style={lbl}>Zona</label><select style={{ ...inp(), background: s.verde }} value={editando.zona} onChange={e => setEditando({ ...editando, zona: e.target.value })}><option value="urbano">Urbano</option><option value="rural">Rural</option></select></div>
                  <div style={campo}><label style={lbl}>Cidade</label><select style={{ ...inp(), background: s.verde }} value={editando.cidade} onChange={e => setEditando({ ...editando, cidade: e.target.value })}>{CIDADES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div style={campo}><label style={lbl}>Bairro</label><input style={inp()} value={editando.bairro} onChange={e => setEditando({ ...editando, bairro: e.target.value })} placeholder="Ex: Centro" /></div>
                  <div style={campo}>
                    <label style={lbl}>Preço (R$)</label>
                    <input
                      style={inp()}
                      type="text"
                      value={editando.preco > 0 ? editando.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                      onChange={e => {
                        const raw = e.target.value.replace(/\./g, '').replace(',', '.')
                        const num = parseFloat(raw)
                        setEditando({ ...editando, preco: isNaN(num) ? 0 : Math.round(num) })
                      }}
                      placeholder="Ex: 270.000,00"
                    />
                  </div>
                  <div style={campo}><label style={lbl}>Área (m²)</label><input style={inp()} type="number" value={editando.area || ''} onChange={e => setEditando({ ...editando, area: Number(e.target.value) })} placeholder="Ex: 120" /></div>
                  <div style={campo}><label style={lbl}>Quartos</label><input style={inp()} type="number" value={editando.quartos || ''} onChange={e => setEditando({ ...editando, quartos: Number(e.target.value) })} placeholder="Ex: 3" /></div>
                  <div style={campo}><label style={lbl}>Banheiros</label><input style={inp()} type="number" value={editando.banheiros || ''} onChange={e => setEditando({ ...editando, banheiros: Number(e.target.value) })} placeholder="Ex: 2" /></div>
                </div>
                <div style={campo}><label style={lbl}>Link do vídeo</label><input style={inp()} value={editando.video_url} onChange={e => setEditando({ ...editando, video_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." /></div>
                <div style={campo}><label style={lbl}>Status</label><select style={{ ...inp(), background: s.verde }} value={editando.status} onChange={e => setEditando({ ...editando, status: e.target.value })}><option value="disponivel">Disponível</option><option value="reservado">Reservado</option><option value="vendido">Vendido</option></select></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <input type="checkbox" id="destaque" checked={editando.destaque} onChange={e => setEditando({ ...editando, destaque: e.target.checked })} />
                  <label htmlFor="destaque" style={{ ...lbl, margin: 0, cursor: 'pointer' }}>Destacar na página inicial</label>
                </div>
              </div>
              <div>
                <div style={campo}>
                  <label style={lbl}>Fotos do imóvel</label>
                  <div style={{ border: `1.5px dashed rgba(223,192,120,0.25)`, borderRadius: 1, padding: '1.5rem', textAlign: 'center', position: 'relative' }}>
                    <input type="file" multiple accept="image/*,.heic,.heif" onChange={e => e.target.files && handleFotosImovel(e.target.files)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>📸 Clique para adicionar fotos</p>
                    <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.3rem' }}>JPG, PNG, WEBP, HEIC • Múltiplas fotos permitidas</p>
                  </div>
                  {editando.fotos && editando.fotos.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.75rem' }}>
                      {editando.fotos.map((url, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img src={url} alt={`Foto ${i + 1}`} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 1 }} />
                          <button onClick={() => setEditando({ ...editando, fotos: editando.fotos.filter((_, j) => j !== i) })} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(200,50,50,0.8)', border: 'none', color: 'white', width: 20, height: 20, borderRadius: '50%', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(223,192,120,0.1)`, borderRadius: 2, padding: '1rem' }}>
                  <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>URL amigável</p>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', wordBreak: 'break-all' }}>/imoveis/{editando.slug || gerarSlug(editando.titulo) || 'sera-gerado-automaticamente'}</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: `1px solid rgba(223,192,120,0.1)` }}>
              <button onClick={salvarImovel} disabled={salvando} style={{ background: s.ouro, color: s.verde, border: 'none', padding: '0.9rem 2.5rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: salvando ? 'not-allowed' : 'pointer', borderRadius: 1, opacity: salvando ? 0.7 : 1 }}>
                {salvando ? 'Salvando...' : '💾 Salvar imóvel'}
              </button>
              <button onClick={() => { setEditando(null); setAba('imoveis') }} style={{ background: 'transparent', border: `1px solid rgba(223,192,120,0.2)`, color: 'rgba(255,255,255,0.45)', padding: '0.9rem 1.5rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.78rem', cursor: 'pointer', borderRadius: 1 }}>Cancelar</button>
            </div>
          </div>
        )}

        {/* ABA CARROSSEL */}
        {aba === 'carrossel' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', color: s.ouro, fontSize: '1.2rem', fontWeight: 400 }}>Carrossel da página inicial</h2>
              <button onClick={() => { const novo: Slide = { imagem: '', legenda: 'Novo slide', subtitulo: '', ordem: slides.length, ativo: true }; setSlides([...slides, novo]) }} style={{ background: s.ouro, color: s.verde, border: 'none', padding: '0.6rem 1.2rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1 }}>+ Novo slide</button>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.5rem' }}>Recomendado: imagens 1400 × 500 px, formato JPG ou PNG.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {slides.map((sl, idx) => (
                <div key={sl.id || idx} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(223,192,120,0.12)`, borderRadius: 2, padding: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr auto', gap: '1.5rem', alignItems: 'start' }}>
                    <div>
                      {sl.imagem ? <img src={sl.imagem} alt={sl.legenda} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 1, marginBottom: '0.5rem' }} /> : <div style={{ width: '100%', height: 100, background: 'rgba(255,255,255,0.05)', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }}>🖼️</div>}
                      <div style={{ position: 'relative' }}>
                        <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFotoSlide(e.target.files[0], sl, idx)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                        <button style={{ width: '100%', background: 'transparent', border: `1px solid rgba(223,192,120,0.25)`, color: 'rgba(255,255,255,0.5)', padding: '0.4rem', borderRadius: 1, fontSize: '0.65rem', cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{sl.imagem ? 'Trocar imagem' : 'Adicionar imagem'}</button>
                      </div>
                    </div>
                    <div>
                      <div style={campo}><label style={lbl}>Legenda principal</label><input style={inp()} value={sl.legenda} onChange={e => { const n = [...slides]; n[idx] = { ...sl, legenda: e.target.value }; setSlides(n) }} placeholder="Ex: Imóveis exclusivos em Campo Belo" /></div>
                      <div style={campo}><label style={lbl}>Subtítulo</label><input style={inp()} value={sl.subtitulo} onChange={e => { const n = [...slides]; n[idx] = { ...sl, subtitulo: e.target.value }; setSlides(n) }} placeholder="Ex: Compra e venda com quem entende" /></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input type="checkbox" id={`ativo-${idx}`} checked={sl.ativo} onChange={e => { const n = [...slides]; n[idx] = { ...sl, ativo: e.target.checked }; setSlides(n) }} />
                        <label htmlFor={`ativo-${idx}`} style={{ ...lbl, margin: 0, cursor: 'pointer' }}>Slide ativo</label>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button onClick={() => salvarSlide(slides[idx])} disabled={salvando} style={{ background: s.ouro, color: s.verde, border: 'none', padding: '0.5rem 1rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 1, whiteSpace: 'nowrap' }}>Salvar</button>
                      {sl.id && <button onClick={() => excluirSlide(sl.id!)} style={{ background: 'rgba(200,50,50,0.12)', border: `1px solid rgba(200,50,50,0.25)`, color: '#ff8080', padding: '0.5rem 1rem', borderRadius: 1, fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}>Excluir</button>}
                    </div>
                  </div>
                </div>
              ))}
              {slides.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)', border: `1.5px dashed rgba(223,192,120,0.2)`, borderRadius: 2 }}><p>Nenhum slide. Clique em "+ Novo slide" para começar.</p></div>}
            </div>
          </div>
        )}

        {/* ABA TEXTOS */}
        {aba === 'textos' && (
          <div style={{ maxWidth: 800 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', color: s.ouro, fontSize: '1.2rem', fontWeight: 400 }}>✏️ Editar textos do site</h2>
              <button onClick={salvarConfig} disabled={salvando} style={{ background: s.ouro, color: s.verde, border: 'none', padding: '0.7rem 1.5rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: salvando ? 'not-allowed' : 'pointer', borderRadius: 1, opacity: salvando ? 0.7 : 1 }}>
                {salvando ? 'Salvando...' : '💾 Salvar todos os textos'}
              </button>
            </div>
            {GRUPOS_TEXTO.map(grupo => (
              <div key={grupo.grupo} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(223,192,120,0.12)`, borderRadius: 2, padding: '1.75rem', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.78rem', color: s.ouro, fontWeight: 600, marginBottom: '1.25rem', letterSpacing: '0.05em' }}>{grupo.grupo}</p>
                {grupo.campos.map(f => (
                  <div key={f.chave} style={campo}>
                    <label style={lbl}>{f.label}</label>
                    {(f as any).grande ? (
                      <textarea value={config[f.chave] || ''} onChange={e => setConfig(c => ({ ...c, [f.chave]: e.target.value }))} rows={3} style={{ ...inp(), resize: 'vertical', minHeight: 80 }} />
                    ) : (
                      <input value={config[f.chave] || ''} onChange={e => setConfig(c => ({ ...c, [f.chave]: e.target.value }))} style={inp()} />
                    )}
                  </div>
                ))}
              </div>
            ))}
            <button onClick={salvarConfig} disabled={salvando} style={{ background: s.ouro, color: s.verde, border: 'none', padding: '0.9rem 2.5rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: salvando ? 'not-allowed' : 'pointer', borderRadius: 1, opacity: salvando ? 0.7 : 1 }}>
              {salvando ? 'Salvando...' : '💾 Salvar todos os textos'}
            </button>
          </div>
        )}

        {/* ABA VISUAL */}
        {aba === 'configuracoes' && (
          <div style={{ maxWidth: 700 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', color: s.ouro, fontSize: '1.2rem', fontWeight: 400, marginBottom: '2rem' }}>⚙️ Configurações visuais</h2>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(223,192,120,0.12)`, borderRadius: 2, padding: '1.75rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: s.ouro, marginBottom: '1.25rem' }}>🎨 Cores</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={campo}>
                  <label style={lbl}>Cor principal (fundo)</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input type="color" value={config.cor_principal || '#043137'} onChange={e => setConfig(c => ({ ...c, cor_principal: e.target.value }))} style={{ width: 48, height: 40, borderRadius: 1, border: `1px solid rgba(223,192,120,0.2)`, cursor: 'pointer', background: 'transparent', padding: 2 }} />
                    <input style={{ ...inp(), flex: 1 }} value={config.cor_principal || '#043137'} onChange={e => setConfig(c => ({ ...c, cor_principal: e.target.value }))} placeholder="#043137" />
                  </div>
                </div>
                <div style={campo}>
                  <label style={lbl}>Cor de destaque (ouro)</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input type="color" value={config.cor_destaque || '#DFC078'} onChange={e => setConfig(c => ({ ...c, cor_destaque: e.target.value }))} style={{ width: 48, height: 40, borderRadius: 1, border: `1px solid rgba(223,192,120,0.2)`, cursor: 'pointer', background: 'transparent', padding: 2 }} />
                    <input style={{ ...inp(), flex: 1 }} value={config.cor_destaque || '#DFC078'} onChange={e => setConfig(c => ({ ...c, cor_destaque: e.target.value }))} placeholder="#DFC078" />
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: 1, display: 'flex', alignItems: 'center', gap: '1rem', background: config.cor_principal || '#043137' }}>
                <span style={{ fontFamily: (config.fonte_titulo || 'Cormorant Garamond') + ', serif', fontSize: '1.1rem', color: config.cor_destaque || '#DFC078' }}>Jussara Ribeiro Imóveis</span>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>← Prévia</span>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(223,192,120,0.12)`, borderRadius: 2, padding: '1.75rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: s.ouro, marginBottom: '1.25rem' }}>🔤 Fontes</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={campo}>
                  <label style={lbl}>Fonte dos títulos</label>
                  <select style={{ ...inp(), background: s.verde }} value={config.fonte_titulo || 'Cormorant Garamond'} onChange={e => setConfig(c => ({ ...c, fonte_titulo: e.target.value }))}>
                    {FONTES_TITULO.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <p style={{ fontFamily: (config.fonte_titulo || 'Cormorant Garamond') + ', serif', fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>Prévia: Jussara Ribeiro</p>
                </div>
                <div style={campo}>
                  <label style={lbl}>Fonte do texto geral</label>
                  <select style={{ ...inp(), background: s.verde }} value={config.fonte_texto || 'Open Sans'} onChange={e => setConfig(c => ({ ...c, fonte_texto: e.target.value }))}>
                    {FONTES_TEXTO.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <p style={{ fontFamily: (config.fonte_texto || 'Open Sans') + ', sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>Prévia: Compra e venda de imóveis</p>
                </div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(223,192,120,0.12)`, borderRadius: 2, padding: '1.75rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: s.ouro, marginBottom: '1.25rem' }}>🎬 Vídeo da Cidade</p>
              <div style={campo}>
                <label style={lbl}>Opção de vídeo</label>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>
                    <input type="radio" name="video_tipo" checked={config.video_cidade_tipo !== 'upload'} onChange={() => setConfig(c => ({ ...c, video_cidade_tipo: 'link' }))} />
                    Link (YouTube)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>
                    <input type="radio" name="video_tipo" checked={config.video_cidade_tipo === 'upload'} onChange={() => setConfig(c => ({ ...c, video_cidade_tipo: 'upload' }))} />
                    Upload de arquivo
                  </label>
                </div>
                {config.video_cidade_tipo === 'upload' ? (
                  <div>
                    <div style={{ border: `1.5px dashed rgba(223,192,120,0.25)`, borderRadius: 1, padding: '1.5rem', textAlign: 'center', position: 'relative', marginBottom: '0.75rem' }}>
                      <input type="file" accept="video/*" onChange={e => e.target.files?.[0] && handleVideoUpload(e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>🎬 Clique para fazer upload do vídeo</p>
                      <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.3rem' }}>MP4, MOV, WebM • Recomendado até 50MB</p>
                    </div>
                    {config.video_cidade && config.video_cidade_tipo === 'upload' && (
                      <video src={config.video_cidade} controls style={{ width: '100%', borderRadius: 1, maxHeight: 200 }} />
                    )}
                  </div>
                ) : (
                  <div>
                    <input style={inp()} value={config.video_cidade || ''} onChange={e => setConfig(c => ({ ...c, video_cidade: e.target.value, video_cidade_tipo: 'link' }))} placeholder="https://www.youtube.com/watch?v=..." />
                    {config.video_cidade && config.video_cidade_tipo !== 'upload' && (
                      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>✅ Link configurado</p>
                    )}
                  </div>
                )}
                {!config.video_cidade && (
                  <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.5rem' }}>Nenhum vídeo configurado. O espaço ficará oculto no site.</p>
                )}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(223,192,120,0.12)`, borderRadius: 2, padding: '1.75rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: s.ouro, marginBottom: '1.25rem' }}>🔒 Segurança</p>
              <div style={campo}>
                <label style={lbl}>Senha do painel admin</label>
                <input style={inp()} type="text" value={config.senha_admin || ''} onChange={e => setConfig(c => ({ ...c, senha_admin: e.target.value }))} placeholder="Nova senha..." />
                <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.35rem' }}>Anote a senha antes de salvar.</p>
              </div>
            </div>
            <button onClick={salvarConfig} disabled={salvando} style={{ background: s.ouro, color: s.verde, border: 'none', padding: '0.9rem 2.5rem', fontFamily: 'Open Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: salvando ? 'not-allowed' : 'pointer', borderRadius: 1, opacity: salvando ? 0.7 : 1 }}>
              {salvando ? 'Salvando...' : '💾 Salvar configurações'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
