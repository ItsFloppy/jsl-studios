import type { Metadata } from 'next'
import { Behaviors } from '@/components/Behaviors'
import { PageShell } from '@/components/PageShell'

export const metadata: Metadata = {
  title: 'Justin Souriau-Levine — JSL Studios',
  description:
    'Justin Souriau-Levine is an award-winning filmmaker, producer, writer and actor, and the Founder & CEO of JSL Studios. A life built around storytelling.',
}

export default function JustinPage() {
  return (
    <PageShell page="justin">
      <section className="wrap justin-head">
      <a className="back-link" href="/about#team">← Back to team</a>
      <div className="justin-intro">
      <div className="justin-photo" data-reveal="">
      <img src="/assets/team/justin-souriau-levine.webp" alt="Justin Souriau-Levine — portrait" fetchPriority="high" />
      </div>
      <div className="justin-intro-body">
      <div className="justin-title">
      <h1>Justin Souriau-Levine</h1>
      <span className="justin-sub">Filmmaker. Producer. Storyteller. Studio Builder.</span>
      <p className="justin-quote">A life built around storytelling.</p>
      </div>
      <div className="justin-copy">
      <p data-reveal="">Justin Souriau-Levine is an award-winning filmmaker, producer, writer and actor, and the Founder &amp; CEO of JSL Studios.</p>
      <p data-reveal="" data-delay="80">Born in New York in 2000, Justin began making films at the age of seven. What started with short films created through his first production company, Dingueling Productions, eventually grew into a lifelong pursuit of filmmaking, storytelling and entertainment. Between 2007 and 2017, he completed more than twenty short films before moving into feature filmmaking.</p>
      <p data-reveal="" data-delay="160">In 2020, he founded Justin Souriau-Levine Studios in New York, beginning a new chapter focused on independent feature films and cinematic storytelling.</p>
      </div>
      </div>
      </div>
      </section>

      <section className="justin-story">

      <div className="story-chapter">
      <div className="chapter-head" data-reveal="">
      <h2>Before film, there was performance</h2>
      </div>
      <div className="chapter-copy">
      <p data-reveal="">Long before building a film studio, Justin was already immersed in the world of performance.</p>
      <p data-reveal="" data-delay="80">In 2010, he made his stage debut with American Ballet Theatre. Over the following decade, he performed in hundreds of productions across some of the world's most renowned stages, including the Metropolitan Opera House, Lincoln Center's Koch Theater, the Kennedy Center, BAM and major venues in Japan.</p>
      <p data-reveal="" data-delay="160">His work with American Ballet Theatre included featured roles in productions such as The Nutcracker, Whipped Cream, The Sleeping Beauty, Don Quixote, Giselle, Manon, Romeo &amp; Juliet, Swan Lake, Le Corsaire, Cinderella, La Bayadère, Othello and The Golden Cockerel.</p>
      <p data-reveal="" data-delay="240">During this period, he was featured by publications and media including The New York Times, The Wall Street Journal, The Washington Post, Los Angeles Times, Town &amp; Country and Dance Magazine. He received Dance Magazine's Best Child Performer award in 2011 and Best Performances recognition in 2012.</p>
      </div>
      <p className="chapter-quote" data-reveal="">Performance taught him something that would later become central to his filmmaking: cinema is not only about what you see. It is about what an audience feels.</p>
      </div>

      <div className="story-chapter gold">
      <div className="chapter-head" data-reveal="">
      <h2>The filmmaker</h2>
      </div>
      <div className="chapter-copy">
      <p data-reveal="">Justin's filmmaking career began at seven years old.</p>
      <p data-reveal="" data-delay="80">After years of short-form filmmaking, he began developing feature projects, including Codename Bluebird, The Roof's Edge and The Movers, before establishing JSL Studios and producing The Greatest Race in 2021. The Greatest Race marked the beginning of JSL's feature-film journey.</p>
      <p data-reveal="" data-delay="160">Justin followed it with Planet of the Astronauts (2022), which premiered at the Directors Guild of America in New York before receiving a theatrical release across the Northeastern United States. The film was subsequently screened at Harvard University and the Lycée Français de New York Cultural Center, where Justin participated in discussions with audiences.</p>
      <p data-reveal="" data-delay="240">His work has since expanded across feature films, documentary, commercial production, fashion and branded content. As Executive Producer of Her Fight, His Name: The Story of Gwen Carr and Eric Garner, Justin received three New York Emmy Awards. His filmmaking has also received recognition through Film Threat's Award This!, including nominations for Best Director and recognition for Planet of the Astronauts.</p>
      </div>
      </div>

      <div className="story-chapter">
      <div className="chapter-head" data-reveal="">
      <h2>Building JSL</h2>
      </div>
      <div className="chapter-copy">
      <p data-reveal="">What began as a film company has continued to evolve. Under Justin's leadership, JSL has expanded beyond feature filmmaking into commercial production, branded content, fashion films and runway production.</p>
      <p data-reveal="" data-delay="80">The studio has produced campaigns and commercials for companies including Vosita Healthcare and Microwize Technologies, while developing fashion productions and runway coverage for Global Fashion Collective and LaQuan Smith during New York and Paris Fashion Weeks.</p>
      <p data-reveal="" data-delay="160">The philosophy behind this expansion is simple: the same attention to storytelling, performance, music, visual language and production value can be brought to a feature film, a fashion show, a campaign or a commercial. This has become an increasingly important part of Justin's vision for JSL — building a studio where cinema and creative production can exist within the same ecosystem.</p>
      </div>
      <p className="chapter-quote" data-reveal="">Cinema should not be confined to cinema.</p>
      </div>

      <div className="story-chapter gold">
      <div className="chapter-head" data-reveal="">
      <h2>Music, performance &amp; cinema</h2>
      </div>
      <div className="chapter-copy">
      <p data-reveal="">Music has always played an important role in Justin's creative approach. His work has been recognized for its musicality, and his early filmmaking career included collaborations with composers and musicians including Henry Mancini, Victor Young, Stephen Sondheim, Guillermo Klein, Magali Souriau and Olivia Paris.</p>
      <p data-reveal="" data-delay="80">He has also worked as a musical artist himself. In 2019, his band Yellow Man released Beautiful Day to be Alive, followed by Orange Sunset in 2020.</p>
      </div>
      <p className="chapter-quote" data-reveal="">Across film, dance and music, a common thread runs through Justin's work: rhythm, spectacle, performance and emotion.</p>
      </div>

      <a className="btn btn-sky justin-back" href="/about#team">← Back to team</a>
      </section>

      <Behaviors />
    </PageShell>
  )
}
