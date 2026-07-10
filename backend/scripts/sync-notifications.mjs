import nodemailer from 'nodemailer'

const siteUrl = String(process.env.SITE_URL || '').replace(/\/$/, '')
const adminToken = process.env.ADMIN_TOKEN
const emailTo = process.env.LEAD_EMAIL_TO
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS

for (const [name, value] of Object.entries({ siteUrl, adminToken, emailTo, smtpUser, smtpPass })) {
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.qq.com',
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE || 'true') !== 'false',
  auth: { user: smtpUser, pass: smtpPass },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 30000
})

async function api(path, options = {}) {
  const response = await fetch(`${siteUrl}${path}`, {
    ...options,
    headers: {
      authorization: `Bearer ${adminToken}`,
      'content-type': 'application/json',
      ...options.headers
    }
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || `API ${response.status}`)
  return data
}

async function mark(payload) {
  return api('/api/admin/notifications/mark', {
    method: 'POST',
    body: JSON.stringify({ ...payload, provider: 'github-actions-qq-smtp' })
  })
}

function leadText(lead) {
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

function chatText(session, message) {
  return [
    '赛锐锶科技官网收到新的项目顾问咨询',
    '',
    `消息：${message.text}`,
    `会话：${session.id}`,
    `页面：${session.page || '/'}`,
    `时间：${message.createdAt}`,
    `IP：${session.ip || '未知'}`
  ].join('\n')
}

const [leadsData, chatsData] = await Promise.all([
  api('/api/admin/leads'),
  api('/api/admin/chats')
])

const pendingLeads = leadsData.leads.filter(lead => !lead.email?.sent).slice(0, 30)
const pendingChats = chatsData.chats.flatMap(session =>
  (session.messages || [])
    .filter(message => message.role === 'user' && !message.email?.sent)
    .map(message => ({ session, message }))
).slice(0, 30)

let sent = 0
for (const lead of pendingLeads) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || smtpUser,
      to: emailTo,
      subject: `官网新咨询：${lead.name}（${lead.role || '未填写身份'}）`,
      text: leadText(lead)
    })
    await mark({ type: 'lead', id: lead.id, sent: true, reason: 'SENT' })
    sent += 1
  } catch (error) {
    await mark({ type: 'lead', id: lead.id, sent: false, reason: error.code || error.message || 'MAIL_SEND_FAILED' }).catch(() => {})
    throw error
  }
}

for (const { session, message } of pendingChats) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || smtpUser,
      to: emailTo,
      subject: `官网顾问新消息：${String(message.text).slice(0, 24)}`,
      text: chatText(session, message)
    })
    await mark({ type: 'chat', sessionId: session.id, id: message.id, sent: true, reason: 'SENT' })
    sent += 1
  } catch (error) {
    await mark({ type: 'chat', sessionId: session.id, id: message.id, sent: false, reason: error.code || error.message || 'MAIL_SEND_FAILED' }).catch(() => {})
    throw error
  }
}

console.log(`Notification sync complete: ${sent} sent, ${pendingLeads.length + pendingChats.length} pending processed.`)
