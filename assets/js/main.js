/* Home page behaviour: theme, navigation, hero network, publications browser, rosters. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- theme toggle (light / dark / system) ---------- */
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var saved = store("theme");
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  var themeBtn = document.getElementById("theme-btn");
  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function syncThemeLabel() { if (themeBtn) themeBtn.setAttribute("aria-label", isDark() ? "Switch to light theme" : "Switch to dark theme"); }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next); store("theme", next); syncThemeLabel();
    });
    syncThemeLabel();
  }

  /* ---------- mobile menu ---------- */
  var menuBtn = document.getElementById("menu-btn");
  var nav = document.getElementById("site-nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- highlight current section in the nav ---------- */
  if ("IntersectionObserver" in window && nav) {
    var links = {};
    Array.prototype.forEach.call(nav.querySelectorAll("a[href^='#']"), function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && links[en.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].removeAttribute("aria-current"); });
          links[en.target.id].setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- copy e-mail ---------- */
  var copyBtn = document.getElementById("copy-email");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var txt = document.getElementById("email-text").textContent.trim();
      var done = function () { copyBtn.textContent = "Copied"; setTimeout(function () { copyBtn.textContent = "Copy address"; }, 1800); };
      var fallback = function () {
        var r = document.createRange(); r.selectNodeContents(document.getElementById("email-text"));
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); copyBtn.textContent = "Press Ctrl+C";
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, fallback); else fallback();
    });
  }


  /* ---------- hero carousel ---------- */
  var car = document.getElementById("carousel");
  if (car) {
    var slides = Array.prototype.slice.call(car.querySelectorAll(".slide"));
    var countEl = document.getElementById("car-count"), bar = document.getElementById("car-bar"), pauseBtn = document.getElementById("car-pause");
    var cur = 0, timer = null, DUR = 5500, userPaused = reduceMotion, hoverPaused = false;
    car.style.setProperty("--car-ms", DUR + "ms");
    function preload(i) { var im = slides[i]; if (im && im.loading === "lazy") im.loading = "eager"; }
    function show(i) {
      slides[cur].classList.remove("is-active"); slides[cur].setAttribute("aria-hidden", "true");
      cur = (i + slides.length) % slides.length;
      slides[cur].classList.add("is-active"); slides[cur].removeAttribute("aria-hidden");
      countEl.textContent = (cur + 1) + " / " + slides.length;
      preload((cur + 1) % slides.length);
      restart();
    }
    function restart() {
      clearTimeout(timer); bar.classList.remove("run"); void bar.offsetWidth;
      if (userPaused || hoverPaused || document.hidden) return;
      bar.classList.add("run");
      timer = setTimeout(function () { show(cur + 1); }, DUR);
    }
    function setPaused(p) {
      userPaused = p; car.classList.toggle("paused", p);
      pauseBtn.setAttribute("aria-label", p ? "Play slideshow" : "Pause slideshow");
      pauseBtn.innerHTML = p
        ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L8.5 4.64A1 1 0 0 0 7 5.5z"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
      restart();
    }
    document.getElementById("car-prev").addEventListener("click", function () { show(cur - 1); });
    document.getElementById("car-next").addEventListener("click", function () { show(cur + 1); });
    pauseBtn.addEventListener("click", function () { setPaused(!userPaused); });
    var stage = document.getElementById("slides");
    stage.addEventListener("mouseenter", function () { hoverPaused = true; restart(); });
    stage.addEventListener("mouseleave", function () { hoverPaused = false; restart(); });
    car.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { show(cur - 1); e.preventDefault(); }
      if (e.key === "ArrowRight") { show(cur + 1); e.preventDefault(); }
    });
    var x0 = null;
    stage.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
    stage.addEventListener("pointerup", function (e) { if (x0 === null) return; var dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); });
    document.addEventListener("visibilitychange", restart);
    preload(1);
    setPaused(userPaused);
  }

  /* ---------- hero: a feed-forward network with signals travelling through it ---------- */
  var canvas = document.getElementById("net");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, dpr = 1, nodes = [], layers = [], edges = [], pulses = [], running = false, visible = true, t0 = 0;
    var pointer = { x: -1e4, y: -1e4 };
    var TEAL = [43, 208, 196], VIOLET = [141, 124, 248];
    function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
    function rgba(c, a) { return "rgba(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + "," + a + ")"; }
    function rand(a, b) { return a + Math.random() * (b - a); }

    function build() {
      var rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var narrow = W < 700;
      var sizes = narrow ? [3, 5, 6, 5, 3] : [4, 7, 9, 10, 9, 6, 3];
      var x0 = narrow ? W * 0.08 : W * 0.30, x1 = W * 0.97;
      nodes = []; layers = []; edges = [];
      sizes.forEach(function (n, li) {
        var L = [];
        var x = x0 + (x1 - x0) * (li / (sizes.length - 1));
        var span = H * (narrow ? 0.62 : 0.78) * (0.55 + 0.45 * n / Math.max.apply(null, sizes));
        for (var i = 0; i < n; i++) {
          var y = H / 2 - span / 2 + (n === 1 ? span / 2 : span * i / (n - 1));
          var node = { x: x + rand(-14, 14), y: y + rand(-10, 10), bx: 0, by: 0, ph: rand(0, 6.28), glow: 0, li: li, c: mix(TEAL, VIOLET, li / (sizes.length - 1)), out: [] };
          node.bx = node.x; node.by = node.y;
          nodes.push(node); L.push(node);
        }
        layers.push(L);
      });
      for (var l = 0; l < layers.length - 1; l++) {
        layers[l].forEach(function (a) {
          layers[l + 1].forEach(function (b) {
            if (Math.random() < 0.72) { var e = { a: a, b: b, w: rand(0.25, 1) }; edges.push(e); a.out.push(e); }
          });
        });
      }
      pulses = [];
    }

    function spawn() {
      var src = layers[0][(Math.random() * layers[0].length) | 0];
      if (src && src.out.length) pulses.push({ e: src.out[(Math.random() * src.out.length) | 0], t: 0, v: rand(0.006, 0.012) });
    }

    function alphaAt(x) {
      // keep the network faint under the text column on wide screens
      if (W < 700) return 0.55;
      var f = Math.min(1, Math.max(0, (x - W * 0.25) / (W * 0.35)));
      return 0.25 + 0.75 * f;
    }

    function frame(ts) {
      if (!running) return;
      var t = (ts - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      nodes.forEach(function (n) {
        n.x = n.bx + Math.sin(t * 0.5 + n.ph) * 4;
        n.y = n.by + Math.cos(t * 0.4 + n.ph) * 5;
        var dx = n.x - pointer.x, dy = n.y - pointer.y, d2 = dx * dx + dy * dy;
        if (d2 < 14000) n.glow = Math.max(n.glow, 0.6);
        n.glow *= 0.955;
      });
      ctx.lineWidth = 1;
      edges.forEach(function (e) {
        var a = 0.095 * e.w * alphaAt((e.a.x + e.b.x) / 2);
        ctx.strokeStyle = rgba(e.a.c, a);
        ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke();
      });
      if (!reduceMotion && Math.random() < 0.16 && pulses.length < 60) spawn();
      for (var i = pulses.length - 1; i >= 0; i--) {
        var p = pulses[i]; p.t += p.v * 1.6;
        var e = p.e, x = e.a.x + (e.b.x - e.a.x) * p.t, y = e.a.y + (e.b.y - e.a.y) * p.t;
        var c = mix(e.a.c, e.b.c, p.t), al = alphaAt(x);
        var tx = e.a.x + (e.b.x - e.a.x) * Math.max(0, p.t - 0.12), ty = e.a.y + (e.b.y - e.a.y) * Math.max(0, p.t - 0.12);
        var g = ctx.createLinearGradient(tx, ty, x, y); g.addColorStop(0, rgba(c, 0)); g.addColorStop(1, rgba(c, 0.85 * al));
        ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
        if (p.t >= 1) {
          e.b.glow = 1; pulses.splice(i, 1);
          if (e.b.out.length && Math.random() < 0.8) pulses.push({ e: e.b.out[(Math.random() * e.b.out.length) | 0], t: 0, v: p.v });
        }
      }
      nodes.forEach(function (n) {
        var al = alphaAt(n.x),    r = 4.5 + n.glow * 3;
        if (n.glow > 0.05) {
          var gr = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 26 * n.glow + 8 );
          gr.addColorStop(0, rgba(n.c, 0.45 * n.glow * al)); gr.addColorStop(1, rgba(n.c, 0));
          ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(n.x, n.y, 26 * n.glow + 8, 0, 6.283); ctx.fill();
        }
        ctx.fillStyle = rgba(n.c, (0.55 + 0.45 * n.glow) * al);
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, 6.283); ctx.fill();
      });
      requestAnimationFrame(frame);
    }
    function start() { if (running || reduceMotion || !visible || document.hidden) return; running = true; t0 = performance.now(); requestAnimationFrame(frame); }
    function stop() { running = false; }
    function staticFrame() {
      // one still frame, used for reduced motion
      running = true; for (var k = 0; k < 40; k++) spawn(); pulses.forEach(function (p) { p.t = Math.random(); p.v = 0; });
      frame(performance.now()); running = false;
    }
    build();
    if (reduceMotion) staticFrame(); else start();
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { build(); if (reduceMotion) staticFrame(); }, 150); });
    var hero = canvas.parentElement;
    hero.addEventListener("pointermove", function (e) { var r = canvas.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; });
    hero.addEventListener("pointerleave", function () { pointer.x = pointer.y = -1e4; });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); else stop(); }).observe(hero);
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
  }

  /* ---------- publications ---------- */
  var PUBS = (window.PUBLICATIONS || []).map(function (p, i) {
    p.i = i;
    if (!p.text) p.text = [p.authors, p.title, p.venue].filter(Boolean).join(", ");
    return p;
  });
  var listEl = document.getElementById("pub-list");
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function boldMe(html) { return html.replace(/(Lior\s+Rokach|L\.\s?Rokach|Rokach,?\s+L(?:ior)?\.?(?=[\s,;.]|$)|Rokach\s+L\b|Rokach\s+Lior|Rokach,\s+Lior)/g, "<b>$1</b>"); }
  function markTerms(html, terms) {
    if (!terms.length) return html;
    var re = new RegExp("(" + terms.map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")(?![^<]*>)", "gi");
    return html.replace(re, "<mark>$1</mark>");
  }
  function scholar(p) { return "https://scholar.google.com/scholar?q=" + encodeURIComponent(p.title ? '"' + p.title + '"' : p.text.slice(0, 220)); }
  var TYPE_LABEL = { journal: "Journal", conference: "Conference", workshop: "Workshop", chapter: "Chapter", book: "Book" };

  function pubHTML(p, terms) {
    var h = '<article class="pub">';
    if (p.title) {
      h += '<div class="t">' + markTerms(esc(p.title), terms) + "</div>";
      h += '<div class="au">' + markTerms(boldMe(esc(p.authors || "")), terms) + "</div>";
      h += '<div class="ve">' + markTerms(esc(p.venue || ""), terms) + "</div>";
    } else {
      h += '<div class="full">' + markTerms(boldMe(esc(p.text)), terms) + "</div>";
    }
    h += '<div class="side"><span class="pill ' + p.type + '">' + TYPE_LABEL[p.type] + "</span>";
    if (p.badge) h += '<span class="pill star">' + esc(p.badge) + "</span>";
    if (p.inpress) h += '<span class="pill">In press</span>';
    var href = p.url || scholar(p);
    h += '<a class="lnk" href="' + esc(href) + '" target="_blank" rel="noopener">' + (p.url ? "Paper" : "Find on Scholar") + " ↗</a></div>";
    return h + "</article>";
  }

  if (listEl && PUBS.length) {
    var q = document.getElementById("pub-q"), yearSel = document.getElementById("pub-year"), status = document.getElementById("pub-status"),
        moreBtn = document.getElementById("pub-more"), chipsEl = document.getElementById("pub-types"), histo = document.getElementById("pub-histo"),
        resetBtn = document.getElementById("pub-reset");
    var state = { type: "all", year: "all", q: "", sel: false, shown: 40 };
    var years = PUBS.map(function (p) { return p.year; });
    var minY = Math.min.apply(null, years), maxY = Math.max.apply(null, years);

    // type chips with counts
    var counts = { all: PUBS.length };
    PUBS.forEach(function (p) { counts[p.type] = (counts[p.type] || 0) + 1; });
    var chipDefs = [["all", "All"], ["journal", "Journals"], ["conference", "Conferences"], ["workshop", "Workshops"], ["chapter", "Chapters"]].filter(function (d) { return d[0] === "all" || counts[d[0]]; });
    chipsEl.innerHTML = chipDefs.map(function (d) {
      var n = d[0] === "sel" ? PUBS.filter(function (p) { return p.sel; }).length : counts[d[0]] || 0;
      return '<button type="button" class="chip" data-type="' + d[0] + '" aria-pressed="' + (d[0] === "all") + '">' + d[1] + '<span class="n">' + n + "</span></button>";
    }).join("");
    chipsEl.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var t = b.getAttribute("data-type");
      if (t === "sel") { state.sel = !state.sel; }
      else { state.type = t; }
      Array.prototype.forEach.call(chipsEl.children, function (c) {
        var ct = c.getAttribute("data-type");
        c.setAttribute("aria-pressed", String(ct === "sel" ? state.sel : ct === state.type));
      });
      state.shown = 40; render();
    });

    // year select
    var opts = '<option value="all">All years</option>';
    for (var y = maxY; y >= minY; y--) opts += '<option value="' + y + '">' + y + "</option>";
    yearSel.innerHTML = opts;
    yearSel.addEventListener("change", function () { state.year = yearSel.value; state.shown = 40; render(); });

    // histogram of output per year (click a bar to filter)
    var perYear = {}; PUBS.forEach(function (p) { if (p.type !== "book") perYear[p.year] = (perYear[p.year] || 0) + 1; });
    var maxN = Math.max.apply(null, Object.keys(perYear).map(function (k) { return perYear[k]; }));
    var bars = "";
    for (var yy = minY; yy <= maxY; yy++) {
      var n = perYear[yy] || 0;
      bars += '<button type="button" data-year="' + yy + '" style="height:' + Math.max(3, Math.round(100 * n / maxN)) + '%" title="' + yy + ": " + n + ' papers" aria-label="' + yy + ", " + n + ' papers"></button>';
    }
    histo.querySelector(".histo-bars").innerHTML = bars;
    var ht = document.getElementById("histo-total"); if (ht) ht.textContent = PUBS.length + " items, " + minY + "–" + maxY;
    histo.querySelector(".histo-axis").innerHTML = "<span>" + minY + "</span><span>" + Math.round((minY + maxY) / 2) + "</span><span>" + maxY + "</span>";
    histo.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-year]"); if (!b) return;
      var yv = b.getAttribute("data-year");
      state.year = state.year === yv ? "all" : yv; yearSel.value = state.year; state.shown = 40; render();
    });

    var deb;
    q.addEventListener("input", function () { clearTimeout(deb); deb = setTimeout(function () { state.q = q.value; state.shown = 40; render(); }, 120); });
    moreBtn.addEventListener("click", function () { state.shown += 60; render(); });
    resetBtn.addEventListener("click", function () {
      state = { type: "all", year: "all", q: "", sel: false, shown: 40 }; q.value = ""; yearSel.value = "all";
      Array.prototype.forEach.call(chipsEl.children, function (c) { c.setAttribute("aria-pressed", String(c.getAttribute("data-type") === "all")); });
      render();
    });

    function norm(s) { return s.toLowerCase().normalize ? s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") : s.toLowerCase(); }
    PUBS.forEach(function (p) { p._s = norm(p.text + " " + (p.title || "") + " " + p.year); });

    function render() {
      var terms = norm(state.q).split(/\s+/).filter(function (t) { return t.length > 1; });
      var res = PUBS.filter(function (p) {
        if (state.type !== "all" && p.type !== state.type) return false;
        if (state.sel && !p.sel) return false;
        if (state.year !== "all" && String(p.year) !== state.year) return false;
        for (var i = 0; i < terms.length; i++) if (p._s.indexOf(terms[i]) < 0) return false;
        return true;
      }).sort(function (a, b) { return b.year - a.year || a.i - b.i; });
      var shown = res.slice(0, state.shown), html = "", lastY = null;
      shown.forEach(function (p) {
        if (p.year !== lastY) { html += '<h3 class="year-h">' + p.year + "</h3>"; lastY = p.year; }
        html += pubHTML(p, terms);
      });
      if (!res.length) html = '<p class="muted" style="padding:1.2rem 0">No publications match these filters. <button type="button" class="linkish" id="pub-clear2">Clear filters</button></p>';
      listEl.innerHTML = html;
      var c2 = document.getElementById("pub-clear2"); if (c2) c2.addEventListener("click", function () { resetBtn.click(); });
      status.textContent = "Showing " + shown.length + " of " + res.length + (res.length === PUBS.length ? " items" : " matching items");
      moreBtn.hidden = res.length <= state.shown;
      moreBtn.textContent = "Show " + Math.min(60, res.length - state.shown) + " more";
      resetBtn.hidden = state.type === "all" && state.year === "all" && !state.q && !state.sel;
      Array.prototype.forEach.call(histo.querySelectorAll("button[data-year]"), function (b) { b.classList.toggle("on", b.getAttribute("data-year") === state.year); });
    }
    render();

  }

  /* ---------- roster filters (alumni) ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-filter-list]"), function (inp) {
    var list = document.getElementById(inp.getAttribute("data-filter-list"));
    inp.addEventListener("input", function () {
      var v = inp.value.toLowerCase().trim();
      Array.prototype.forEach.call(list.children, function (li) { li.hidden = v && li.textContent.toLowerCase().indexOf(v) < 0; });
    });
  });
})();
