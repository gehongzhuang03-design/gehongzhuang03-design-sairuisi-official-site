import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowRight,
  Books,
  ChatCircleDots,
  Check,
  ClipboardText,
  Compass,
  FileText,
  GraduationCap,
  List,
  PaperPlaneTilt,
  PresentationChart,
  ShieldCheck,
  Sparkle,
  Stack,
  Target,
  Timer,
  TrendUp,
  Trophy,
  UsersThree,
  X
} from '@phosphor-icons/react'
import './styles.css'

const heroSlides = [
  {
    image: '/assets/flagship/hero-apple-4k.webp',
    tone: 'light',
    styleName: '极简',
    eyebrow: '2027 全周期竞赛服务',
    title: '为好项目，\n打造旗舰级表达。',
    desc: '面向学生团队与高校教师，提供从项目诊断、选题定位、计划书与申报材料，到技术 Demo、PPT、答辩训练和整队管理的完整支持。',
    cta: '预约项目诊断',
    href: '#contact'
  },
  {
    image: '/assets/flagship/hero-xiaomi-4k.webp',
    tone: 'bright',
    styleName: '矩阵',
    eyebrow: 'PRODUCTIZED SERVICE MATRIX',
    title: '让学生项目，\n更接近它应得的结果。',
    desc: '把创意、计划书、PPT、材料精修和答辩表达做成清晰可选的服务模块，按项目基础选择合适档位。',
    cta: '查看学生优惠报价',
    href: '#student-plans'
  },
  {
    image: '/assets/flagship/hero-samsung-4k.webp',
    tone: 'dark',
    styleName: '沉浸',
    eyebrow: 'IMMERSIVE TEAM COACHING',
    title: '把整队带队，\n变成清晰可控的过程。',
    desc: '围绕团队管理、高质量材料、节点督导和模拟答辩，为高校教师提供五档带队方案。',
    cta: '查看教师带队方案',
    href: '#teacher-plans'
  }
]

const productStories = [
  {
    no: '01',
    title: '学生优惠报价',
    desc: '面向学生团队的竞赛服务优惠方案，透明定价，按基础选择。',
    price: '¥1199',
    suffix: '起',
    image: '/assets/flagship/product-student.png',
    href: '#student-plans',
    tone: 'blue'
  },
  {
    no: '02',
    title: '教师带队方案',
    desc: '为高校教师设计的带队支持方案，从组队推进到项目落地。',
    price: '¥3999',
    suffix: '起',
    image: '/assets/flagship/product-teacher.png',
    href: '#teacher-plans',
    tone: 'orange'
  },
  {
    no: '03',
    title: '高质量材料',
    desc: '规范搭建、逻辑重构与专业表达，让申报材料更清晰、更高效。',
    price: '全链路',
    suffix: '交付',
    image: '/assets/flagship/product-materials.png',
    href: '#services',
    tone: 'slate'
  }
]

const serviceItems = [
  { icon: Target, no: '01', title: '精准定位', desc: '赛道判断、选题诊断与优先级建议' },
  { icon: ClipboardText, no: '02', title: '材料打磨', desc: '申报书结构、证据链与视觉统一' },
  { icon: PresentationChart, no: '03', title: '答辩提升', desc: '路演设计、表达训练与问题库' },
  { icon: UsersThree, no: '04', title: '整队管理', desc: '团队协作、任务拆解与进度管理' },
  { icon: ShieldCheck, no: '05', title: '全程陪伴', desc: '从申报到落地，陪伴每一步' }
]

const studentGroups = [
  {
    id: 'innovation',
    label: '创新创业类',
    title: '创新创业类竞赛',
    desc: '适用于中国国际大学生创新大赛、三创、挑战杯、创青春、ICAN、金融科技、生命科学、服务外包等。',
    plans: [
      ['1199', '创意 + 计划书 + 全程指导 + 修改'],
      ['1999', '创意 + 计划书 + PPT + 全程指导 + 修改'],
      ['2999', '3000元内容 + 文案美化包装（10天精修）'],
      ['3999', '3000元内容 + 文案企业包装（20天精修）', '热门'],
      ['4999', '4000元内容 + 文案企业包装（30天精修）', '旗舰推荐'],
      ['定制', '高校教师全程内容高质量定制（价格详细商议）']
    ]
  },
  {
    id: 'research',
    label: '调研实践类',
    title: '调研、实践、设计类竞赛',
    desc: '适用于节能减排、计算机设计、人工智能挑战、智能农业装备、正大杯、统计调查、乡村振兴类竞赛。',
    plans: [
      ['2999', '创意 + 说明书 + PPT + 硬件（报告）+ 指导 + 修改'],
      ['3999', '3000元内容 + 文案硬件（10天精修）', '热门'],
      ['4999', '4000元内容 + 文案硬件（20天精修）', '旗舰推荐'],
      ['定制', '高校教师全程高质量定制（价格详细商议）']
    ]
  },
  {
    id: 'guidance',
    label: '综合指导',
    title: '三下乡与整队指导',
    desc: '适用于大挑、正大杯、统计调研、三下乡及各省市实践竞赛，兼顾个人辅导与整队陪跑。',
    plans: [
      ['999–1499', '学生指导：0基础创意、撰写引导、PPT制作、要点讲解、润色与技巧教学'],
      ['2999–4999', '团队指导：教师协同、全队答疑、方案与硬件支持、研究生项目及全程指导', '团队优选']
    ]
  }
]

const teacherPlans = [
  {
    price: '3999',
    title: '基础带队支持',
    fit: '已有团队与材料初稿',
    items: ['竞赛方向与选题诊断', '1次项目启动会', '团队分工与时间表搭建', '申报书结构及目录建议', '3次集中指导 + 节点答疑'],
    delivery: '带队计划表 / 材料问题清单'
  },
  {
    price: '6999',
    title: '整队指导进阶',
    fit: '校赛、省赛阶段项目',
    items: ['包含基础档全部服务', '创新点与研究路径梳理', '5次整队指导会议', '申报书逐章修改建议', 'PPT逻辑与团队任务分配'],
    delivery: '整队推进表 / 申报书修改清单'
  },
  {
    price: '9999',
    title: '高质量材料共创',
    fit: '重点培育与高质量申报',
    items: ['包含进阶档全部服务', '申报书深度打磨与统一', '数据逻辑、图表与证据链', 'PPT视觉与答辩叙事', '8次整队指导 + 1次模拟答辩'],
    delivery: '高质量申报书 / PPT / 答辩提纲',
    badge: '推荐'
  },
  {
    price: '14999',
    title: '全程带队冲刺',
    fit: '重点项目、跨专业团队、省国赛冲刺',
    items: ['项目全周期节点管理', '团队分工与进度督导', '选题与创新点持续优化', '10次整队指导', '申报书 / PPT / 答辩稿全链路', '2次模拟答辩与问题闭环', '专家视角评审与复盘', '重大节点快速响应'],
    delivery: '全套申报材料 + 带队过程表 + 答辩问题库',
    badge: '重点项目优选'
  },
  {
    price: '19999',
    title: '旗舰定制陪跑',
    fit: '重大赛事、决赛项目、一队一策',
    items: ['一队一策深度共创', '教师端带队方案', '学生端任务与检查清单', '12次整队指导', '高质量材料全套系统打磨', '3次模拟答辩与集中冲刺', '研究设计与成果表达优化', '决赛前复盘与应答策略'],
    delivery: '全链路材料包 + 整队管理工具 + 决赛冲刺方案',
    badge: '旗舰推荐'
  }
]

const processSteps = [
  ['需求共识', '明确赛事、项目阶段、团队基础、已有材料和关键节点。'],
  ['项目诊断', '输出当前短板、提升路径、合作档位和交付清单。'],
  ['协同打磨', '围绕材料、技术、视觉、分工和答辩阶段化推进。'],
  ['赛前冲刺', '完成材料终审、模拟评审、问题库训练与表达优化。']
]

const deliveryModules = [
  {
    tag: '01 / DIAGNOSIS CARD',
    title: '先判断，再投入',
    desc: '用一次结构化诊断，把赛事、赛道、团队基础和时间节点放到同一张地图上，避免一开始就把时间花在错误环节。',
    metric: '48h',
    metricLabel: '完成首次项目判断',
    items: ['赛道适配度与优先级', '团队能力与材料体检', '阶段目标与投入建议']
  },
  {
    tag: '02 / MATERIAL SYSTEM',
    title: '让材料变成证据链',
    desc: '从计划书、数据、图表到 PPT，统一叙事逻辑、证据顺序和视觉语言，让评审可以快速理解项目价值。',
    metric: '01',
    metricLabel: '套材料交付系统',
    items: ['申报书结构重构', '数据与证据链整理', 'PPT与视觉表达统一']
  },
  {
    tag: '03 / DEMO & PITCH',
    title: '把想法做成可展示',
    desc: '把产品原型、技术 Demo 和路演表达串成一条体验路径，让项目不仅能讲清楚，还能现场被看见、被使用。',
    metric: '3×',
    metricLabel: '展示、路演、答辩联动',
    items: ['产品原型与演示脚本', '路演节奏与镜头设计', '高频问题与答辩训练']
  },
  {
    tag: '04 / TEAM COACHING',
    title: '让团队按节奏推进',
    desc: '为教师和学生提供可执行的任务拆解、节点检查和复盘机制，让整队指导从“提醒”变成可以追踪的过程。',
    metric: '4步',
    metricLabel: '从共识到赛前冲刺',
    items: ['角色分工与任务看板', '周节奏与节点复盘', '模拟评审与冲刺清单']
  }
]

const faqs = [
  ['服务是否承诺获奖？', '不承诺。赛事结果受到项目基础、规则变化、评审偏好和现场发挥等多重因素影响。我们提供专业指导、材料优化与整队陪跑。'],
  ['可以只选择某一项服务吗？', '可以。学生可选择计划书、PPT、精修或综合指导；教师可按团队阶段选择五档带队方案，也可以沟通定制。'],
  ['“修改”具体包含什么？', '默认包含3次免费微调。超过3次，或发生方向重构、内容大幅增加、整体视觉重做等较大修改，需要另行评估费用。'],
  ['教师服务与学生服务有什么区别？', '学生服务更侧重作品和参赛表达；教师服务增加整队管理、任务拆解、过程督导、高质量材料体系与模拟答辩。'],
  ['硬件、实验和第三方费用包含吗？', '不包含。差旅、硬件、实验、检测、专利及其他第三方支出需根据实际情况另行计算。']
]

function useReveal() {
  useEffect(() => {
    const revealNow = node => {
      if (!(node instanceof Element)) return
      const targets = node.matches?.('[data-reveal]') ? [node] : []
      targets.push(...node.querySelectorAll?.('[data-reveal]') || [])
      targets.forEach(target => {
        const rect = target.getBoundingClientRect()
        if (rect.top < window.innerHeight + 160) target.classList.add('is-visible')
      })
    }
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { rootMargin: '0px 0px 180px 0px', threshold: 0.02 }
    )
    const observe = node => {
      if (!(node instanceof Element)) return
      if (node.matches?.('[data-reveal]')) observer.observe(node)
      node.querySelectorAll?.('[data-reveal]').forEach(child => observer.observe(child))
      revealNow(node)
    }
    observe(document.body)
    const mutation = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(observe)))
    mutation.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      mutation.disconnect()
    }
  }, [])
}

function DynamicBackdrop() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const context = canvas.getContext('2d', { alpha: true })
    if (!context) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = { x: 0.68, y: 0.28, tx: 0.68, ty: 0.28 }
    const particles = Array.from({ length: 46 }, (_, index) => ({
      x: (index * 0.61803398875) % 1,
      y: (index * 0.38196601125 + 0.13) % 1,
      radius: 0.7 + (index % 5) * 0.42,
      speed: 0.018 + (index % 7) * 0.004,
      depth: 0.2 + (index % 6) * 0.12
    }))
    let width = 0
    let height = 0
    let ratio = 1
    let frame = 0

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const updatePointer = event => {
      pointer.tx = event.clientX / Math.max(width, 1)
      pointer.ty = event.clientY / Math.max(height, 1)
      document.documentElement.style.setProperty('--pointer-x', pointer.tx.toFixed(3))
      document.documentElement.style.setProperty('--pointer-y', pointer.ty.toFixed(3))
      document.documentElement.style.setProperty('--pointer-x-pos', `${(pointer.tx * 100).toFixed(2)}%`)
      document.documentElement.style.setProperty('--pointer-y-pos', `${(pointer.ty * 100).toFixed(2)}%`)
    }

    const updateScroll = () => {
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      const scrollRatio = Math.min(window.scrollY / scrollable, 1)
      document.documentElement.style.setProperty('--scroll-ratio', scrollRatio.toFixed(3))
      document.documentElement.style.setProperty('--scroll-shift', `${(-scrollRatio * 140).toFixed(1)}px`)
    }

    const draw = time => {
      pointer.x += (pointer.tx - pointer.x) * 0.045
      pointer.y += (pointer.ty - pointer.y) * 0.045
      context.clearRect(0, 0, width, height)

      const glow = context.createRadialGradient(
        pointer.x * width,
        pointer.y * height,
        0,
        pointer.x * width,
        pointer.y * height,
        Math.max(width, height) * 0.68
      )
      glow.addColorStop(0, 'rgba(196, 255, 46, 0.13)')
      glow.addColorStop(0.42, 'rgba(112, 91, 255, 0.045)')
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
      context.fillStyle = glow
      context.fillRect(0, 0, width, height)

      const t = time * 0.00012
      for (let layer = 0; layer < 4; layer += 1) {
        context.beginPath()
        for (let x = -80; x <= width + 80; x += 42) {
          const wave = Math.sin(x * 0.0042 + t * (1.2 + layer * 0.18) + layer * 1.35)
          const wave2 = Math.cos(x * 0.0019 - t * 0.7 + layer)
          const y = height * (0.18 + layer * 0.21) + wave * (34 + layer * 9) + wave2 * 24 + (pointer.y - 0.5) * 40
          if (x === -80) context.moveTo(x, y)
          else context.lineTo(x, y)
        }
        context.strokeStyle = layer % 2
          ? `rgba(10, 10, 12, ${0.024 + layer * 0.007})`
          : `rgba(146, 205, 0, ${0.035 + layer * 0.008})`
        context.lineWidth = 1
        context.stroke()
      }

      const points = particles.map(particle => ({
        ...particle,
        px: (((particle.x + t * particle.speed) % 1) * width) + (pointer.x - 0.5) * particle.depth * 56,
        py: particle.y * height + Math.sin(t * 4 + particle.x * 12) * 18 + (pointer.y - 0.5) * particle.depth * 36
      }))

      points.forEach((point, index) => {
        const next = points[(index + 7) % points.length]
        const distance = Math.hypot(point.px - next.px, point.py - next.py)
        if (distance < 245) {
          context.beginPath()
          context.moveTo(point.px, point.py)
          context.lineTo(next.px, next.py)
          context.strokeStyle = `rgba(18, 18, 20, ${0.05 * (1 - distance / 245)})`
          context.stroke()
        }
        context.beginPath()
        context.arc(point.px, point.py, point.radius, 0, Math.PI * 2)
        context.fillStyle = index % 8 === 0 ? 'rgba(154, 220, 0, 0.48)' : 'rgba(18, 18, 20, 0.22)'
        context.fill()
      })

      if (!reducedMotion) frame = window.requestAnimationFrame(draw)
    }

    resize()
    updateScroll()
    draw(0)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', updatePointer, { passive: true })
    window.addEventListener('scroll', updateScroll, { passive: true })
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', updatePointer)
      window.removeEventListener('scroll', updateScroll)
    }
  }, [])

  return (
    <div className="dynamic-backdrop" aria-hidden="true">
      <canvas ref={canvasRef} />
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />
      <div className="ambient-grid" />
      <div className="ambient-beam" />
      <div className="ambient-vignette" />
    </div>
  )
}

function Header({ heroTone }) {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const [active, setActive] = useState('top')
  const [progress, setProgress] = useState(0)
  const navs = [
    ['services', '服务体系'],
    ['deliverables', '交付内容'],
    ['student-plans', '学生报价'],
    ['teacher-plans', '教师报价'],
    ['process', '合作流程'],
    ['faq', '常见问题']
  ]

  useEffect(() => {
    const update = () => {
      setSolid(window.scrollY > 40)
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0)
      const ids = ['top', ...navs.map(item => item[0]), 'contact']
      const current = [...ids].reverse().find(id => document.getElementById(id)?.getBoundingClientRect().top <= 150)
      if (current) setActive(current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <header className={`site-header ${solid ? 'solid' : ''} ${!solid && heroTone !== 'dark' ? 'on-light-hero' : ''}`}>
      <div className="header-progress" style={{ width: `${progress}%` }} />
      <div className="header-cluster">
        <a href="#top" className="brand"><span aria-hidden="true">✳</span>赛锐锶科技</a>
        <nav className={open ? 'open' : ''}>
          {navs.map(([id, label]) => (
            <a className={active === id ? 'active' : ''} key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>
          ))}
        </nav>
      </div>
      <div className="header-actions">
        <a href="#contact" className="header-cta" onClick={() => setOpen(false)}>预约项目诊断 <ArrowRight /></a>
        <button className="menu-toggle" aria-label="切换导航" onClick={() => setOpen(!open)}>{open ? <X /> : <List />}</button>
      </div>
    </header>
  )
}

function Hero({ onToneChange }) {
  const [index, setIndex] = useState(0)
  const current = heroSlides[index]

  useEffect(() => {
    const timer = setInterval(() => setIndex(value => (value + 1) % heroSlides.length), 7200)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    onToneChange?.(current.tone)
  }, [current.tone, onToneChange])

  return (
    <section className={`hero hero-${current.tone}`} id="top">
      <div className="hero-signal-rail" aria-label="服务重点">
        {[
          ['01 / 诊断', '48h', '先判断，再投入', '赛道适配 · 团队体检'],
          ['02 / 交付', '01', '一套材料系统', '计划书 · PPT · 证据链'],
          ['03 / 陪跑', '4步', '按节奏推进', '共识 · 打磨 · 冲刺']
        ].map(([tag, metric, title, desc], signalIndex) => (
          <article key={tag} className={signalIndex === index ? 'active' : ''}>
            <span>{tag}</span><strong>{metric}</strong><h3>{title}</h3><p>{desc}</p>
          </article>
        ))}
      </div>
      <div className="hero-copy" key={index}>
        <span>{current.eyebrow}</span>
        <h1>{current.title.split('\n').map((line, lineIndex) => <React.Fragment key={line}>{line}{lineIndex === 0 && <br />}</React.Fragment>)}</h1>
        <p>{current.desc}</p>
        <a href={current.href}>{current.cta}<ArrowRight /></a>
        <div className="hero-style-tabs" aria-label="切换首页风格">
          {heroSlides.map((slide, slideIndex) => (
            <button key={slide.styleName} className={slideIndex === index ? 'active' : ''} onClick={() => setIndex(slideIndex)}>
              <small>0{slideIndex + 1}</small>{slide.styleName}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function Showcase() {
  const [audience, setAudience] = useState('student')
  return (
    <section className="showcase" id="showcase">
      <div className="audience-tabs" data-reveal>
        <button className={audience === 'student' ? 'active' : ''} onClick={() => setAudience('student')}>面向学生团队</button>
        <button className={audience === 'teacher' ? 'active' : ''} onClick={() => setAudience('teacher')}>面向高校教师</button>
      </div>
      <div className="product-grid">
        {productStories.map((item, index) => (
          <article className={`product-story ${item.tone}`} key={item.no} data-reveal style={{ '--delay': `${index * 90}ms` }}>
            <div className="product-copy">
              <span>{item.no}</span>
              <h2>{item.title}</h2>
              <p>{item.desc}</p>
              <strong>{item.price}<small>{item.suffix}</small></strong>
              <a href={item.href}>查看完整方案 <ArrowRight /></a>
            </div>
            <img src={item.image} alt="" />
          </article>
        ))}
      </div>
      <div className="service-strip">
        {serviceItems.map(({ icon: Icon, no, title, desc }) => (
          <div key={no}><Icon weight="light" /><span><b>{title}</b><small>{desc}</small></span></div>
        ))}
      </div>
    </section>
  )
}

function Services() {
  return (
    <section className="services" id="services">
      <div className="section-heading dark" data-reveal>
        <span>01 / SERVICE SYSTEM</span>
        <h2>不是堆材料，<br />而是建立一套可交付的方法。</h2>
        <p>每个关键节点都对应明确的任务、成果和下一步，让学生作品质量与教师带队效率同时提升。</p>
      </div>
      <div className="service-editorial">
        {[
          ['项目诊断与赛道定位', '判断什么最值得做，明确选题、赛道、资源与时间优先级。', Compass],
          ['申报书与高质量材料', '重构项目逻辑、研究路径、证据链、市场表达与成果价值。', FileText],
          ['技术原型与演示系统', '补齐可体验、可展示、可持续迭代的产品或技术 Demo。', Stack],
          ['路演 PPT 与答辩训练', '统一故事线、视觉表达、答辩话术与高频问题应答。', PresentationChart]
        ].map(([title, desc, Icon], index) => (
          <article key={title} data-reveal>
            <span>0{index + 1}</span>
            <Icon weight="light" />
            <div><h3>{title}</h3><p>{desc}</p></div>
            <ArrowRight />
          </article>
        ))}
      </div>
    </section>
  )
}

function DeliveryMatrix() {
  const [active, setActive] = useState(0)
  const module = deliveryModules[active]
  return (
    <section className="delivery-matrix" id="deliverables">
      <div className="section-heading" data-reveal>
        <span>02 / DELIVERY MAP</span>
        <h2>把服务拆成可看见的交付。</h2>
        <p>不同项目需要不同的推进方式。你可以先选择最需要解决的环节，再决定是否进入完整合作。</p>
      </div>
      <div className="delivery-map" data-reveal>
        <div className="delivery-tabs" role="tablist" aria-label="交付内容分类">
          {deliveryModules.map((item, index) => (
            <button key={item.tag} className={active === index ? 'active' : ''} onClick={() => setActive(index)} aria-pressed={active === index}>
              <small>0{index + 1}</small><span>{item.title}</span>
            </button>
          ))}
        </div>
        <article className="delivery-stage" key={module.tag}>
          <div className="delivery-stage-top"><span>{module.tag}</span><strong>{module.metric}<small>{module.metricLabel}</small></strong></div>
          <h3>{module.title}</h3>
          <p>{module.desc}</p>
          <div className="delivery-list">{module.items.map((item, index) => <span key={item}><b>0{index + 1}</b>{item}</span>)}</div>
          <a href="#contact">咨询这个模块 <ArrowRight /></a>
        </article>
      </div>
      <div className="coverage-strip" data-reveal>
        <span>适用场景</span>
        {['创新创业类', '调研实践类', '挑战杯', '互联网+ / 国创赛', '高校整队', '决赛冲刺'].map(item => <b key={item}>{item}</b>)}
      </div>
    </section>
  )
}

function StudentPricing() {
  const [active, setActive] = useState(0)
  const [selected, setSelected] = useState('3999')
  const group = studentGroups[active]
  return (
    <section className="student-pricing pricing-section" id="student-plans">
      <div className="section-heading" data-reveal>
        <span>03 / STUDENT PRICING</span>
        <h2>面向学生的竞赛优惠报价</h2>
        <p>先判断项目基础，再选择合适档位。价格与服务内容逐项对齐，避免无效投入。</p>
      </div>
      <div className="student-pricing-shell" data-reveal>
        <div className="pricing-tabs">
          {studentGroups.map((item, index) => (
            <button key={item.id} className={active === index ? 'active' : ''} onClick={() => { setActive(index); setSelected(item.plans[0][0]) }}>
              <small>0{index + 1}</small>{item.label}
            </button>
          ))}
        </div>
        <div className="student-pricing-content" key={group.id}>
          <div className="pricing-intro">
            <span>{group.label}</span>
            <h3>{group.title}</h3>
            <p>{group.desc}</p>
            <div><GraduationCap weight="light" /><b>学生优惠方案</b><small>按项目阶段灵活选择</small></div>
          </div>
          <div className="student-plan-list">
            {group.plans.map(([price, desc, badge]) => (
              <button key={`${price}-${desc}`} className={selected === price ? 'selected' : ''} onClick={() => setSelected(price)} aria-pressed={selected === price}>
                <strong>{price === '定制' ? price : `¥${price}`}</strong>
                <span>{desc}</span>
                {badge && <b>{badge}</b>}
                <i><Check weight="bold" /></i>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="notice" data-reveal><ShieldCheck weight="light" /><p><b>学生服务须知：</b>“修改”代表免费微调3次；超过3次或修改幅度较大需额外付费。竞赛结果受多种因素影响，不承诺获奖。</p></div>
    </section>
  )
}

function TeacherPricing() {
  const [active, setActive] = useState(2)
  const plan = teacherPlans[active]
  return (
    <section className="teacher-pricing pricing-section" id="teacher-plans">
      <div className="section-heading dark" data-reveal>
        <span>04 / TEACHER COACHING</span>
        <h2>高校教师竞赛带队服务方案</h2>
        <p>以带队管理、整队指导和高质量材料为核心，提供五档可落地的服务模式。</p>
      </div>
      <div className="teacher-price-nav" data-reveal>
        {teacherPlans.map((item, index) => (
          <button key={item.price} className={active === index ? 'active' : ''} onClick={() => setActive(index)}>
            <small>0{index + 1}</small><span>¥{item.price}</span><b>{item.title}</b>
          </button>
        ))}
      </div>
      <div className="teacher-detail" key={plan.price}>
        <div className="teacher-visual">
          <img src="/assets/flagship/product-teacher.png" alt="" />
          <span>单支队伍 · 默认线上服务</span>
        </div>
        <div className="teacher-detail-copy">
          <div className="teacher-detail-head">
            <div><span>{plan.badge || '带队服务'}</span><h3>{plan.title}</h3><p>适合：{plan.fit}</p></div>
            <strong>¥{plan.price}</strong>
          </div>
          <ul>{plan.items.map(item => <li key={item}><Check weight="bold" />{item}</li>)}</ul>
          <div className="delivery"><Books weight="light" /><span><small>核心交付</small><b>{plan.delivery}</b></span></div>
          <a href="#contact">咨询该方案 <ArrowRight /></a>
        </div>
      </div>
      <div className="notice dark-notice" data-reveal><ShieldCheck weight="light" /><p><b>教师服务须知：</b>报价为单支队伍，默认线上服务；差旅、硬件、实验、检测、专利等第三方费用另计。材料修改含3次免费微调。</p></div>
    </section>
  )
}

function Process() {
  const [active, setActive] = useState(0)
  return (
    <section className="process" id="process">
      <div className="section-heading" data-reveal>
        <span>05 / WORKFLOW</span>
        <h2>四步，把复杂备赛变得清晰。</h2>
      </div>
      <div className="process-layout">
        <div className="process-nav" data-reveal>
          {processSteps.map(([title], index) => (
            <button key={title} className={active === index ? 'active' : ''} onClick={() => setActive(index)}><small>0{index + 1}</small>{title}</button>
          ))}
        </div>
        <div className="process-stage" key={active}>
          <span>STEP 0{active + 1}</span>
          <h3>{processSteps[active][0]}</h3>
          <p>{processSteps[active][1]}</p>
          <div className="process-meter"><i style={{ width: `${((active + 1) / processSteps.length) * 100}%` }} /></div>
          <TrendUp weight="light" />
        </div>
      </div>
    </section>
  )
}

function Faq() {
  return (
    <section className="faq" id="faq">
      <div className="section-heading" data-reveal>
        <span>06 / FAQ</span>
        <h2>合作前，先把关键问题说清楚。</h2>
      </div>
      <div className="faq-list">
        {faqs.map(([question, answer], index) => (
          <details key={question} data-reveal>
            <summary><span>0{index + 1}</span>{question}<i>+</i></summary>
            <p>{answer}</p>
          </details>
        ))}
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
        <span>START A PROJECT</span>
        <h2>先做一次专业判断，<br />再决定怎么投入。</h2>
        <p>留下目标赛事、团队身份、已有材料和时间节点，我们会先判断适合的服务档位，再给出合作建议。</p>
        <div className="contact-handle"><ChatCircleDots weight="light" /><span><small>微信咨询</small><b>dachui0612</b></span></div>
        <div className="contact-qr-grid" data-reveal>
          <div className="contact-qr-card">
            <div className="contact-qr-frame"><img src="/assets/contact/wechat-personal.png" alt="个人微信二维码" /></div>
            <span><small>个人微信</small><b>添加大锤老师</b></span>
          </div>
          <div className="contact-qr-card">
            <div className="contact-qr-frame"><img src="/assets/contact/wechat-enterprise.png" alt="企业微信二维码" /></div>
            <span><small>企业微信</small><b>赛锐锶科技</b></span>
          </div>
        </div>
      </div>
      <form onSubmit={submit} data-reveal>
        <div className="role-select">
          <label><input type="radio" name="role" value="学生团队" defaultChecked /><span>学生团队</span></label>
          <label><input type="radio" name="role" value="高校教师" /><span>高校教师</span></label>
        </div>
        <label><span>称呼</span><input name="name" required placeholder="姓名 / 团队名称" /></label>
        <label><span>联系方式</span><input name="contact" required placeholder="手机 / 微信 / 邮箱" /></label>
        <label><span>需求简介</span><textarea name="need" required rows="5" placeholder="目标赛事、项目阶段、已有材料、希望解决的问题……" /></label>
        <input type="hidden" name="source" value="官网旗舰版" />
        <button disabled={loading}>{loading ? '正在提交…' : '提交需求'}<PaperPlaneTilt weight="fill" /></button>
        {status && <p className="form-status"><Check weight="bold" />{status}</p>}
      </form>
    </section>
  )
}

function Chat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'bot', text: '你好，我是赛锐锶项目顾问助手。可以问我学生报价、教师带队方案、合作流程或联系方式。' }])
  const [input, setInput] = useState('')
  const sessionRef = useRef('')
  const sessionPromiseRef = useRef(null)
  const replies = useMemo(() => [
    [['学生', '报价'], '学生服务从1199元起，分为创新创业、调研实践和综合指导三类。'],
    [['教师', '带队'], '教师带队服务为3999—19999元，覆盖项目诊断、整队管理、高质量材料、模拟答辩和全程陪跑。'],
    [['流程', '合作'], '合作分为需求共识、项目诊断、协同打磨和赛前冲刺四步。'],
    [['联系', '微信'], '微信：dachui0612。也可以直接提交页面底部的需求表单。']
  ], [])
  const ensureSession = async () => {
    if (sessionRef.current) return sessionRef.current
    if (!sessionPromiseRef.current) {
      sessionPromiseRef.current = fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: '官网右下角项目顾问', page: window.location.pathname })
      })
        .then(response => response.json().then(data => (response.ok ? data.session?.id : '')))
        .then(id => {
          if (id) sessionRef.current = id
          return id || ''
        })
        .catch(() => '')
        .finally(() => { sessionPromiseRef.current = null })
    }
    return sessionPromiseRef.current
  }
  const saveMessage = async (sessionId, role, text, quick = false) => {
    if (!sessionId) return
    try {
      await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, text, quick })
      })
    } catch {
      // 不阻塞访客继续咨询。
    }
  }
  const send = async (text, quick = false) => {
    const value = text || input.trim()
    if (!value) return
    setMessages(prev => [...prev, { role: 'user', text: value }])
    setInput('')
    const sessionId = await ensureSession()
    saveMessage(sessionId, 'user', value, quick)
    const hit = replies.find(([keys]) => keys.some(key => value.includes(key)))
    const reply = hit ? hit[1] : '收到。建议补充目标赛事、团队身份、当前材料和时间节点，我可以帮你判断优先选择哪一档。'
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: reply }])
      saveMessage(sessionId, 'bot', reply)
    }, 220)
  }
  return (
    <div className={`chat ${open ? 'open' : ''}`}>
      <div className="chat-panel">
        <div className="chat-head"><b>项目顾问</b><button aria-label="关闭顾问" onClick={() => setOpen(false)}><X /></button></div>
        <div className="chat-body">{messages.map((item, index) => <p key={index} className={item.role}>{item.text}</p>)}</div>
        <div className="chat-quick">{['学生报价', '教师带队', '合作流程'].map(item => <button key={item} onClick={() => send(item, true)}>{item}</button>)}</div>
        <div className="chat-input"><input value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => event.key === 'Enter' && send()} placeholder="输入你的问题…" /><button aria-label="发送问题" onClick={() => send()}><ArrowRight /></button></div>
      </div>
      <button className="chat-button" aria-label="打开智能顾问" onClick={() => setOpen(!open)}>{open ? <X /> : <ChatCircleDots weight="light" />}</button>
    </div>
  )
}

function Footer() {
  return (
    <footer>
      <b>赛锐锶科技</b>
      <p>大学生创新创业竞赛 · 高校教师带队 · 高质量材料 · 技术 Demo · 路演答辩</p>
      <span>© 2027 赛锐锶科技。网站报价与最终服务内容以双方确认的项目清单为准。</span>
    </footer>
  )
}

function App() {
  useReveal()
  const [heroTone, setHeroTone] = useState(heroSlides[0].tone)
  return (
    <>
      <DynamicBackdrop />
      <Header heroTone={heroTone} />
      <main>
        <Hero onToneChange={setHeroTone} />
        <Showcase />
        <Services />
        <DeliveryMatrix />
        <StudentPricing />
        <TeacherPricing />
        <Process />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <Chat />
    </>
  )
}

createRoot(document.getElementById('root')).render(<App />)
