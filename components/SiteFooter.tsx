export function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="foot-inner">
        <div className="foot-top">
          <div className="foot-brand">
            <div className="foot-brand-row">
              <span className="foot-brand-word">JSL</span>
              <span className="foot-brand-dot"></span>
            </div>
            <span className="foot-brand-tag">Studios</span>
          </div>
          <div className="foot-cols">
            <div className="foot-col">
              <span className="foot-col-label">Site</span>
              <a className="foot-link" href="/studios">Studio</a>
              <a className="foot-link sky" href="/production">Production</a>
              <a className="foot-link" href="/about">About</a>
            </div>
            {/* A "Follow" column (IMDb, Instagram, LinkedIn, YouTube) goes here once JSL's own
                profile URLs are known; .foot-ext in site.css styles its links. */}
            <div className="foot-col wide">
              <span className="foot-col-label">Offices</span>
              <span className="foot-plain">New York</span>
              <span className="foot-plain">Paris</span>
            </div>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 JSL Studios</span>
          <span>Legal mentions · Privacy</span>
        </div>
      </div>
    </footer>
  )
}
