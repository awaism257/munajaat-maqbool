/* Munajaat Maqbool — PWA */
(function () {
  'use strict';

  /* ================= State & persistence ================= */
  var LS = {
    get: function (k, d) {
      try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); }
      catch (e) { return d; }
    },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  var settings = LS.get('mm_settings', null);
  if (!settings) {
    settings = { showUrdu: false, showEnglish: true, dark: null }; // dark null = follow system
  }
  if (typeof settings.showUrdu !== 'boolean') settings.showUrdu = false;
  if (typeof settings.showEnglish !== 'boolean') settings.showEnglish = true;
  if (typeof settings.fontArabic !== 'number') settings.fontArabic = 1;
  if (typeof settings.fontText !== 'number') settings.fontText = 1;
  if (typeof settings.lineArabic !== 'number') settings.lineArabic = 1;
  if (typeof settings.showTransliteration !== 'boolean') settings.showTransliteration = false;
  if (typeof settings.fontTranslit !== 'number') settings.fontTranslit = 1;
  var bookmarks = LS.get('mm_bookmarks', {}); // key `${dayId}:${n}` -> true

  var DATA = null; // munajaat.json content
  var dayById = {};

  function saveSettings() { LS.set('mm_settings', settings); }
  function saveBookmarks() { LS.set('mm_bookmarks', bookmarks); }

  /* ================= Theme ================= */
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function applyTheme() {
    var dark = settings.dark === null ? (mq ? mq.matches : false) : settings.dark;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    var mc = document.querySelector('meta[name="theme-color"]');
    if (mc) mc.setAttribute('content', dark ? '#101613' : '#1B5E20');
  }
  if (mq && mq.addEventListener) mq.addEventListener('change', function () { if (settings.dark === null) applyTheme(); });

  /* ================= Font scaling ================= */
  function applyFontScale() {
    var st = document.documentElement.style;
    st.setProperty('--arabic-scale', settings.fontArabic);
    st.setProperty('--text-scale', settings.fontText);
    st.setProperty('--arabic-lh', settings.lineArabic);
    st.setProperty('--translit-scale', settings.fontTranslit);
  }

  /* ================= Helpers ================= */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function esc(s) { return String(s == null ? '' : s); }

  // Arabic/Urdu normalization (port of Android app logic). Never applied to display text.
  function normalize(s) {
    if (!s) return '';
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      var ch = s[i];
      if ((c >= 0x064B && c <= 0x065A) || (c >= 0x06D6 && c <= 0x06ED) || c === 0x0670 || c === 0x0640) continue;
      if (ch === 'أ' || ch === 'إ' || ch === 'آ' || ch === 'ٱ') ch = 'ا';
      else if (ch === 'ة') ch = 'ه';
      else if (ch === 'ى' || ch === 'ی' || ch === 'ے') ch = 'ي';
      else if (ch === 'ک') ch = 'ك';
      else if (ch === 'ہ' || ch === 'ھ' || ch === 'ۃ') ch = 'ه';
      else if (ch === 'ؤ') ch = 'و';
      else if (ch === 'ئ') ch = 'ي';
      out += ch;
    }
    return out;
  }

  var ICONS = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    bookmarkOutline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
    bookmarkFilled: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
  };
  function iconBtn(name, label, extraCls) {
    var b = el('button', 'icon-btn' + (extraCls ? ' ' + extraCls : ''));
    b.type = 'button';
    b.innerHTML = ICONS[name];
    b.setAttribute('aria-label', label);
    b.title = label;
    return b;
  }

  var toastTimer = null;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 1800);
  }

  function copyText(text) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      toast(ok ? 'Copied' : 'Copy failed');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Copied'); }, fallback);
    } else fallback();
  }

  // Share button: opens the native share sheet on phones (which itself
  // includes a Copy option); falls back to plain copy on desktop browsers.
  function shareText(text) {
    if (navigator.share) {
      navigator.share({ text: text }).catch(function () { /* user dismissed */ });
    } else {
      copyText(text);
    }
  }

  function bmKey(dayId, n) { return dayId + ':' + n; }
  function isBookmarked(dayId, n) { return !!bookmarks[bmKey(dayId, n)]; }
  function toggleBookmark(dayId, n, btn) {
    var k = bmKey(dayId, n);
    if (bookmarks[k]) delete bookmarks[k]; else bookmarks[k] = true;
    saveBookmarks();
    if (btn) {
      btn.innerHTML = isBookmarked(dayId, n) ? ICONS.bookmarkFilled : ICONS.bookmarkOutline;
      btn.classList.toggle('gold', isBookmarked(dayId, n));
      btn.setAttribute('aria-pressed', isBookmarked(dayId, n) ? 'true' : 'false');
    }
    toast(isBookmarked(dayId, n) ? 'Bookmarked' : 'Bookmark removed');
  }

  function snippet(s, len) {
    s = esc(s).trim().replace(/\s+/g, ' ');
    return s.length > (len || 90) ? s.slice(0, len || 90).trim() + '…' : s;
  }

  /* ================= View builders ================= */
  var app = document.getElementById('app');

  function makeTopbar(title, showBack) {
    var bar = el('div', 'topbar');
    if (showBack) {
      var back = iconBtn('back', 'Back');
      back.addEventListener('click', function () {
        // Back always returns to the home screen (days list).
        location.hash = '#/';
      });
      bar.appendChild(back);
    }
    bar.appendChild(el('div', 'title', title));
    var row = el('div', 'icon-row');
    var s = iconBtn('search', 'Search');
    s.addEventListener('click', function () { location.hash = '#/search'; });
    var b = iconBtn('bookmarkOutline', 'Bookmarks');
    b.addEventListener('click', function () { location.hash = '#/bookmarks'; });
    var g = iconBtn('settings', 'Settings');
    g.addEventListener('click', function () { location.hash = '#/settings'; });
    row.appendChild(s); row.appendChild(b); row.appendChild(g);
    bar.appendChild(row);
    bar.appendChild(el('div', 'divider'));
    return bar;
  }

  function renderHome() {
    var w = el('div', 'wrap');
    var h = el('header', 'home-header');
    var row = el('div');
    row.style.display = 'flex'; row.style.alignItems = 'flex-start';
    var txt = el('div');
    txt.appendChild(el('h1', null, 'Munajaat Maqbool'));
    txt.appendChild(el('div', 'subtitle', 'The Accepted Whispers'));
    row.appendChild(txt);
    var icons = el('div', 'icon-row');
    var s = iconBtn('search', 'Search'); s.addEventListener('click', function () { location.hash = '#/search'; });
    var b = iconBtn('bookmarkOutline', 'Bookmarks'); b.addEventListener('click', function () { location.hash = '#/bookmarks'; });
    var g = iconBtn('settings', 'Settings'); g.addEventListener('click', function () { location.hash = '#/settings'; });
    icons.appendChild(s); icons.appendChild(b); icons.appendChild(g);
    row.appendChild(icons);
    h.appendChild(row);
    h.appendChild(el('div', 'divider'));
    w.appendChild(h);

    DATA.days.forEach(function (d) {
      var a = el('a', 'card day-card');
      a.href = '#/day/' + d.id;
      var info = el('div');
      info.appendChild(el('div', 'day-title', d.title));
      info.appendChild(el('div', 'day-count', d.items.length + (d.items.length === 1 ? ' dua' : ' duas')));
      a.appendChild(info);
      a.appendChild(el('span', 'chevron', '›'));
      w.appendChild(a);
    });

    var cred = el('a', 'card day-card');
    cred.href = '#/credits';
    var ci = el('div');
    ci.appendChild(el('div', 'day-title', 'Credits'));
    cred.appendChild(ci);
    cred.appendChild(el('span', 'chevron', '›'));
    w.appendChild(cred);
    return w;
  }

  function buildDuaCard(day, item) {
    var card = el('div', 'card dua-card');
    card.id = 'item-' + item.n;

    var head = el('div', 'dua-head');
    head.appendChild(el('span', 'num-badge', String(item.n)));
    var actions = el('div', 'dua-actions');
    var cp = iconBtn('copy', 'Share or copy dua', 'small');
    cp.addEventListener('click', function () {
      var parts = [];
      if (item.arabic) parts.push(item.arabic);
      if (settings.showTransliteration && item.transliteration) parts.push(item.transliteration);
      if (settings.showUrdu && item.urdu) parts.push(item.urdu);
      if (settings.showEnglish && item.english) parts.push(item.english);
      var fns = (item.footnotes || []).filter(function (f) { return f && f.trim(); });
      if (fns.length) parts.push('Reference:\n' + fns.join('\n'));
      shareText(parts.join('\n\n'));
    });
    var bmState = isBookmarked(day.id, item.n);
    var bm = iconBtn(bmState ? 'bookmarkFilled' : 'bookmarkOutline', 'Bookmark dua', 'small' + (bmState ? ' gold' : ''));
    bm.setAttribute('aria-pressed', bmState ? 'true' : 'false');
    bm.addEventListener('click', function () { toggleBookmark(day.id, item.n, bm); });
    actions.appendChild(cp); actions.appendChild(bm);
    head.appendChild(actions);
    card.appendChild(head);

    if (item.arabic) card.appendChild(el('div', 'arabic', item.arabic)).setAttribute('dir', 'rtl');
    if (settings.showTransliteration && item.transliteration) card.appendChild(el('div', 'transliteration', item.transliteration));
    if (settings.showUrdu && item.urdu) card.appendChild(el('div', 'urdu', item.urdu)).setAttribute('dir', 'rtl');
    if (settings.showEnglish && item.english) card.appendChild(el('div', 'english', item.english));

    var fns = (item.footnotes || []).filter(function (f) { return f && f.trim(); });
    if (fns.length) {
      var tog = el('button', 'ref-toggle');
      tog.type = 'button';
      tog.setAttribute('aria-expanded', 'false');
      tog.innerHTML = '<span class="tri">▶</span><span>Reference</span>';
      var body = el('div', 'ref-body', fns.join('\n'));
      tog.addEventListener('click', function () {
        var open = body.classList.toggle('open');
        tog.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      card.appendChild(tog);
      card.appendChild(body);
    }
    return card;
  }

  function renderDay(id, scrollTo) {
    var day = dayById[id];
    var w = el('div', 'wrap');
    if (!day) {
      w.appendChild(makeTopbar('Not found', true));
      w.appendChild(el('div', 'empty', 'Day not found.'));
      return w;
    }
    w.appendChild(makeTopbar(day.title, true));
    day.items.forEach(function (item) { w.appendChild(buildDuaCard(day, item)); });
    if (scrollTo) {
      setTimeout(function () {
        var t = document.getElementById('item-' + scrollTo);
        if (t) t.scrollIntoView({ block: 'start' });
      }, 50);
    }
    return w;
  }

  function renderSearch() {
    var w = el('div', 'wrap');
    w.appendChild(makeTopbar('Search', true));
    var input = el('input', 'search-input');
    input.type = 'search';
    input.placeholder = 'Search duas…';
    input.setAttribute('aria-label', 'Search duas');
    w.appendChild(input);
    var results = el('div');
    w.appendChild(results);

    var pending = sessionStorage.getItem('mm_search_q') || '';
    input.value = pending;

    function run() {
      var q = input.value;
      sessionStorage.setItem('mm_search_q', q);
      results.innerHTML = '';
      if (!q.trim()) return;
      var ql = q.toLowerCase();
      var qn = normalize(q);
      var count = 0;
      DATA.days.forEach(function (d) {
        d.items.forEach(function (item) {
          var match =
            (item.english && item.english.toLowerCase().indexOf(ql) !== -1) ||
            (qn && (normalize(item.arabic).indexOf(qn) !== -1 || normalize(item.urdu).indexOf(qn) !== -1));
          if (!match) return;
          count++;
          var c = el('div', 'card result-card');
          c.setAttribute('role', 'button');
          c.tabIndex = 0;
          c.appendChild(el('div', 'r-meta', d.title + ' — Dua ' + item.n));
          c.appendChild(el('div', 'r-snippet', snippet(item.english || item.arabic, 110)));
          function go() { location.hash = '#/day/' + d.id + '/' + item.n; }
          c.addEventListener('click', go);
          c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
          results.appendChild(c);
        });
      });
      if (!count) results.appendChild(el('div', 'empty', 'No results found.'));
    }
    input.addEventListener('input', run);
    run();
    setTimeout(function () { input.focus(); }, 50);
    return w;
  }

  function renderBookmarks() {
    var w = el('div', 'wrap');
    w.appendChild(makeTopbar('Bookmarks', true));
    var any = false;
    DATA.days.forEach(function (d) {
      d.items.forEach(function (item) {
        if (!isBookmarked(d.id, item.n)) return;
        any = true;
        var c = el('div', 'card result-card');
        c.setAttribute('role', 'button');
        c.tabIndex = 0;
        c.appendChild(el('div', 'r-meta', d.title + ' — Dua ' + item.n));
        c.appendChild(el('div', 'r-snippet', snippet(item.english || item.arabic, 110)));
        function go() { location.hash = '#/day/' + d.id + '/' + item.n; }
        c.addEventListener('click', go);
        c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
        w.appendChild(c);
      });
    });
    if (!any) w.appendChild(el('div', 'empty', 'No bookmarks yet. Tap the bookmark icon on any dua to save it here.'));
    return w;
  }

  function renderSettings() {
    var w = el('div', 'wrap');
    w.appendChild(makeTopbar('Settings', true));
    var card = el('div', 'card');

    function row(labelText, checked, onChange, note) {
      var r = el('div', 'setting-row');
      var l = el('label', null, labelText);
      var sw = el('span', 'switch');
      var inp = document.createElement('input');
      inp.type = 'checkbox';
      inp.checked = checked;
      inp.setAttribute('aria-label', labelText);
      var track = el('span', 'track');
      sw.appendChild(inp); sw.appendChild(track);
      inp.addEventListener('change', function () { onChange(inp.checked); });
      r.appendChild(l); r.appendChild(sw);
      if (note) l.appendChild(el('div', 'day-count', note));
      return r;
    }

    card.appendChild(row('Show Urdu translation', settings.showUrdu, function (v) {
      settings.showUrdu = v; saveSettings();
    }));
    card.appendChild(row('Show English translation', settings.showEnglish, function (v) {
      settings.showEnglish = v; saveSettings();
    }));
    card.appendChild(row('Show transliteration', settings.showTransliteration, function (v) {
      settings.showTransliteration = v; saveSettings();
    }));
    card.appendChild(row('Dark theme', settings.dark === null ? (mq && mq.matches) : settings.dark, function (v) {
      settings.dark = v; saveSettings(); applyTheme();
    }, settings.dark === null ? 'Following system theme' : null));

    function sliderRow(labelText, key, min, max) {
      var r = el('div', 'setting-row setting-slider');
      var head = el('div', 'slider-head');
      var l = el('label', null, labelText);
      var val = el('span', 'slider-val', Math.round(settings[key] * 100) + '%');
      head.appendChild(l); head.appendChild(val);
      var inp = document.createElement('input');
      inp.type = 'range';
      inp.min = String(min == null ? 0.8 : min); inp.max = String(max == null ? 1.6 : max); inp.step = '0.05';
      inp.value = String(settings[key]);
      inp.setAttribute('aria-label', labelText);
      inp.addEventListener('input', function () {
        settings[key] = parseFloat(inp.value);
        val.textContent = Math.round(settings[key] * 100) + '%';
        saveSettings(); applyFontScale();
      });
      r.appendChild(head); r.appendChild(inp);
      return r;
    }

    card.appendChild(sliderRow('Arabic text size', 'fontArabic'));
    card.appendChild(sliderRow('Translation text size', 'fontText'));
    card.appendChild(sliderRow('Arabic line spacing', 'lineArabic'));
    card.appendChild(sliderRow('Transliteration text size', 'fontTranslit'));
    w.appendChild(card);
    w.appendChild(el('div', 'empty', 'Language changes apply when you reopen a day.'));
    return w;
  }

  function renderCredits() {
    var w = el('div', 'wrap');
    w.appendChild(makeTopbar('Credits', true));

    /* Header card */
    var head = el('div', 'card credits about-head');
    var t = el('h2', null, 'Munajaat Maqbool');
    t.style.fontFamily = "Georgia, 'Times New Roman', serif";
    t.style.color = 'var(--primary)';
    head.appendChild(t);
    head.appendChild(el('p', 'about-tagline', 'Free · No ads · No sign-in · No tracking · Offline'));
    var site = el('a', 'about-site', 'munajaat-maqbool.netlify.app');
    site.href = 'https://munajaat-maqbool.netlify.app';
    head.appendChild(site);
    w.appendChild(head);

    /* Texts & licences card */
    var texts = el('div', 'card credits');
    texts.appendChild(el('div', 'about-heading', 'TEXTS & LICENCES'));
    var rows = [
      ['Original work', 'Munajaat-e-Maqbool by Mawlana Ashraf Ali Thanawi (rahimahullah) — public domain'],
      ["Qur'anic supplications", 'ClearQuran translation by Dr. Talal Itani (clearquran.com) — CC BY-ND 4.0'],
      ['Other supplications', 'Fresh plain-English translation in the ClearQuran register, reviewed against the Urdu translation']
    ];
    rows.forEach(function (r) {
      var row = el('div', 'about-row');
      row.appendChild(el('span', 'about-label', r[0]));
      row.appendChild(el('span', 'about-value', r[1]));
      texts.appendChild(row);
    });
    w.appendChild(texts);

    /* Fonts card */
    var fonts = el('div', 'card credits');
    fonts.appendChild(el('div', 'about-heading', 'FONTS'));
    fonts.appendChild(el('p', null, 'Digital Khatt IndoPak (© 2024-2025 Amine Anane, Tarteel Inc.) · Amiri · Noto Nastaliq Urdu — SIL Open Font License'));
    w.appendChild(fonts);

    /* Support card */
    var support = el('div', 'card credits support-box');
    support.appendChild(el('h3', null, 'Support this app'));
    support.appendChild(el('p', null, 'Munajaat Maqbool is free and contains no adverts. If it has benefited you, you can leave a small tip towards hosting and development costs — entirely optional.'));
    var link = el('a', 'support-btn', '♥ Leave a tip on Ko-fi');
    link.href = 'https://ko-fi.com/awaismahmood257';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    support.appendChild(link);
    w.appendChild(support);

    /* Footer lines */
    w.appendChild(el('p', 'about-foot', 'Compiled by Awais Mahmood with the help of Kimi K3 AI.'));
    var free = el('p', 'about-foot about-gold', 'Distributed free of charge.');
    w.appendChild(free);
    return w;
  }

  function renderError(msg) {
    var w = el('div', 'wrap');
    var h = el('header', 'home-header');
    h.appendChild(el('h1', null, 'Munajaat Maqbool'));
    h.appendChild(el('div', 'divider'));
    w.appendChild(h);
    var box = el('div', 'error-box');
    box.appendChild(el('strong', null, 'Unable to load content.'));
    box.appendChild(el('p', null, msg));
    w.appendChild(box);
    return w;
  }

  /* ================= Router ================= */
  function route() {
    if (!DATA) return;
    var hash = location.hash || '#/';
    var parts = hash.replace(/^#\//, '').split('/').filter(Boolean);
    var view;
    if (parts.length === 0) view = renderHome();
    else if (parts[0] === 'day' && parts[1]) view = renderDay(parts[1], parts[2] ? parseInt(parts[2], 10) : null);
    else if (parts[0] === 'search') view = renderSearch();
    else if (parts[0] === 'bookmarks') view = renderBookmarks();
    else if (parts[0] === 'settings') view = renderSettings();
    else if (parts[0] === 'credits') view = renderCredits();
    else view = renderHome();
    app.innerHTML = '';
    app.appendChild(view);
    if (!(parts[0] === 'day' && parts[2])) window.scrollTo(0, 0);
  }

  /* ================= iOS hint banner ================= */
  function maybeShowIOSBanner() {
    try {
      var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      var standalone = window.navigator.standalone === true ||
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
      if (isIOS && !standalone && !LS.get('mm_ios_banner_dismissed', false)) {
        var banner = document.getElementById('ios-banner');
        banner.hidden = false;
        document.getElementById('ios-banner-close').addEventListener('click', function () {
          banner.hidden = true;
          LS.set('mm_ios_banner_dismissed', true);
        });
      }
    } catch (e) {}
  }

  function maybeShowAndroidBanner() {
    try {
      var isAndroid = /android/i.test(navigator.userAgent);
      var standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
      if (!isAndroid || standalone || LS.get('mm_android_banner_dismissed', false)) return;
      var banner = document.getElementById('android-banner');
      if (!banner) return;
      var installBtn = document.getElementById('android-install');
      if (deferredInstallPrompt) {
        // Native one-tap install is available (Chrome/Edge on Android)
        document.getElementById('android-banner-text').textContent =
          'Install this app on your device for the full experience.';
        installBtn.hidden = false;
        installBtn.addEventListener('click', function () {
          deferredInstallPrompt.prompt();
          deferredInstallPrompt.userChoice.finally(function () {
            deferredInstallPrompt = null;
            banner.hidden = true;
          });
        });
      }
      banner.hidden = false;
      document.getElementById('android-banner-close').addEventListener('click', function () {
        banner.hidden = true;
        LS.set('mm_android_banner_dismissed', true);
      });
    } catch (e) {}
  }

  var deferredInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredInstallPrompt = e;
    maybeShowAndroidBanner();
  });
  window.addEventListener('appinstalled', function () {
    var banner = document.getElementById('android-banner');
    if (banner) banner.hidden = true;
  });

  /* ================= Boot ================= */
  applyTheme();
  applyFontScale();
  maybeShowIOSBanner();
  maybeShowAndroidBanner();

  fetch('assets/munajaat.json')
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      DATA = data;
      (data.days || []).forEach(function (d) { dayById[d.id] = d; });
      route();
    })
    .catch(function (err) {
      app.innerHTML = '';
      app.appendChild(renderError(
        'The dua content could not be loaded (' + err.message + '). ' +
        'If you opened this file directly (file://), please serve it over http(s) — e.g. deploy to Netlify or run a local web server.'
      ));
    });

  window.addEventListener('hashchange', route);

  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    var refreshing = false;
    var hadController = !!navigator.serviceWorker.controller;
    // When an updated service worker takes control, reload once to serve the fresh version.
    // (Guarded so first-time installs don't trigger a reload.)
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (refreshing || !hadController) return;
      refreshing = true;
      window.location.reload();
    });
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        // Proactively check for updates on load (bypasses HTTP cache of sw.js)
        reg.update().catch(function () {});
        // Re-check whenever the app returns to the foreground (helps iOS home-screen PWAs)
        document.addEventListener('visibilitychange', function () {
          if (document.visibilityState === 'visible') reg.update().catch(function () {});
        });
      }).catch(function () {});
    });
  }
})();
