export function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="foot-inner">
        <div className="foot-top">
          <a className="foot-brand" href="/">
            <img className="foot-logo" src="/assets/jsl-logo-400.webp" width={180} height={180} alt="JSL Studios" />
          </a>
          <div className="foot-cols">
            <div className="foot-col">
              <span className="foot-col-label">Site</span>
              <a className="foot-link" href="/studios">Studios</a>
              <a className="foot-link sky" href="/productions">Productions</a>
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
