/* Email Studio funnel pages (v3). The site's page behaviour without its intro: hero entrance, word splits, reveals,
   pixel art (needs scene.js), poster parallax, and, only where the page has them, the live studio window, the journey map,
   the demos, the install terminal and the setup call calendar. Every part checks for its own elements first.
   All loops are sample data on a made-up brand (Fernhill). */
(function () {
  "use strict";
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, RM ? 0 : ms); }); };
  var AG = { sorter: "#0D99FF", librarian: "#7B61FF", maker: "#FF8A3D", reviewer: "#14AE5C", lead: "#2c2a27", you: "#F5E6A3" };
  function bot(kind, s) { return '<span class="bot ' + kind + '" style="--s:' + (s || 1) + '"><i class="eye"></i><i class="eye"></i></span>'; }
  var ROWS = [["14px", "#2c2a26"], ["58px", "#c9b48f"], ["8px", "#e4e0d8"], ["8px", "#e4e0d8"], ["14px", "#121110"], ["34px", "#d8cbb4"], ["10px", "#f1ede6"]];
  function miniRows(el) { el.innerHTML = ROWS.map(function (r) { return '<i style="--h:' + r[0] + ';--bg:' + r[1] + '"></i>'; }).join(""); return $$("i", el); }
  var hasIO = "IntersectionObserver" in window;
  function onSeen(el, fn, th) {
    if (!el) return;
    if (!hasIO) { fn(); return; }
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { o.disconnect(); fn(); } }, { threshold: th || .3 });
    o.observe(el);
  }

  /* hero entrance */
  requestAnimationFrame(function () { $$(".hero,.fhero").forEach(function (h) { h.classList.add("in"); }); });

  /* split words for h2 reveals */
  $$(".ws").forEach(function (el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return; if (/^\s+$/.test(t)) { f.appendChild(document.createTextNode(t)); return; }
            var w = document.createElement("span"); w.className = "wd"; var s = document.createElement("span"); s.textContent = t; s.style.setProperty("--i", i++); w.appendChild(s); f.appendChild(w);
          });
          node.replaceChild(f, c);
        } else if (c.nodeType === 1 && !c.classList.contains("bot")) walk(c);
      });
    })(el);
  });
  var revealEls = $$(".rv,.ws,.poster,.belt");
  if (hasIO) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -10% 0px", threshold: .08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else revealEls.forEach(function (el) { el.classList.add("in"); });

  /* pixel art: every .art[data-seed] with a canvas and a .screen */
  var arts = $$(".art[data-seed]");
  function paintArts() {
    if (!window.ESScene) return;
    arts.forEach(function (box) {
      var cv = $("canvas", box), scr = $(".screen", box), bw = box.clientWidth, bh = box.clientHeight;
      if (!cv || !bw || !bh) return;
      var px = bw > 700 ? 4 : 3;
      var r = ESScene.paint(cv, { w: Math.round(bw / px), h: Math.round(bh / px), seed: +box.dataset.seed || 7 });
      if (scr) { scr.style.left = r.x * 100 + "%"; scr.style.top = r.y * 100 + "%"; scr.style.width = r.w * 100 + "%"; scr.style.height = r.h * 100 + "%"; }
    });
  }
  /* full-bleed hero scene (site v3.1): horizon at the bottom of #hero-sky, the computer whole on the crest */
  var heroSky = $("#hero-sky");
  function paintHero() {
    var hero = $("#hero"), cv = $("#hero-cv"), scr = $("#hero-screen");
    if (!window.ESScene || !heroSky || !hero || !cv) return;
    var bw = hero.clientWidth, bh = hero.clientHeight;
    if (!bw || !bh) return;
    var px = bw > 700 ? 4 : 3;
    var horizon = (heroSky.offsetTop + heroSky.offsetHeight - (bw > 700 ? 44 : 30)) / bh;
    var cw = Math.min(.46, (bw > 700 ? 230 : 150) / bw);
    var r = ESScene.paint(cv, { w: Math.round(bw / px), h: Math.round(bh / px), seed: 7, horizon: horizon, cw: cw });
    if (scr) { scr.style.left = r.x * 100 + "%"; scr.style.top = r.y * 100 + "%"; scr.style.width = r.w * 100 + "%"; scr.style.height = r.h * 100 + "%"; }
  }
  function paintAll() { paintArts(); paintHero(); }
  if (arts.length || heroSky) {
    paintAll();
    if (heroSky && document.fonts && document.fonts.ready) document.fonts.ready.then(paintHero);
    var rz, lastW = innerWidth;
    window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { if (Math.abs(innerWidth - lastW) < 2) return; lastW = innerWidth; paintAll(); }, 200); });
  }
  /* a tiny email building itself on a screen */
  $$(".mini[data-loop]").forEach(function (el) {
    var rows = miniRows(el);
    (async function () {
      for (;;) { rows.forEach(function (r) { r.classList.remove("on"); }); await sleep(600); for (var i = 0; i < rows.length; i++) { rows[i].classList.add("on"); await sleep(420); } await sleep(2600); if (RM) return; }
    })();
  });

  /* poster parallax */
  var posters = $$(".poster[data-speed]"), tk = false;
  function px() { tk = false; var vh = innerHeight; posters.forEach(function (p) { var r = p.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return; p.style.setProperty("--py", ((r.top + r.height / 2 - vh / 2) * parseFloat(p.dataset.speed)).toFixed(1) + "px"); }); }
  if (posters.length && !RM && innerWidth > 700) { addEventListener("scroll", function () { if (!tk) { tk = true; requestAnimationFrame(px); } }, { passive: true }); px(); }

  /* LIVE studio window */
  if ($("#live-out")) (function live() {
    var stages = [
      ["sorter", "Brief read: Weekend edit, Sat send, copy ready", 0],
      ["librarian", "Brand rules loaded: 4 hard, 6 soft", 0],
      ["librarian", "Library: 43 past sends, hero signature noted", 0],
      ["reviewer", "Layers: every row named", 0],
      ["librarian", "Parts ready: 3 organisms, 5 atoms", 0],
      ["maker", "Precedent: Weekend edit, October", 2],
      ["maker", "Rebuilt in Figma from approved rows", 7],
      ["reviewer", "Preflight: Ready with substitutions", 7],
      ["lead", "Waiting for your yes", 7]
    ];
    var brief = "Hero: The weekend edit. Two products. CTA: Shop the edit.";
    var type = $("#live-type"), out = $("#live-out"), slots = $$("#live-slots i"), n = $("#live-n"), c = $("#live-c"), rows = $("#live-rows"), b = $("#live-bot");
    onSeen($("#live"), async function loop() {
      for (;;) {
        type.textContent = ""; out.innerHTML = ""; slots.forEach(function (s) { s.classList.remove("on"); }); rows.textContent = "0";
        for (var i = 0; i < brief.length; i++) { type.textContent += brief[i]; await sleep(22); }
        for (var k = 0; k < stages.length; k++) {
          var s = stages[k];
          b.className = "bot " + s[0]; n.textContent = "stage " + (k + 1) + " of 9"; c.textContent = (k + 1) + "/9";
          slots[k].classList.add("on"); rows.textContent = s[2];
          var o = document.createElement("div"); o.className = "o"; o.innerHTML = "<i>✓</i>" + s[1]; out.appendChild(o);
          if (out.children.length > 4) out.removeChild(out.firstChild);
          (function (o) { requestAnimationFrame(function () { o.classList.add("on"); }); })(o);
          await sleep(1100);
        }
        await sleep(2400); if (RM) return;
      }
    });
  })();

  /* JOURNEY map */
  if ($("#map")) (function journey() {
    var NS = "http://www.w3.org/2000/svg", svg = $("#map");
    var N = [["01", "Intake", "sorter", 90, 90], ["02", "Brand", "librarian", 250, 70], ["03", "Library", "librarian", 420, 100], ["04", "Layers", "reviewer", 520, 230], ["05", "Atomic", "librarian", 370, 260], ["06", "Match + Remix", "maker", 200, 250], ["07", "Build", "maker", 90, 380], ["08", "Review", "reviewer", 240, 460], ["you", "You", "you", 400, 430], ["09", "Run", "lead", 515, 520]];
    var soft = { sorter: "#cfe9ff", librarian: "#D4C8F0", maker: "#ffd7bd", reviewer: "#c2ebcd", lead: "#C9F135", you: "#F5E6A3" };
    function el(t, a) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); return e; }
    var edges = [];
    for (var i = 1; i < N.length; i++) { var a = N[i - 1], bb = N[i]; var mx = (a[3] + bb[3]) / 2, my = (a[4] + bb[4]) / 2 - 30; var p = el("path", { d: "M" + a[3] + " " + a[4] + " Q" + mx + " " + my + " " + bb[3] + " " + bb[4], "class": "edge" }); svg.appendChild(p); edges.push(p); }
    var nodes = N.map(function (n) {
      var g = el("g", { "class": "nd", transform: "translate(" + n[3] + " " + n[4] + ")" });
      var c = el("circle", { r: 30, fill: "#fff", stroke: "#121110", "stroke-width": 1.5 });
      var k = el("text", { "class": "k", y: -4 }); k.textContent = n[0] === "you" ? "human" : n[0];
      var t = el("text", { y: 12 }); t.textContent = n[1];
      g.appendChild(c); g.appendChild(k); g.appendChild(t); svg.appendChild(g); g._c = c; g._kind = n[2]; return g;
    });
    var walker = el("g", { "class": "walker" });
    var body = el("rect", { x: -22, y: -16, width: 44, height: 32, rx: 12, fill: AG.sorter });
    walker.appendChild(body); walker.appendChild(el("rect", { x: -9, y: -7, width: 5, height: 11, rx: 2.5, fill: "#fff" })); walker.appendChild(el("rect", { x: 4, y: -7, width: 5, height: 11, rx: 2.5, fill: "#fff" }));
    svg.appendChild(walker);
    var stops = $$(".stop"), cur = -1;
    function set(k) {
      if (k === cur || k < 0) return; cur = k;
      stops.forEach(function (s, j) { s.classList.toggle("on", j === k); });
      nodes.forEach(function (g, j) { g.classList.toggle("on", j === k); g._c.setAttribute("fill", j <= k ? soft[g._kind] : "#fff"); g._c.setAttribute("r", j === k ? 38 : 30); });
      edges.forEach(function (e, j) { e.classList.toggle("lit", j < k); });
      var n = N[k]; walker.style.transform = "translate(" + n[3] + "px," + (n[4] - 54) + "px)";
      body.setAttribute("fill", AG[n[2]]);
    }
    if (hasIO) {
      var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) set(stops.indexOf(e.target)); }); }, { rootMargin: innerWidth < 960 ? "-60% 0px -32% 0px" : "-45% 0px -45% 0px" });
      stops.forEach(function (s) { sio.observe(s); });
    }
    set(0);
  })();

  /* DEMOS */
  if ($("#dbody")) (function demosBlock() {
    var demos = {
      brand: { t: "~/email-studio-work · claude", k: "librarian · brand-extract", h: "A website in. <em>A brand file out.</em>", p: "brand-extract runs dembrandt on the brand's site and writes BRAND.md: colours, type, components and motion. rules-sweep then adds what the client said twice.",
        run: async function (el, ok) { el.innerHTML = '<div class="term"></div>'; var t = $(".term", el); var L = [['<span class="p">›</span> extract the brand for fernhill.example', 0], ['<span class="c">  running npx dembrandt fernhill.example</span>', 600], ['<span class="c">  colours ........ </span><span class="y">6 found</span>', 700], ['<span class="c">  type ........... </span><span class="y">2 families, 7 sizes</span>', 500], ['<span class="c">  components ..... </span><span class="y">buttons, cards, inputs</span>', 450], ['<span class="c">  motion ......... </span><span class="y">3 easings</span>', 450], ['  wrote <span class="v">brands/fernhill/BRAND.md</span>', 550], ['  wrote <span class="v">brands/fernhill/rules.md</span> <span class="c">waiting for rules-sweep</span>', 450], ['<span class="p">›</span> <span class="caret"></span>', 350]];
          for (var i = 0; i < L.length; i++) { if (!ok()) return; await sleep(L[i][1]); t.insertAdjacentHTML("beforeend", L[i][0] + "\n"); if (i === 2) { var sw = document.createElement("div"); sw.className = "swatches"; ["#2c2a26", "#f1ede6", "#b99f7c", "#8c6f4f", "#d8cbb4", "#3f5a46"].forEach(function (c) { var x = document.createElement("i"); x.style.background = c; sw.appendChild(x); }); t.appendChild(sw); $$("i", sw).forEach(function (x, j) { setTimeout(function () { x.classList.add("on"); }, RM ? 0 : 80 * j); }); } } } },
      atomic: { t: "Fernhill · approved · Figma", k: "librarian · atomic-emails", h: "Cut once. <em>Reuse forever.</em>", p: "atomic-emails proposes the cut as a dry run. A reviewer reads it before any part is written: organisms, molecules and atoms, named for the next build.",
        run: async function (el, ok) { el.innerHTML = '<div class="split"><div class="em">' + ROWS.map(function (r) { return '<i style="--h:' + r[0] + ';--bg:' + r[1] + '"></i>'; }).join("") + '</div><div class="parts"></div></div>'; var P = $(".parts", el), em = $$(".em i", el);
          var parts = [["o", "organism", "Hero / Image + headline", 1], ["o", "organism", "Products / Grid 2", 5], ["m", "molecule", "CTA / Button", 4], ["m", "molecule", "Body / Copy", 2], ["a", "atom", "Logo / Wordmark", 0], ["a", "atom", "Footer / Legal", 6]];
          await sleep(400); for (var i = 0; i < parts.length; i++) { if (!ok()) return; em.forEach(function (x) { x.classList.remove("hl"); }); em[parts[i][3]].classList.add("hl"); var d = document.createElement("div"); d.className = "part " + parts[i][0]; d.innerHTML = "<b>" + parts[i][1] + "</b>" + parts[i][2]; P.appendChild(d); await sleep(30); d.classList.add("on"); await sleep(520); }
          em.forEach(function (x) { x.classList.remove("hl"); }); var r = document.createElement("div"); r.className = "part on"; r.style.background = "#121110"; r.style.color = "#fff"; r.innerHTML = bot("reviewer", .3) + " dry run read · 6 parts · approve?"; P.appendChild(r); } },
      review: { t: "preflight · weekend edit", k: "reviewer · preflight", h: "Evidence, <em>then a verdict.</em>", p: "preflight runs the 7 point checklist on the built email, labels every row Observed, Inferred or Substituted, and gives one of four verdicts. You accept or reject each one.",
        run: async function (el, ok) { var C = [["Rows from approved layouts only", "observed"], ["Layer names follow Email Layers", "observed"], ["Alt text on every image", "observed"], ["Mobile type 14px or larger", "observed"], ["Hero differs from the last 3 sends", "inferred"], ["Product photo swapped from the library", "substituted"], ["Dark mode check", "observed"]];
          el.innerHTML = '<div class="check">' + C.map(function (c) { return '<div class="ck"><i></i>' + c[0] + "<small>" + c[1] + "</small></div>"; }).join("") + '<div class="verdict"><span>Verdict</span><span>Ready with substitutions</span></div></div>'; var R = $$(".ck", el);
          await sleep(400); for (var i = 0; i < R.length; i++) { if (!ok()) return; R[i].classList.add(C[i][1] === "substituted" ? "sub" : "ok"); await sleep(420); } $(".verdict", el).classList.add("on"); } }
    };
    var tok = 0, tabs = $$(".tab"), auto = true;
    function show(k, play) { var d = demos[k], my = ++tok; tabs.forEach(function (t) { t.setAttribute("aria-selected", t.dataset.demo === k ? "true" : "false"); }); $("#dtitle").textContent = d.t; $("#dcopy").innerHTML = '<span class="lab">' + d.k + "</span><h3>" + d.h + "</h3><p>" + d.p + "</p>"; if (play) d.run($("#dbody"), function () { return my === tok; }); }
    tabs.forEach(function (t) { t.addEventListener("click", function () { auto = false; show(t.dataset.demo, true); }); });
    show("brand", false);
    var order = ["brand", "atomic", "review"], oi = 0;
    onSeen($("#demos"), function () { show("brand", true); if (!RM) setInterval(function () { if (auto) { oi = (oi + 1) % 3; show(order[oi], true); } }, 9000); }, .25);
  })();

  /* install terminal */
  var it = $("#iterm");
  if (it) onSeen(it, async function () {
    async function type(s) { for (var i = 0; i < s.length; i++) { it.insertAdjacentText("beforeend", s[i]); await sleep(26); } }
    it.innerHTML = '<span class="p">›</span> '; await type("/plugin marketplace add ~/email-studio-plugin");
    it.insertAdjacentHTML("beforeend", '\n<span class="c">  marketplace email-studio added</span>\n<span class="p">›</span> '); await sleep(450);
    await type("/plugin install email-studio@email-studio"); await sleep(450);
    it.insertAdjacentHTML("beforeend", '\n<span class="c">  installed </span><span class="y">email-studio 1.0.0</span>\n<span class="c">  19 skills · 5 agents</span>\n\n<span class="p">›</span> '); await sleep(600);
    await type("/email-studio:new-brand Fernhill");
    it.insertAdjacentHTML("beforeend", '\n<span class="c">  sorter, librarian: on it</span>\n<span class="p">›</span> <span class="caret"></span>');
  }, .4);

  /* setup call calendar: an hour finds its slot */
  var cal = $("#cal");
  if (cal) onSeen(cal, async function () {
    var cells = $$(".slot", cal), pick = cells.filter(function (c) { return c.dataset.pick; })[0];
    if (!pick) return;
    for (;;) {
      cells.forEach(function (c) { c.classList.remove("seek", "pick"); });
      var path = [1, 6, 11].map(function (i) { return cells[i]; }).filter(Boolean);
      for (var i = 0; i < path.length; i++) { path[i].classList.add("seek"); await sleep(360); path[i].classList.remove("seek"); }
      pick.classList.add("pick"); await sleep(4200); if (RM) return;
    }
  });
})();
