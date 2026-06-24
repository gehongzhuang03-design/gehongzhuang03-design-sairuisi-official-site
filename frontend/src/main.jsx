import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ClipboardCheck,
  Code2,
  FileText,
  Layers3,
  Menu,
  MessageCircle,
  MousePointer2,
  Presentation,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
  X,
  Zap
} from 'lucide-react'
import './styles.css'

const metrics = [
  { value: 8, suffix: '年', label: '深耕双创竞赛服务' },
  { value: 30, suffix: '+', label: '年均国家级奖项案例' },
  { value: 150, suffix: '+', label: '累计国家级奖项案例' },
  { value: 500, suffix: '+', label: '服务团队与教师项目' }
]

const eventTabs = [
  {
    id: 'internet',
    name: '中国国际大学生创新大赛',
    tag: '主流高规格赛道',
    title: '把真实需求、技术成果和商业闭环讲成一个强项目',
    desc: '围绕红旅、产业命题、高教主赛道等不同方向，重构项目价值、用户证据、技术路径和商业模型，让评委快速理解“为什么值得”。',
    points: ['赛道规则研判', '项目命题升级', '商业计划书重构', '路演答辩强化']
  },
  {
    id: 'challenge',
    name: '挑战杯 / 创青春',
    tag: '研究与创业并重',
    title: '从研究问题到成果表达，形成可信的证据链',
    desc: '帮助团队梳理研究基础、技术创新、应用场景、社会价值和成果转化路径，避免材料堆叠，强化专业可信度。',
    points: ['研究价值论证', '成果材料梳理', '数据图表设计', '专家问答预案']
  },
  {
    id: 'service',
    name: '三创赛 / 服务外包',
    tag: '产品与方案导向',
    title: '用可演示系统和清晰交付，让方案更像真实产品',
    desc: '覆盖需求分析、交互原型、演示系统、数据看板、方案文档和答辩材料，提升项目完成度与现场说服力。',
    points: ['产品原型设计', 'Web / App Demo', '服务方案打磨', '技术文档输出']
  },
  {
    id: 'career',
    name: '职业规划 / 教学创新',
    tag: '教师与学生成长',
    title: '面向教师成果凝练与学生成长表达的专业支撑',
    desc: '围绕教学创新大赛、职业规划大赛、教学成果奖与双创指导能力提升，建立可复用的方法体系和材料体系。',
    points: ['教学成果凝练', '职业叙事设计', '指导案例沉淀', '成果证明整理']
  }
]

const services = [
  { icon: Target, no: '01', title: '项目诊断与赛道定位', desc: '根据团队基础、技术储备、目标赛事和时间节点，判断最值得打磨的方向。', tags: ['赛道选择', '选题升级', '差异化定位'] },
  { icon: FileText, no: '02', title: '商业计划书与申报材料', desc: '把散落的事实整理成完整证据链，重构市场、产品、模式、财务和社会价值表达。', tags: ['BP', '申报书', '数据图表'] },
  { icon: Code2, no: '03', title: '技术原型与演示系统', desc: '为项目补齐可体验、可展示、可持续迭代的产品形态，提升成果可信度。', tags: ['Web', '小程序', '数据看板'] },
  { icon: Presentation, no: '04', title: '路演 PPT 与答辩训练', desc: '重构故事线、视觉系统和答辩问题库，把临场发挥变成可训练能力。', tags: ['PPT', '话术', '模拟评审'] },
  { icon: BookOpen, no: '05', title: '教师专业提升服务', desc: '面向教师教学创新、课题申报、成果凝练、论文专利与职称材料提供系统支持。', tags: ['教创赛', '课题', '成果奖'] },
  { icon: ClipboardCheck, no: '06', title: '赛前冲刺与交付管理', desc: '按里程碑推进内容、技术、视觉和表达，节点明确，过程透明，交易走平台。', tags: ['里程碑', '复盘', '平台交易'] }
]

const cases = [
  { title: '智能制造项目', award: '国家级金奖方向', stat: '18×', desc: '从实验室样机出发，重新定义产业场景、客户痛点和技术指标，让成果更容易被理解。' },
  { title: '乡村振兴项目', award: '国家级银奖方向', stat: '4.6M', desc: '从“讲情怀”转向产品、渠道、供应链和社会价值闭环，增强项目可持续性。' },
  { title: '数字医疗项目', award: '国家级一等奖方向', stat: '92%', desc: '把复杂算法转译为临床价值、指标证明和应用流程，提升专业评审信任度。' }
]

const process = [
  ['需求共识', '30 分钟深度沟通，明确项目阶段、目标赛事、团队基础、时间节点和关键风险。'],
  ['诊断方案', '输出项目短板、提升路径、交付清单和节奏建议，先判断什么最值得做。'],
  ['协同打磨', '策划、技术、视觉、材料、路演多角色协同推进，每个阶段都有明确交付物。'],
  ['赛前压测', '模拟评审、问题库训练、材料终审和现场表达优化，让团队以稳定状态进入关键赛点。']
]

const faqs = [
  ['你们提供保奖服务吗？', '不提供。我们提供的是专业竞赛辅导、技术支撑、材料优化和路演训练，最终结果取决于项目本身质量、赛事规则和评审结果。任何声称“保过”“保奖”的说法都需要谨慎辨别。'],
  ['只做单项服务可以吗？', '可以。可以只做商业计划书、PPT、技术 Demo、答辩训练，也可以做从诊断到冲刺的全流程服务。'],
  ['适合什么阶段的团队？', '从只有初步想法、已经有原型、到临近省赛国赛冲刺都可以。不同阶段重点不同：早期重方向，中期重证据，后期重表达和交付。'],
  ['教师服务包含哪些内容？', '包含教学创新大赛、教学成果奖凝练、课题申报、论文专利、教材专著、职称材料整理和双创指导成果沉淀等方向。'],
  ['交易怎么保障？', '坚持全程平台交易，费用、节点、交付和沟通留痕，避免口头承诺不清晰。']
]

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('visible')),
      { threshold: 0.12 }
    )
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

function CinematicBackdrop() {
  useEffect(() => {
    const root = document.documentElement
    let frame = 0
    const move = event => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        root.style.setProperty('--mx', `${(event.clientX / window.innerWidth - 0.5).toFixed(3)}`)
        root.style.setProperty('--my', `${(event.clientY / window.innerHeight - 0.5).toFixed(3)}`)
      })
    }
    const scroll = () => root.style.setProperty('--sy', `${Math.min(window.scrollY / 1000, 1).toFixed(3)}`)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('scroll', scroll, { passive: true })
    scroll()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('scroll', scroll)
    }
  }, [])

  return (
    <div className="cinematic-backdrop" aria-hidden="true">
      <div className="film-noise" />
      <div className="stage-beam beam-one" />
      <div className="stage-beam beam-two" />
      <div className="halo-system">
        <i /><i /><i />
      </div>
      <div className="energy-core"><i /><i /></div>
      <div className="star-grid">{Array.from({ length: 42 }, (_, index) => <span key={index} />)}</div>
    </div>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  const navs = [
    ['#events', '赛事覆盖'],
    ['#services', '服务体系'],
    ['#teacher', '教师服务'],
    ['#cases', '成果案例'],
    ['#process', '合作流程'],
    ['#faq', '常见问题']
  ]
  return (
    <header className="site-header">
      <a href="#top" className="brand">
        <span>SRS</span>
        <b>赛锐锶科技<small>Innovation Competition Partner</small></b>
      </a>
      <nav className={open ? 'open' : ''}>
        {navs.map(([href, label]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
        <a href="#contact" className="nav-cta" onClick={() => setOpen(false)}>预约诊断 <ArrowRight size={15} /></a>
      </nav>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="切换菜单">{open ? <X /> : <Menu />}</button>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <div className="hero-kicker"><Sparkles size={15} /> 8 年老店 · 年均 30+ 国奖 · 全程平台交易</div>
        <h1><em>把好项目，</em><br /><span>打磨成真正能被看见的作品</span><small>被相信 · 被记住 · 被选择</small></h1>
        <p>赛锐锶科技面向大学生创新创业竞赛团队与高校教师，提供从项目诊断、赛道定位、材料打磨、技术实现到路演答辩的全链路支撑。</p>
        <div className="hero-actions">
          <a className="primary-button" href="#contact">预约项目诊断 <ArrowRight /></a>
          <a className="ghost-button" href="#events">查看赛事覆盖 <ChevronDown /></a>
        </div>
        <div className="hero-alert">
          <ShieldAlert />
          <span><b>重要声明</b> 不提供任何“保过 / 保奖”服务。我们提供专业辅导、技术支撑与材料优化，最终结果以赛事评审为准。</span>
        </div>
      </div>
      <div className="hero-console">
        <div className="console-head"><span /><span /><span /><b>SRS COMMAND CENTER</b></div>
        <div className="console-orbit">
          <div className="radar"><Radar /></div>
          <div className="orbit-card card-a"><b>项目诊断</b><small>Evidence Chain</small></div>
          <div className="orbit-card card-b"><b>技术 Demo</b><small>Product Proof</small></div>
          <div className="orbit-card card-c"><b>路演答辩</b><small>Pitch System</small></div>
        </div>
        <div className="console-panel">
          <div><small>PROJECT READINESS</small><strong>86%</strong></div>
          <div><small>NEXT ACTION</small><strong>补齐证据闭环</strong></div>
        </div>
      </div>
    </section>
  )
}

function Metrics() {
  return (
    <section className="metric-band">
      {metrics.map(item => (
        <div key={item.label} data-reveal>
          <strong>{item.value}<sup>{item.suffix}</sup></strong>
          <span>{item.label}</span>
        </div>
      ))}
    </section>
  )
}

function SectionTitle({ eyebrow, title, desc, light }) {
  return (
    <div className={`section-title ${light ? 'light' : ''}`} data-reveal>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {desc && <p>{desc}</p>}
    </div>
  )
}

function Events() {
  const [active, setActive] = useState(eventTabs[0].id)
  const current = eventTabs.find(item => item.id === active)
  return (
    <section className="section events" id="events">
      <SectionTitle
        eyebrow="01 / COMPETITION MAP"
        title="覆盖主流双创与成长类竞赛场景"
        desc="不把所有赛事当成同一种材料处理。我们根据赛事规则、评审偏好和项目阶段，重组最适合的参赛策略。"
      />
      <div className="event-shell" data-reveal>
        <div className="event-tabs">
          {eventTabs.map(item => <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => setActive(item.id)}>{item.name}</button>)}
        </div>
        <div className="event-panel" key={current.id}>
          <div>
            <span>{current.tag}</span>
            <h3>{current.title}</h3>
            <p>{current.desc}</p>
          </div>
          <ul>{current.points.map(point => <li key={point}><Check />{point}</li>)}</ul>
        </div>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section className="section services" id="services">
      <SectionTitle
        eyebrow="02 / SERVICE SYSTEM"
        title="内容、技术、视觉、表达一起打磨"
        desc="真正影响结果的不是单份材料，而是项目逻辑、证据链、技术可见度和现场表达共同形成的系统能力。"
        light
      />
      <div className="service-grid">
        {services.map(({ icon: Icon, no, title, desc, tags }) => (
          <article className="service-card" key={no} data-reveal>
            <div className="service-top"><Icon /><span>{no}</span></div>
            <h3>{title}</h3>
            <p>{desc}</p>
            <div>{tags.map(tag => <b key={tag}>{tag}</b>)}</div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Teacher() {
  const items = [
    ['教学创新大赛', '课程痛点、教学方法、育人成效、推广价值的系统化表达。'],
    ['教学成果奖凝练', '从材料堆叠转向成果机制、实践路径和可复制经验。'],
    ['课题 / 论文 / 专利', '围绕教师长期发展目标，梳理成果积累与申报节奏。'],
    ['职称材料支持', '整合教学、科研、竞赛指导和社会服务成果，提升材料清晰度。']
  ]
  return (
    <section className="section teacher" id="teacher">
      <SectionTitle
        eyebrow="03 / FOR EDUCATORS"
        title="面向高校教师的专业提升服务"
        desc="除了学生竞赛，我们也为教师提供教学创新、成果凝练、课题申报、论文专利与职称材料等方向的专业支撑。"
      />
      <div className="teacher-layout">
        <div className="teacher-visual" data-reveal>
          <BrainCircuit />
          <h3>从一次参赛支持，到一套可持续复用的教师成果体系</h3>
          <p>把竞赛指导、课程建设、项目孵化和科研成果连接起来，形成更完整的成长路径。</p>
        </div>
        <div className="teacher-list">
          {items.map(([title, desc], index) => <div key={title} data-reveal><span>0{index + 1}</span><b>{title}</b><p>{desc}</p></div>)}
        </div>
      </div>
    </section>
  )
}

function Cases() {
  const [active, setActive] = useState(0)
  const current = cases[active]
  return (
    <section className="section cases" id="cases">
      <SectionTitle
        eyebrow="04 / SELECTED OUTCOMES"
        title="用脱敏案例，展示项目如何被重新点亮"
        desc="案例不展示客户隐私，只呈现方法和变化。正式合作沟通后，可根据情况核验相关证明材料。"
        light
      />
      <div className="case-stage" data-reveal>
        <div className="case-nav">
          {cases.map((item, index) => <button key={item.title} className={active === index ? 'active' : ''} onClick={() => setActive(index)}><span>0{index + 1}</span>{item.title}</button>)}
        </div>
        <div className="case-main" key={current.title}>
          <span>{current.award}</span>
          <h3>{current.title}</h3>
          <p>{current.desc}</p>
          <strong>{current.stat}</strong>
          <small>关键指标 / 价值感知提升</small>
        </div>
      </div>
    </section>
  )
}

function Process() {
  const [active, setActive] = useState(0)
  return (
    <section className="section process" id="process">
      <SectionTitle
        eyebrow="05 / WORKFLOW"
        title="流程清晰，节点透明，交付可追踪"
        desc="我们更重视过程的确定性：先诊断，再方案，再执行，再冲刺。每一步都让团队知道为什么做、做什么、做到什么程度。"
      />
      <div className="process-grid" data-reveal>
        <div className="process-nav">
          {process.map(([title], index) => <button key={title} className={active === index ? 'active' : ''} onClick={() => setActive(index)}><span>0{index + 1}</span>{title}</button>)}
        </div>
        <div className="process-view" key={active}>
          <Zap />
          <span>STEP 0{active + 1}</span>
          <h3>{process[active][0]}</h3>
          <p>{process[active][1]}</p>
        </div>
      </div>
    </section>
  )
}

function Brands() {
  const brands = [
    ['大锤的小铺', '面向学生团队的竞赛咨询、材料优化、项目陪跑和沟通窗口。'],
    ['锤音科技有限公司', '承接技术研发、系统搭建、原型 Demo 与产品化支撑。'],
    ['锤音专业技术服务中心', '面向教师与专业技术需求的成果凝练、材料输出与提升服务。']
  ]
  return (
    <section className="section brands">
      <SectionTitle eyebrow="06 / BRAND MATRIX" title="多品牌协同，覆盖完整服务链路" light />
      <div className="brand-grid">
        {brands.map(([title, desc]) => <article key={title} data-reveal><span>{title.slice(0, 2)}</span><h3>{title}</h3><p>{desc}</p></article>)}
      </div>
    </section>
  )
}

function Faq() {
  return (
    <section className="section faq" id="faq">
      <SectionTitle eyebrow="07 / FAQ" title="合作前，先把关键问题说清楚" />
      <div className="faq-list">
        {faqs.map(([question, answer]) => <details key={question} data-reveal><summary>{question}</summary><p>{answer}</p></details>)}
      </div>
    </section>
  )
}

function Contact() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async event => {
    event.preventDefault()
    setLoading(true)
    setStatus('')
    const form = event.currentTarget
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      setStatus(data.message)
      form.reset()
    } catch (error) {
      setStatus(error.message || '提交失败，请稍后重试。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="contact" id="contact">
      <div className="contact-copy" data-reveal>
        <span>LET'S START</span>
        <h2>把你的项目阶段告诉我们，先做一次专业判断。</h2>
        <p>你可以留下目标赛事、项目方向、当前材料情况和时间节点。我们会先判断最值得提升的地方，再给出适合的合作路径。</p>
        <div className="contact-cards">
          <div><MessageCircle /><b>微信</b><span>dachui0612</span></div>
          <div><ShieldCheck /><b>交易保障</b><span>全程走平台</span></div>
        </div>
      </div>
      <form onSubmit={submit} data-reveal>
        <div className="role-select">
          <label><input type="radio" name="role" value="学生团队" defaultChecked /><span>学生团队</span></label>
          <label><input type="radio" name="role" value="高校教师" /><span>高校教师</span></label>
        </div>
        <label><span>称呼</span><input name="name" required placeholder="姓名 / 团队名称" /></label>
        <label><span>联系方式</span><input name="contact" required placeholder="手机 / 微信 / 邮箱" /></label>
        <label><span>需求简介</span><textarea name="need" required rows="5" placeholder="目标赛事、项目阶段、已有材料、希望解决的问题..." /></label>
        <button disabled={loading}>{loading ? '正在提交...' : '提交需求'}<ArrowRight /></button>
        {status && <p className="form-status"><Check />{status}</p>}
      </form>
    </section>
  )
}

function Chat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'bot', text: '你好，我是赛锐锶项目顾问助手。可以问我：合作流程、服务内容、技术 Demo、教师服务、联系方式。' }])
  const [input, setInput] = useState('')
  const replies = useMemo(() => [
    [['合作', '流程'], '合作一般分四步：需求沟通、项目诊断、方案共创、赛前冲刺。我们会按阶段明确交付物和时间节点。'],
    [['服务', '内容'], '核心服务包括项目诊断、赛道定位、商业计划书、申报材料、技术 Demo、路演 PPT、答辩训练和教师成果服务。'],
    [['技术', 'demo', '系统'], '可以做 Web 官网、App 原型、小程序、数据看板、后台系统和可演示 Demo，重点是提升项目可信度。'],
    [['教师', '职称', '教学'], '教师服务包含教学创新大赛、教学成果奖、课题申报、论文专利、教材专著、职称材料整理等方向。'],
    [['联系', '微信', '电话'], '推荐先加微信：dachui0612。也可以在页面底部提交需求表单。']
  ], [])
  const send = text => {
    const value = text || input.trim()
    if (!value) return
    setMessages(prev => [...prev, { role: 'user', text: value }])
    setInput('')
    const hit = replies.find(([keys]) => keys.some(key => value.toLowerCase().includes(key)))
    setTimeout(() => setMessages(prev => [...prev, { role: 'bot', text: hit ? hit[1] : '收到。建议你补充目标赛事、项目方向和当前阶段，我可以帮你判断优先要打磨哪里。' }]), 260)
  }

  return (
    <div className={`chat ${open ? 'open' : ''}`}>
      <div className="chat-panel">
        <div className="chat-head"><b>智能顾问</b><button onClick={() => setOpen(false)}><X size={16} /></button></div>
        <div className="chat-body">{messages.map((item, index) => <p key={index} className={item.role}>{item.text}</p>)}</div>
        <div className="chat-quick">{['合作流程', '技术 Demo', '教师服务'].map(item => <button key={item} onClick={() => send(item)}>{item}</button>)}</div>
        <div className="chat-input"><input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="输入你的问题..." /><button onClick={() => send()}><ArrowRight size={16} /></button></div>
      </div>
      <button className="chat-button" onClick={() => setOpen(!open)}>{open ? <X /> : <MessageCircle />}</button>
    </div>
  )
}

function Footer() {
  return (
    <footer>
      <div className="footer-brand"><span>SRS</span><b>赛锐锶科技</b></div>
      <p>旗下品牌：大锤的小铺 · 锤音科技有限公司 · 锤音专业技术服务中心</p>
      <p>© 2026 赛锐锶科技. All rights reserved. 备案号待上线后替换。</p>
    </footer>
  )
}

function App() {
  useReveal()
  return (
    <>
      <CinematicBackdrop />
      <Header />
      <main>
        <Hero />
        <Metrics />
        <Events />
        <Services />
        <Teacher />
        <Cases />
        <Process />
        <Brands />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <Chat />
    </>
  )
}

createRoot(document.getElementById('root')).render(<App />)
