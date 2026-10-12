import type { Metadata } from 'next'
import { Behaviors } from '@/components/Behaviors'
import { PageShell } from '@/components/PageShell'

export const metadata: Metadata = {
  title: 'JSL Studios — Independent Film & Production Company',
  description:
    'JSL Studios is a New York City, Paris and Riyadh based independent film and commercial production company producing narrative feature films, commercials and branded content.',
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <PageShell page="home">
      <section className="hero-split" data-hero="" role="group" aria-label="Choose a side: JSL Studios or JSL Productions. Left and right arrow keys pick a side, Enter opens it." tabIndex={0}>
      <div className="hero-layer hero-production">
      <img src="/assets/split-production-v2.webp" alt="JSL Productions" draggable={false} fetchPriority="high" />
      <div className="wash wash-sky"></div>
      <div className="grad"></div>
      </div>
      <div className="hero-layer hero-studio" data-split-img="">
      <img src="/assets/split-studio-v2.webp" alt="JSL Studios" draggable={false} fetchPriority="high" />
      <div className="wash wash-gold"></div>
      <div className="grad"></div>
      </div>
      <div className="split-line" data-split-line=""></div>
      <div className="hero-caps">
      <div className="hero-cap" data-split-cap="studio">
      <h2><span className="over">JSL</span><span>STUDIOS</span></h2>
      <p>Features we write, produce and sign. Where our stories begin.</p>
      </div>
      <div className="hero-cap hero-cap-right" data-split-cap="production">
      <h2><span className="over">JSL</span><span>PRODUCTIONS</span></h2>
      <p>Films for houses, brands and cultural partners. Their story, our eye.</p>
      </div>
      </div>
      </section>

      <section className="home-intro">
      <div className="wrap home-intro-inner">
      <div className="home-intro-col" data-reveal="">
      <div className="kicker">
      <span className="kicker-line"></span>
      <span>Who we are</span>
      </div>
      <div className="home-intro-copy">JSL Studios is a New York City, Paris and Riyadh based independent film and commercial production company which produces narrative feature films, commercials and branded content. <br />Since our inception in 2020, JSL has been a harbor for joy, entertainment, and escapism. From our feature films to our commercial and fashion productions, every project is part of a larger journey: to spread joy, imagination, and entertainment across the world through the magic of cinema.</div>
      <p className="home-intro-quote">Joy is why we started. Craft is how we keep it.</p>
      <a className="btn" href="/about">Know more about us</a>
      </div>
      </div>
      </section>

      <section className="reel-sec" aria-label="Selected frames">
      <div className="reel-head kicker">
      <span className="kicker-line sky"></span>
      <span>Selected frames</span>
      </div>
      <div className="reel">
      <div className="reel-item"><div className="reel-tile"><img src="/assets/crop/feat-dungeon-two.webp" alt="Back to the Present!" loading="lazy" decoding="async" /></div><div className="reel-cap"><i></i><span>Back to the Present!</span></div></div>
      <div className="reel-item"><div className="reel-tile"><img className="op-22" src="/assets/crop/fash-red-suit.webp" alt="Fashion film — LAQUAN SMITH" loading="lazy" decoding="async" /></div><div className="reel-cap"><i className="sky"></i><span>Fashion film — LAQUAN SMITH</span></div></div>
      <div className="reel-item"><div className="reel-tile"><img src="/assets/crop/feat-tgr-nyc.webp" alt="The Greatest Race" loading="lazy" decoding="async" /></div><div className="reel-cap"><i></i><span>The Greatest Race</span></div></div>
      <div className="reel-item"><div className="reel-tile"><img className="op-30" src="/assets/crop/fash-runway-dark.webp" alt="Fashion film — GFC FW26" loading="lazy" decoding="async" /></div><div className="reel-cap"><i className="sky"></i><span>Fashion film — GFC FW26</span></div></div>
      <div className="reel-item"><div className="reel-tile"><img src="/assets/crop/feat-friar-cardinal.webp" alt="Back to the Present!" loading="lazy" decoding="async" /></div><div className="reel-cap"><i></i><span>Back to the Present!</span></div></div>
      <div className="reel-item"><div className="reel-tile"><img className="op-26" src="/assets/crop/fash-hats-trio.webp" alt="Fashion film — GFC SS27" loading="lazy" decoding="async" /></div><div className="reel-cap"><i className="sky"></i><span>Fashion film — GFC SS27</span></div></div>
      <div className="reel-item"><div className="reel-tile"><img className="op-40" src="/assets/crop/feat-astronaut-shore.webp" alt="Planet of the Astronauts" loading="lazy" decoding="async" /></div><div className="reel-cap"><i></i><span>Planet of the Astronauts</span></div></div>
      <div className="reel-item"><div className="reel-tile"><img src="/assets/crop/feat-tall-ship.webp" alt="Selected frame" loading="lazy" decoding="async" /></div><div className="reel-cap"><i></i><span>Selected frame</span></div></div>
      <div className="reel-item"><div className="reel-tile"><img className="op-30" src="/assets/crop/fash-kid-runway.webp" alt="Fashion film — GFC FW26" loading="lazy" decoding="async" /></div><div className="reel-cap"><i className="sky"></i><span>Fashion film — GFC FW26</span></div></div>
      <div className="reel-item"><div className="reel-tile"><img src="/assets/crop/feat-tgr-nyc.webp" alt="The Greatest Race" loading="lazy" decoding="async" /></div><div className="reel-cap"><i></i><span>The Greatest Race</span></div></div>
      <div className="reel-item"><div className="reel-tile"><img className="op-34" src="/assets/crop/bts-steadicam-nyc.webp" alt="On set — fashion film" loading="lazy" decoding="async" /></div><div className="reel-cap"><i className="sky"></i><span>On set — fashion film</span></div></div>
      <div className="reel-item"><div className="reel-tile"><img src="/assets/crop/feat-underwater.webp" alt="Back to the Present!" loading="lazy" decoding="async" /></div><div className="reel-cap"><i></i><span>Back to the Present!</span></div></div>
      <div className="reel-item"><div className="reel-tile"><img className="op-45" src="/assets/crop/feat-cigarette-man.webp" alt="Back to the Present!" loading="lazy" decoding="async" /></div><div className="reel-cap"><i></i><span>Back to the Present!</span></div></div>
      <div className="reel-item"><div className="reel-tile"><img className="op-26" src="/assets/crop/fash-hats-crew.webp" alt="Fashion film — GFC SS27" loading="lazy" decoding="async" /></div><div className="reel-cap"><i className="sky"></i><span>Fashion film — GFC SS27</span></div></div>
      <div className="reel-item"><div className="reel-tile"><img src="/assets/crop/feat-hiding-field.webp" alt="Back to the Present!" loading="lazy" decoding="async" /></div><div className="reel-cap"><i></i><span>Back to the Present!</span></div></div>
      <div className="reel-item"><div className="reel-tile"><img className="op-34" src="/assets/crop/bts-apartment-shoot.webp" alt="Fashion film — PUBLIC SERV-CE" loading="lazy" decoding="async" /></div><div className="reel-cap"><i className="sky"></i><span>Fashion film — PUBLIC SERV-CE</span></div></div>
      <div className="reel-item"><div className="reel-tile"><img src="/assets/crop/feat-cowgirls.webp" alt="Selected frame" loading="lazy" decoding="async" /></div><div className="reel-cap"><i></i><span>Selected frame</span></div></div>
      <div className="reel-item" aria-hidden="true"><div className="reel-tile"><img src="/assets/crop/feat-dungeon-two.webp" alt="" loading="lazy" decoding="async" /></div><div className="reel-cap"><i></i><span>Back to the Present!</span></div></div>
      <div className="reel-item" aria-hidden="true"><div className="reel-tile"><img className="op-22" src="/assets/crop/fash-red-suit.webp" alt="" loading="lazy" decoding="async" /></div><div className="reel-cap"><i className="sky"></i><span>Fashion film — LAQUAN SMITH</span></div></div>
      <div className="reel-item" aria-hidden="true"><div className="reel-tile"><img src="/assets/crop/feat-tgr-nyc.webp" alt="" loading="lazy" decoding="async" /></div><div className="reel-cap"><i></i><span>The Greatest Race</span></div></div>
      <div className="reel-item" aria-hidden="true"><div className="reel-tile"><img className="op-30" src="/assets/crop/fash-runway-dark.webp" alt="" loading="lazy" decoding="async" /></div><div className="reel-cap"><i className="sky"></i><span>Fashion film — GFC FW26</span></div></div>
      <div className="reel-item" aria-hidden="true"><div className="reel-tile"><img src="/assets/crop/feat-friar-cardinal.webp" alt="" loading="lazy" decoding="async" /></div><div className="reel-cap"><i></i><span>Back to the Present!</span></div></div>
      <div className="reel-item" aria-hidden="true"><div className="reel-tile"><img className="op-26" src="/assets/crop/fash-hats-trio.webp" alt="" loading="lazy" decoding="async" /></div><div className="reel-cap"><i className="sky"></i><span>Fashion film — GFC SS27</span></div></div>
      <div className="reel-item" aria-hidden="true"><div className="reel-tile"><img className="op-40" src="/assets/crop/feat-astronaut-shore.webp" alt="" loading="lazy" decoding="async" /></div><div className="reel-cap"><i></i><span>Planet of the Astronauts</span></div></div>
      <div className="reel-item" aria-hidden="true"><div className="reel-tile"><img src="/assets/crop/feat-tall-ship.webp" alt="" loading="lazy" decoding="async" /></div><div className="reel-cap"><i></i><span>Selected frame</span></div></div>
      <div className="reel-item" aria-hidden="true"><div className="reel-tile"><img className="op-30" src="/assets/crop/fash-kid-runway.webp" alt="" loading="lazy" decoding="async" /></div><div className="reel-cap"><i className="sky"></i><span>Fashion film — GFC FW26</span></div></div>
      <div className="reel-item" aria-hidden="true"><div className="reel-tile"><img src="/assets/crop/feat-tgr-nyc.webp" alt="" loading="lazy" decoding="async" /></div><div className="reel-cap"><i></i><span>The Greatest Race</span></div></div>
      <div className="reel-item" aria-hidden="true"><div className="reel-tile"><img className="op-34" src="/assets/crop/bts-steadicam-nyc.webp" alt="" loading="lazy" decoding="async" /></div><div className="reel-cap"><i className="sky"></i><span>On set — fashion film</span></div></div>
      <div className="reel-item" aria-hidden="true"><div className="reel-tile"><img src="/assets/crop/feat-underwater.webp" alt="" loading="lazy" decoding="async" /></div><div className="reel-cap"><i></i><span>Back to the Present!</span></div></div>
      <div className="reel-item" aria-hidden="true"><div className="reel-tile"><img className="op-45" src="/assets/crop/feat-cigarette-man.webp" alt="" loading="lazy" decoding="async" /></div><div className="reel-cap"><i></i><span>Back to the Present!</span></div></div>
      <div className="reel-item" aria-hidden="true"><div className="reel-tile"><img className="op-26" src="/assets/crop/fash-hats-crew.webp" alt="" loading="lazy" decoding="async" /></div><div className="reel-cap"><i className="sky"></i><span>Fashion film — GFC SS27</span></div></div>
      <div className="reel-item" aria-hidden="true"><div className="reel-tile"><img src="/assets/crop/feat-hiding-field.webp" alt="" loading="lazy" decoding="async" /></div><div className="reel-cap"><i></i><span>Back to the Present!</span></div></div>
      <div className="reel-item" aria-hidden="true"><div className="reel-tile"><img className="op-34" src="/assets/crop/bts-apartment-shoot.webp" alt="" loading="lazy" decoding="async" /></div><div className="reel-cap"><i className="sky"></i><span>Fashion film — PUBLIC SERV-CE</span></div></div>
      <div className="reel-item" aria-hidden="true"><div className="reel-tile"><img src="/assets/crop/feat-cowgirls.webp" alt="" loading="lazy" decoding="async" /></div><div className="reel-cap"><i></i><span>Selected frame</span></div></div>
      </div>
      <span className="reel-fade-l"></span>
      <span className="reel-fade-r"></span>
      </section>

      <section className="home-quote-sec">
      <div className="wrap home-quote-inner" data-reveal="">
      <p className="home-quote">Let's change the world, one film at a time.</p>
      <span className="home-quote-bar"></span>
      </div>
      </section>

      <section className="newsletter-sec">
      <div className="wrap newsletter-inner" data-reveal="">
      <div className="newsletter-head">
      <div className="kicker">
      <span className="kicker-line sky"></span>
      <span>Newsletter</span>
      </div>
      <h2>Stay up to date with the JSL Studios newsletter!</h2>
      </div>
      <form className="newsletter-form" data-newsletter="">
      <p>Sign up for our newsletter by providing us with your email address</p>
      <input type="email" required placeholder="your@email.com" aria-label="Email address" />
      <button type="submit">Sign up</button>
      </form>
      </div>
      </section>

      <section className="contact-sec">
      <div className="wrap contact-inner">
      <div className="kicker contact-kicker">
      <span className="kicker-line"></span>
      <span>Contact</span>
      </div>
      <div className="contact-grid">
      <div className="contact-city" data-reveal="">
      <span className="contact-city-name">New York</span>
      <div className="contact-city-meta">
      <span>172E, 95th Street 10128 NY, NY</span>
      </div>
      </div>
      <div className="contact-city" data-reveal="" data-delay="110">
      <span className="contact-city-name">Paris</span>
      {/* The Paris address and both phone numbers are still to supply. */}
      <div className="contact-city-meta"></div>
      </div>
      <div className="contact-city no-edge" data-reveal="">
      <span className="contact-city-name">Write to us</span>
      <div className="contact-city-meta">
      <span>projects — <a href="mailto:jsl@jsl-studios.com">jsl@jsl-studios.com</a></span>
      <span>press — <a href="mailto:communication@jsl-studios.com">communication@jsl-studios.com</a></span>
      <span>careers — <a href="mailto:team@jsl-studios.com">team@jsl-studios.com</a></span>
      </div>
      </div>
      </div>
      </div>
      </section>

      <Behaviors />
    </PageShell>
  )
}
