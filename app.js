/* Email Studio site v2: hero build, ticker, poster parallax, whiteboard process, demos, install terminal, reveals. */
(function () {
  "use strict";
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, RM ? 0 : ms); }); };

  /* nav */
  var nav = $("#nav");
  var onScroll = function () { nav.classList.toggle("solid", window.scrollY > 20); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* word split for h2 reveals */
  $$(".wsplit").forEach(function (el) {
    var i = 0;
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
            var w = document.createElement("span"); w.className = "wd";
            var s = document.createElement("span"); s.textContent = t; s.style.setProperty("--i", i++);
            w.appendChild(s); frag.appendChild(w);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1) walk(c);
      });
    };
    walk(el);
  });

  /* reveal observer */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
  $$(".rv,.wsplit,.board-wrap .poster,#atomize").forEach(function (el) { io.observe(el); });

  /* ticker */
  var stages = [["Intake", ""], ["Brand", "extracted"], ["Library", ""], ["Email", "Layers"], ["Atomic", "Emails"], ["Template", "Remix"], ["Build", "in Figma"], ["Preflight", ""], ["You", "approve"], ["Run", "the week"]];
  var tk = $("#ticker");
  var html = stages.map(function (s) { return "<span>" + s[0] + (s[1] ? " <em>" + s[1] + "</em>" : "") + "</span>"; }).join("");
  tk.innerHTML = html + html;

  /* hero: rows assemble, cursor selects, verdict */
  var hero = $("#hero");
  requestAnimationFrame(function () { hero.classList.add("in"); });
  var rows = $$("#hero-mail .row"), lays = $$("#hero-layers .lay"), cur = $("#hero-cursor"), ver = $("#hero-verdict");
  var canvas = cur.parentNode;
  function moveTo(el) {
    var c = canvas.getBoundingClientRect(), r = el.getBoundingClientRect();
    cur.style.transform = "translate(" + (r.left - c.left + r.width * 0.72) + "px," + (r.top - c.top + r.height * 0.5) + "px)";
  }
  async function heroLoop() {
    for (;;) {
      rows.forEach(function (r) { r.classList.remove("in", "sel"); }); lays.forEach(function (l) { l.classList.remove("on", "ok"); }); ver.classList.remove("in");
      await wait(500);
      for (var i = 0; i < rows.length; i++) {
        rows[i].classList.add("in", "sel"); lays[i].classList.add("on"); moveTo(rows[i]);
        await wait(720);
        rows[i].classList.remove("sel"); lays[i].classList.remove("on"); lays[i].classList.add("ok");
      }
      ver.classList.add("in");
      cur.style.transform = "translate(" + (canvas.clientWidth - 40) + "px," + (canvas.clientHeight - 70) + "px)";
      await wait(3600);
      if (RM) return;
    }
  }
  heroLoop();

  /* poster parallax */
  var posters = $$(".poster[data-speed]");
  var ticking = false;
  function parallax() {
    ticking = false;
    var vh = window.innerHeight;
    posters.forEach(function (p) {
      var r = p.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var d = (r.top + r.height / 2 - vh / 2) * parseFloat(p.dataset.speed);
      p.style.setProperty("--py", d.toFixed(1) + "px");
    });
  }
  if (!RM && window.innerWidth > 700) {
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }, { passive: true });
    parallax();
  }

  /* whiteboard */
  var NS = "http://www.w3.org/2000/svg";
  var nodes = [
    ["01", "Intake", 30, 30], ["02", "Brand", 240, 30], ["03", "Library", 450, 30],
    ["04", "Layers", 450, 200], ["05", "Atomic", 240, 200], ["06", "Match + Remix", 30, 200],
    ["07", "Build", 30, 370], ["08", "Review", 240, 370], ["You", "approve", 450, 370], ["09", "Run", 240, 540]
  ];
  var NW = 140, NH = 64;
  var svg = $("#wb-svg");
  var wires = [], gs = [];
  function el(t, a) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); return e; }
  function centre(n) { return [n[2] + NW / 2, n[3] + NH / 2]; }
  for (var i = 1; i < nodes.length; i++) {
    var a = centre(nodes[i - 1]), b = centre(nodes[i]), d;
    if (a[1] === b[1]) d = "M" + a[0] + " " + a[1] + " C" + (a[0] + b[0]) / 2 + " " + (a[1] - 40) + " " + (a[0] + b[0]) / 2 + " " + (b[1] - 40) + " " + b[0] + " " + b[1];
    else d = "M" + a[0] + " " + a[1] + " C" + a[0] + " " + (a[1] + b[1]) / 2 + " " + b[0] + " " + (a[1] + b[1]) / 2 + " " + b[0] + " " + b[1];
    var w = el("path", { d: d, "class": "wire" }); svg.appendChild(w); wires.push(w);
  }
  var loop = el("path", { d: "M240 572 C 0 600 -10 300 30 62", "class": "wire", "stroke-dasharray": "5 7" }); svg.appendChild(loop);
  var lt = el("text", { x: 70, y: 600, "font-family": "IBM Plex Mono", "font-size": 11, fill: "#4f5c55" }); lt.textContent = "next week, smarter"; svg.appendChild(lt);
  nodes.forEach(function (n, idx) {
    var outer = el("g", { transform: "translate(" + n[2] + " " + n[3] + ")" });
    var g = el("g", { "class": "node" + (n[0] === "You" ? " human" : "") }); outer.appendChild(g);
    g.appendChild(el("rect", { "class": "box", width: NW, height: NH, rx: 14 }));
    g.appendChild(el("rect", { "class": "hl", x: 12, y: 30, width: NW - 24, height: 20, rx: 3 }));
    var t1 = el("text", { "class": "n", x: 14, y: 22 }); t1.textContent = n[0] === "You" ? "human" : n[0];
    var t2 = el("text", { x: 14, y: 45 }); t2.textContent = n[0] === "You" ? "You approve" : n[1];
    g.appendChild(t1); g.appendChild(t2);
    g.addEventListener("click", function () { var s = $$(".step")[idx]; if (s) s.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "center" }); });
    svg.appendChild(outer); gs.push(g);
  });
  wires.forEach(function (w) { w.style.setProperty("--len", Math.ceil(w.getTotalLength())); });
  var steps = $$(".step"), current = -1;
  function setStep(k) {
    if (k === current) return; current = k;
    steps.forEach(function (s, j) { s.classList.toggle("on", j === k); });
    gs.forEach(function (g, j) { g.classList.toggle("on", j === k); g.classList.toggle("done", j < k); });
    wires.forEach(function (w, j) {
      var lit = j < k;
      if (lit && !w.classList.contains("lit")) w.classList.add("lit");
      if (!lit) w.classList.remove("lit");
    });
  }
  var sio = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) setStep(+e.target.dataset.i); });
  }, { rootMargin: window.innerWidth < 960 ? "-62% 0px -30% 0px" : "-45% 0px -45% 0px" });
  steps.forEach(function (s) { sio.observe(s); });
  setStep(0);

  /* demos */
  var demos = {
    brand: {
      title: "~/email-studio-work · claude",
      cap: "stage 02 · brand-extract",
      h: "A website in. <em>A brand file out.</em>",
      p: "brand-extract runs dembrandt on the brand's site and writes BRAND.md: colours, type, components and motion. Then rules-sweep adds the hard and soft rules from comments and client edits.",
      run: async function (body, alive) {
        body.innerHTML = '<div class="term"></div>'; var t = $(".term", body);
        var lines = [
          ['<span class="p">›</span> extract the brand for fernhill.example', 0],
          ['<span class="c">  running npx dembrandt fernhill.example</span>', 600],
          ['<span class="c">  colours ........ </span><span class="y">6 found</span>', 700],
          ['<span class="c">  type ........... </span><span class="y">2 families, 7 sizes</span>', 500],
          ['<span class="c">  components ..... </span><span class="y">buttons, cards, inputs</span>', 500],
          ['<span class="c">  motion ......... </span><span class="y">3 easings</span>', 500],
          ['  wrote <span class="v">brands/fernhill/BRAND.md</span>', 600],
          ['  wrote <span class="v">brands/fernhill/rules.md</span> <span class="c">(hard 0 · soft 0 · waiting for rules-sweep)</span>', 500],
          ['<span class="p">›</span> <span class="caret"></span>', 400]
        ];
        for (var i = 0; i < lines.length; i++) { if (!alive()) return; await wait(lines[i][1]); t.innerHTML += lines[i][0] + "\n"; if (i === 2) { var sw = document.createElement("div"); sw.className = "swatches"; ["#2c2a26", "#f1ede6", "#b99f7c", "#8c6f4f", "#d8cbb4", "#3f5a46"].forEach(function (c) { var x = document.createElement("i"); x.style.background = c; sw.appendChild(x); }); t.appendChild(sw); $$("i", sw).forEach(function (x, j) { setTimeout(function () { x.classList.add("in"); }, RM ? 0 : 80 * j); }); t.appendChild(document.createTextNode("\n")); } }
      }
    },
    atomic: {
      title: "Fernhill · Approved · Figma",
      cap: "stage 05 · atomic-emails",
      h: "Cut it once. <em>Reuse it forever.</em>",
      p: "atomic-emails reads an approved email, proposes the cut as a dry run, and a reviewer reads it before any part is written: organisms, molecules and atoms, named for the next build.",
      run: async function (body, alive) {
        body.innerHTML = '<div class="split"><div class="mail">' + $("#hero-mail").innerHTML.replace(/class="row[^"]*"/g, 'class="row in"') + '</div><div class="parts"></div></div>';
        var P = $(".parts", body);
        var parts = [["o", "organism", "Hero / Image + headline"], ["o", "organism", "Products / Grid 2"], ["m", "molecule", "CTA / Button"], ["m", "molecule", "Body / Copy block"], ["a", "atom", "Logo / Wordmark"], ["a", "atom", "Footer / Legal"], ["a", "atom", "Type / Headline 26"]];
        await wait(500);
        for (var i = 0; i < parts.length; i++) { if (!alive()) return; var d = document.createElement("div"); d.className = "part " + parts[i][0]; d.innerHTML = "<b>" + parts[i][1] + "</b>" + parts[i][2]; P.appendChild(d); await wait(30); d.classList.add("in"); await wait(480); }
        var r = document.createElement("div"); r.className = "part in"; r.style.background = "#13233d"; r.innerHTML = '<b style="background:#17904f;color:#fff">review</b>dry run read · 7 parts · approve?'; P.appendChild(r);
      }
    },
    review: {
      title: "Preflight · Weekend edit",
      cap: "stage 08 · preflight",
      h: "Evidence, <em>then a verdict.</em>",
      p: "preflight runs the 7 point checklist on the built email, labels every row Observed, Inferred or Substituted, and gives one of four verdicts. You approve or reject each finding.",
      run: async function (body, alive) {
        var cks = [["Rows from approved layouts only", "observed"], ["Layer names follow Email Layers", "observed"], ["Alt text on every image", "observed"], ["Mobile type 14px or larger", "observed"], ["Hero differs from the last 3 sends", "inferred"], ["Product photo swapped from library", "substituted"], ["Dark mode check", "observed"]];
        body.innerHTML = '<div class="check">' + cks.map(function (c) { return '<div class="ck"><i></i>' + c[0] + "<small>" + c[1] + "</small></div>"; }).join("") + '<div class="ck-verdict"><span>Verdict</span><span>Ready with substitutions</span></div></div>';
        var rowsEl = $$(".ck", body);
        await wait(400);
        for (var i = 0; i < rowsEl.length; i++) { if (!alive()) return; rowsEl[i].classList.add(cks[i][1] === "substituted" ? "sub" : "ok"); await wait(420); }
        $(".ck-verdict", body).classList.add("in");
      }
    }
  };
  var token = 0, tabs = $$(".tab");
  function showDemo(k) {
    var d = demos[k], my = ++token;
    tabs.forEach(function (t) { t.setAttribute("aria-selected", t.dataset.demo === k ? "true" : "false"); });
    $("#demo-title").textContent = d.title; $("#demo-cap").textContent = d.cap;
    $("#demo-copy").innerHTML = '<p class="eyebrow">' + d.cap + "</p><h3>" + d.h + "</h3><p>" + d.p + "</p>";
    d.run($("#demo-body"), function () { return my === token; });
  }
  tabs.forEach(function (t) { t.addEventListener("click", function () { showDemo(t.dataset.demo); auto = false; }); });
  var auto = true, demoStarted = false, order = ["brand", "atomic", "review"], oi = 0;
  var dio = new IntersectionObserver(function (es) {
    if (es[0].isIntersecting && !demoStarted) {
      demoStarted = true; showDemo("brand");
      if (!RM) setInterval(function () { if (auto) { oi = (oi + 1) % 3; showDemo(order[oi]); } }, 9000);
    }
  }, { threshold: 0.25 });
  dio.observe($("#demos"));
  showDemo("brand"); token++; // render copy immediately; animation starts on view

  /* install terminal */
  var it = $("#install-term"), installed = false;
  async function typeInto(el, text) { for (var i = 0; i < text.length; i++) { el.innerHTML += text[i] === "<" ? "&lt;" : text[i]; await wait(28); } }
  var iio = new IntersectionObserver(async function (es) {
    if (!es[0].isIntersecting || installed) return; installed = true;
    it.innerHTML = '<span class="p">›</span> ';
    await typeInto(it, "/plugin marketplace add ~/email-studio-plugin");
    it.innerHTML += '\n<span class="c">  marketplace email-studio added</span>\n<span class="p">›</span> ';
    await wait(500);
    await typeInto(it, "/plugin install email-studio@email-studio");
    await wait(500);
    it.innerHTML += '\n<span class="c">  installed </span><span class="y">email-studio 1.0.0</span>\n<span class="c">  19 skills · 5 agents · 5 commands</span>\n\n<span class="p">›</span> ';
    await wait(700);
    await typeInto(it, "/email-studio:new-brand Fernhill");
    it.innerHTML += '\n<span class="c">  stage 01 intake · stage 02 brand · ready</span>\n<span class="p">›</span> <span class="caret"></span>';
  }, { threshold: 0.4 });
  iio.observe(it);
})();
