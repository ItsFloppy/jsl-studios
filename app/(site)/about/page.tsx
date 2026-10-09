import type { Metadata } from 'next'
import { Behaviors } from '@/components/Behaviors'
import { NetworkLegend } from '@/components/NetworkLegend'
import { PageShell } from '@/components/PageShell'
import { TeamGroup } from '@/components/TeamGroup'
import type { NetworkTile } from '@/lib/behaviors/about'
import { optimisedSrc } from '@/lib/sanity.image'
import { getNetwork, getTeamGroups } from '@/lib/sanity.queries'

export const metadata: Metadata = {
  title: 'About — JSL Studios',
  description:
    'JSL Studios is an independent film studio built to bring the magic, scale and craft of cinema to a new generation of audiences. Founded in New York, 2020.',
}

// Team and network come from Sanity: re-rendered at most once a minute (ISR).
export const revalidate = 60

// The CEO block and the viewer's default portrait are about Justin. His portrait is taken
// from his team entry, so replacing it in the Studio replaces it here too.
const CEO_NAME = 'Justin Souriau-Levine'
const CEO_PORTRAIT_FALLBACK = '/assets/team/justin-souriau-levine.webp'
const PORTRAIT_WIDTH = 828
const LOGO_WIDTH = 640

export default async function AboutPage() {
  const [team, network] = await Promise.all([getTeamGroups(), getNetwork()])

  const ceo = team.flatMap((g) => g.members).find((m) => m.name === CEO_NAME && m.photo)
  const ceoPortrait = optimisedSrc(ceo?.photo?.src ?? CEO_PORTRAIT_FALLBACK, PORTRAIT_WIDTH)

  // The mosaic is laid out by script (lib/behaviors/about.ts): it gets one flat list,
  // each partner tagged with its sector's index in the filter bar.
  const tiles: NetworkTile[] = network.flatMap((sector, si) =>
    sector.partners.map((p) => ({
      name: p.name,
      rel: p.relationship,
      si,
      src: p.logo ? optimisedSrc(p.logo.src, LOGO_WIDTH) : undefined,
      url: p.url,
      invert: p.invertLogo,
      visibility: p.visibility,
    })),
  )

  return (
    <PageShell page="about">
      <section className="wrap about-head">
      <div className="kicker">
      <span className="kicker-line sky"></span>
      <span>About</span>
      </div>
      <h1>The house behind the films</h1>
      </section>

      <div className="about-tabs">
      <div className="about-tabs-inner" role="tablist" aria-label="About sections">
      <button className="tab-btn" data-tab="story" role="tab" aria-selected="true" aria-controls="panel-story">Know more about us</button>
      <button className="tab-btn" data-tab="team" role="tab" aria-selected="false" aria-controls="panel-team">Team</button>
      <button className="tab-btn" data-tab="network" role="tab" aria-selected="false" aria-controls="panel-network">Network</button>
      <button className="tab-btn" data-tab="contact" role="tab" aria-selected="false" aria-controls="panel-contact">Contact</button>
      </div>
      </div>

      {/* ============ Story ============ */}
      <div id="panel-story" role="tabpanel" aria-label="Know more about us">

      <section className="story-hero">
      <img src="/assets/crop/feat-cowgirls.webp" alt="Feature still" fetchPriority="high" />
      <div className="story-hero-grad"></div>
      <div className="story-hero-inner">
      <h2>We make<br />cinema.</h2>
      <p>JSL Studios is an independent film studio built to bring the magic, scale and craft of cinema to a new generation of audiences.</p>
      </div>
      </section>

      <section className="wrap story-body">
      <div className="story-cols">
      <div className="story-cols-title">
      <span>Founded in New York, 2020.</span>
      </div>
      <div className="story-cols-body">
      <p data-reveal="">Founded in New York in 2020, JSL began with independent feature films and has since grown into a multidisciplinary studio working across cinema, fashion, advertising and entertainment.</p>
      <p data-reveal="" data-delay="80">Our work ranges from original feature films and stories in development to high-end campaigns, fashion films, runway films, commercials and branded content.</p>
      <p data-reveal="" data-delay="160">Across every format, our ambition remains the same: to create work with the imagination, emotion and production value of cinema.</p>
      </div>
      </div>

      <div className="two-worlds">
      <div className="two-worlds-head">
      <span className="tw-title">A studio. A production house. A creative platform.</span>
      <span className="tw-sub">JSL operates across two complementary worlds.</span>
      </div>
      <div className="two-worlds-grid">
      <div className="world-card" data-reveal="">
      <span className="world-name">JSL Studio</span>
      <p>JSL STUDIO develops, write and produce our own films — building original stories, characters and worlds with the ambition to grow JSL into a distinctive international film studio. It is the creative engine behind the worlds, characters and stories we want to bring to audiences.</p>
      </div>
      <div className="world-card sky" data-reveal="" data-delay="120">
      <span className="world-name">JSL Production</span>
      <p>JSL PRODUCTION is where that same cinematic vision meets the world of brands, fashion and culture. We work with fashion houses, luxury brands, cultural partners and entertainment companies to create campaigns, commercials, fashion films, runway films, branded content and short-form productions designed with the scale and attention to detail of cinema.</p>
      </div>
      </div>
      </div>
      <p className="one-vision">Different projects. One vision.</p>

      <div className="story-cols">
      <div className="story-cols-title">
      <span>From independent film to global studio</span>
      </div>
      <div className="story-cols-body">
      <p className="lede" data-reveal="">JSL was born independently, but our ambition has never been small.</p>
      <p data-reveal="" data-delay="80">Our first productions established the foundation. Each project has allowed us to grow our teams, our capabilities, our network and the scale of what we can create.</p>
      <p data-reveal="" data-delay="160">Today, JSL is building toward something larger: an international studio capable of developing original cinema, producing at scale and creating lasting relationships across the global entertainment and creative industries.</p>
      <p data-reveal="" data-delay="240">We are building a company designed to move between worlds — from the theatrical screen to fashion, from advertising to entertainment, from New York and Europe to new international markets.</p>
      </div>
      </div>
      </section>

      <section className="story-divider">
      <img loading="lazy" decoding="async" src="/assets/crop/sunrise-desert.webp" alt="Feature still — sun low over the desert" />
      </section>

      <section className="wrap vision-sec">
      <div className="vision-head">
      <span className="vision-title">Our vision</span>
      <p>JSL Studios aims to become a global reference for independent, story-driven cinema — combining the creative freedom of an independent studio with the ambition, craft and production value traditionally associated with major studios.</p>
      </div>
      <div className="vision-grid">
      <figure className="vision-card" data-reveal="">
      <img loading="lazy" decoding="async" src="/assets/crop/feat-tall-ship.webp" alt="Feature still" />
      <div className="vision-grad"></div>
      <figcaption>
      <span className="v-label">Spectacular</span>
      <span className="v-line">without losing its soul.</span>
      </figcaption>
      </figure>
      <figure className="vision-card" data-reveal="" data-delay="120">
      <img loading="lazy" decoding="async" src="/assets/crop/bts-apartment-shoot.webp" alt="Feature still" />
      <div className="vision-grad"></div>
      <figcaption>
      <span className="v-label">Ambitious</span>
      <span className="v-line">without losing its independence.</span>
      </figcaption>
      </figure>
      <figure className="vision-card pos-30" data-reveal="" data-delay="240">
      <img loading="lazy" decoding="async" src="/assets/crop/fash-hats-crew.webp" alt="Feature still" />
      <div className="vision-grad"></div>
      <figcaption>
      <span className="v-label">Contemporary</span>
      <span className="v-line">without losing the timeless magic.</span>
      </figcaption>
      </figure>
      </div>
      <div className="vision-close">
      <p data-reveal="">We believe cinema can be spectacular without losing its soul, ambitious without losing its independence, and contemporary without losing the timeless magic that made audiences fall in love with movies in the first place. JSL draws from the golden age of Hollywood — its sense of spectacle, storytelling and movie magic — and reimagines it through a contemporary, international lens.</p>
      <div className="vision-close-col">
      <p className="v-small" data-reveal="" data-delay="100">At the same time, we seek to push fashion, advertising and entertainment toward a more cinematic standard of visual storytelling.</p>
      <p className="v-big" data-reveal="" data-delay="200">Our work is ultimately about one thing: creating moments of joy, entertainment, escapism and movie magic for audiences around the world.</p>
      </div>
      </div>
      </section>

      <section className="wrap world-sec">
      <div className="world-line">
      <span>New York</span><span className="d-gold">—</span><span>Paris</span><span className="d-sky">—</span><span>The world</span>
      </div>
      <div className="world-cols">
      <p>Born between France and the United States, JSL has always been international by nature. Today, our network is expanding into new territories, including Saudi Arabia, where we are building new relationships and creative opportunities across film, fashion and entertainment.</p>
      <p className="w-big">We believe the future of cinema and creative production is increasingly global — and JSL intends to be part of that future.</p>
      </div>
      </section>

      </div>

      {/* ============ Team ============ */}
      <div id="panel-team" role="tabpanel" aria-label="Team" hidden>
      <section className="wrap team-sec">
      <div className="team-layout">

      <div className="team-viewer">
      <div className="team-portrait" title="Click to open the bio">
      <div className="portrait-layers">
      <div className="portrait-layer active" data-person-layer="">
      <img loading="lazy" decoding="async" src={ceoPortrait} alt="Justin Souriau-Levine — portrait" />
      </div>
      </div>
      <div className="team-bio" id="team-bio" tabIndex={-1}>
      <div>
      <div className="team-bio-name">Justin Souriau-Levine</div>
      <div className="team-bio-role">Founder &amp; CEO</div>
      </div>
      <p className="team-bio-text"></p>
      <span className="team-bio-close">click to close</span>
      </div>
      </div>
      <div className="team-viewer-meta" aria-hidden="true">
      <span data-active-group="">Founder &amp; CEO</span>
      <span data-active-index="">Justin Souriau-Levine</span>
      </div>
      </div>

      <div className="team-lists">

      <div className="ceo-block">
      <div className="ceo-head">
      <h2>Our CEO</h2>
      </div>
      <h3 className="ceo-name">Justin Souriau-Levine</h3>
      <div className="ceo-copy">
      <p className="lede" data-reveal="">Justin Souriau-Levine is an award-winning director, producer, writer and actor, and the Founder &amp; CEO of JSL Studios.</p>
      <p data-reveal="" data-delay="80">Since founding the studio in New York in 2020, he has led JSL across independent feature films, commercial production, fashion and branded content.</p>
      <p data-reveal="" data-delay="160">A three-time New York Emmy recipient as Executive Producer, Justin brings a background in both filmmaking and performance to his work. Before cinema, he performed with American Ballet Theatre at major venues including the Metropolitan Opera House, Lincoln Center and the Kennedy Center.</p>
      <p data-reveal="" data-delay="240">Today, he is building JSL with a broader ambition: to grow an international film studio where original cinema, creative production and global collaboration come together.</p>
      </div>
      <a className="btn" href="/justin-souriau-levine">Discover Justin's story →</a>
      </div>

      {team.map((group, i) => (
        <TeamGroup key={group.id} group={group} index={i} />
      ))}

      </div>
      </div>
      </section>
      </div>

      {/* ============ Network ============ */}
      <div id="panel-network" role="tabpanel" aria-label="Network" hidden>
      <section className="wrap network-sec">
      <div className="network-head">
      <div className="network-head-left">
      <div className="kicker">
      <span className="kicker-line sky"></span>
      <span>Network</span>
      </div>
      <h2>Connected by cinema</h2>
      </div>
      <div className="network-head-right">
      <p>JSL works across industries, markets and creative communities — building relationships with brands, institutions, talent and organizations that share an appreciation for powerful storytelling and cinematic craft.</p>
      <p>From fashion and luxury to entertainment, beauty, sport, food &amp; beverage and healthcare, our growing network reflects the breadth of the worlds JSL operates within.</p>
      </div>
      </div>

      <NetworkLegend sectors={network} />

      <div className="network-mosaic" aria-label="JSL network of clients and partners"></div>
      </section>
      </div>

      {/* ============ Contact ============ */}
      <div id="panel-contact" role="tabpanel" aria-label="Contact" hidden>
      <section className="wrap about-contact-sec">
      <p className="about-contact-lede" data-reveal="">Tell us what you want to make.</p>
      <div className="about-contact-grid">
      <a className="contact-card" data-reveal="" href="mailto:jsl@jsl-studios.com">
      <span className="c-bar"></span>
      <span className="c-title">Projects</span>
      <span className="c-mail">jsl@jsl-studios.com →</span>
      <span className="c-phone">+1 (347) 962-0268</span>
      </a>
      <a className="contact-card sky" data-reveal="" data-delay="80" href="mailto:communication@jsl-studios.com">
      <span className="c-bar"></span>
      <span className="c-title">Press</span>
      <span className="c-mail">communication@jsl-studios.com →</span>
      <span className="c-phone">+33 7 81 27 68 75</span>
      </a>
      <a className="contact-card" data-reveal="" data-delay="160" href="mailto:team@jsl-studios.com">
      <span className="c-bar"></span>
      <span className="c-title">Careers</span>
      <span className="c-mail">team@jsl-studios.com →</span>
      <span className="c-phone">+1 (203) 690-6011</span>
      </a>
      </div>
      </section>
      </div>

      <Behaviors network={tiles} />
    </PageShell>
  )
}
