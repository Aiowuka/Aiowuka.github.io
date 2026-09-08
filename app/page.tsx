import Link from 'next/link'

const trajectories = [
  {
    index: '01',
    title: 'AI 与群体智能',
    en: 'AI / collective intelligence',
    copy: '研究 Agent、群体协作，以及一个系统怎样知道什么能力真的可以被放弃。',
  },
  {
    index: '02',
    title: '飞控与无人系统',
    en: 'flight control / autonomy',
    copy: '把控制、感知和真实硬件接起来，关注能够在现实环境里工作的自主系统。',
  },
  {
    index: '03',
    title: '做东西，也记录过程',
    en: 'build / document / iterate',
    copy: '代码、实验、网页、机器人和还没成形的想法，都会在这里慢慢留下痕迹。',
  },
]

const notes = [
  ['Now', '正在把研究、工程项目和个人记录整理成一个长期可维护的工作与展示空间。'],
  ['Study', '南京航空航天大学 · 飞行器控制与信息工程。'],
  ['Open', '公开部分只展示我愿意被看见的内容；其余内容按访问权限开放。'],
]

export default function Home() {
  return (
    <div className="site-frame">
      <header className="masthead">
        <Link className="wordmark" href="/">AIowuka</Link>
        <div className="masthead-meta">Nanjing · 2026</div>
        <nav className="masthead-nav" aria-label="Primary">
          <a href="#now">Now</a>
          <a href="#notes">Notes</a>
          <a href="#projects">Projects</a>
          <Link href="/private">Portal</Link>
        </nav>
      </header>

      <main>
        <section className="intro" id="about">
          <div className="eyebrow">Personal index / 个人索引</div>

          <div className="intro-grid">
            <div className="intro-title">
              <h1>AIowuka</h1>
              <p className="intro-kicker">I build, study, test, and leave traces.</p>
            </div>

            <div className="intro-note">
              <p className="intro-cn">你好，我是 AIowuka。</p>
              <p>
                南京航空航天大学飞控方向学生。我的兴趣在 AI、Agent、无人系统、控制，以及那些还没有被完整定义的问题。
              </p>
              <p className="intro-en">
                Flight control student at NUAA, interested in AI, agents, autonomy, control systems, and unfinished questions worth building around.
              </p>
            </div>
          </div>

          <div className="fact-rail" aria-label="Profile facts">
            <div className="fact-cell">
              <span>01 / BASE</span>
              <strong>Nanjing, China</strong>
            </div>
            <div className="fact-cell">
              <span>02 / FIELD</span>
              <strong>Flight Control</strong>
            </div>
            <div className="fact-cell">
              <span>03 / FOCUS</span>
              <strong>AI · Agents · Autonomy</strong>
            </div>
            <div className="fact-cell fact-link">
              <span>04 / ELSEWHERE</span>
              <a href="https://github.com/Aiowuka" target="_blank" rel="noreferrer">GitHub ↗</a>
            </div>
          </div>
        </section>

        <section className="chapter" id="now">
          <div className="chapter-heading">
            <span className="chapter-no">I</span>
            <div>
              <div className="eyebrow">Current trajectories</div>
              <h2>现在在往哪里走</h2>
            </div>
          </div>

          <div className="trajectory-list">
            {trajectories.map((item) => (
              <article className="trajectory" key={item.index}>
                <div className="trajectory-index">{item.index}</div>
                <div className="trajectory-main">
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
                <div className="trajectory-en">{item.en}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="notes-layout" id="notes">
          <div className="notes-statement">
            <div className="eyebrow">Notebook / 记录</div>
            <p>
              我不太想把这里做成一份静态简历。
              <br />
              更希望它像一个持续变化的索引：今天在研究什么、做什么、听什么、拍到什么，都会慢慢长出来。
            </p>
          </div>

          <div className="notes-ledger">
            {notes.map(([label, text]) => (
              <div className="ledger-row" key={label}>
                <span>{label}</span>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="projects" id="projects">
          <div className="chapter-heading compact">
            <span className="chapter-no">II</span>
            <div>
              <div className="eyebrow">Selected threads</div>
              <h2>正在展开的项目</h2>
            </div>
          </div>

          <div className="project-lines">
            <article className="project-line">
              <div className="project-type">RESEARCH</div>
              <div>
                <h3>Collective Intelligence</h3>
                <p>围绕 Agent 群体、能力冗余与未来任务空间展开的研究。</p>
              </div>
              <span>ongoing</span>
            </article>
            <article className="project-line">
              <div className="project-type">SYSTEM</div>
              <div>
                <h3>AI-assisted Workflows</h3>
                <p>把 AI 从聊天窗口变成能够参与真实工作流、数据和工具链的系统。</p>
              </div>
              <span>building</span>
            </article>
            <article className="project-line">
              <div className="project-type">HARDWARE</div>
              <div>
                <h3>Autonomous Systems</h3>
                <p>无人机、传感器、嵌入式与现实世界里的控制和自主。</p>
              </div>
              <span>field notes</span>
            </article>
          </div>
        </section>

        <section className="media-shelf" aria-label="Future media shelf">
          <div className="media-title">
            <div className="eyebrow">Life outside the terminal</div>
            <h2>照片、音乐，和一些别的东西</h2>
          </div>
          <div className="media-placeholder photo-placeholder">
            <span>PHOTO / soon</span>
          </div>
          <div className="media-placeholder sound-placeholder">
            <span>SOUND / soon</span>
          </div>
          <p className="media-copy">这里以后会放照片、音乐、旅行和生活片段。不是作品集，只是想保留一点不那么“项目化”的东西。</p>
        </section>

        <section className="portal-strip">
          <div>
            <div className="eyebrow">Access boundary</div>
            <p>有些内容公开，有些只留给特定的人。登录只证明身份，权限由我单独决定。</p>
          </div>
          <Link className="portal-link" href="/private">进入 Portal <span>↗</span></Link>
        </section>
      </main>

      <footer className="site-footer">
        <span>AIowuka · aiowuka.me</span>
        <span>Built slowly, kept deliberately.</span>
      </footer>
    </div>
  )
}
