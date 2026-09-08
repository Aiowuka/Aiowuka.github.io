import Link from 'next/link'

const shelves = [
  {
    id: 'research',
    label: 'Research',
    title: '研究',
    copy: '关于 AI、群体智能、分布式系统，以及还没有被完全回答的问题。',
    tags: '#AI   #群体智能   #科研   #论文',
    tone: 'research',
  },
  {
    id: 'projects',
    label: 'Projects',
    title: '项目',
    copy: '把想法变成可以运行的系统，从无人机到工具，从硬件到软件。',
    tags: '#UAV   #ROS   #嵌入式   #BUILD',
    tone: 'projects',
  },
  {
    id: 'photos',
    label: 'Photos',
    title: '照片',
    copy: '沿途的风景、城市、天气，以及一些我觉得值得留下的瞬间。',
    tags: '#照片   #旅行   #日常',
    tone: 'photos',
  },
  {
    id: 'music',
    label: 'Music',
    title: '音乐',
    copy: '在旋律和节奏里，找到另一种秩序。这里以后会放歌单和最近在听。',
    tags: '#歌单   #推荐   #生活',
    tone: 'music',
  },
]

const doing = [
  '辅导员 AI 系统 · 上线准备',
  '群体智能 / K-space 研究',
  '无人机与机器人相关项目',
  '数学建模 · 准备中',
  '记录一些生活与思考',
]

export default function Home() {
  return (
    <div className="journal-shell">
      <aside className="personal-rail">
        <div>
          <Link href="/" className="scribble-mark">Aiowuka</Link>
          <p className="rail-mantra">Same planet.<br/>Different perspective.</p>
        </div>

        <nav className="rail-nav" aria-label="Personal navigation">
          <a className="active" href="#home"><span />首页</a>
          <a href="#about">关于我</a>
          <a href="#research">研究</a>
          <a href="#projects">项目</a>
          <a href="#photos">照片</a>
          <a href="#music">音乐</a>
          <a href="#notes">随记</a>
        </nav>

        <p className="rail-note">Good ideas<br/>usually start<br/>somewhere messy.</p>

        <div className="rail-bottom">
          <p>Nanjing, China<br/>NUAA ✈</p>
          <div className="keep-dot"><i /> KEEP EXPLORING</div>
        </div>
      </aside>

      <main className="journal-main" id="home">
        <header className="journal-topbar">
          <span>AIowuka's little corner of the internet</span>
          <div className="topbar-actions">
            <span aria-hidden="true">⌕</span>
            <span aria-hidden="true">☼</span>
            <span>中 / EN</span>
            <Link href="/private">个人空间 ↗</Link>
          </div>
        </header>

        <section className="hero-desk">
          <div className="hero-photo" aria-label="Photo placeholder for a personal sunset photograph">
            <div className="hero-sun" />
            <div className="hero-skyline" />
            <p className="photo-handwriting">在复杂的世界里，<br/>做一个更有温度的探索者。</p>
            <span className="photo-caption">same sky,<br/>different stories.</span>
          </div>

          <div className="hero-copy" id="about">
            <p className="hand-title">记录，<br/>构建，<br/>然后继续出发。</p>
            <p className="about-copy">我是飞行器控制与信息工程方向的学生，对技术、世界和生活都充满好奇。喜欢动手，喜欢思考，也喜欢记录。</p>
            <p className="about-copy">希望在这个有点混乱但很美的世界里，构建一些有价值的东西。</p>
            <a className="ink-button" href="#research">了解我 <span>→</span></a>
          </div>

          <aside className="doing-note">
            <div className="pin-row"><i /> <strong>现在在做</strong></div>
            <ul>
              {doing.map((item) => <li key={item}><span />{item}</li>)}
            </ul>
            <p>慢一点，<br/>但走得更远。</p>
          </aside>
        </section>

        <section className="shelf-grid">
          {shelves.map((item) => (
            <article className="shelf-card" id={item.id} key={item.id}>
              <div className={`shelf-visual ${item.tone}`} aria-hidden="true"><span>{item.label}</span></div>
              <div className="shelf-heading"><h2>{item.title}</h2><span>→</span></div>
              <p>{item.copy}</p>
              <small>{item.tags}</small>
            </article>
          ))}
        </section>

        <section className="notes-board" id="notes">
          <div className="paper-strip">
            <span className="paperclip" aria-hidden="true">⌁</span>
            <p className="hand-note">保持好奇，保持记录。</p>
            <span className="thin-line" />
          </div>
          <div className="planet-note">
            <span>A SMALL PERSON</span>
            <span>ON A BIG PLANET.</span>
          </div>
        </section>

        <section className="portal-corner">
          <div>
            <span className="micro-label">PRIVATE / FRIENDS / SELECTED</span>
            <p>有些东西我只想留给熟悉的人。登录不自动获得权限，但可以先敲门。</p>
          </div>
          <Link href="/private">进入个人空间 <span>→</span></Link>
        </section>
      </main>
    </div>
  )
}
