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
  if (typeof settings.fontUrdu !== 'number') settings.fontUrdu = 1;
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
    st.setProperty('--urdu-scale', settings.fontUrdu);
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
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 20 12 7 20 7 4"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
    arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>'
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

    var isThisPlaying = (audioPlayer.dayId === day.id && audioPlayer.activeDuaN === item.n && audioPlayer.isPlaying);
    var play = iconBtn(isThisPlaying ? 'pause' : 'play', 'Play dua ' + item.n, 'small dua-play-btn');
    play.setAttribute('data-dua-n', item.n);
    play.addEventListener('click', function () {
      playOrPauseDua(day, item);
    });

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
    actions.appendChild(play); actions.appendChild(cp); actions.appendChild(bm);
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

  /* ================= Audio Player ================= */
  var audioPlayer = {
    dayId: null,
    activeDay: null,
    activeDuaN: null,
    singleDuaN: null, // If set, stops playback when this individual dua finishes
    audio: null,
    isPlaying: false
  };

  function isAudioActive() {
    return !!(audioPlayer.audio && !audioPlayer.audio.paused && !audioPlayer.audio.ended);
  }

  function formatTime(s) {
    if (isNaN(s) || s == null) return '0:00';
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function playOrPauseDua(day, item) {
    if (audioPlayer.dayId === day.id && audioPlayer.audio) {
      if (audioPlayer.activeDuaN === item.n) {
        if (!audioPlayer.audio.paused) {
          audioPlayer.audio.pause();
        } else {
          audioPlayer.singleDuaN = item.n;
          audioPlayer.audio.play().catch(function (e) {
            if (e.name !== 'AbortError') console.error(e);
          });
        }
        return;
      }
      audioPlayer.activeDuaN = item.n;
      audioPlayer.singleDuaN = item.n;
      var startTime = (item && item.audio_start != null) ? item.audio_start : 0;
      try { audioPlayer.audio.currentTime = startTime; } catch (e) {}
      if (audioPlayer.audio.paused) {
        audioPlayer.audio.play().catch(function (e) {
          if (e.name !== 'AbortError') console.error(e);
        });
      }
      highlightAndScrollToDua(item.n);
      updateAudioUI();
      return;
    }

    startAudioForDay(day, item, true);
  }

  function startAudioForDay(day, startItem, isSingleDua) {
    if (audioPlayer.audio) {
      try { audioPlayer.audio.pause(); } catch (e) {}
      audioPlayer.audio = null;
    }
    audioPlayer.dayId = day.id;
    audioPlayer.activeDay = day;
    audioPlayer.activeDuaN = startItem ? startItem.n : (day.items[0] ? day.items[0].n : 1);
    audioPlayer.singleDuaN = isSingleDua ? (startItem ? startItem.n : null) : null;
    audioPlayer.isPlaying = true;

    var startTime = (startItem && startItem.audio_start != null) ? startItem.audio_start : 0;
    var a = new Audio('https://audio.munajaat.app/islah_slow/' + day.id + '.mp3');
    audioPlayer.audio = a;

    var seekDone = false;
    function applySeek() {
      if (!seekDone && startTime > 0) {
        try {
          a.currentTime = startTime;
          seekDone = true;
        } catch (e) {}
      }
    }
    a.addEventListener('loadedmetadata', applySeek);
    a.addEventListener('canplay', applySeek);

    a.addEventListener('play', function () {
      audioPlayer.isPlaying = true;
      updateAudioUI();
      startAutoScrollLoop();
    });
    a.addEventListener('playing', function () {
      audioPlayer.isPlaying = true;
      updateAudioUI();
      startAutoScrollLoop();
    });
    a.addEventListener('pause', function () {
      audioPlayer.isPlaying = false;
      updateAudioUI();
      stopAutoScrollLoop();
    });
    a.addEventListener('timeupdate', onAudioTimeUpdate);
    a.addEventListener('ended', function () {
      audioPlayer.isPlaying = false;
      audioPlayer.activeDuaN = null;
      audioPlayer.singleDuaN = null;
      stopAutoScrollLoop();
      var allActive = document.querySelectorAll('.active-dua-card');
      allActive.forEach(function (c) { c.classList.remove('active-dua-card'); });
      updateAudioUI();
    });
    a.addEventListener('error', function () {
      audioPlayer.isPlaying = false;
      audioPlayer.singleDuaN = null;
      stopAutoScrollLoop();
      updateAudioUI();
      toast('Failed to load audio');
    });

    updateAudioUI();
    highlightAndScrollToDua(audioPlayer.activeDuaN);

    a.play().then(function () {
      applySeek();
    }).catch(function (e) {
      if (e.name !== 'AbortError') {
        console.error(e);
      }
      audioPlayer.isPlaying = false;
      updateAudioUI();
    });
  }

  /* Progressive smooth auto-scrolling for long verses */
  var autoScrollRaf = null;
  var isUserScrolling = false;
  var userScrollTimer = null;

  function markUserScrolling() {
    isUserScrolling = true;
    if (userScrollTimer) clearTimeout(userScrollTimer);
    userScrollTimer = setTimeout(function () {
      isUserScrolling = false;
    }, 2500);
  }

  window.addEventListener('wheel', markUserScrolling, { passive: true });
  window.addEventListener('touchmove', markUserScrolling, { passive: true });

  function startAutoScrollLoop() {
    if (autoScrollRaf) return;
    function loop() {
      if (isAudioActive() && audioPlayer.activeDay && audioPlayer.activeDuaN && !isUserScrolling) {
        var card = document.getElementById('item-' + audioPlayer.activeDuaN);
        if (card) {
          var t = audioPlayer.audio.currentTime;
          var items = audioPlayer.activeDay.items;
          var currentItem = null;
          for (var i = 0; i < items.length; i++) {
            if (items[i].n === audioPlayer.activeDuaN) {
              currentItem = items[i];
              break;
            }
          }
            var arabicEl = card.querySelector('.arabic');
            var targetEl = arabicEl || card;
            var topbar = document.querySelector('.topbar');
            var topbarHeight = topbar ? topbar.offsetHeight : 60;
            var visibleTop = topbarHeight + 12;
            var footerOffset = 84;
            var visibleHeight = window.innerHeight - visibleTop - footerOffset;
            var arabicHeight = targetEl.offsetHeight;
            var overflow = arabicHeight - visibleHeight;

            // Only scroll down if the Arabic text ITSELF is taller than the visible viewport
            if (currentItem && overflow > 15) {
              var s = currentItem.audio_start != null ? currentItem.audio_start : 0;
              var e = currentItem.audio_end != null ? currentItem.audio_end : (s + 10);
              var dur = Math.max(1, e - s);
              var p = Math.max(0, Math.min(1, (t - s) / dur));

              var currentY = window.pageYOffset || document.documentElement.scrollTop;
              var cardRect = card.getBoundingClientRect();
              var startY = cardRect.top + currentY - visibleTop;
              var targetY = startY + (p * (overflow + 24));

              var dy = targetY - currentY;
              if (Math.abs(dy) > 1.0) {
                var speed = (Math.abs(dy) > 120) ? 0.08 : 0.04;
                window.scrollTo(0, currentY + (dy * speed));
              }
            }
        }
      }
      if (isAudioActive()) {
        autoScrollRaf = requestAnimationFrame(loop);
      } else {
        autoScrollRaf = null;
      }
    }
    autoScrollRaf = requestAnimationFrame(loop);
  }

  function stopAutoScrollLoop() {
    if (autoScrollRaf) {
      cancelAnimationFrame(autoScrollRaf);
      autoScrollRaf = null;
    }
  }

  function onAudioTimeUpdate() {
    if (!audioPlayer.audio || !audioPlayer.activeDay) return;
    var t = audioPlayer.audio.currentTime;
    var items = audioPlayer.activeDay.items;

    // If single-dua mode is active, stop playback at the end of this dua:
    if (audioPlayer.singleDuaN != null) {
      var singleItem = null;
      for (var k = 0; k < items.length; k++) {
        if (items[k].n === audioPlayer.singleDuaN) { singleItem = items[k]; break; }
      }
      if (singleItem && singleItem.audio_end > 0 && t >= (singleItem.audio_end - 0.15)) {
        audioPlayer.audio.pause();
        audioPlayer.singleDuaN = null;
        updateAudioUI();
        return;
      }
    }

    var matched = null;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var nextIt = (i + 1 < items.length) ? items[i + 1] : null;
      var s = it.audio_start != null ? it.audio_start : 0;
      var e = it.audio_end != null ? it.audio_end : null;

      // Continuous hold between unit.startTime and nextUnit.startTime (or unit.endTime if last unit)
      if (t >= s && (nextIt && nextIt.audio_start != null ? t < nextIt.audio_start : (e != null ? t < e : true))) {
        matched = it;
        break;
      }
    }
    if (!matched && items.length > 0) {
      if (t < (items[0].audio_start || 0)) {
        matched = items[0];
      } else if (t >= (items[items.length - 1].audio_start || 0)) {
        matched = items[items.length - 1];
      }
    }

    if (matched && matched.n !== audioPlayer.activeDuaN) {
      audioPlayer.activeDuaN = matched.n;
      highlightAndScrollToDua(matched.n);
    }
    updateAudioUI();
  }

  function highlightAndScrollToDua(duaN) {
    var allActive = document.querySelectorAll('.active-dua-card');
    allActive.forEach(function (c) { c.classList.remove('active-dua-card'); });

    var targetCard = document.getElementById('item-' + duaN);
    if (targetCard) {
      targetCard.classList.add('active-dua-card');
      // Scroll to start of card so the top of Arabic text is immediately visible
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function updateAudioUI() {
    var hash = location.hash || '';
    var m = hash.match(/^#\/day\/([^/]+)/);
    var visibleDayId = m ? m[1] : null;

    var isAudioActuallyPlaying = isAudioActive();

    // 1. Update individual dua card play buttons
    var cardPlayBtns = document.querySelectorAll('.dua-play-btn');
    cardPlayBtns.forEach(function (btn) {
      var n = parseInt(btn.getAttribute('data-dua-n'), 10);
      var isThis = (visibleDayId === audioPlayer.dayId && audioPlayer.activeDuaN === n && isAudioActuallyPlaying);
      btn.innerHTML = isThis ? ICONS.pause : ICONS.play;
      btn.setAttribute('aria-label', (isThis ? 'Pause dua ' : 'Play dua ') + n);
    });

    // 2. Ensure active card highlight matches visible day
    if (visibleDayId === audioPlayer.dayId && audioPlayer.activeDuaN) {
      var target = document.getElementById('item-' + audioPlayer.activeDuaN);
      if (target && !target.classList.contains('active-dua-card')) {
        var allActive = document.querySelectorAll('.active-dua-card');
        allActive.forEach(function (c) { c.classList.remove('active-dua-card'); });
        target.classList.add('active-dua-card');
      }
    } else {
      var oldActive = document.querySelectorAll('.active-dua-card');
      oldActive.forEach(function (c) { c.classList.remove('active-dua-card'); });
    }

    // 3. Update reader footer
    var footerPlayBtn = document.querySelector('.reader-footer .audio-play-btn');
    var footerCount = document.querySelector('.reader-footer .audio-count');
    var footerTimer = document.querySelector('.reader-footer .audio-timer');

    if (footerPlayBtn) {
      var isDayPlaying = (visibleDayId === audioPlayer.dayId && isAudioActuallyPlaying);
      footerPlayBtn.innerHTML = isDayPlaying ? ICONS.pause : ICONS.play;
      footerPlayBtn.setAttribute('aria-label', isDayPlaying ? 'Pause recitation' : 'Play recitation');
    }

    if (footerCount) {
      var curDay = visibleDayId ? dayById[visibleDayId] : null;
      if (curDay) {
        if (visibleDayId === audioPlayer.dayId && (isAudioActuallyPlaying || (audioPlayer.audio && audioPlayer.audio.currentTime > 0))) {
          var curN = audioPlayer.activeDuaN || 1;
          footerCount.textContent = 'Dua ' + curN + ' of ' + curDay.items.length;
        } else {
          footerCount.textContent = curDay.items.length + (curDay.items.length === 1 ? ' dua' : ' duas');
        }
      }
    }

    if (footerTimer) {
      if (visibleDayId === audioPlayer.dayId && audioPlayer.audio) {
        if (!isNaN(audioPlayer.audio.duration) && audioPlayer.audio.duration > 0) {
          footerTimer.textContent = formatTime(audioPlayer.audio.currentTime) + ' / ' + formatTime(audioPlayer.audio.duration);
        } else if (isAudioActuallyPlaying) {
          footerTimer.textContent = 'Streaming…';
        } else {
          footerTimer.textContent = '';
        }
      } else {
        footerTimer.textContent = '';
      }
    }
  }

  function renderDay(id, scrollTo) {
    var day = dayById[id];
    var w = el('div', 'wrap reader-wrap');
    if (!day) {
      w.appendChild(makeTopbar('Not found', true));
      w.appendChild(el('div', 'empty', 'Day not found.'));
      return w;
    }
    w.appendChild(makeTopbar(day.title, true));
    day.items.forEach(function (item) { w.appendChild(buildDuaCard(day, item)); });

    // Day navigation & audio bottom footer
    var dayIndex = -1;
    for (var i = 0; i < DATA.days.length; i++) {
      if (DATA.days[i].id === day.id) { dayIndex = i; break; }
    }

    var footer = el('div', 'reader-footer');
    var prevBtn = iconBtn('arrowLeft', 'Previous day');
    if (dayIndex > 0) {
      var prevId = DATA.days[dayIndex - 1].id;
      prevBtn.addEventListener('click', function () { location.hash = '#/day/' + prevId; });
    } else {
      prevBtn.disabled = true;
      prevBtn.style.opacity = '0.3';
      prevBtn.style.cursor = 'default';
    }
    footer.appendChild(prevBtn);

    var center = el('div', 'reader-footer-center');
    var playBtn = el('button', 'audio-play-btn');
    playBtn.type = 'button';
    playBtn.setAttribute('aria-label', 'Play recitation');

    var info = el('div', 'audio-info');
    var count = el('div', 'audio-count', day.items.length + (day.items.length === 1 ? ' dua' : ' duas'));
    var timer = el('div', 'audio-timer');
    info.appendChild(count);
    info.appendChild(timer);

    playBtn.addEventListener('click', function () {
      if (audioPlayer.dayId === day.id && audioPlayer.audio) {
        if (!audioPlayer.audio.paused) {
          audioPlayer.audio.pause();
        } else {
          audioPlayer.singleDuaN = null;
          audioPlayer.audio.play().catch(function (e) {
            if (e.name !== 'AbortError') console.error(e);
          });
        }
      } else {
        startAudioForDay(day, day.items[0], false);
      }
    });

    center.appendChild(playBtn);
    center.appendChild(info);
    footer.appendChild(center);

    var nextBtn = iconBtn('arrowRight', 'Next day');
    if (dayIndex < DATA.days.length - 1) {
      var nextId = DATA.days[dayIndex + 1].id;
      nextBtn.addEventListener('click', function () { location.hash = '#/day/' + nextId; });
    } else {
      nextBtn.disabled = true;
      nextBtn.style.opacity = '0.3';
      nextBtn.style.cursor = 'default';
    }
    footer.appendChild(nextBtn);

    updateAudioUI();
    w.appendChild(footer);

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
    card.appendChild(sliderRow('Urdu text size', 'fontUrdu'));
    card.appendChild(sliderRow('English text size', 'fontText'));
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
    var site = el('a', 'about-site', 'munajaat.app');
    site.href = 'https://munajaat.app';
    head.appendChild(site);
    w.appendChild(head);

    /* Texts & licences card */
    var texts = el('div', 'card credits');
    texts.appendChild(el('div', 'about-heading', 'TEXTS & LICENCES'));
    var rows = [
      ['Original work', 'Munajaat-e-Maqbool compiled by Mawlana Ashraf Ali Thanawi (d. 1943) — public domain'],
      ['Urdu translation', 'Classical translation by Mawlana Ashraf Ali Thanawi (d. 1943) — public domain'],
      ['English translation', 'Fresh plain-English translation directly from the Arabic source — MIT Licence']
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
    fonts.appendChild(el('p', null, 'Digital Khatt IndoPak v2 (© 2024-2025 Amine Anane, Tarteel Inc.) · Amiri Quran · Noto Nastaliq Urdu · Noto Naskh Arabic — SIL Open Font License'));
    w.appendChild(fonts);

    /* Audio Recitation card */
    var audio = el('div', 'card credits');
    audio.appendChild(el('div', 'about-heading', 'AUDIO RECITATION'));
    var audioRows = [
      ['Reciter', 'Qari (Islah-ul-Muslmeen) — Slow & Meditative Munajaat-e-Maqbool recitation'],
      ['Coverage', 'Complete weekly compilation (all 195 Qur\'anic and Prophetic Hadith supplications)'],
      ['Streaming', 'Fast edge delivery via Cloudflare R2 (audio.munajaat.app)']
    ];
    audioRows.forEach(function (r) {
      var row = el('div', 'about-row');
      row.appendChild(el('span', 'about-label', r[0]));
      row.appendChild(el('span', 'about-value', r[1]));
      audio.appendChild(row);
    });
    w.appendChild(audio);

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

  /* ================= Desktop Layout & Sidebar ================= */
  function showShortcutsModal() {
    showToast('Shortcuts: 1-7 (Days), / (Search), Esc (Home), J/K (Scroll Dua), T (Theme)');
  }

  function scrollToNextDua(cards, direction) {
    if (!cards || cards.length === 0) return;
    var target = null;
    if (direction > 0) {
      for (var i = 0; i < cards.length; i++) {
        var rect = cards[i].getBoundingClientRect();
        if (rect.top > 60) { target = cards[i]; break; }
      }
    } else {
      for (var j = cards.length - 1; j >= 0; j--) {
        var r = cards[j].getBoundingClientRect();
        if (r.top < -60) { target = cards[j]; break; }
      }
    }
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function buildDesktopSidebar() {
    var aside = el('aside', 'desktop-sidebar');

    var brand = el('a', 'sidebar-brand');
    brand.href = '#/';
    var logo = el('img', 'sidebar-logo');
    logo.src = 'assets/icon-192.png';
    logo.alt = 'Munajaat Maqbool Logo';
    brand.appendChild(logo);

    var titles = el('div', 'sidebar-titles');
    titles.appendChild(el('div', 'sidebar-title', 'Munajaat Maqbool'));
    titles.appendChild(el('div', 'sidebar-sub', 'The Accepted Whispers'));
    brand.appendChild(titles);
    aside.appendChild(brand);

    var nav = el('nav', 'sidebar-nav');
    var secDays = el('div', 'nav-section-label', 'Daily Sections');
    nav.appendChild(secDays);

    var dayLabels = [
      { id: 'saturday', num: '1', name: 'Saturday' },
      { id: 'sunday', num: '2', name: 'Sunday' },
      { id: 'monday', num: '3', name: 'Monday' },
      { id: 'tuesday', num: '4', name: 'Tuesday' },
      { id: 'wednesday', num: '5', name: 'Wednesday' },
      { id: 'thursday', num: '6', name: 'Thursday' },
      { id: 'friday', num: '7', name: 'Friday' }
    ];

    dayLabels.forEach(function (d) {
      var a = el('a', 'nav-item nav-day');
      a.href = '#/day/' + d.id;
      a.setAttribute('data-nav', 'day-' + d.id);
      var badge = el('span', 'nav-badge', d.num);
      var span = el('span', 'nav-text', d.name);
      a.appendChild(badge);
      a.appendChild(span);
      nav.appendChild(a);
    });

    var secMenu = el('div', 'nav-section-label', 'Navigation');
    nav.appendChild(secMenu);

    var menuItems = [
      { hash: '#/search', key: 'search', label: 'Search', icon: ICONS.search },
      { hash: '#/bookmarks', key: 'bookmarks', label: 'Bookmarks', icon: ICONS.bookmarkOutline },
      { hash: '#/settings', key: 'settings', label: 'Settings', icon: ICONS.settings },
      { hash: '#/credits', key: 'credits', label: 'Credits', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' }
    ];

    menuItems.forEach(function (m) {
      var a = el('a', 'nav-item');
      a.href = m.hash;
      a.setAttribute('data-nav', m.key);
      var ico = el('span', 'nav-icon');
      ico.innerHTML = m.icon;
      var span = el('span', 'nav-text', m.label);
      a.appendChild(ico);
      a.appendChild(span);
      nav.appendChild(a);
    });

    aside.appendChild(nav);

    var foot = el('div', 'sidebar-foot');
    var themeBtn = el('button', 'sidebar-btn', '🌓 Theme');
    themeBtn.type = 'button';
    themeBtn.title = 'Toggle Dark / Light (T)';
    themeBtn.addEventListener('click', function () {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      settings.dark = !isDark;
      saveSettings();
      applyTheme();
      showToast(settings.dark ? 'Dark theme enabled' : 'Light theme enabled');
    });
    foot.appendChild(themeBtn);

    var helpBtn = el('button', 'sidebar-btn', '⌨ Shortcuts');
    helpBtn.type = 'button';
    helpBtn.title = 'Keyboard Shortcuts (?)';
    helpBtn.addEventListener('click', showShortcutsModal);
    foot.appendChild(helpBtn);

    aside.appendChild(foot);
    return aside;
  }

  function updateDesktopSidebarActive(parts) {
    var items = document.querySelectorAll('.desktop-sidebar .nav-item');
    items.forEach(function (it) { it.classList.remove('active'); });
    var activeKey = null;
    if (parts.length === 0) {
      // Home
    } else if (parts[0] === 'day' && parts[1]) {
      activeKey = 'day-' + parts[1];
    } else if (parts[0]) {
      activeKey = parts[0];
    }
    if (activeKey) {
      var activeEl = document.querySelector('.desktop-sidebar [data-nav="' + activeKey + '"]');
      if (activeEl) activeEl.classList.add('active');
    }
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

    var container = document.getElementById('layout-container');
    if (!container) {
      app.innerHTML = '';
      container = el('div', 'layout-container');
      container.id = 'layout-container';
      var sidebar = buildDesktopSidebar();
      container.appendChild(sidebar);
      var mainContent = el('main', 'main-content');
      mainContent.id = 'main-content';
      container.appendChild(mainContent);
      app.appendChild(container);
    }
    var main = document.getElementById('main-content');
    main.innerHTML = '';
    main.appendChild(view);
    updateDesktopSidebarActive(parts);
    updateAudioUI();

    var siteFooter = document.getElementById('site-footer');
    if (siteFooter) {
      siteFooter.style.display = (parts.length === 0 || parts[0] === 'credits') ? 'block' : 'none';
    }

    if (!(parts[0] === 'day' && parts[2])) window.scrollTo(0, 0);
  }

  /* ================= Keyboard navigation ================= */
  window.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    var isInput = tag === 'input' || tag === 'textarea';

    if (e.key === 'Escape') {
      if (isInput) {
        e.target.blur();
      } else if (location.hash && location.hash !== '#/' && location.hash !== '#') {
        location.hash = '#/';
      }
      return;
    }

    if (isInput) return;

    if (e.key === '/') {
      e.preventDefault();
      location.hash = '#/search';
      setTimeout(function () {
        var inp = document.querySelector('.search-input');
        if (inp) inp.focus();
      }, 50);
      return;
    }

    if (e.key === '?' || e.key === 'h' || e.key === 'H') {
      showShortcutsModal();
      return;
    }

    if (e.key === 't' || e.key === 'T') {
      e.preventDefault();
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      settings.dark = !isDark;
      saveSettings();
      applyTheme();
      showToast(settings.dark ? 'Dark theme enabled' : 'Light theme enabled');
      return;
    }

    // Keys 1-7 jump directly to days
    if (e.key >= '1' && e.key <= '7' && DATA && DATA.days) {
      var idx = parseInt(e.key, 10) - 1;
      if (DATA.days[idx]) {
        e.preventDefault();
        location.hash = '#/day/' + DATA.days[idx].id;
        return;
      }
    }

    // J/K or Alt+Arrow to scroll through duas
    var parts = (location.hash || '').replace(/^#\//, '').split('/');
    if (parts[0] === 'day' && parts[1]) {
      var cards = document.querySelectorAll('.dua-card');
      if (cards.length > 0) {
        if (e.key === 'j' || (e.key === 'ArrowDown' && e.altKey)) {
          e.preventDefault();
          scrollToNextDua(cards, 1);
        } else if (e.key === 'k' || (e.key === 'ArrowUp' && e.altKey)) {
          e.preventDefault();
          scrollToNextDua(cards, -1);
        }
      }
    }
  });

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
