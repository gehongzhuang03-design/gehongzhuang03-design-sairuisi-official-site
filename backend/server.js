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
const webDist = path.resolve(__dirname, '..', 'frontend', 'dist')

const adminToken = process.env.ADMIN_TOKEN || 'srs-admin-2026'
const emailTo = process.env.LEAD_EMAIL_TO || '1760772194@qq.com'

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true }))
app.use(express.json({ limit: '64kb' }))

const serviceData = {
  metrics: [
    { value: 8, suffix: '年', label: '深耕双创竞赛服务' },
    { value: 30, suffix: '+', label: '年均国家级奖项案例' },
    { value: 150, suffix: '+', label: '累计国家级奖项案例' },
    { value: 500, suffix: '+', label: '服务团队与教师项目' }
  ],
  sections: [
    { key: 'hero', name: '首屏定位', summary: '大学生创新创业竞赛与高校教师专业提升服务官网首屏。' },
    { key: 'events', name: '赛事覆盖', summary: '中国国际大学生创新大赛、挑战杯、创青春、三创赛、服务外包、职业规划与教学创新。' },
    { key: 'services', name: '服务体系', summary: '项目诊断、商业计划书、技术 Demo、路演 PPT、答辩训练、赛前冲刺。' },
    { key: 'teacher', name: '教师服务', summary: '教学创新、成果奖凝练、课题申报、论文专利、职称材料。' },
    { key: 'cases', name: '脱敏案例', summary: '智能制造、乡村振兴、数字医疗等方向的脱敏成果案例。' },
    { key: 'process', name: '合作流程', summary: '需求共识、诊断方案、协同打磨、赛前压测。' },
    { key: 'contact', name: '联系方式', summary: '前端表单提交后写入后台，并尝试同步到指定邮箱。' }
  ],
  brands: ['大锤的小铺', '锤音科技有限公司', '锤音专业技术服务中心'],
  tracks: ['中国国际大学生创新大赛', '挑战杯', '创青春', '三创赛', '服务外包', '职业规划大赛', '教师教学创新大赛']
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
<title>赛锐锶科技后台</title>
<style>
:root{color-scheme:dark;--bg:#05070c;--panel:#0d1320;--line:rgba(255,255,255,.1);--text:#f7fbff;--muted:#94a3b8;--blue:#69a7ff;--green:#6df4b2;--red:#ff8b8b}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 20% 0,rgba(87,140,255,.18),transparent 34%),var(--bg);color:var(--text);font-family:Inter,'Microsoft YaHei',system-ui,sans-serif}button,input{font:inherit}
.shell{max-width:1180px;margin:0 auto;padding:34px 20px 80px}.top{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:24px}.brand{display:flex;align-items:center;gap:12px}.logo{width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,#5b9dff,#8b5cf6);display:grid;place-items:center;font-weight:900}.top h1{margin:0;font-size:28px}.top p{margin:4px 0 0;color:var(--muted);font-size:13px}
.login{display:flex;gap:8px}.login input{width:220px;border:1px solid var(--line);background:rgba(255,255,255,.05);color:white;border-radius:12px;padding:11px 12px;outline:none}.login button,.refresh{border:0;border-radius:12px;background:white;color:#07101d;padding:11px 16px;font-weight:800;cursor:pointer}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}.metric,.card{border:1px solid var(--line);border-radius:18px;background:rgba(13,19,32,.78);box-shadow:0 20px 60px rgba(0,0,0,.24)}.metric{padding:20px}.metric strong{display:block;font-size:32px}.metric span{color:var(--muted);font-size:12px}
.layout{display:grid;grid-template-columns:.82fr 1.18fr;gap:16px}.card{padding:20px}.card h2{margin:0 0 14px;font-size:18px}.muted{color:var(--muted);font-size:12px;line-height:1.7}.sections{display:grid;gap:10px}.section-row{padding:13px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.035)}.section-row b{display:block;font-size:14px}.section-row span{display:block;margin-top:5px;color:var(--muted);font-size:12px;line-height:1.6}
table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:12px 10px;border-bottom:1px solid var(--line);vertical-align:top;text-align:left}th{color:#b9c6d8;font-size:12px}td{color:#e6edf7}.need{max-width:360px;color:#aebacc;line-height:1.6}.pill{display:inline-flex;padding:5px 8px;border-radius:100px;font-size:11px;background:rgba(105,167,255,.13);color:#9fd0ff}.ok{color:var(--green)}.warn{color:#ffd28a}.bad{color:var(--red)}.empty{padding:40px;text-align:center;color:var(--muted)}
@media(max-width:880px){.top,.layout{display:block}.login{margin-top:16px}.grid{grid-template-columns:repeat(2,1fr)}.card{margin-top:14px}table{display:block;overflow:auto}.login input{width:100%}}
</style>
</head>
<body>
<div class="shell">
  <div class="top">
    <div class="brand"><div class="logo">SRS</div><div><h1>官网后台</h1><p>查看官网内容、咨询线索与邮件同步状态</p></div></div>
    <div class="login"><input id="token" placeholder="后台口令，默认 srs-admin-2026"/><button id="save">进入后台</button><button class="refresh" id="refresh">刷新</button></div>
  </div>
  <div class="grid" id="metrics"></div>
  <div class="layout">
    <div class="card"><h2>前端内容模块</h2><p class="muted">这里读取后端 /api/site，用于确认前端官网的主要内容模块已经与后端内容结构对应。</p><div class="sections" id="sections"></div></div>
    <div class="card"><h2>咨询线索</h2><p class="muted" id="mailState">邮件接收：${emailTo}</p><div id="leads"></div></div>
  </div>
</div>
<script>
const tokenInput=document.getElementById('token')
const saved=localStorage.getItem('SRS_ADMIN_TOKEN')||''
tokenInput.value=saved
document.getElementById('save').onclick=()=>{localStorage.setItem('SRS_ADMIN_TOKEN',tokenInput.value.trim());load()}
document.getElementById('refresh').onclick=()=>load()
function auth(){return {'Authorization':'Bearer '+(localStorage.getItem('SRS_ADMIN_TOKEN')||tokenInput.value.trim())}}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function getJson(url,admin=false){const res=await fetch(url,admin?{headers:auth()}:{});const data=await res.json();if(!res.ok)throw new Error(data.message||'请求失败');return data}
async function load(){
  try{
    const site=await getJson('/api/site')
    const leadsData=await getJson('/api/admin/leads',true)
    document.getElementById('metrics').innerHTML=site.metrics.map(item=>'<div class="metric"><strong>'+esc(item.value)+esc(item.suffix)+'</strong><span>'+esc(item.label)+'</span></div>').join('')
    document.getElementById('sections').innerHTML=site.sections.map(item=>'<div class="section-row"><b>'+esc(item.name)+'</b><span>'+esc(item.summary)+'</span></div>').join('')
    renderLeads(leadsData.leads)
    document.getElementById('mailState').innerHTML='邮件接收：${emailTo} · SMTP：'+(leadsData.smtpConfigured?'<span class="ok">已配置</span>':'<span class="warn">未配置，仅保存线索</span>')
  }catch(error){
    document.getElementById('leads').innerHTML='<div class="empty bad">'+esc(error.message)+'</div>'
  }
}
function renderLeads(leads){
  if(!leads.length){document.getElementById('leads').innerHTML='<div class="empty">暂无线索</div>';return}
  document.getElementById('leads').innerHTML='<table><thead><tr><th>时间</th><th>称呼</th><th>身份</th><th>联系方式</th><th>需求</th><th>邮件</th></tr></thead><tbody>'+leads.map(lead=>{
    const mail=lead.email?.sent?'<span class="ok">已发送</span>':('<span class="warn">'+esc(lead.email?.reason||'未发送')+'</span>')
    return '<tr><td>'+esc(new Date(lead.createdAt).toLocaleString())+'</td><td>'+esc(lead.name)+'</td><td><span class="pill">'+esc(lead.role||'未填')+'</span></td><td>'+esc(lead.contact)+'</td><td class="need">'+esc(lead.need)+'</td><td>'+mail+'</td></tr>'
  }).join('')+'</tbody></table>'
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
    message: lead.email?.sent ? '需求已收到，并已同步到邮箱。' : '需求已收到，后台已保存，我们会尽快联系。'
  })
})

app.get('/api/admin/leads', requireAdmin, async (_req, res) => {
  const leads = await readLeads()
  res.json({
    ok: true,
    smtpConfigured: Boolean(getTransporter()),
    emailTo,
    leads: leads.slice().reverse()
  })
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
