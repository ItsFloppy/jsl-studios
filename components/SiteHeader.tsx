// Plain <a> rather than next/link throughout: every page is a full load, as on the static
// site. The page scripts (lib/behaviors) bind once per document and the hero's wipe
// navigates with window.location anyway; client-side navigation would also prefetch
// pages in the background, spending Netlify requests for nothing.

export function SiteHeader({ brandTag }: { brandTag?: string }) {
  return (
    <header className="site-head">
      <div className="head-inner">
        <a className="brand" href="/" aria-label="JSL Studios, home">
          <span className="brand-word">JSL</span>
          <img className="brand-logo" src="/assets/jsl-logo-64.webp" width={26} height={26} alt="" />
          {brandTag && <span className="brand-tag">{brandTag}</span>}
        </a>
        <nav className="site-nav" aria-label="Main">
          <a className="nav-link" data-nav="studios" href="/studios">Studios</a>
          <a className="nav-link" data-nav="production" href="/production">Productions</a>
          <div className="nav-about">
            <a className="nav-link" data-nav="about" href="/about">About</a>
            <div className="about-menu">
              <div className="about-menu-panel">
                <a href="/about#story">Know more</a>
                <a href="/about#team">Team</a>
                <a href="/about#network">Network</a>
                <a href="/about#contact">Contact</a>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
