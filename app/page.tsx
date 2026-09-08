import Link from 'next/link'

export default function Home() {
  return <div className="page">
    <header className="site-header"><Link className="name" href="/">AIowuka</Link><nav className="nav"><a href="#about">关于 / About</a><a href="#now">近况 / Now</a><Link href="/private">私人区域 / Private</Link><Link href="/login">登录 / Sign in</Link></nav></header>
    <main>
      <div className="hero" id="about"><div className="hero-main"><h1>AIowuka</h1><p className="hello">你好，我是 AIowuka。<br/>Hi, I’m AIowuka.</p><p className="copy">南京航空航天大学飞控专业学生。我喜欢 AI、Agent、无人系统，也喜欢把一些还没有想明白的问题慢慢做成东西。<span className="en">I study Flight Control at Nanjing University of Aeronautics and Astronautics. I’m interested in AI, agents, autonomous systems, and turning unfinished ideas into things I can explore and build.</span></p></div><aside className="side"><div className="side-block">南京 / Nanjing<br/><span className="muted">南京航空航天大学 · NUAA</span></div><div className="side-block">飞控 / Flight Control<br/><span className="muted">Control, autonomy and intelligent systems.</span></div><div className="side-block"><a href="https://github.com/Aiowuka">GitHub ↗</a></div></aside></div>
      <section className="section" id="now"><div><h2>最近</h2><span className="muted">Now · 2026.09</span></div><div className="grid3"><article className="item"><h3>AI 与群体智能</h3><p>在研究 Agent、群体智能，以及还没有完全想明白的问题。</p></article><article className="item"><h3>无人系统</h3><p>继续做无人机、飞行控制，以及真实世界里的自主系统。</p></article><article className="item"><h3>学习与记录</h3><p>写下值得留下来的东西，也慢慢整理自己的方法和兴趣。</p></article></div></section>
      <section className="section"><div><h2>访问边界</h2><span className="muted">Access</span></div><div><p className="copy">公开内容继续对所有人开放；登录并不自动获得权限。受保护内容由我按 MEMBER / SELECTED / OWNER 范围授权。</p><Link className="button" href="/private">进入私人区域</Link></div></section>
    </main><footer>AIowuka · aiowuka.me</footer>
  </div>
}
