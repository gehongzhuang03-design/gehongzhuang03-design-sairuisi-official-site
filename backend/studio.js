import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

const CURRENT_YEAR = new Date().getFullYear()
const DEFAULT_SOURCES = [
  { name: '赛氪竞赛网', url: 'https://www.saikr.com/' },
  { name: '我爱竞赛网', url: 'https://www.52jingsai.com/' },
  { name: '全国大学生创业服务网', url: 'https://cy.ncss.cn/' },
  { name: '挑战杯官网', url: 'https://www.tiaozhanbei.net/' },
  { name: '全网公开信息·大学生竞赛', url: `https://html.duckduckgo.com/html/?q=${encodeURIComponent(`${CURRENT_YEAR} 大学生 竞赛 报名 通知`)}` },
  { name: '全网公开信息·创新创业', url: `https://html.duckduckgo.com/html/?q=${encodeURIComponent(`${CURRENT_YEAR} 创新创业 大赛 征集 通知`)}` }
]

const DEFAULT_SETTINGS = {
  dailyTime: process.env.STUDIO_DAILY_TIME || '08:00',
  autoGenerate: true,
  brandName: '赛锐锶科技',
  tone: '像一位长期带赛的老师：信息准确、判断克制、表达自然，不端着，不堆形容词',
  audience: '准备参加大学生创新创业、调研实践与科技竞赛的学生团队和高校老师',
  sources: DEFAULT_SOURCES
}

function stripHtml(value = '') {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function clampText(value, max = 200) {
  return stripHtml(value).slice(0, max)
}

function toAbsoluteUrl(href, base) {
  try {
    const url = new URL(href, base)
    if (url.hostname.endsWith('duckduckgo.com') && url.searchParams.get('uddg')) return decodeURIComponent(url.searchParams.get('uddg'))
    if (!['http:', 'https:'].includes(url.protocol)) return ''
    return url.href
  } catch {
    return ''
  }
}

function parseLinks(html, source) {
  const links = []
  const anchorPattern = /<a\b([^>]*?)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi
  for (const match of html.matchAll(anchorPattern)) {
    const title = clampText(match[4], 120)
    const href = toAbsoluteUrl(match[2], source.url)
    if (!href || title.length < 6) continue
    if (!/(竞赛|大赛|比赛|挑战杯|创新|创业|报名|征集|通知|赛项|作品)/.test(title)) continue
    if (/(登录|注册|联系我们|更多竞赛|全部竞赛|竞赛列表|圆满落幕|成功举办|顺利举行|获奖名单|赛事回顾)/.test(title)) continue
    const contextStart = Math.max(0, (match.index || 0) - 180)
    const context = clampText(html.slice(contextStart, (match.index || 0) + match[0].length + 180), 260)
    const date = context.match(/20\d{2}[年./-]\d{1,2}(?:[月./-]\d{1,2}日?)?/)?.[0] || ''
    links.push({ title, url: href, source: source.name, date, context })
  }
  return links
}

async function fetchSource(source) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36',
        'accept-language': 'zh-CN,zh;q=0.9'
      }
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return parseLinks(await response.text(), source)
  } finally {
    clearTimeout(timer)
  }
}

async function fetchDetailTitle(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { 'user-agent': 'Mozilla/5.0', 'accept-language': 'zh-CN,zh;q=0.9' } })
    if (!response.ok) return ''
    const html = (await response.text()).slice(0, 240_000)
    const raw = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1]
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1]
      || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
      || ''
    return clampText(raw, 140).replace(/(?:[-_|]\s*)?(挑战杯动态|赛氪竞赛网|我爱竞赛网)\s*$/, '').trim()
  } catch {
    return ''
  } finally {
    clearTimeout(timer)
  }
}

function extractJson(text) {
  const value = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  try { return JSON.parse(value) } catch { /* continue */ }
  const start = value.indexOf('{')
  const end = value.lastIndexOf('}')
  if (start >= 0 && end > start) return JSON.parse(value.slice(start, end + 1))
  throw new Error('模型没有返回可解析的 JSON')
}

async function callTextModel(messages) {
  const baseUrl = String(process.env.AI_BASE_URL || '').replace(/\/$/, '')
  const apiKey = process.env.TEXT_API_KEY
  if (!baseUrl || !apiKey) throw new Error('文字生成接口尚未配置')
  const requestBody = {
    model: process.env.TEXT_MODEL || 'glm-5.2',
    messages,
    temperature: 0.72,
    response_format: { type: 'json_object' }
  }
  let response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  })
  if (!response.ok && [400, 422].includes(response.status)) {
    delete requestBody.response_format
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })
  }
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error?.message || `文字接口请求失败（${response.status}）`)
  const content = payload.choices?.[0]?.message?.content
  return extractJson(Array.isArray(content) ? content.map(item => item.text || '').join('') : content)
}

async function downloadImageResult(result, targetPath) {
  const item = result?.data?.[0]
  if (item?.b64_json) {
    await fs.writeFile(targetPath, Buffer.from(item.b64_json, 'base64'))
    return
  }
  if (item?.url) {
    const response = await fetch(item.url)
    if (!response.ok) throw new Error('生成图片下载失败')
    await fs.writeFile(targetPath, Buffer.from(await response.arrayBuffer()))
    return
  }
  throw new Error('生图接口没有返回图片')
}

async function callImageModel(prompt, size, targetPath) {
  const baseUrl = String(process.env.AI_BASE_URL || '').replace(/\/$/, '')
  const apiKey = process.env.IMAGE_API_KEY
  if (!baseUrl || !apiKey) throw new Error('生图接口尚未配置')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 180_000)
  try {
    const response = await fetch(`${baseUrl}/images/generations`, {
      method: 'POST',
      signal: controller.signal,
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.IMAGE_MODEL || 'gpt-image-2',
        prompt,
        size,
        quality: 'medium',
        n: 1
      })
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(payload.error?.message || `生图接口请求失败（${response.status}）`)
    await downloadImageResult(payload, targetPath)
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('生图接口等待超过3分钟，请稍后重试')
    throw error
  } finally {
    clearTimeout(timer)
  }
}

export class ContentStudio {
  constructor({ dataDir, publicDir }) {
    this.dataFile = path.join(dataDir, 'content-studio.json')
    this.generatedDir = path.join(publicDir, 'generated')
    this.state = null
    this.queue = Promise.resolve()
  }

  async load() {
    if (this.state) return this.state
    try {
      const parsed = JSON.parse(await fs.readFile(this.dataFile, 'utf8'))
      this.state = { items: [], runs: [], settings: DEFAULT_SETTINGS, ...parsed }
      this.state.settings = { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) }
    } catch {
      this.state = { items: [], runs: [], settings: DEFAULT_SETTINGS, lastScheduledDate: '' }
    }
    return this.state
  }

  async save() {
    await fs.mkdir(path.dirname(this.dataFile), { recursive: true })
    await fs.writeFile(this.dataFile, JSON.stringify(this.state, null, 2), 'utf8')
  }

  mutate(task) {
    const run = this.queue.then(async () => {
      await this.load()
      const result = await task(this.state)
      await this.save()
      return result
    })
    this.queue = run.catch(() => {})
    return run
  }

  async dashboard() {
    const state = await this.load()
    return {
      items: state.items.slice().sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0, 80),
      runs: state.runs.slice(-12).reverse(),
      settings: state.settings,
      configured: { text: Boolean(process.env.TEXT_API_KEY), image: Boolean(process.env.IMAGE_API_KEY) }
    }
  }

  async collect({ autoGenerate = false } = {}) {
    const state = await this.load()
    const startedAt = new Date().toISOString()
    const results = await Promise.allSettled((state.settings.sources || DEFAULT_SOURCES).map(fetchSource))
    const raw = results.flatMap(result => result.status === 'fulfilled' ? result.value : [])
    const unique = [...new Map(raw.map(item => [item.url.replace(/\/$/, ''), item])).values()].slice(0, 60)
    if (!unique.length) throw new Error('暂时没有从来源页提取到可用竞赛信息，请稍后重试或在设置中补充来源')

    const knownUrls = new Set(state.items.map(item => item.sourceUrl))
    const selection = await callTextModel([
      {
        role: 'system',
        content: `你是高校竞赛信息编辑。今天是${new Date().toLocaleDateString('zh-CN')}。只能依据给定候选链接，不得编造主办方、报名时间、奖项或截止日期。优先筛选仍可报名、正在征集、刚发布通知或即将启动的赛事；排除已经结束、赛果新闻和往届回顾。最多选择5条，宁缺毋滥。返回JSON对象：{"items":[{"sourceUrl":"必须原样复制候选URL","title":"准确标题","source":"来源站点","publishedDate":"不确定则空字符串","deadline":"不确定则写待核验","category":"创新创业/科技/调研实践/其他","reason":"一句话推荐理由","confidence":0到100的整数}]}。如果日期或事实无法确认，明确写待核验。`
      },
      { role: 'user', content: JSON.stringify(unique) }
    ])
    const selected = Array.isArray(selection.items) ? selection.items : []
    const detailTitles = new Map(await Promise.all(selected.map(async candidate => [candidate.sourceUrl, await fetchDetailTitle(candidate.sourceUrl)])))
    const now = new Date().toISOString()
    const added = []
    await this.mutate(current => {
      for (const candidate of selected) {
        const original = unique.find(item => item.url === candidate.sourceUrl)
        if (!original || knownUrls.has(original.url)) continue
        const item = {
          id: crypto.randomUUID(),
          title: clampText(detailTitles.get(original.url) || candidate.title || original.title, 120),
          source: clampText(candidate.source || original.source, 40),
          sourceUrl: original.url,
          publishedDate: clampText(candidate.publishedDate || original.date, 30),
          deadline: clampText(candidate.deadline || '待核验', 40),
          category: clampText(candidate.category || '其他', 30),
          reason: clampText(candidate.reason, 160),
          confidence: Math.max(0, Math.min(100, Number(candidate.confidence) || 60)),
          status: '待审核',
          createdAt: now,
          updatedAt: now,
          content: null,
          images: []
        }
        current.items.push(item)
        added.push(item)
      }
      current.runs.push({ id: crypto.randomUUID(), startedAt, finishedAt: now, candidates: unique.length, added: added.length, status: 'success' })
      current.runs = current.runs.slice(-40)
    })

    if (autoGenerate && added[0]) await this.generate(added[0].id)
    return { candidates: unique.length, added: added.length, items: added }
  }

  async generate(id) {
    const state = await this.load()
    const item = state.items.find(entry => entry.id === id)
    if (!item) throw new Error('竞赛信息不存在')
    const content = await callTextModel([
      {
        role: 'system',
        content: `你是${state.settings.brandName}的资深新媒体编辑，读者是${state.settings.audience}。文风要求：${state.settings.tone}。绝不编造事实；所有不确定信息写“请以官网最新通知为准”。避免“赋能、助力、重磅、干货满满、宝子们”等AI腔和营销套话。公众号像老师认真讲清一件事，约900-1400字；小红书像学长学姐分享，约350-550字，有信息密度但不过度使用emoji。返回JSON对象，结构必须为：{"wechat":{"title":"","digest":"","bodyText":"纯文本，使用小标题分段","bodyHtml":"可直接粘贴到公众号编辑器的简洁HTML，只用p,h2,strong,ul,li,blockquote,a标签"},"xiaohongshu":{"title":"不超过20字","body":"正文","tags":["话题1"]},"facts":["已核验事实或待核验项"],"imagePrompt":"用于生成无文字配图的中文提示词"}。公众号和小红书都必须包含原始信息来源与核验提醒。`
      },
      { role: 'user', content: JSON.stringify(item) }
    ])
    const safeContent = {
      wechat: {
        title: clampText(content.wechat?.title || item.title, 80),
        digest: clampText(content.wechat?.digest || item.reason, 140),
        bodyText: String(content.wechat?.bodyText || '').slice(0, 12000),
        bodyHtml: String(content.wechat?.bodyHtml || '').slice(0, 30000)
      },
      xiaohongshu: {
        title: clampText(content.xiaohongshu?.title || item.title, 30),
        body: String(content.xiaohongshu?.body || '').slice(0, 5000),
        tags: Array.isArray(content.xiaohongshu?.tags) ? content.xiaohongshu.tags.map(tag => clampText(tag, 24)).slice(0, 10) : []
      },
      facts: Array.isArray(content.facts) ? content.facts.map(fact => clampText(fact, 220)).slice(0, 12) : [],
      imagePrompt: clampText(content.imagePrompt, 1200)
    }

    await this.mutate(current => {
      const target = current.items.find(entry => entry.id === id)
      if (!target) return
      target.content = safeContent
      target.status = '待审核'
      target.updatedAt = new Date().toISOString()
    })

    await fs.mkdir(this.generatedDir, { recursive: true })
    const imageBase = crypto.randomUUID()
    const coverFile = `${imageBase}-cover.png`
    const squareFile = `${imageBase}-square.png`
    const visualPrompt = `${safeContent.imagePrompt || `围绕${item.title}的高校竞赛主题视觉`}。品牌气质：专业、年轻、可信，现代编辑摄影与轻量信息图结合，蓝紫色与暖橙点缀，真实中国大学校园氛围。不要出现任何文字、字母、数字、logo或水印，留出干净标题区域。`
    const imageResults = []
    for (const task of [
      () => callImageModel(`${visualPrompt} 横版公众号封面构图。`, '1536x1024', path.join(this.generatedDir, coverFile)),
      () => callImageModel(`${visualPrompt} 小红书正方形首图构图。`, '1024x1024', path.join(this.generatedDir, squareFile))
    ]) {
      try {
        await task()
        imageResults.push({ status: 'fulfilled' })
      } catch (reason) {
        imageResults.push({ status: 'rejected', reason })
      }
    }
    const images = []
    if (imageResults[0].status === 'fulfilled') images.push({ type: 'wechat-cover', url: `/generated/${coverFile}`, label: '公众号封面' })
    if (imageResults[1].status === 'fulfilled') images.push({ type: 'xiaohongshu-cover', url: `/generated/${squareFile}`, label: '小红书首图' })
    const imageErrors = imageResults.filter(result => result.status === 'rejected').map(result => result.reason?.message || '配图生成失败')

    await this.mutate(current => {
      const target = current.items.find(entry => entry.id === id)
      if (!target) return
      target.content = safeContent
      target.images = images
      target.imageErrors = imageErrors
      target.status = '待审核'
      target.updatedAt = new Date().toISOString()
    })
    return (await this.load()).items.find(entry => entry.id === id)
  }

  async updateItem(id, patch) {
    return this.mutate(state => {
      const item = state.items.find(entry => entry.id === id)
      if (!item) throw new Error('内容不存在')
      if (['待审核', '已通过', '已发布'].includes(patch.status)) item.status = patch.status
      if (patch.content?.wechat) item.content.wechat = { ...item.content.wechat, ...patch.content.wechat }
      if (patch.content?.xiaohongshu) item.content.xiaohongshu = { ...item.content.xiaohongshu, ...patch.content.xiaohongshu }
      item.updatedAt = new Date().toISOString()
      return item
    })
  }

  async updateSettings(patch) {
    return this.mutate(state => {
      state.settings = {
        ...state.settings,
        dailyTime: /^([01]\d|2[0-3]):[0-5]\d$/.test(patch.dailyTime) ? patch.dailyTime : state.settings.dailyTime,
        autoGenerate: typeof patch.autoGenerate === 'boolean' ? patch.autoGenerate : state.settings.autoGenerate,
        tone: clampText(patch.tone || state.settings.tone, 300),
        audience: clampText(patch.audience || state.settings.audience, 300)
      }
      return state.settings
    })
  }

  async runScheduleTick() {
    const state = await this.load()
    const formatter = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    const parts = Object.fromEntries(formatter.formatToParts(new Date()).map(part => [part.type, part.value]))
    const date = `${parts.year}-${parts.month}-${parts.day}`
    const time = `${parts.hour}:${parts.minute}`
    if (time < state.settings.dailyTime || state.lastScheduledDate === date) return
    state.lastScheduledDate = date
    await this.save()
    await this.collect({ autoGenerate: state.settings.autoGenerate }).catch(async error => {
      state.runs.push({ id: crypto.randomUUID(), startedAt: new Date().toISOString(), finishedAt: new Date().toISOString(), status: 'failed', error: error.message })
      await this.save()
    })
  }
}
