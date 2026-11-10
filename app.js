/* Email Studio site v3. Intro (loader → pixel scene → zoom → retro installer → opens to the hero), live studio,
   journey map, posters, demos, install terminal. Every loop is sample data on a made-up brand (Fernhill). */
(function () {
  "use strict";
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, RM ? 0 : ms); }); };
  var easeIO = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  function tween(ms, fn, ease) { return new Promise(function (res) { var t0 = performance.now(); (function f(now) { var t = Math.min(1, (now - t0) / ms); fn((ease || easeIO)(t)); if (t < 1) requestAnimationFrame(f); else res(); })(t0); }); }
  var AG = { sorter: "#0D99FF", librarian: "#7B61FF", maker: "#FF8A3D", reviewer: "#14AE5C", lead: "#2c2a27", you: "#F5E6A3" };
  function bot(kind, s) { return '<span class="bot ' + kind + '" style="--s:' + (s || 1) + '"><i class="eye"></i><i class="eye"></i></span>'; }
  var ROWS = [["14px", "#2c2a26"], ["58px", "#c9b48f"], ["8px", "#e4e0d8"], ["8px", "#e4e0d8"], ["14px", "#121110"], ["34px", "#d8cbb4"], ["10px", "#f1ede6"]];
  function miniRows(el) { el.innerHTML = ROWS.map(function (r) { return '<i style="--h:' + r[0] + ';--bg:' + r[1] + '"></i>'; }).join(""); return $$("i", el); }

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
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -10% 0px", threshold: .08 });
  $$(".rv,.ws,.poster,#belt").forEach(function (el) { io.observe(el); });

  /* pixel art in the hero and the closer */
  function placeScreen(cv, scr, r) { scr.style.left = r.x * 100 + "%"; scr.style.top = r.y * 100 + "%"; scr.style.width = r.w * 100 + "%"; scr.style.height = r.h * 100 + "%"; }
  function paintArt(cvId, scrId, seed) {
    var cv = document.getElementById(cvId), box = cv.parentNode, bw = box.clientWidth, bh = box.clientHeight;
    var px = bw > 700 ? 4 : 3, W = Math.round(bw / px), H = Math.round(bh / px);
    var r = ESScene.paint(cv, { w: W, h: H, seed: seed });
    placeScreen(cv, document.getElementById(scrId), r);
  }
  function paintHero() {
    var hero = $("#hero"), cv = $("#hero-cv"), bw = hero.clientWidth, bh = hero.clientHeight, sky = $("#hero-sky");
    var px = bw > 700 ? 4 : 3, W = Math.round(bw / px), H = Math.round(bh / px);
    var horizon = (sky.offsetTop + sky.offsetHeight - (bw > 700 ? 44 : 30)) / bh;
    var cw = Math.min(.46, (bw > 700 ? 230 : 150) / bw);
    var r = ESScene.paint(cv, { w: W, h: H, seed: 7, horizon: horizon, cw: cw });
    placeScreen(cv, $("#hero-screen"), r);
  }
  paintHero(); paintArt("close-cv", "close-screen", 12);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(paintHero);
  var rz, lastW = innerWidth; window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { if (Math.abs(innerWidth - lastW) < 2) return; lastW = innerWidth; paintHero(); paintArt("close-cv", "close-screen", 12); }, 200); });
  (async function heroScreen() {
    var rows = miniRows($("#hero-mini"));
    for (;;) { rows.forEach(function (r) { r.classList.remove("on"); }); await sleep(600); for (var i = 0; i < rows.length; i++) { rows[i].classList.add("on"); await sleep(420); } await sleep(2600); if (RM) return; }
  })();

  /* INTRO: every visit. Loader, then the hero's own pixel scene dithers in, the camera dives into the computer,
     the retro installer runs, and the camera pulls back out to the hero, which is the final frame. */
  var intro = $("#intro"), hero = $("#hero"), nav = $("#nav"), hbg = $(".hbg"), hcv = $("#hero-cv"), rt = $("#rt");
  var noIntro = /[?&]nointro/.test(location.search), run = 0, PAPER = [244, 241, 234];
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  function settle() {
    hbg.style.transform = ""; ESScene.reveal(hcv, 1.01, PAPER);
    intro.classList.add("gone"); intro.classList.remove("clear");
    document.body.classList.remove("locked", "intro-run", "revealed"); nav.classList.remove("hide");
    requestAnimationFrame(function () { hero.classList.add("in"); });
  }
  function skip() { run++; settle(); }
  $("#skip").addEventListener("click", skip);
  window.addEventListener("keydown", function (e) { if (document.body.classList.contains("intro-run") && (e.key === "Escape" || e.key === "Enter")) skip(); });
  $$("[data-replay]").forEach(function (b) { b.addEventListener("click", function () { scrollTo(0, 0); startIntro(); }); });
  function screenGeo() {
    var bw = hero.clientWidth, bh = hero.clientHeight, sc = $("#hero-screen");
    var x = sc.offsetLeft + sc.offsetWidth / 2, y = sc.offsetTop + sc.offsetHeight / 2;
    var S = Math.max(innerWidth / sc.offsetWidth, innerHeight / sc.offsetHeight) * 1.22;
    return { x: x, y: y, S: S, dx: innerWidth / 2 - x, dy: innerHeight / 2 - y };
  }
  function zoom(g, t) { hbg.style.transformOrigin = g.x + "px " + g.y + "px"; hbg.style.transform = "translate(" + (g.dx * t).toFixed(1) + "px," + (g.dy * t).toFixed(1) + "px) scale(" + (1 + (g.S - 1) * t).toFixed(4) + ")"; }

  async function startIntro() {
    var my = ++run, alive = function () { return my === run; };
    scrollTo(0, 0);
    hero.classList.remove("in"); nav.classList.add("hide");
    document.body.classList.add("locked", "intro-run"); document.body.classList.remove("revealed");
    intro.classList.remove("gone", "clear"); $("#ld").style.opacity = 1; hbg.style.transform = "";
    rt.hidden = true; rt.classList.remove("on");
    ESScene.reveal(hcv, 0, PAPER);
    /* 1. loader: the studio running, plays once, ends exactly */
    var track = $("#ld-track"), chip = $("#ld-chip"), kinds = ["sorter", "librarian", "maker", "reviewer", "you"], xs = [6, 28, 50, 72, 94];
    $$(".bot", track).forEach(function (b) { b.remove(); });
    kinds.forEach(function (k, i) { var w = document.createElement("span"); w.innerHTML = bot(k, .78); var b = w.firstChild; b.style.left = "calc(" + xs[i] + "% - 25px)"; track.appendChild(b); });
    var bots = $$(".bot", track), bar = $("#ld-bar"), num = $("#ld-n");
    chip.classList.remove("ok"); chip.style.left = "calc(" + xs[0] + "% - 15px)";
    var LD = 2400;
    tween(LD, function (t) { if (!alive()) return; bar.style.transform = "scaleX(" + t + ")"; num.textContent = "stage " + String(Math.min(9, 1 + Math.floor(t * 9))).padStart(2, "0") + " / 09"; }, function (t) { return t; });
    for (var i = 0; i < 5; i++) { chip.style.left = "calc(" + xs[i] + "% - 15px)"; bots[i].classList.add("hit"); await sleep(LD / 5 - 30); bots[i].classList.remove("hit"); if (!alive()) return; }
    chip.classList.add("ok"); num.textContent = "ready"; await sleep(260); if (!alive()) return;
    /* 2. the hero's pixel scene dithers in, with the caption */
    $("#ld").style.opacity = 0; intro.classList.add("clear");
    await tween(800, function (t) { if (alive()) ESScene.reveal(hcv, t, PAPER); }, function (t) { return t; });
    if (!alive()) return;
    ESScene.reveal(hcv, 1.01, PAPER); document.body.classList.add("revealed");
    var cap = $("#scn-cap"); $("#scn").hidden = false; cap.style.opacity = 1;
    await sleep(1500); if (!alive()) return;
    /* 3. dive into the computer */
    cap.style.opacity = 0;
    var g = screenGeo(); rt.hidden = false;
    await tween(1600, function (t) { if (!alive()) return; zoom(g, t); if (t > .66) rt.classList.add("on"); });
    if (!alive()) return;
    /* 4. retro installer with a live feed */
    var steps = [["sorter", "01 intake"], ["librarian", "02 brand"], ["librarian", "03 library"], ["reviewer", "04 layers"], ["librarian", "05 atomic"], ["maker", "06 match + remix"], ["maker", "07 build"], ["reviewer", "08 review"], ["lead", "09 run"]];
    var feed = [["sorter", "6 briefs sorted <em>· 1 missing link</em>"], ["librarian", "BRAND.md <em>· 6 colours, 2 type families</em>"], ["librarian", "library <em>· 43 sends digested</em>"], ["reviewer", "layers <em>· 2 renamed on your yes</em>"], ["librarian", "atomic <em>· dry run read</em>"], ["maker", "precedent <em>· Weekend edit, Oct</em>"], ["maker", "rebuilt <em>· 7 rows, 0 new</em>"], ["reviewer", "verdict <em>· Ready</em>"], ["lead", "week <em>· 5 ready, 1 waiting</em>"]];
    var sEl = $("#rt-steps"), log = $("#rt-log"), prog = $("#rt-prog"), pct = $("#rt-pct"), mini = miniRows($("#rt-mini"));
    log.innerHTML = ""; pct.textContent = "0%"; $("#rt-status").textContent = "Copying 19 skills…";
    sEl.innerHTML = steps.map(function (s) { return '<div class="rstep"><span class="bx">[ ]</span>' + s[1] + " · " + s[0] + "</div>"; }).join("");
    prog.innerHTML = new Array(25).join("<i></i>");
    var lines = $$(".rstep", sEl), blocks = $$("i", prog), btn = $("#rt-open"), cur = $("#rt-cur");
    btn.classList.remove("ready", "press"); cur.style.transition = "none"; cur.style.transform = "translate(" + (innerWidth + 40) + "px," + (innerHeight + 40) + "px)";
    for (var k = 0; k < steps.length; k++) {
      lines[k].classList.add("go"); $(".bx", lines[k]).textContent = "[>]";
      await sleep(180); if (!alive()) return;
      lines[k].classList.replace("go", "ok"); $(".bx", lines[k]).textContent = "[x]";
      var d = document.createElement("div"); d.innerHTML = bot(feed[k][0], .24) + "<span>" + feed[k][1] + "</span>"; log.appendChild(d);
      if (mini[Math.min(k, mini.length - 1)]) mini[Math.min(k, mini.length - 1)].classList.add("on");
      var p = Math.round((k + 1) / steps.length * 100); pct.textContent = p + "%";
      blocks.forEach(function (b, j) { if (j < Math.round(p / 100 * blocks.length)) b.classList.add("on"); });
      await sleep(160); if (!alive()) return;
    }
    $("#rt-status").textContent = "Installed. 19 skills, 5 agents.";
    btn.classList.add("ready");
    var br = btn.getBoundingClientRect();
    await sleep(80);
    cur.style.transition = "transform .8s cubic-bezier(.2,.7,.1,1)";
    cur.style.transform = "translate(" + (br.left + br.width * .6) + "px," + (br.top + br.height * .45) + "px)";
    await sleep(950); if (!alive()) return;
    btn.classList.add("press"); await sleep(240); if (!alive()) return;
    /* 5. pull back out: the hero is the final frame */
    rt.classList.remove("on");
    await sleep(380); if (!alive()) return;
    rt.hidden = true;
    await tween(1500, function (t) { if (alive()) zoom(g, 1 - t); });
    if (!alive()) return;
    settle();
  }
  if (RM || noIntro) settle();
  else startIntro().catch(function () { settle(); });

  /* LIVE studio loop */
  (function live() {
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
    var started = false;
    new IntersectionObserver(function (es) { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .3 }).observe($("#live"));
    async function loop() {
      for (;;) {
        type.textContent = ""; out.innerHTML = ""; slots.forEach(function (s) { s.classList.remove("on"); }); rows.textContent = "0";
        for (var i = 0; i < brief.length; i++) { type.textContent += brief[i]; await sleep(22); }
        for (var k = 0; k < stages.length; k++) {
          var s = stages[k];
          b.className = "bot " + s[0]; n.textContent = "stage " + (k + 1) + " of 9"; c.textContent = (k + 1) + "/9";
          slots[k].classList.add("on"); rows.textContent = s[2];
          var o = document.createElement("div"); o.className = "o"; o.innerHTML = "<i>✓</i>" + s[1]; out.appendChild(o);
          if (out.children.length > 4) out.removeChild(out.firstChild);
          requestAnimationFrame(function () { o.classList.add("on"); });
          await sleep(1100);
        }
        await sleep(2400); if (RM) return;
      }
    }
  })();

  /* JOURNEY map */
  (function journey() {
    var NS = "http://www.w3.org/2000/svg", svg = $("#map");
    var N = [["01", "Intake", "sorter", 90, 90], ["02", "Brand", "librarian", 250, 70], ["03", "Library", "librarian", 420, 100], ["04", "Layers", "reviewer", 520, 230], ["05", "Atomic", "librarian", 370, 260], ["06", "Match + Remix", "maker", 200, 250], ["07", "Build", "maker", 90, 380], ["08", "Review", "reviewer", 240, 460], ["you", "You", "you", 400, 430], ["09", "Run", "lead", 515, 520]];
    var soft = { sorter: "#cfe9ff", librarian: "#D4C8F0", maker: "#ffd7bd", reviewer: "#c2ebcd", lead: "#C9F135", you: "#F5E6A3" };
    function el(t, a) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); return e; }
    var edges = [];
    for (var i = 1; i < N.length; i++) { var a = N[i - 1], b = N[i]; var mx = (a[3] + b[3]) / 2, my = (a[4] + b[4]) / 2 - 30; var p = el("path", { d: "M" + a[3] + " " + a[4] + " Q" + mx + " " + my + " " + b[3] + " " + b[4], "class": "edge" }); svg.appendChild(p); edges.push(p); }
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
      if (k === cur) return; cur = k;
      stops.forEach(function (s, j) { s.classList.toggle("on", j === k); });
      nodes.forEach(function (g, j) { g.classList.toggle("on", j === k); g._c.setAttribute("fill", j <= k ? soft[g._kind] : "#fff"); g._c.setAttribute("r", j === k ? 38 : 30); });
      edges.forEach(function (e, j) { e.classList.toggle("lit", j < k); });
      var n = N[k]; walker.style.transform = "translate(" + n[3] + "px," + (n[4] - 54) + "px)";
      body.setAttribute("fill", AG[n[2]]);
    }
    var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) set(stops.indexOf(e.target)); }); }, { rootMargin: innerWidth < 960 ? "-60% 0px -32% 0px" : "-45% 0px -45% 0px" });
    stops.forEach(function (s) { sio.observe(s); });
    set(0);
  })();

  /* poster parallax */
  var posters = $$(".poster[data-speed]"), tk = false;
  function px() { tk = false; var vh = innerHeight; posters.forEach(function (p) { var r = p.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return; p.style.setProperty("--py", ((r.top + r.height / 2 - vh / 2) * parseFloat(p.dataset.speed)).toFixed(1) + "px"); }); }
  if (!RM && innerWidth > 700) { addEventListener("scroll", function () { if (!tk) { tk = true; requestAnimationFrame(px); } }, { passive: true }); px(); }

  /* DEMOS */
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
  var dOn = false, order = ["brand", "atomic", "review"], oi = 0;
  new IntersectionObserver(function (es) { if (es[0].isIntersecting && !dOn) { dOn = true; show("brand", true); if (!RM) setInterval(function () { if (auto) { oi = (oi + 1) % 3; show(order[oi], true); } }, 9000); } }, { threshold: .25 }).observe($("#demos"));

  /* install terminal */
  var it = $("#iterm"), ran = false;
  async function type(s) { for (var i = 0; i < s.length; i++) { it.insertAdjacentText("beforeend", s[i]); await sleep(26); } }
  new IntersectionObserver(async function (es) {
    if (!es[0].isIntersecting || ran) return; ran = true;
    it.innerHTML = '<span class="p">›</span> '; await type("/plugin marketplace add ~/email-studio-plugin");
    it.insertAdjacentHTML("beforeend", '\n<span class="c">  marketplace email-studio added</span>\n<span class="p">›</span> '); await sleep(450);
    await type("/plugin install email-studio@email-studio"); await sleep(450);
    it.insertAdjacentHTML("beforeend", '\n<span class="c">  installed </span><span class="y">email-studio 1.0.0</span>\n<span class="c">  19 skills · 5 agents</span>\n\n<span class="p">›</span> '); await sleep(600);
    await type("/email-studio:new-brand Fernhill");
    it.insertAdjacentHTML("beforeend", '\n<span class="c">  sorter, librarian: on it</span>\n<span class="p">›</span> <span class="caret"></span>');
  }, { threshold: .4 }).observe(it);
})();
/* Immersive scroll for the hero: the scene drifts slower than the page and the computer recedes. */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var hbg = document.querySelector(".hbg"), hero = document.getElementById("hero"), tk = false;
  function f() {
    tk = false;
    if (document.body.classList.contains("intro-run")) return;
    var y = Math.min(scrollY, hero.offsetHeight), k = y / hero.offsetHeight;
    hbg.style.transformOrigin = "50% 30%";
    hbg.style.transform = "translateY(" + (y * 0.38).toFixed(1) + "px) scale(" + (1 + k * 0.08).toFixed(4) + ")";
  }
  addEventListener("scroll", function () { if (!tk) { tk = true; requestAnimationFrame(f); } }, { passive: true });
})();
