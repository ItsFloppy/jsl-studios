/* JSL Studios — About page: tabs, team credits viewer, network mosaic.
   Ported from the data script of the JSL Studios Claude Design file */
(function () {
  'use strict';

  var reducedMotion = function () {
    return window.JSL ? window.JSL.reduced() : false;
  };

  /* ---------- Tabs (hash-driven) ---------- */

  var TABS = ['story', 'team', 'network', 'contact'];

  // Set by networkBind(): builds the mosaic the first time the Network tab is shown.
  var ensureNetwork = null;

  function currentTab() {
    var h = (window.location.hash || '').replace('#', '');
    return TABS.indexOf(h) !== -1 ? h : 'story';
  }

  function showTab(tab, scroll) {
    TABS.forEach(function (t) {
      var btn = document.querySelector('[data-tab="' + t + '"]');
      var panel = document.getElementById('panel-' + t);
      var on = t === tab;
      if (btn) btn.setAttribute('aria-selected', on ? 'true' : 'false');
      if (panel) panel.hidden = !on;
    });
    if (tab === 'network' && ensureNetwork) ensureNetwork();
    if (scroll) window.scrollTo(0, 0);
    if (window.JSL) window.JSL.reveal();
  }

  function tabsBind() {
    document.querySelectorAll('[data-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = btn.getAttribute('data-tab');
        // A real history entry per tab, so Back returns to the previous tab. The
        // hashchange listener below does the switching; re-clicking the current tab
        // fires no hashchange, so that case is handled here.
        if (window.location.hash === '#' + tab) showTab(tab, true);
        else window.location.hash = tab;
      });
    });
    window.addEventListener('hashchange', function () { showTab(currentTab(), true); });
    showTab(currentTab(), false);
  }

  /* ---------- Team credits viewer ---------- */

  var PHOTOS = {
    'Justin Souriau-Levine': '/assets/team/justin-souriau-levine.webp',
    'Gordon Caplan': '/assets/team/gordon-caplan.webp',
    'François Grunenwald': '/assets/team/francois-grunenwald.webp',
    'Franck Sineau': '/assets/team/franck-sineau.webp',
    'Bruce D. Levine': '/assets/team/bruce-d-levine.webp',
    'Louise Vilepellet': '/assets/team/louise-vilepellet.webp',
    'Christopher Kondoleon': '/assets/team/chris-kondoleon.webp',
    'Antoine Bonnefoy': '/assets/team/antoine-bonnefoy.webp',
    'John Dima': '/assets/team/john-dima.webp',
    'Hugo Bonnain': '/assets/team/hugo-bonnain.webp',
    'Theodore Verzat': '/assets/team/theodore-verzat.webp',
    'Gary Springer': '/assets/team/gary-springer.webp',
    'Martin Cornu-Mansuy': '/assets/team/martin-cornu-mansuy.webp',
    'Robert A. Levine': '/assets/team/robert-a-levine.webp',
    'Magali Souriau': '/assets/team/magali-souriau.webp',
    'Emma Kremer': '/assets/team/emma-kremer.webp',
    'Yves Philippe': '/assets/team/yves-philippe.webp',
    'Marvin Jay Levy': '/assets/team/marvin-jay-levy.webp'
  };

  var BIOS = {
    'Justin Souriau-Levine': "Justin Souriau-Levine is an award-winning director, producer, writer, cinematographer and actor, and the Founder & CEO of JSL Studios. Since establishing the company in New York in 2020, he has led its growth across independent feature films, commercial production, fashion and branded content. His work has earned three New York Emmy Awards as Executive Producer, alongside recognition from film festivals and industry institutions. Before cinema, Justin performed for American Ballet Theatre at major venues including the Metropolitan Opera House, Lincoln Center and the Kennedy Center. Today, he leads JSL's international development, bringing together filmmaking, creative production and global partnerships with a distinctly cinematic vision.",
    'Gordon Caplan': "Gordon R. Caplan is a seasoned investor, strategic advisor and business leader, and the Founder & CEO of Dutchess Management, a strategic advisory firm focused on complex transactions, investments and corporate transformation. Previously, he served as Co-Chairman of Willkie Farr & Gallagher, where he led the firm's Private Equity Practice and helped build one of the world's leading private equity practices. His career spans private equity, venture capital, M&A, corporate governance and technology transactions, with board experience across leading growth companies. Named \"Dealmaker of the Year\" by American Lawyer in 2018, Gordon brings JSL a wealth of strategic, financial and investment expertise as a Board Member, Partner and Investor.",
    'François Grunenwald': "François Grunenwald brings more than two decades of senior financial and corporate experience to JSL Studios. He currently serves as Chief Accounting Officer and Head of Treasury–Cash Management at Ocwen Financial Corporation in the United States, following a 23-year career at PwC that culminated in his appointment as Partner. His academic background spans economics, finance, banking and capital markets, complemented by additional professional certifications. At JSL, François works closely with Justin Souriau-Levine as a trusted advisor and financial consultant, contributing strategic and financial expertise to the company's development. He has also supported the production of JSL's feature film Back to the Present!.",
    'Franck Sineau': "Franck Sineau brings more than two decades of international expertise in luxury marketing, media, communications and brand development to JSL Studios. He currently serves as Group Marketing Deputy Director and Global Media Director at Richemont, where he has held senior leadership positions for more than sixteen years, working across strategy, planning, media and global brand development. Prior to Richemont, Franck was Managing Partner at Mindshare and held communications leadership roles with Alfa Romeo and Saab. A graduate of Université Paris 2 Panthéon-Assas, where he earned Master's degrees in Communication and Political Science, he brings JSL extensive strategic, marketing and luxury-industry expertise as a Board Member, Partner and Investor.",
    'Bruce D. Levine': "Bruce D. Levine brings extensive financial leadership and cultural-sector management experience to JSL Studios. He holds a BA from Connecticut College and an MBA from Boston University, and currently serves as Chief Financial Officer and Chief Operating Officer at Building for the Arts NY in New York City, while also sitting on the Board of Queens Theatre. Previously, he served as Chief Financial Officer at Theatre Row Studios and 42nd Street Development. As JSL's Financial Advisor, Bruce works closely with the company's leadership on financial strategy, management and long-term development. He is also an active partner and supporter of JSL's feature film Back to the Present!.",
    'Louise Vilepellet': "Louise Villepelet brings more than a decade of experience in strategy consulting, luxury and investment to JSL Studios. She is the Co-Founder of WAW, a strategic consulting firm dedicated to the luxury Wine & Spirits sector, where she advises leading Houses on growth, brand elevation, customer experience and long-term strategy. Previously a Manager at Kearney, she led transformation projects for major consumer and luxury brands, following five years at MAD, a specialist strategy consultancy in the luxury sector. Earlier in her career, she worked in Private Equity at Linklaters in London and Paris. A graduate of HEC Paris, Cambridge University and Université Paris-Panthéon-Assas, Louise brings JSL a powerful combination of strategic, luxury and investment expertise.",
    'Christopher Kondoleon': "Christopher Kondoleon combines finance, production, fashion and talent management expertise within JSL Studios. A graduate of the University of Wisconsin with a B.B.A. in Finance and Real Estate, he began his professional career in corporate development at Hudson's Bay Company, supporting initiatives across its retail and real estate portfolio. His experience later expanded into fashion, marketing and talent management in New York, Los Angeles and Paris. At JSL, Christopher supports budgeting, operations, fundraising, marketing and production strategy, while also contributing creatively through photography, social media and drone operations. He has played a significant role in Back to the Present! and JSL's commercial productions.",
    'Antoine Bonnefoy': "Antoine Bonnefoy is a Production Manager at JSL Studios, contributing to the company's film and production activities across France and internationally. With an academic background spanning economics, business management and international business, including studies in New York and Paris, he brings a strong understanding of both European and American environments. Antoine's career at JSL began on Planet of the Astronauts, where he worked across production and camera operations and also made his screen debut. He has since taken on increasingly strategic responsibilities across pre-production, casting and production management, playing an integral role in the development and execution of JSL's feature films and expanding French operations.",
    'Hugo Bonnain': "Holding a Master's degree in International Business & Communication Strategy from AMOS and Pace University, Hugo Bonnain is the Head of Communications at JSL Studios, where he leads the company's communications strategy across cinema, fashion and commercial production. Before joining JSL, he served as Communications Manager and Press Officer at OGC Nice, one of France's leading professional football clubs, gaining extensive experience in media relations, corporate communications, reputation and public-facing strategy within a major international sports organization. Since joining JSL in 2024, Hugo has expanded the company's communications across its films, campaigns and fashion productions, strengthening its presence across social, digital and industry channels while helping position JSL for its next phase as an international studio.",
    'Theodore Verzat': "Théodore Verzat brings a multidisciplinary combination of engineering, filmmaking, production and post-production expertise to JSL Studios. Raised in Cannes, France, he studied engineering at ISEN Lille before pursuing cinematic studies at 3iS in Nantes. Prior to joining JSL, he worked across camera and post-production departments at Pernel Media in Paris, a CANAL+ subsidiary, and founded NOS REVERB, an audiovisual music production company specializing in music videos and concert films. At JSL, Théodore oversees post-production across campaigns, commercials, fashion films and feature cinema, while also supporting French production operations. His technical expertise spans editing, DIT, live production, camera and post-production workflows.",
    'Martin Cornu-Mansuy': "Martin Cornu-Mansuy brings a highly versatile combination of technology, production and on-set expertise to JSL Studios. Holding a Master's degree in IT Project Management, he began his career as a developer and IT project manager, specializing in UX/UI design. Since joining JSL in 2024, his role has expanded across technical, creative and production departments. He has contributed to Back to the Present! through production logistics, wardrobe, stunt coordination, sword choreography and on-set support, while also working across Fashion Week productions in technical and production roles. A guitarist and active musician, Martin combines technical precision with a strong creative instinct, making him a uniquely adaptable member of JSL's international production team.",
    'Robert A. Levine': "Robert A. Levine brings more than five decades of Hollywood experience to JSL Studios. A member of the Academy of Motion Picture Arts and Sciences, the Publicists Guild and the Writers Guild of America, he has worked across screenwriting, publicity, production, marketing and film history. His career includes senior positions at Columbia Pictures, 20th Century Fox and Interscope Communications, as well as work on major productions including The China Syndrome, Tess, Gandhi, Tootsie, Romancing the Stone and more than thirty studio films. He has collaborated with acclaimed filmmakers and leading international talent, while also lecturing at NYU's Tisch School of the Arts.",
    'Gary Springer': "Gary Springer is a veteran entertainment professional whose career spans film, theatre, publicity, sales, distribution and awards strategy. An entertainment publicist representing film, theatre and events, he has worked extensively with independent and international cinema, representing films at festivals across the United States and abroad and advising on sales, distribution and awards campaigns. His theatre experience includes representation of more than 25 Broadway productions, alongside numerous Off-Broadway companies and productions. Gary began his career as an actor, appearing in films including Dog Day Afternoon, Jaws 2 and A Small Circle of Friends. A voting member of the Academy Awards and founding member of The Creative Coalition, he brings JSL decades of industry relationships and expertise in positioning independent cinema for international audiences.",
    'Magali Souriau': "Magali Souriau is an acclaimed French jazz pianist, composer, conductor and educator whose career spans music, performance and film. A graduate of the Marseille Conservatory and Berklee College of Music, where she graduated Summa Cum Laude, she has received prestigious distinctions including the Woody Herman Jazz Master Award and the Gil Evans Fellowship. She has performed internationally and at renowned New York jazz venues, while composing extensively for orchestras, ensembles and film. Magali has also served as an Artist in Residence at MIT and worked with American Ballet Theatre. At JSL, she advises on artistic direction and musical composition, shaping the distinctive musical identity of the studio's productions."
  };

  var CEO = {
    name: 'Justin Souriau-Levine',
    role: 'Founder & CEO',
    group: 'Founder & CEO',
    index: 'Justin Souriau-Levine'
  };

  function teamBind() {
    var viewer = document.querySelector('.team-portrait');
    if (!viewer) return;
    var layersHost = viewer.querySelector('.portrait-layers');
    var bioEl = viewer.querySelector('.team-bio');
    var bioName = bioEl.querySelector('.team-bio-name');
    var bioRole = bioEl.querySelector('.team-bio-role');
    var bioText = bioEl.querySelector('.team-bio-text');
    var metaGroup = document.querySelector('[data-active-group]');
    var metaIndex = document.querySelector('[data-active-index]');

    var layers = {};

    function layerFor(name) {
      if (layers[name]) return layers[name];
      var div = document.createElement('div');
      div.className = 'portrait-layer';
      var slot = document.createElement('div');
      slot.className = 'portrait-ph';
      slot.textContent = '[PORTRAIT — 4:5]';
      if (PHOTOS[name]) {
        var img = document.createElement('img');
        img.alt = name + ' — portrait';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.src = PHOTOS[name];
        // A portrait that is absent falls back to the slot, so dropping the file
        // into assets/team/ later is all that's needed to make it appear.
        img.addEventListener('error', function () {
          if (img.parentNode === div) div.removeChild(img);
          div.appendChild(slot);
        });
        div.appendChild(img);
      } else {
        div.appendChild(slot);
      }
      layersHost.appendChild(div);
      layers[name] = div;
      return div;
    }

    // The static Justin layer shipped in the HTML.
    var staticLayer = layersHost.querySelector('[data-person-layer]');
    if (staticLayer) layers[CEO.name] = staticLayer;

    var active = null;
    var bioOpen = false;

    function bioFor(person) {
      return BIOS[person.name] || ('[BIO — a short presentation of ' + person.name + ', ' + person.role + ' — to be supplied]');
    }

    function setActive(person) {
      if (active && active.name === person.name && active.index === person.index) return;
      active = person;
      var layer = layerFor(person.name);
      Object.keys(layers).forEach(function (k) { layers[k].classList.toggle('active', layers[k] === layer); });
      if (metaGroup) metaGroup.textContent = person.group;
      if (metaIndex) metaIndex.textContent = person.index;
      bioName.textContent = person.name;
      bioRole.textContent = person.role;
      bioText.textContent = bioFor(person);
    }

    // Which row's bio is showing, so only that row reports aria-expanded="true".
    var openRow = null;

    function setBio(open, row) {
      bioOpen = open;
      openRow = open ? (row || openRow) : null;
      bioEl.classList.toggle('open', open);
      document.querySelectorAll('.team-row').forEach(function (r) {
        r.setAttribute('aria-expanded', open && r === openRow ? 'true' : 'false');
      });
    }

    setActive(CEO);

    var ceoBlock = document.querySelector('.ceo-block');
    if (ceoBlock) {
      ceoBlock.addEventListener('mouseenter', function () { setActive(CEO); });
    }

    document.querySelectorAll('.team-row').forEach(function (row) {
      var person = {
        name: row.getAttribute('data-name'),
        role: row.getAttribute('data-role'),
        group: row.getAttribute('data-group'),
        index: row.getAttribute('data-index')
      };
      if (person.name === CEO.name) person = { name: CEO.name, role: CEO.role, group: CEO.group, index: CEO.index };
      // While a bio is open, hovering or focusing another row shows that person's bio, so
      // that row becomes the expanded one — and Enter on it then closes what it shows.
      var over = function () {
        setActive(person);
        if (bioOpen) setBio(true, row);
      };
      // moveFocus only for keyboard activation: the bio that just appeared is elsewhere in
      // the DOM and nothing would announce it otherwise. Doing it on mouse clicks too would
      // yank focus away from where the pointer is.
      var open = function (moveFocus) {
        var same = active && active.name === person.name;
        var willOpen = same ? !bioOpen : true;
        setActive(person);
        setBio(willOpen, row);
        if (moveFocus) (willOpen ? bioEl : row).focus();
        // On narrow screens the viewer is not sticky and sits above the whole list, so a
        // tapped name's bio would open off screen: bring it into view.
        else if (willOpen && getComputedStyle(viewer.parentNode).position === 'static') {
          viewer.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
        }
      };
      row.addEventListener('mouseenter', over);
      row.addEventListener('focus', over);
      row.addEventListener('click', function () { open(false); });
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(true); }
      });
    });

    viewer.addEventListener('click', function () { setBio(!bioOpen, openRow); });
  }

  /* ---------- Network mosaic ---------- */

  var SECTORS = [
    ['Fashion & Luxury', [['LaQuan Smith', 'client'], ['Public Service', 'client'], ['Alaïa', 'network'], ['Chloé', 'network'], ['Global Fashion Collective', 'client'], ['Eduardo Ramos', 'featured'], ['Richemont', 'network'], ['Cartier', 'relationship'], ['Montblanc', 'relationship'], ['New York Fashion Week', 'client'], ['Paris Fashion Week', 'client'], ['Milan Fashion Week', 'client'], ['Met Gala', 'featured'], ['Perry Jones', 'featured'], ['David Layer', 'featured'], ['NOLO', 'featured'], ['Alex S. Yu', 'featured'], ['Tess Mann Atelier', 'featured'], ['Noé Bernacelli', 'featured'], ['Fashion TV', 'relationship'], ['Dutchess Management', 'featured'], ['Wilson Model Management', 'network']]],
    ['Entertainment & Experiences', [['Nickelodeon Universe', 'featured'], ['Six Flags', 'conversation'], ['DreamWorks Water Park', 'featured'], ['Camelback Resort', 'conversation'], ['Qiddiya', 'conversation'], ['Mescal Movie Set', 'featured'], ['Monument Valley', 'featured'], ['Étoile du Roy', 'featured'], ['Château de Falaise', 'featured'], ['Queens Theatre', 'featured'], ['American Film Market', 'network'], ['Berlinale', 'network'], ['Festival de Cannes', 'network'], ['Cannes Lions', 'network'], ['Dolby', 'relationship'], ['Red Sea Global', 'conversation'], ['SLS Expo', 'relationship'], ['Saudi Capital Markets Forum', 'relationship'], ['Saudi Entertainment Expo', 'relationship'], ['Saudi Media Forum', 'relationship']]],
    ['Beauty & Culture', [['Yayoi', 'client'], ['Goop', 'relationship'], ['Goldwell', 'client']]],
    ['Sports & Athletics', [['PSG Academy', 'featured'], ['Al Hilal', 'conversation'], ['Al Ahli', 'conversation'], ['Al Ittihad', 'conversation'], ['NYCFC', 'relationship'], ['FFF Academy', 'featured'], ['Real Murcia', 'conversation']]],
    ['Education & Institutions', [['Pace University', 'relationship'], ['Harvard University', 'network'], ['Yale / Yale New Haven Health', 'relationship'], ['American Ballet Theatre', 'network'], ['Echoing Green', 'conversation'], ['Endeavor Global', 'conversation'], ['HMTC of Nassau County', 'featured'], ['MISA', 'network'], ['PIF', 'relationship'], ['Tawuniya', 'conversation']]],
    ['Food & Beverage', [['Danone', 'conversation'], ['Nespresso', 'conversation'], ['La Voglia', 'featured'], ['Aveiro Maroc', 'conversation'], ['Bachir', 'network'], ["Côte d'Or", 'conversation'], ['Isigny Sainte-Mère', 'conversation']]],
    ['Healthcare', [['Vosita Healthcare', 'client'], ['Zocdoc', 'conversation']]]
  ];

  var LOGO_URL = { 'laquan-smith': 'https://laquansmith.com', 'public-service': 'https://publicserv-ce.com', 'alaia': 'https://www.maison-alaia.com', 'chloe': 'https://www.chloe.com', 'global-fashion-collective': 'https://globalfashioncollective.com', 'eduardo-ramos': 'https://eduardo-ramos.com', 'richemont': 'https://www.richemont.com', 'cartier': 'https://www.cartier.com', 'montblanc': 'https://www.montblanc.com',
    'nickelodeon-universe': 'https://www.nickelodeonuniverse.com', 'six-flags': 'https://www.sixflags.com', 'dreamworks-water-park': 'https://www.americandream.com/venue/dreamworks-water-park', 'camelback-resort': 'https://www.camelbackresort.com', 'qiddiya': 'https://qiddiya.com',
    'yayoi': 'https://yayoi.beauty', 'goop': 'https://goop.com', 'goldwell': 'https://www.goldwell.com',
    'psg-academy': 'https://www.psg.fr/en/psg-academy', 'al-hilal': 'https://alhilal.com', 'al-ahli': 'https://www.alahlifc.sa', 'al-ittihad': 'https://ittihadclub.sa', 'nycfc': 'https://www.newyorkcityfc.com', 'fff-academy': 'https://fffacademy.com', 'real-murcia': 'https://www.realmurcia.es',
    'pace-university': 'https://www.pace.edu', 'harvard-university': 'https://www.harvard.edu', 'yale-yale-new-haven-health': 'https://www.yale.edu',
    'danone': 'https://www.danone.com', 'nespresso': 'https://www.nespresso.com', 'la-voglia': 'https://lavoglianyc.com',
    'vosita-healthcare': 'https://go.vosita.com', 'zocdoc': 'https://www.zocdoc.com',
    'new-york-fashion-week': 'https://nyfw.com', 'paris-fashion-week': 'https://fhcm.paris', 'milan-fashion-week': 'https://www.cameramoda.it', 'met-gala': 'https://www.metmuseum.org', 'perry-jones': 'https://perryjonesofficial.com', 'david-layer': 'https://david-layer.com', 'nolo': 'https://nolofashion.com', 'alex-s-yu': 'https://alexsyu.com', 'tess-mann-atelier': 'https://tessmannatelier.com', 'noe-bernacelli': 'https://noebernacelli.com', 'fashion-tv': 'https://www.fashiontv.com', 'dutchess-management': 'https://dmstrategic.com', 'wilson-model-management': 'https://wilsonmodelmgmt.com',
    'mescal-movie-set': 'https://mescalmovieset.com', 'monument-valley': 'https://navajonationparks.org', 'etoile-du-roy': 'https://etoile-du-roy.com', 'chateau-de-falaise': 'https://chateau-guillaume-leconquerant.fr', 'queens-theatre': 'https://www.queenstheatre.org', 'american-film-market': 'https://americanfilmmarket.com', 'berlinale': 'https://www.berlinale.de', 'festival-de-cannes': 'https://www.festival-cannes.com', 'cannes-lions': 'https://www.canneslions.com', 'dolby': 'https://www.dolby.com', 'red-sea-global': 'https://www.redseaglobal.com', 'sls-expo': 'https://saudilightandsoundexpo.com', 'saudi-capital-markets-forum': 'https://www.tadawulgroup.sa', 'saudi-entertainment-expo': 'https://saudientertainmentexpo.com', 'saudi-media-forum': 'https://saudimf.sa',
    'american-ballet-theatre': 'https://www.abt.org', 'echoing-green': 'https://echoinggreen.org', 'endeavor-global': 'https://endeavour-global.com', 'hmtc-of-nassau-county': 'https://hmtcli.org', 'misa': 'https://misa.gov.sa', 'pif': 'https://www.pif.gov.sa', 'tawuniya': 'https://www.tawuniya.com',
    'aveiro-maroc': 'https://www.aveiro-maroc.com', 'bachir': 'https://www.bachir.com', 'cote-d-or': 'https://www.cotedor.fr', 'isigny-sainte-mere': 'https://www.isigny-ste-mere.com' };

  var LOGO_INVERT = ['laquan-smith', 'eduardo-ramos', 'global-fashion-collective', 'la-voglia', 'perry-jones'];
  var SCORE = { client: 5, featured: 4, network: 3, relationship: 2, conversation: 1 };
  var VISIBILITY = { 'new-york-fashion-week': 5, 'paris-fashion-week': 5, 'milan-fashion-week': 5, 'met-gala': 5, 'perry-jones': 1, 'david-layer': 1, 'nolo': 1, 'alex-s-yu': 2, 'tess-mann-atelier': 2, 'noe-bernacelli': 2, 'fashion-tv': 3, 'dutchess-management': 1, 'wilson-model-management': 1,
    'mescal-movie-set': 2, 'monument-valley': 5, 'etoile-du-roy': 2, 'chateau-de-falaise': 3, 'american-ballet-theatre': 4, 'queens-theatre': 1, 'hmtc-of-nassau-county': 1, 'american-film-market': 3, 'berlinale': 5, 'festival-de-cannes': 5, 'cannes-lions': 4, 'dolby': 5, 'red-sea-global': 2, 'sls-expo': 1, 'saudi-capital-markets-forum': 2, 'saudi-entertainment-expo': 1, 'saudi-media-forum': 2,
    'echoing-green': 2, 'endeavor-global': 1, 'misa': 3, 'pif': 4, 'tawuniya': 2,
    'aveiro-maroc': 1, 'isigny-sainte-mere': 3, 'cote-d-or': 4, 'bachir': 2 };

  function slugOf(n) {
    return n.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
  }
  /**
   * Seeded pseudo-random generator (mulberry32), returning a function that yields
   * successive floats in [0, 1).
   *
   * The mosaic shuffles its tiles before packing them, and that shuffle has to be
   * *deterministic*: the layout is asked for again on every filter click, and the FLIP
   * animation measures each tile's old and new position by matching `data-tile`
   * keys across the two renders. With Math.random() the order would differ every
   * time, so tiles would appear to teleport instead of sliding, and returning to a
   * filter would never reproduce the arrangement the user just saw. Seeding by
   * sector index instead gives each filter one fixed, arbitrary-looking layout.
   *
   * The seed is first spread across the 32-bit range by Knuth's multiplicative
   * hash constant, so adjacent sector indices (0, 1, 2 …) don't yield similar
   * sequences.
   */
  function rng(seed) {
    var t = seed * 2654435761 + 1013904223;
    return function () {
      t += 0x6D2B79F5;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  var ALL = SECTORS.reduce(function (acc, s, si) {
    s[1].forEach(function (pair) {
      var slug = slugOf(pair[0]);
      acc.push({
        name: pair[0], rel: pair[1], si: si, slug: slug,
        src: '/assets/logos/' + slug + '.png',
        url: LOGO_URL[slug] || '#',
        filter: LOGO_INVERT.indexOf(slug) !== -1 ? 'invert(1)' : 'none'
      });
    });
    return acc;
  }, []);

  function sizeFor(t) { return t >= 8 ? [3, 2] : t > 6 ? [2, 2] : t >= 4 ? [2, 1] : [1, 1]; }
  function totalOf(n) { return SCORE[n.rel] + (VISIBILITY[n.slug] || 3); }

  var COLS = 6;

  function packMosaic(sector) {
    var visible = sector == null ? ALL.slice() : ALL.filter(function (n) { return n.si === sector; });
    var mrnd = rng(41 + (sector == null ? 0 : sector + 1));
    // deterministic shuffle
    for (var k = visible.length - 1; k > 0; k--) {
      var r = Math.floor(mrnd() * (k + 1));
      var t = visible[k]; visible[k] = visible[r]; visible[r] = t;
    }
    var tiles = visible.map(function (n) {
      var sz = sizeFor(totalOf(n));
      return Object.assign({}, n, { cs: sz[0], rs: sz[1] });
    });
    // Explicit dense-pack simulation (mirrors CSS grid-auto-flow:dense) so post-hoc hole
    // patches never shift other tiles. `cell` maps each grid cell (r * COLS + c) to the tile
    // covering it, so "is this cell free?" and "whose cell is it?" are both one lookup.
    var cell = [], rowFill = [], firstOpen = 0, maxRow = 0;
    var at = function (r, c) { return cell[r * COLS + c]; };
    var fits = function (r, c, cs, rs) {
      if (c + cs > COLS) return false;
      for (var dr = 0; dr < rs; dr++) for (var dc = 0; dc < cs; dc++) if (at(r + dr, c + dc)) return false;
      return true;
    };
    var place = function (m, r, c, cs, rs) {
      for (var dr = 0; dr < rs; dr++) {
        rowFill[r + dr] = (rowFill[r + dr] || 0) + cs;
        for (var dc = 0; dc < cs; dc++) cell[(r + dr) * COLS + c + dc] = m;
      }
    };
    tiles.forEach(function (m) {
      // First free slot, scanning left-to-right then down. A full row can't take any tile,
      // so the scan starts at the first row with room (the r > 200 guard is a runaway
      // backstop; a fitting slot always exists within a few rows).
      while (rowFill[firstOpen] === COLS) firstOpen++;
      var r, c;
      outer: for (r = firstOpen; ; r++) {
        for (c = 0; c <= COLS - m.cs; c++) { if (fits(r, c, m.cs, m.rs)) break outer; }
        if (r > 200) break;
      }
      place(m, r, c, m.cs, m.rs); m.row = r + 1; m.col = c + 1; maxRow = Math.max(maxRow, r + m.rs);
    });
    // Growing a tile by one column adds one cell per row it spans (and vice versa), so the
    // whole strip has to be free first and all of it has to be marked. The design marked
    // only the single hole being patched, which let a later tile land on top of one.
    var stripFree = function (r, c, rs, cs) { return r >= 0 && c >= 0 && fits(r, c, cs, rs); };
    var patchPass = function (capped) {
      var patchedAny = false;
      for (var r = 0; r < maxRow; r++) {
        for (var c = 0; c < COLS; c++) {
          if (at(r, c)) continue;
          var left = c > 0 ? at(r, c - 1) : null;
          if (left && left.col - 1 + left.cs === c && (!capped || left.cs < 3) && stripFree(left.row - 1, c, left.rs, 1)) { left.cs += 1; place(left, left.row - 1, c, 1, left.rs); patchedAny = true; continue; }
          var above = r > 0 ? at(r - 1, c) : null;
          if (above && above.row - 1 + above.rs === r && (!capped || above.rs < 2) && stripFree(r, above.col - 1, 1, above.cs)) { above.rs += 1; place(above, r, above.col - 1, above.cs, 1); patchedAny = true; continue; }
          var right = c < COLS - 1 ? at(r, c + 1) : null;
          if (right && right.col - 1 === c + 1 && (!capped || right.cs < 3) && stripFree(right.row - 1, c, right.rs, 1)) { right.col -= 1; right.cs += 1; place(right, right.row - 1, c, 1, right.rs); patchedAny = true; continue; }
          var below = at(r + 1, c);
          if (below && below.row - 1 === r + 1 && (!capped || below.rs < 2) && stripFree(r, below.col - 1, 1, below.cs)) { below.row -= 1; below.rs += 1; place(below, r, below.col - 1, below.cs, 1); patchedAny = true; continue; }
        }
      }
      return patchedAny;
    };
    while (patchPass(true)) {}
    while (patchPass(false)) {}
    return tiles;
  }

  // A filter always packs to the same layout, so each one is packed once and reused.
  var mosaicCache = {};
  function computeMosaic(sector) {
    var k = sector == null ? 'all' : String(sector);
    if (!mosaicCache[k]) mosaicCache[k] = Object.freeze(packMosaic(sector).map(Object.freeze));
    return mosaicCache[k];
  }

  function networkBind() {
    var host = document.querySelector('.network-mosaic');
    if (!host) return;
    var sector = null;
    var flipRects = null;
    // Logos that failed to load: later renders set the name in type straight away instead
    // of requesting the missing file again on every filter click.
    var failed = {};

    function nameTag(m) {
      var t = document.createElement('span');
      t.className = 'net-tile-name';
      t.textContent = m.name;
      return t;
    }

    function tileFor(m) {
      var a = document.createElement('a');
      a.className = 'net-tile';
      a.setAttribute('data-tile', m.slug);
      a.href = m.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.setAttribute('aria-label', m.name);
      a.style.gridColumn = m.col + ' / span ' + m.cs;
      a.style.gridRow = m.row + ' / span ' + m.rs;
      var inner = document.createElement('div');
      inner.className = 'net-tile-inner';
      if (m.filter !== 'none') inner.style.filter = m.filter;
      if (failed[m.slug]) {
        inner.appendChild(nameTag(m));
      } else {
        var img = document.createElement('img');
        img.alt = m.name;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.src = m.src;
        // A logo that fails to load falls back to the brand name rather than a broken icon.
        img.addEventListener('error', function () {
          failed[m.slug] = true;
          if (img.parentNode === inner) inner.replaceChild(nameTag(m), img);
        });
        inner.appendChild(img);
      }
      a.appendChild(inner);
      return a;
    }

    function render() {
      var frag = document.createDocumentFragment();
      computeMosaic(sector).forEach(function (m) { frag.appendChild(tileFor(m)); });
      host.replaceChildren(frag);
    }

    function flipSnap() {
      var map = {};
      host.querySelectorAll('[data-tile]').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.width) map[el.getAttribute('data-tile')] = r;
      });
      flipRects = map;
    }

    function flipPlay() {
      var prev = flipRects;
      if (!prev) return;
      flipRects = null;
      if (reducedMotion()) return;
      var ease = 'cubic-bezier(.16,1,.3,1)';
      var els = Array.prototype.slice.call(host.querySelectorAll('[data-tile]'));
      // Measure every new box before writing any style: interleaving the two would force
      // a style recalculation for each tile.
      var rects = els.map(function (el) { return el.getBoundingClientRect(); });
      var moves = [];
      els.forEach(function (el, i) {
        var r = rects[i], p = prev[el.getAttribute('data-tile')];
        el.style.transition = 'none';
        el.style.willChange = 'transform';
        if (p) {
          // .net-tile scales from its top-left corner, so translating by the corner offset
          // and scaling by the size ratio puts it exactly back on its old box.
          var sx = p.width / r.width, sy = p.height / r.height;
          el.style.transform = 'translate(' + (p.left - r.left) + 'px,' + (p.top - r.top) + 'px) scale(' + sx + ',' + sy + ')';
          moves.push([el, 0]);
        } else {
          // A tile entering the filter grows in from 70% about its centre: (1 - .7) / 2 = 15%.
          el.style.transform = 'translate(15%,15%) scale(.7)';
          el.style.opacity = '0';
          moves.push([el, 220 + i * 22]);
        }
        var inner = el.firstElementChild;
        if (inner) inner.style.transition = 'none';
      });
      void document.body.offsetHeight;
      requestAnimationFrame(function () {
        moves.forEach(function (mv) {
          var el = mv[0], d = mv[1];
          el.style.transition = 'transform .85s ' + ease + ' ' + d + 'ms, opacity .6s ' + ease + ' ' + d + 'ms, background-color .5s';
          el.style.transform = '';
          el.style.opacity = '';
          var inner = el.firstElementChild;
          if (inner) inner.style.transition = '';
          // Only the tile's own transform transition ends the move: opacity finishes sooner,
          // and transitions on .net-tile-inner bubble up here too.
          // Hiding the tab mid-move cancels the transition rather than ending it.
          var done = function (e) {
            if (e.target !== el || e.propertyName !== 'transform') return;
            el.style.transition = '';
            el.style.willChange = '';
            el.removeEventListener('transitionend', done);
            el.removeEventListener('transitioncancel', done);
          };
          el.addEventListener('transitionend', done);
          el.addEventListener('transitioncancel', done);
        });
      });
    }

    document.querySelectorAll('.legend-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        var v = pill.getAttribute('data-sector');
        var next = v === 'all' ? null : parseInt(v, 10);
        flipSnap();
        sector = (sector === next) ? null : next;
        document.querySelectorAll('.legend-pill').forEach(function (p) {
          var pv = p.getAttribute('data-sector');
          var pn = pv === 'all' ? null : parseInt(pv, 10);
          p.setAttribute('aria-pressed', pn === sector ? 'true' : 'false');
        });
        render();
        flipPlay();
      });
    });

    // The Network tab starts hidden, so the mosaic is only built when it is first shown.
    var built = false;
    ensureNetwork = function () {
      if (built) return;
      built = true;
      render();
    };
    if (currentTab() === 'network') ensureNetwork();
  }

  /* ---------- Init ---------- */

  function init() {
    tabsBind();
    teamBind();
    networkBind();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
