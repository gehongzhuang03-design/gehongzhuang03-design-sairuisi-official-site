import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import nodemailer from 'nodemailer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const port = Number(process.env.PORT || 3001)
const dataDir = path.join(__dirname, 'data')
const dataFile = path.join(dataDir, 'leads.json')
const chatsFile = path.join(dataDir, 'chats.json')
const webDist = path.resolve(__dirname, '..', 'frontend', 'dist')

const adminToken = process.env.ADMIN_TOKEN || 'srs-admin-2026'
const emailTo = process.env.LEAD_EMAIL_TO || '1760772194@qq.com'

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true }))
app.use(express.json({ limit: '64kb' }))

const serviceData = {
  metrics: [
    { value: 7, suffix: '年', label: '高校竞赛服务经验' },
    { value: 100, suffix: '+', label: '国奖项目经验积累' },
    { value: 2, suffix: '类', label: '学生与教师专项服务' },
    { value: 5, suffix: '档', label: '教师带队服务模式' }
  ],
  sections: [
    { key: 'hero', name: '首页定位', summary: '面向学生团队与高校教师的竞赛服务平台。' },
    { key: 'services', name: '服务体系', summary: '项目诊断、材料打磨、技术 Demo、路演答辩与整队管理。' },
    { key: 'deliverables', name: '交付内容', summary: '项目诊断、材料证据链、Demo / 路演与整队推进。' },
    { key: 'student-plans', name: '学生报价', summary: '创新创业、调研实践与综合指导三类优惠报价。' },
    { key: 'teacher-plans', name: '教师带队', summary: '3999—19999五档带队、整队指导与高质量材料服务。' },
    { key: 'process', name: '合作流程', summary: '需求共识、项目诊断、协同打磨与赛前冲刺。' },
    { key: 'contact', name: '联系咨询', summary: '前端表单提交后写入后台，并可同步发送到指定邮箱。' }
  ]
}

async function readLeads() {
  try {
    const raw = await fs.readFile(dataFile, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeLeads(leads) {
  await fs.mkdir(dataDir, { recursive: true })
  await fs.writeFile(dataFile, JSON.stringify(leads, null, 2), 'utf8')
}

async function readChats() {
  try {
    const raw = await fs.readFile(chatsFile, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeChats(chats) {
  await fs.mkdir(dataDir, { recursive: true })
  await fs.writeFile(chatsFile, JSON.stringify(chats, null, 2), 'utf8')
}

let chatMutationQueue = Promise.resolve()
function mutateChats(mutator) {
  const task = chatMutationQueue.then(async () => {
    const chats = await readChats()
    const result = await mutator(chats)
    await writeChats(chats)
    return result
  })
  chatMutationQueue = task.catch(() => {})
  return task
}

function cleanChatText(value, max = 800) {
  return String(value || '').replace(/\\s+/g, ' ').trim().slice(0, max)
}

function getClientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim()
}

function getTransporter() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) return null

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') !== 'false',
    auth: { user, pass }
  })
}

function renderLeadEmail(lead) {
  return [
    '赛锐锶科技官网收到新的咨询线索',
    '',
    `称呼：${lead.name}`,
    `身份：${lead.role || '未填写'}`,
    `联系方式：${lead.contact}`,
    `需求简介：${lead.need}`,
    '',
    `提交时间：${lead.createdAt}`,
    `来源页面：${lead.source || '官网表单'}`,
    `IP：${lead.ip || '未知'}`,
    '',
    '请尽快跟进。'
  ].join('\n')
}

async function sendLeadMail(lead) {
  const transporter = getTransporter()
  if (!transporter) return { sent: false, reason: 'SMTP_NOT_CONFIGURED' }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  const subject = `官网新咨询：${lead.name}（${lead.role || '未填写身份'}）`
  const text = renderLeadEmail(lead)
  const html = text
    .split('\n')
    .map(line => line ? `<p>${line.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</p>` : '<br/>')
    .join('')

  await transporter.sendMail({ from, to: emailTo, subject, text, html })
  return { sent: true, to: emailTo }
}

async function sendChatMail(session, message) {
  const transporter = getTransporter()
  if (!transporter) return { sent: false, reason: 'SMTP_NOT_CONFIGURED' }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  const subject = `官网顾问新消息：${message.text.slice(0, 24)}`
  const text = [
    '赛锐锶科技官网收到新的项目顾问咨询',
    '',
    `消息：${message.text}`,
    `会话：${session.id}`,
    `页面：${session.page || '/'}`,
    `时间：${message.createdAt}`,
    `IP：${session.ip || '未知'}`
  ].join('\n')

  await transporter.sendMail({ from, to: emailTo, subject, text })
  return { sent: true, to: emailTo }
}

function requireAdmin(req, res, next) {
  const header = String(req.headers.authorization || '')
  const token = header.startsWith('Bearer ') ? header.slice(7) : String(req.query.token || '')
  if (token !== adminToken) return res.status(401).json({ ok: false, message: '需要后台管理口令。' })
  next()
}

function adminPage() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>赛锐锶科技官网后台</title>
<style>
:root{color-scheme:dark;--bg:#05070c;--panel:#0d1320;--line:rgba(255,255,255,.1);--text:#f7fbff;--muted:#94a3b8;--blue:#69a7ff;--green:#6df4b2;--red:#ff8b8b}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 20% 0,rgba(87,140,255,.18),transparent 34%),var(--bg);color:var(--text);font-family:Inter,'Microsoft YaHei',system-ui,sans-serif}
button,input{font:inherit}.shell{max-width:1180px;margin:0 auto;padding:34px 20px 80px}.top{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:24px}.brand{display:flex;align-items:center;gap:12px}.logo{width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,#5b9dff,#8b5cf6);display:grid;place-items:center;font-weight:900}.top h1{margin:0;font-size:28px}.top p{margin:4px 0 0;color:var(--muted);font-size:13px}
.login{display:flex;gap:8px}.login input{width:220px;border:1px solid var(--line);background:rgba(255,255,255,.05);color:white;border-radius:12px;padding:11px 12px;outline:none}.login button{border:0;border-radius:12px;background:white;color:#07101d;padding:11px 16px;font-weight:800;cursor:pointer}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}.metric,.card{border:1px solid var(--line);border-radius:18px;background:rgba(13,19,32,.78)}.metric{padding:20px}.metric strong{display:block;font-size:32px}.metric span{color:var(--muted);font-size:12px}
.layout{display:grid;grid-template-columns:.82fr 1.18fr;gap:16px}.card{padding:20px}.sections{display:grid;gap:10px}.section-row{padding:13px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.035)}.section-row b{display:block}.section-row span{display:block;margin-top:5px;color:var(--muted);font-size:12px;line-height:1.6}
.chat-list{display:grid;gap:12px}.chat-session{border:1px solid var(--line);border-radius:14px;padding:14px;background:rgba(255,255,255,.035)}.chat-meta{display:flex;justify-content:space-between;gap:12px;color:var(--muted);font-size:12px;margin-bottom:10px}.chat-message{display:flex;gap:8px;margin-top:8px;line-height:1.55;font-size:13px}.chat-message b{flex:0 0 34px;color:var(--blue)}.chat-message.user b{color:var(--green)}.chat-message span{color:#d7e0ec}
table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:12px 10px;border-bottom:1px solid var(--line);vertical-align:top;text-align:left}.need{max-width:360px;color:#aebacc;line-height:1.6}.ok{color:var(--green)}.warn{color:#ffd28a}.bad{color:var(--red)}.empty{padding:40px;text-align:center;color:var(--muted)}
@media(max-width:880px){.top,.layout{display:block}.login{margin-top:16px}.grid{grid-template-columns:repeat(2,1fr)}.card{margin-top:14px}table{display:block;overflow:auto}}
</style>
</head>
<body>
<div class="shell">
  <div class="top">
    <div class="brand"><div class="logo">SRS</div><div><h1>官网后台</h1><p>查看官网内容、咨询线索与邮件同步状态</p></div></div>
    <div class="login"><input id="token" placeholder="后台口令"/><button id="save">进入后台</button><button id="refresh">刷新</button></div>
  </div>
  <div class="grid" id="metrics"></div>
  <div class="layout">
    <div class="card"><h2>官网内容模块</h2><div class="sections" id="sections"></div></div>
    <div class="card"><h2>咨询线索</h2><p id="mailState"></p><div id="leads"></div></div>
  </div>
  <div class="card" style="margin-top:16px"><h2>项目顾问对话</h2><p style="color:var(--muted);font-size:13px">右下角顾问窗口的会话与消息会自动保存，便于后续跟进。</p><div id="chats"></div></div>
</div>
<script>
const tokenInput=document.getElementById('token')
tokenInput.value=localStorage.getItem('SRS_ADMIN_TOKEN')||''
document.getElementById('save').onclick=()=>{localStorage.setItem('SRS_ADMIN_TOKEN',tokenInput.value.trim());load()}
document.getElementById('refresh').onclick=()=>load()
function auth(){return {'Authorization':'Bearer '+(localStorage.getItem('SRS_ADMIN_TOKEN')||tokenInput.value.trim())}}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function getJson(url,admin=false){const res=await fetch(url,admin?{headers:auth()}:{});const data=await res.json();if(!res.ok)throw new Error(data.message||'请求失败');return data}
async function load(){
  try{
    const site=await getJson('/api/site')
    const leadsData=await getJson('/api/admin/leads',true)
    const chatsData=await getJson('/api/admin/chats',true)
    const metrics=site.metrics.concat([{value:leadsData.leads.length,suffix:'条',label:'已保存咨询线索'},{value:chatsData.chats.length,suffix:'个',label:'项目顾问会话'}])
    document.getElementById('metrics').innerHTML=metrics.map(item=>'<div class="metric"><strong>'+esc(item.value)+esc(item.suffix)+'</strong><span>'+esc(item.label)+'</span></div>').join('')
    document.getElementById('sections').innerHTML=site.sections.map(item=>'<div class="section-row"><b>'+esc(item.name)+'</b><span>'+esc(item.summary)+'</span></div>').join('')
    renderLeads(leadsData.leads)
    renderChats(chatsData.chats)
    document.getElementById('mailState').innerHTML='邮件接收：${emailTo} · SMTP：'+(leadsData.smtpConfigured?'<span class="ok">已配置</span>':'<span class="warn">未配置，仅保存线索</span>')
  }catch(error){document.getElementById('leads').innerHTML='<div class="empty bad">'+esc(error.message)+'</div>'}
}
function renderLeads(leads){
  if(!leads.length){document.getElementById('leads').innerHTML='<div class="empty">暂无线索</div>';return}
  document.getElementById('leads').innerHTML='<table><thead><tr><th>时间</th><th>称呼</th><th>身份</th><th>联系方式</th><th>需求</th><th>邮件</th></tr></thead><tbody>'+leads.map(lead=>{
    const mail=lead.email?.sent?'<span class="ok">已发送</span>':('<span class="warn">'+esc(lead.email?.reason||'未发送')+'</span>')
    return '<tr><td>'+esc(new Date(lead.createdAt).toLocaleString())+'</td><td>'+esc(lead.name)+'</td><td>'+esc(lead.role||'未填')+'</td><td>'+esc(lead.contact)+'</td><td class="need">'+esc(lead.need)+'</td><td>'+mail+'</td></tr>'
  }).join('')+'</tbody></table>'
}
function renderChats(chats){
  const target=document.getElementById('chats')
  if(!chats.length){target.innerHTML='<div class="empty">暂时没有顾问对话</div>';return}
  target.innerHTML='<div class="chat-list">'+chats.map(chat=>{
    const messages=(chat.messages||[]).map(message=>'<div class="chat-message '+esc(message.role)+'"><b>'+(message.role==='user'?'访客':'顾问')+'</b><span>'+esc(message.text)+'</span></div>').join('')
    return '<div class="chat-session"><div class="chat-meta"><span>'+esc(chat.source||'官网顾问')+'</span><span>'+esc(new Date(chat.updatedAt||chat.createdAt).toLocaleString())+' · '+esc((chat.messages||[]).length)+' 条消息</span></div>'+messages+'</div>'
  }).join('')+'</div>'
}
load()
</script>
</body>
</html>`
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'sairuisi-api', time: new Date().toISOString() }))
app.get('/api/site', (_req, res) => res.json(serviceData))

app.post('/api/leads', async (req, res) => {
  const name = String(req.body?.name || '').trim().slice(0, 30)
  const contact = String(req.body?.contact || '').trim().slice(0, 80)
  const need = String(req.body?.need || '').trim().slice(0, 800)
  const role = String(req.body?.role || '').trim().slice(0, 20)
  const source = String(req.body?.source || '官网表单').trim().slice(0, 40)

  if (!name || !contact || !need) {
    return res.status(400).json({ ok: false, message: '请完整填写称呼、联系方式和需求。' })
  }

  const leads = await readLeads()
  const lead = {
    id: crypto.randomUUID(),
    name,
    contact,
    need,
    role,
    source,
    ip: getClientIp(req),
    createdAt: new Date().toISOString(),
    email: { sent: false, reason: 'PENDING' }
  }

  leads.push(lead)
  await writeLeads(leads)

  try {
    lead.email = await sendLeadMail(lead)
  } catch (error) {
    lead.email = { sent: false, reason: error.message || 'MAIL_SEND_FAILED' }
    console.error('Failed to send lead email:', error)
  }

  leads[leads.length - 1] = lead
  await writeLeads(leads)

  res.status(201).json({
    ok: true,
    id: lead.id,
    emailSent: Boolean(lead.email?.sent),
    message: lead.email?.sent ? '需求已收到，并已同步到邮箱。' : '需求已收到，我们会尽快联系。'
  })
})

app.post('/api/chat/sessions', async (req, res) => {
  const now = new Date().toISOString()
  const session = {
    id: crypto.randomUUID(),
    source: cleanChatText(req.body?.source || '官网项目顾问', 40),
    page: cleanChatText(req.body?.page || '/', 120),
    role: cleanChatText(req.body?.role || '', 20),
    ip: getClientIp(req),
    createdAt: now,
    updatedAt: now,
    messages: []
  }
  await mutateChats(chats => {
    chats.push(session)
  })
  res.status(201).json({ ok: true, session: { id: session.id, createdAt: session.createdAt } })
})

app.post('/api/chat/sessions/:id/messages', async (req, res) => {
  const role = req.body?.role === 'user' ? 'user' : 'bot'
  const text = cleanChatText(req.body?.text)
  if (!text) return res.status(400).json({ ok: false, message: '消息内容不能为空。' })

  const message = {
    id: crypto.randomUUID(),
    role,
    text,
    quick: Boolean(req.body?.quick),
    createdAt: new Date().toISOString()
  }
  const savedSession = await mutateChats(chats => {
    const session = chats.find(item => item.id === req.params.id)
    if (!session) return null
    session.messages = Array.isArray(session.messages) ? session.messages : []
    session.messages.push(message)
    session.messages = session.messages.slice(-80)
    session.updatedAt = message.createdAt
    return session
  })
  if (!savedSession) return res.status(404).json({ ok: false, message: '会话不存在。' })

  let email = { sent: false, reason: 'NOT_USER_MESSAGE' }
  if (role === 'user') {
    try {
      email = await sendChatMail(savedSession, message)
    } catch (error) {
      email = { sent: false, reason: error.message || 'MAIL_SEND_FAILED' }
      console.error('Failed to send chat email:', error)
    }
  }
  res.status(201).json({ ok: true, emailSent: Boolean(email.sent), message: { id: message.id, createdAt: message.createdAt } })
})

app.get('/api/admin/leads', requireAdmin, async (_req, res) => {
  const leads = await readLeads()
  res.json({ ok: true, smtpConfigured: Boolean(getTransporter()), emailTo, leads: leads.slice().reverse() })
})

app.get('/api/admin/chats', requireAdmin, async (_req, res) => {
  const chats = await readChats()
  res.json({ ok: true, chats: chats.slice().sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt))).slice(0, 200) })
})

app.get('/admin', (_req, res) => res.type('html').send(adminPage()))

app.use(express.static(webDist))
app.get('*', async (_req, res, next) => {
  try {
    await fs.access(path.join(webDist, 'index.html'))
    res.sendFile(path.join(webDist, 'index.html'))
  } catch {
    next()
  }
})

app.use((_req, res) => res.status(404).json({ ok: false, message: 'Not found' }))
app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ ok: false, message: '服务暂时不可用，请稍后重试。' })
})

app.listen(port, () => console.log(`Sairuisi API running on http://localhost:${port}`))
