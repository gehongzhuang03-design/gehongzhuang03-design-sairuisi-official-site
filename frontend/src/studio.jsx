import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Bot,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Home,
  Image as ImageIcon,
  LoaderCircle,
  LogOut,
  Menu,
  RefreshCw,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X
} from 'lucide-react'
import './studio.css'

const TOKEN_KEY = 'srs_studio_token'

function todayLabel() {
  return new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date())
}

function apiRequest(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY) || ''
  return fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  }).then(async response => {
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const error = new Error(data.message || '请求没有成功，请稍后重试')
      error.status = response.status
      throw error
    }
    return data
  })
}

function Login({ onLogin }) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async event => {
    event.preventDefault()
    if (!token.trim()) return
    setLoading(true)
    setError('')
    localStorage.setItem(TOKEN_KEY, token.trim())
    try {
      await apiRequest('/api/studio/dashboard')
      onLogin()
    } catch (requestError) {
      localStorage.removeItem(TOKEN_KEY)
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="studio-login">
      <section className="login-card">
        <div className="studio-mark"><Sparkles size={24} /></div>
        <span className="login-kicker">赛锐锶 · 内容工作台</span>
        <h1>每天的竞赛推文，<br />从这里开始。</h1>
        <p>采集、核验、写稿、配图和发布助手都装进手机里。</p>
        <form onSubmit={submit}>
          <label htmlFor="studio-token">管理口令</label>
          <input id="studio-token" type="password" value={token} onChange={event => setToken(event.target.value)} placeholder="请输入后台管理口令" autoComplete="current-password" />
          {error && <div className="login-error">{error}</div>}
          <button className="primary-button" disabled={loading}>{loading ? <LoaderCircle className="spin" /> : <ChevronRight />}进入工作台</button>
        </form>
        <div className="privacy-note"><ShieldCheck size={15} /> API 密钥仅保存在服务端</div>
      </section>
    </main>
  )
}

function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{status}</span>
}

function EmptyState({ onCollect, busy }) {
  return (
    <div className="empty-state">
      <div className="empty-orbit"><Bot size={30} /></div>
      <h3>今天还没有新选题</h3>
      <p>点一下开始采集，系统会从已配置的竞赛来源筛选值得发布的信息。</p>
      <button className="primary-button compact" onClick={onCollect} disabled={busy}><RefreshCw className={busy ? 'spin' : ''} />{busy ? '正在采集' : '开始采集'}</button>
    </div>
  )
}

function ItemCard({ item, active, onClick }) {
  const hasContent = Boolean(item.content)
  return (
    <button className={`item-card ${active ? 'active' : ''}`} onClick={onClick}>
      <div className="item-card-top">
        <span className="category">{item.category}</span>
        <StatusBadge status={item.status} />
      </div>
      <h3>{item.title}</h3>
      <p>{item.reason || '等待编辑判断推荐角度'}</p>
      <div className="item-meta">
        <span><Clock3 size={14} />{item.deadline || '时间待核验'}</span>
        <span className={hasContent ? 'ready' : ''}>{hasContent ? '文案已生成' : '待生成'}</span>
      </div>
    </button>
  )
}

async function copyText(text, message) {
  await navigator.clipboard.writeText(text)
  return message
}

async function copyWechatRich(wechat) {
  const text = `${wechat.title}\n\n${wechat.bodyText}`
  if (window.ClipboardItem && navigator.clipboard?.write && wechat.bodyHtml) {
    const html = `<h1>${wechat.title}</h1><p><strong>${wechat.digest || ''}</strong></p>${wechat.bodyHtml}`
    await navigator.clipboard.write([new ClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([text], { type: 'text/plain' })
    })])
  } else {
    await navigator.clipboard.writeText(text)
  }
  return '公众号图文排版已复制，可直接粘贴到编辑器'
}

function Composer({ item, onClose, onGenerate, onUpdate, busy, notify }) {
  const [tab, setTab] = useState('wechat')
  const [draft, setDraft] = useState(item.content)

  useEffect(() => setDraft(item.content), [item])

  const save = async nextContent => {
    setDraft(nextContent)
    await onUpdate(item.id, { content: nextContent })
  }

  const shareXhs = async () => {
    if (!draft?.xiaohongshu) return
    const text = `${draft.xiaohongshu.title}\n\n${draft.xiaohongshu.body}\n\n${(draft.xiaohongshu.tags || []).map(tag => `#${tag}`).join(' ')}`
    const files = []
    for (const image of item.images || []) {
      try {
        const blob = await fetch(image.url).then(response => response.blob())
        files.push(new File([blob], `${image.type}.png`, { type: blob.type || 'image/png' }))
      } catch { /* text-only fallback */ }
    }
    if (navigator.share && (!files.length || navigator.canShare?.({ files }))) {
      await navigator.share({ title: draft.xiaohongshu.title, text, files })
      return
    }
    notify(await copyText(text, '小红书文案已复制，可直接打开 App 发布'))
    window.location.href = 'xhsdiscover://'
  }

  const publishWechat = async () => {
    notify(await copyWechatRich(draft.wechat))
    setTimeout(() => { window.location.href = 'weixin://' }, 260)
  }

  if (!item.content) {
    return (
      <div className="composer-shell">
        <div className="composer-head"><button onClick={onClose}><ArrowLeft /></button><span>生成内容</span><span /></div>
        <div className="generate-state">
          <div className="generate-visual"><Sparkles /></div>
          <span>{item.category}</span>
          <h2>{item.title}</h2>
          <p>将生成公众号长文、小红书短文，以及两张对应配图。事实不确定处会主动标注待核验。</p>
          <button className="primary-button" onClick={() => onGenerate(item.id)} disabled={busy}>{busy ? <LoaderCircle className="spin" /> : <Sparkles />}{busy ? '正在写稿和配图，约需 1—3 分钟' : '生成今日推文'}</button>
          <a href={item.sourceUrl} target="_blank" rel="noreferrer">先查看原始来源 <ExternalLink size={14} /></a>
        </div>
      </div>
    )
  }

  const channel = draft[tab]
  return (
    <div className="composer-shell">
      <div className="composer-head">
        <button onClick={onClose} aria-label="返回"><ArrowLeft /></button>
        <div><b>编辑推文</b><small>修改会自动保存</small></div>
        <button className="icon-button" onClick={() => onGenerate(item.id)} disabled={busy} aria-label="重新生成"><RefreshCw className={busy ? 'spin' : ''} /></button>
      </div>
      <div className="channel-tabs">
        <button className={tab === 'wechat' ? 'active' : ''} onClick={() => setTab('wechat')}>公众号</button>
        <button className={tab === 'xiaohongshu' ? 'active' : ''} onClick={() => setTab('xiaohongshu')}>小红书</button>
        <button className={tab === 'images' ? 'active' : ''} onClick={() => setTab('images')}>配图</button>
      </div>

      {tab === 'images' ? (
        <div className="image-gallery">
          {(item.images || []).map(image => (
            <figure key={image.url}>
              <img src={image.url} alt={image.label} />
              <figcaption><span>{image.label}</span><a href={image.url} download><Download size={17} />保存</a></figcaption>
            </figure>
          ))}
          {!item.images?.length && <div className="no-images"><ImageIcon /><p>配图暂未生成成功，可以点右上角重新生成。</p></div>}
          {item.imageErrors?.map(error => <small className="image-error" key={error}>{error}</small>)}
        </div>
      ) : (
        <div className="editor-pane">
          <label>标题</label>
          <textarea className="title-editor" value={channel.title} onChange={event => setDraft({ ...draft, [tab]: { ...channel, title: event.target.value } })} onBlur={() => save(draft)} />
          {tab === 'wechat' && <><label>摘要</label><textarea className="digest-editor" value={channel.digest} onChange={event => setDraft({ ...draft, wechat: { ...channel, digest: event.target.value } })} onBlur={() => save(draft)} /></>}
          <label>正文</label>
          <textarea className="body-editor" value={tab === 'wechat' ? channel.bodyText : channel.body} onChange={event => setDraft({ ...draft, [tab]: { ...channel, [tab === 'wechat' ? 'bodyText' : 'body']: event.target.value } })} onBlur={() => save(draft)} />
          {tab === 'xiaohongshu' && <div className="tag-row">{channel.tags?.map(tag => <span key={tag}>#{tag}</span>)}</div>}
          <div className="source-check"><ShieldCheck size={18} /><div><b>发布前核验</b><p>{draft.facts?.[0] || '请对照原始通知核验报名时间、参赛对象和赛制。'}</p></div><a href={item.sourceUrl} target="_blank" rel="noreferrer">原文</a></div>
        </div>
      )}

      <div className="publish-bar">
        {tab === 'wechat' && <><button className="secondary-button" onClick={async () => notify(await copyWechatRich(draft.wechat))}><Copy />复制排版</button><button className="primary-button" onClick={publishWechat}><Send />去公众号发布</button></>}
        {tab === 'xiaohongshu' && <><button className="secondary-button" onClick={async () => notify(await copyText(`${draft.xiaohongshu.title}\n\n${draft.xiaohongshu.body}`, '小红书文案已复制'))}><Copy />复制</button><button className="primary-button" onClick={shareXhs}><Share2 />一键分享发布</button></>}
        {tab === 'images' && <button className="primary-button full" onClick={shareXhs}><Share2 />带配图分享到手机</button>}
      </div>
    </div>
  )
}

function SettingsView({ settings, onSave, onLogout, installPrompt, notify }) {
  const [form, setForm] = useState(settings)
  const save = async () => {
    await onSave(form)
    notify('设置已保存')
  }
  return (
    <section className="settings-view">
      <div className="view-title"><span>设置</span><h2>让工作台更像你</h2></div>
      <div className="settings-card install-card">
        <div className="settings-icon"><Smartphone /></div>
        <div><b>安装到手机桌面</b><p>安装后像普通 App 一样打开，支持全屏与系统分享。</p></div>
        <button onClick={installPrompt}>{installPrompt ? '安装' : '查看方法'}</button>
      </div>
      <div className="settings-card form-card">
        <label>每天自动采集时间<input type="time" value={form.dailyTime} onChange={event => setForm({ ...form, dailyTime: event.target.value })} /></label>
        <label className="toggle-label"><span><b>采集后自动生成第一篇</b><small>每天自动准备一组公众号和小红书推文</small></span><input type="checkbox" checked={form.autoGenerate} onChange={event => setForm({ ...form, autoGenerate: event.target.checked })} /></label>
        <label>目标读者<textarea value={form.audience} onChange={event => setForm({ ...form, audience: event.target.value })} /></label>
        <label>文风要求<textarea value={form.tone} onChange={event => setForm({ ...form, tone: event.target.value })} /></label>
        <button className="primary-button" onClick={save}><Check />保存设置</button>
      </div>
      <div className="settings-card source-card"><b>当前采集来源</b>{form.sources?.map(source => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.name}</span><ExternalLink /></a>)}</div>
      <button className="logout-button" onClick={onLogout}><LogOut />退出工作台</button>
    </section>
  )
}

export default function StudioApp() {
  const [authenticated, setAuthenticated] = useState(Boolean(localStorage.getItem(TOKEN_KEY)))
  const [data, setData] = useState(null)
  const [view, setView] = useState('home')
  const [selectedId, setSelectedId] = useState(null)
  const [busy, setBusy] = useState('')
  const [toast, setToast] = useState('')
  const [deferredInstall, setDeferredInstall] = useState(null)

  const notify = message => {
    setToast(message)
    setTimeout(() => setToast(''), 2600)
  }

  const load = async () => {
    try {
      const dashboard = await apiRequest('/api/studio/dashboard')
      setData(dashboard)
    } catch (error) {
      if (error.status === 401) {
        localStorage.removeItem(TOKEN_KEY)
        setAuthenticated(false)
      } else notify(error.message)
    }
  }

  useEffect(() => { if (authenticated) load() }, [authenticated])
  useEffect(() => {
    const handler = event => { event.preventDefault(); setDeferredInstall(event) }
    window.addEventListener('beforeinstallprompt', handler)
    navigator.serviceWorker?.register('/studio-sw.js').catch(() => {})
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const collect = async () => {
    setBusy('collect')
    notify('正在读取来源并筛选新信息…')
    try {
      const result = await apiRequest('/api/studio/collect', { method: 'POST', body: JSON.stringify({ autoGenerate: false }) })
      notify(result.added ? `发现 ${result.added} 条值得关注的新信息` : '没有重复添加，现有信息已经是最新')
      await load()
    } catch (error) { notify(error.message) } finally { setBusy('') }
  }

  const generate = async id => {
    setBusy(`generate-${id}`)
    try {
      const result = await apiRequest(`/api/studio/items/${id}/generate`, { method: 'POST', body: '{}' })
      setData(current => ({ ...current, items: current.items.map(item => item.id === id ? result.item : item) }))
      notify('文案和配图已生成，请审核后发布')
    } catch (error) { notify(error.message) } finally { setBusy('') }
  }

  const updateItem = async (id, patch) => {
    const result = await apiRequest(`/api/studio/items/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
    setData(current => ({ ...current, items: current.items.map(item => item.id === id ? result.item : item) }))
  }

  const updateSettings = async settings => {
    const result = await apiRequest('/api/studio/settings', { method: 'PATCH', body: JSON.stringify(settings) })
    setData(current => ({ ...current, settings: result.settings }))
  }

  const install = async () => {
    if (deferredInstall) {
      deferredInstall.prompt()
      await deferredInstall.userChoice
      setDeferredInstall(null)
      return
    }
    notify('iPhone：点浏览器“分享”→“添加到主屏幕”；安卓：点浏览器菜单→“安装应用”')
  }

  const selectedItem = useMemo(() => data?.items?.find(item => item.id === selectedId), [data, selectedId])
  if (!authenticated) return <Login onLogin={() => setAuthenticated(true)} />
  if (!data) return <div className="studio-loading"><div className="studio-mark"><LoaderCircle className="spin" /></div><span>正在准备今日内容</span></div>
  if (selectedItem) return <Composer item={selectedItem} onClose={() => setSelectedId(null)} onGenerate={generate} onUpdate={updateItem} busy={busy === `generate-${selectedItem.id}`} notify={notify} />

  return (
    <main className="studio-app">
      <header className="studio-header">
        <div><span>{todayLabel()}</span><h1>{view === 'home' ? '早上好，今天发什么？' : view === 'library' ? '内容素材库' : '工作台设置'}</h1></div>
        <button className="avatar-button" onClick={() => setView('settings')}>赛</button>
      </header>

      {view === 'home' && <section className="home-view">
        <div className="daily-card">
          <div><span className="pulse-dot" />每日自动任务</div>
          <h2>{data.settings.dailyTime} 自动采集</h2>
          <p>下一次会从 {data.settings.sources?.length || 0} 个竞赛来源筛选信息{data.settings.autoGenerate ? '，并自动生成第一篇推文' : ''}。</p>
          <button onClick={collect} disabled={busy === 'collect'}><RefreshCw className={busy === 'collect' ? 'spin' : ''} />{busy === 'collect' ? '正在采集，约需 1 分钟' : '立即采集最新信息'}</button>
        </div>
        <div className="section-heading"><div><span>今日选题</span><b>{data.items.length} 条候选</b></div><button onClick={() => setView('library')}>查看全部 <ChevronRight /></button></div>
        <div className="item-list">{data.items.length ? data.items.slice(0, 6).map(item => <ItemCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />) : <EmptyState onCollect={collect} busy={busy === 'collect'} />}</div>
      </section>}

      {view === 'library' && <section className="library-view">
        <div className="filter-pills"><button className="active">全部</button><button>待审核</button><button>已发布</button></div>
        <div className="item-list">{data.items.map(item => <ItemCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />)}</div>
      </section>}

      {view === 'settings' && <SettingsView settings={data.settings} onSave={updateSettings} onLogout={() => { localStorage.removeItem(TOKEN_KEY); setAuthenticated(false) }} installPrompt={install} notify={notify} />}

      <nav className="bottom-nav">
        <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}><Home /><span>今日</span></button>
        <button className={view === 'library' ? 'active' : ''} onClick={() => setView('library')}><FileText /><span>素材库</span></button>
        <button className="nav-create" onClick={collect} disabled={Boolean(busy)}><Sparkles /></button>
        <button onClick={() => { const ready = data.items.find(item => item.content); if (ready) setSelectedId(ready.id); else notify('先生成一篇推文，再使用发布助手') }}><Send /><span>发布</span></button>
        <button className={view === 'settings' ? 'active' : ''} onClick={() => setView('settings')}><Settings /><span>设置</span></button>
      </nav>
      {toast && <div className="studio-toast">{toast}</div>}
    </main>
  )
}
