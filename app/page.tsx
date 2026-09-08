import Link from 'next/link'
import { PublicFrame } from '@/components/public-frame'
import {
  getNavigation,
  getPageBlocks,
  getPageBySlug,
  getPagesBySlugs,
  getSettings,
  settingText,
} from '@/lib/cms'

const shelfUi: Record<string, { tags: string; tone: string }> = {
  research: { tags: '#AI   #CollectiveIntelligence   #Research   #Paper', tone: 'research' },
  projects: { tags: '#UAV   #ROS   #Embedded   #Build', tone: 'projects' },
  photos: { tags: '#Photo   #Travel   #Daily', tone: 'photos' },
  music: { tags: '#Playlist   #Listening   #Life', tone: 'music' },
}

export default async function Home() {
  const [navigation, settings, homePage, shelfPages] = await Promise.all([
    getNavigation(),
    getSettings(['hero_title', 'hero_body', 'portal_note']),
    getPageBySlug('home'),
    getPagesBySlugs(['research', 'projects', 'photos', 'music']),
  ])

  const blocks = homePage ? await getPageBlocks(homePage.id) : []
  const currentBlock = blocks.find((block) => block.block_key === 'current')
  const doing = (currentBlock?.body_markdown || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const heroTitle = settingText(settings, 'hero_title', 'Record. Build. Keep going.')
  const heroBody = settingText(
    settings,
    'hero_body',
    '我是飞行器控制与信息工程方向的学生，对技术、世界和生活都充满好奇。喜欢动手，喜欢思考，也喜欢记录。',
  )
  const portalNote = settingText(
    settings,
    'portal_note',
    '有些东西我只想留给熟悉的人。登录不自动获得权限，但可以先敲门。',
  )

  return (
    <PublicFrame navigation={navigation} activeHref="/">
      <section className="hero-desk">
        <div className="hero-photo" aria-label="Photo placeholder for a personal sunset photograph">
          <div className="hero-sun" />
          <div className="hero-skyline" />
          <p className="photo-handwriting">在复杂的世界里，<br/>做一个更有温度的探索者。</p>
          <span className="photo-caption">same sky,<br/>different stories.</span>
        </div>

        <div className="hero-copy">
          <p className="hero-label">ABOUT</p>
          <h1 className="english-hero">{heroTitle.split(' ').map((word, index) => <span key={`${word}-${index}`}>{word} </span>)}</h1>
          <p className="about-copy">{heroBody}</p>
          <Link className="ink-button" href="/about">About me <span>→</span></Link>
        </div>

        <aside className="doing-note">
          <div className="pin-row"><i /> <strong>NOW</strong></div>
          <ul>
            {(doing.length ? doing : ['正在整理这个网站。']).map((item) => <li key={item}><span />{item}</li>)}
          </ul>
          <Link className="tiny-route-link" href="/now">Open /now →</Link>
        </aside>
      </section>

      <section className="shelf-grid">
        {shelfPages.map((item) => {
          const ui = shelfUi[item.slug] || { tags: '', tone: item.slug }
          return (
            <Link className="shelf-card" href={`/${item.slug}`} key={item.id}>
              <div className={`shelf-visual ${ui.tone}`} aria-hidden="true"><span>{item.nav_label || item.title}</span></div>
              <div className="shelf-heading"><h2>{item.nav_label || item.title}</h2><span>→</span></div>
              <p>{item.summary}</p>
              <small>{ui.tags}</small>
            </Link>
          )
        })}
      </section>

      <Link className="notes-board" href="/notes">
        <div className="paper-strip">
          <span className="paperclip" aria-hidden="true">⌁</span>
          <p className="hand-note">保持好奇，保持记录。</p>
          <span className="thin-line" />
        </div>
        <div className="planet-note">
          <span>A SMALL PERSON</span>
          <span>ON A BIG PLANET.</span>
        </div>
      </Link>

      <section className="portal-corner">
        <div>
          <span className="micro-label">PRIVATE / FRIENDS / SELECTED</span>
          <p>{portalNote}</p>
        </div>
        <Link href="/private">Enter private space <span>→</span></Link>
      </section>
    </PublicFrame>
  )
}
