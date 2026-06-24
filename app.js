/* ============================================================
   xpong — app.js
   i18n engine + chrome (header/footer) + theme + nav
   ============================================================ */
(function () {
  'use strict';

  var XP_VERSION = 's04';
  var XP_VERSION_DATE = '24 Jun 2026';

  // Nav model (shared across pages). soon=true -> disabled, coming-soon badge
  var NAV = [
    { id: 'home',      href: 'index.html',     key: 'nav_home' },
    { id: 'game',      href: 'game.html',      key: 'nav_game',      soon: true },
    { id: 'xray',      href: 'xray.html',      key: 'nav_xray',      soon: true },
    { id: 'stab',      href: 'stab.html',      key: 'nav_stab',      soon: true },
    { id: 'evolution', href: 'evolution.html', key: 'nav_evolution', soon: true }
  ];

  // UI languages (dropdown order). sr renders from sr.cyr
  var LANGS = [
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
    { code: 'it', label: 'IT' },
    { code: 'hr', label: 'HR' },
    { code: 'sr', label: 'SR' }
  ];

  // Translations. sr nested by script so sr.lat can be added additively later.
  var T = {
    en: {
      lab: 'Reinforcement Learning Lab',
      tagline: 'Training AI agents to play Pong — with the lights on.',
      hero_desc: 'xpong is a browser lab for reinforcement learning, built page by page as a window into how an agent learns. Classic Pong first; then the inner state made visible.',
      nav_home: 'Home', nav_game: 'The Game', nav_xray: 'X-Ray',
      nav_stab: 'Stabilization', nav_evolution: 'Evolution',
      soon: 'coming soon',
      footer: 'xpong · an X-Ray project · Flavio &amp; Claude'
    },
    de: {
      lab: 'Reinforcement Learning Lab',
      tagline: 'KI-Agenten lernen Pong — bei eingeschaltetem Licht.',
      hero_desc: 'xpong ist ein Browser-Labor für Reinforcement Learning, Seite für Seite gebaut als Fenster in das Lernen eines Agenten. Zuerst klassisches Pong; dann der innere Zustand, sichtbar gemacht.',
      nav_home: 'Start', nav_game: 'Das Spiel', nav_xray: 'X-Ray',
      nav_stab: 'Stabilisierung', nav_evolution: 'Evolution',
      soon: 'in Kürze',
      footer: 'xpong · ein X-Ray-Projekt · Flavio &amp; Claude'
    },
    it: {
      lab: 'Reinforcement Learning Lab',
      tagline: 'Addestrare agenti IA a giocare a Pong — a luci accese.',
      hero_desc: 'xpong è un laboratorio nel browser per il reinforcement learning, costruito pagina per pagina come una finestra su come un agente impara. Prima il Pong classico; poi lo stato interno reso visibile.',
      nav_home: 'Home', nav_game: 'Il gioco', nav_xray: 'X-Ray',
      nav_stab: 'Stabilizzazione', nav_evolution: 'Evoluzione',
      soon: 'in arrivo',
      footer: 'xpong · un progetto X-Ray · Flavio &amp; Claude'
    },
    hr: {
      lab: 'Reinforcement Learning Lab',
      tagline: 'Treniranje AI agenata za Pong — uz upaljena svjetla.',
      hero_desc: 'xpong je laboratorij u pregledniku za reinforcement learning, građen stranicu po stranicu kao prozor u to kako agent uči. Najprije klasični Pong; zatim unutarnje stanje učinjeno vidljivim.',
      nav_home: 'Početna', nav_game: 'Igra', nav_xray: 'X-Ray',
      nav_stab: 'Stabilizacija', nav_evolution: 'Evolucija',
      soon: 'uskoro',
      footer: 'xpong · X-Ray projekt · Flavio &amp; Claude'
    },
    sr: {
      cyr: {
        lab: 'Reinforcement Learning Lab',
        tagline: 'Тренирање AI агената да играју Понг — уз упаљено светло.',
        hero_desc: 'xpong је лабораторија у прегледачу за reinforcement learning, грађена страницу по страницу као прозор у то како агент учи. Прво класични Понг; затим унутрашње стање учињено видљивим.',
        nav_home: 'Почетна', nav_game: 'Игра', nav_xray: 'X-Ray',
        nav_stab: 'Стабилизација', nav_evolution: 'Еволуција',
        soon: 'ускоро',
        footer: 'xpong · X-Ray пројекат · Flavio &amp; Claude'
      }
    }
  };

  function dict(lang) { return lang === 'sr' ? T.sr.cyr : (T[lang] || T.en); }
  function getLang() { var l = localStorage.getItem('xpong_lang'); return T[l] ? l : 'en'; }
  function t(key, lang) {
    var d = dict(lang || getLang());
    if (d && d[key] != null) return d[key];
    return T.en[key] != null ? T.en[key] : key;
  }

  function applyI18n() {
    var lang = getLang();
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'), lang);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'), lang);
    });
  }

  function getTheme() { return localStorage.getItem('xpong_theme') || 'light'; }
  function applyTheme() { document.documentElement.setAttribute('data-theme', getTheme()); }
  function updateThemeIcon() {
    var b = document.getElementById('xp-theme-toggle');
    if (b) b.textContent = getTheme() === 'dark' ? '☀' : '🌙';
  }
  function toggleTheme() {
    localStorage.setItem('xpong_theme', getTheme() === 'dark' ? 'light' : 'dark');
    applyTheme(); updateThemeIcon();
  }

  function pageId() { return document.body.getAttribute('data-page') || 'home'; }

  function buildHeader() {
    var host = document.getElementById('xp-header');
    if (!host) return;
    var cur = pageId(), lang = getLang();
    var navLinks = NAV.map(function (n) {
      var label = t(n.key, lang);
      if (n.soon) {
        return '<a class="xp-nav-link xp-btn-disabled" title="' + t('soon', lang) + '">' +
               label + ' <span class="xp-badge xp-badge-coming-soon">' + t('soon', lang) + '</span></a>';
      }
      return '<a class="xp-nav-link' + (n.id === cur ? ' active' : '') + '" href="' + n.href + '">' + label + '</a>';
    }).join('');
    var opts = LANGS.map(function (l) {
      return '<option value="' + l.code + '"' + (l.code === lang ? ' selected' : '') + '>' + l.label + '</option>';
    }).join('');
    host.innerHTML =
      '<div id="xp-header-inner">' +
        '<a id="xp-logo" href="index.html">xpong</a>' +
        '<button id="xp-burger" aria-label="menu">☰</button>' +
        '<nav id="xp-nav">' + navLinks + '</nav>' +
        '<div id="xp-header-controls">' +
          '<select id="xp-lang-select" aria-label="language">' + opts + '</select>' +
          '<button id="xp-theme-toggle" aria-label="theme"></button>' +
        '</div>' +
      '</div>';
    document.getElementById('xp-lang-select').addEventListener('change', function (e) {
      localStorage.setItem('xpong_lang', e.target.value); render();
    });
    document.getElementById('xp-theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('xp-burger').addEventListener('click', function () {
      document.getElementById('xp-nav').classList.toggle('open');
    });
    updateThemeIcon();
  }

  function buildFooter() {
    var host = document.getElementById('xp-footer');
    if (host) host.innerHTML = '<span data-i18n-html="footer"></span> · ' + XP_VERSION + ' (' + XP_VERSION_DATE + ')';
  }

  function renderConcepts() {
    var page = document.body.getAttribute('data-page');
    if (!page) return;
    var footer = document.getElementById('xp-footer');
    if (!footer) return;
    var existing = document.getElementById('xp-key-concepts');
    if (existing) existing.remove();
    fetch('data/concepts.json?t=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var concepts = data[page];
        if (!concepts || !concepts.length) return;
        var section = document.createElement('section');
        section.id = 'xp-key-concepts';
        var title = document.createElement('h2');
        title.className = 'xp-concepts-title';
        title.textContent = 'Key Concepts';
        section.appendChild(title);
        var grid = document.createElement('div');
        grid.className = 'xp-concepts-grid';
        concepts.forEach(function (c) {
          var card = document.createElement('div');
          card.className = 'xp-concept-card';
          card.innerHTML =
            '<span class="xp-concept-icon">' + c.icon + '</span>' +
            '<div class="xp-concept-body">' +
              '<a class="xp-concept-name" href="https://en.wikipedia.org/wiki/' + c.wiki + '" target="_blank" rel="noopener">' + c.name + '</a>' +
              '<span class="xp-concept-desc">' + c.description + '</span>' +
            '</div>';
          grid.appendChild(card);
        });
        section.appendChild(grid);
        footer.parentNode.insertBefore(section, footer);
      })
      .catch(function () {});
  }

  function render() { buildHeader(); buildFooter(); applyI18n(); renderConcepts(); }

  function injectFavicon() {
    var l = document.createElement('link');
    l.rel = 'icon'; l.type = 'image/svg+xml'; l.href = 'favicon.svg';
    document.head.appendChild(l);
  }

  injectFavicon();
  applyTheme();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else { render(); }

  window.xpong = { t: t, getLang: getLang, render: render };
})();
