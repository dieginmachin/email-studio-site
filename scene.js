/* Pixel scene: a retro computer on a grassy hill, drawn small and ordered-dithered (Bayer 4x4),
   then scaled up with image-rendering: pixelated. Our own drawing; the Pinterest image is only a reference.
   window.ESScene.paint(canvas, {w, h, seed, reveal}) returns the screen rect in 0..1 units. */
(function () {
  "use strict";
  var B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 1e6) / 1e6; }; }
  function noise(seed) {
    var r = rng(seed), N = 64, p = new Float32Array(N * N);
    for (var i = 0; i < N * N; i++) p[i] = r();
    function g(x, y) { return p[((y & 63) * N) + (x & 63)]; }
    function sm(t) { return t * t * (3 - 2 * t); }
    return function (x, y) {
      var xi = Math.floor(x), yi = Math.floor(y), xf = sm(x - xi), yf = sm(y - yi);
      var a = g(xi, yi), b = g(xi + 1, yi), c = g(xi, yi + 1), d = g(xi + 1, yi + 1);
      return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
    };
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mixc(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }

  function paint(cv, o) {
    o = o || {};
    var W = o.w || 240, H = o.h || 300, seed = o.seed || 7;
    cv.width = W; cv.height = H;
    var c = cv.getContext("2d");
    var img = c.createImageData(W, H), d = img.data;
    var n1 = noise(seed), n2 = noise(seed + 11), n3 = noise(seed + 23);
    var portrait = H > W;
    var horizon = portrait ? 0.56 : 0.6;
    // computer geometry (units of W/H)
    var cw = portrait ? 0.46 : 0.26, cx = 0.5 - cw / 2 + (portrait ? 0.02 : 0.03);
    function hillY0(x) { return horizon + 0.035 * Math.sin(x * 3.1 + 0.6) - 0.05 * (x - 0.5) + 0.015 * Math.sin(x * 9.7); }
    var bh = cw * 0.16 * W / H, hc = Math.min(hillY0(cx), hillY0(cx + cw));
    var base = { x: cx - cw * 0.12, y: hc + 0.018 - bh, w: cw * 1.12, h: bh };
    var mon = { x: cx + cw * 0.08, y: base.y - cw * 0.78 * W / H, w: cw * 0.86, h: cw * 0.78 * W / H };
    var side = { x: mon.x + mon.w, w: cw * 0.2 };
    var scr = { x: mon.x + mon.w * 0.1, y: mon.y + mon.h * 0.12, w: mon.w * 0.72, h: mon.h * 0.62 };
    var beige = [234, 229, 214], beigeS = [196, 189, 170], beigeD = [150, 143, 126], ink = [40, 38, 34];
    var sky1 = [46, 110, 214], sky2 = [120, 172, 236], sky3 = [172, 204, 240];
    var gA = [92, 128, 44], gB = [150, 150, 52], gC = [196, 128, 58], gD = [44, 72, 26];
    function hillY(x) { return horizon + 0.035 * Math.sin(x * 3.1 + 0.6) - 0.05 * (x - 0.5) + 0.015 * Math.sin(x * 9.7); }
    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var u = x / W, v = y / H, col;
        var hy = hillY(u);
        if (v < hy) {
          var t = v / hy;
          col = t < 0.7 ? mixc(sky1, sky2, t / 0.7) : mixc(sky2, sky3, (t - 0.7) / 0.3);
          // clouds
          var cl = n1(u * 7, v * 16) * 0.6 + n2(u * 15, v * 30) * 0.4;
          var band = Math.max(0, 1 - Math.abs(v - (0.22 + 0.1 * Math.sin(u * 4))) * 5.5);
          var right = Math.max(0, 1 - Math.abs(v - 0.34) * 9) * Math.max(0, (u - 0.55) * 2);
          var cv2 = Math.max(0, cl - 0.5) * 2.6 * Math.max(band * 0.6, right);
          col = mixc(col, [246, 248, 252], Math.min(1, cv2));
        } else {
          var dd = (v - hy) / (1 - hy);
          var gn = n1(u * 26, v * 60) * 0.5 + n2(u * 60, v * 140) * 0.3 + n3(u * 8, v * 14) * 0.2;
          col = mixc(gA, gB, gn);
          if (n3(u * 11 + 3, v * 22) > 0.62) col = mixc(col, gC, (n3(u * 11 + 3, v * 22) - 0.62) * 2.2);
          col = mixc(col, gD, Math.min(1, dd * 1.1 + (n2(u * 4, v * 6) - 0.5) * 0.4));
          if (dd < 0.03) col = mixc(col, [214, 196, 120], 0.35); // sunlit crest
        }
        // computer
        var inside = function (r) { return u >= r.x && u < r.x + r.w && v >= r.y && v < r.y + r.h; };
        if (inside(base)) {
          col = beige;
          if (v > base.y + base.h * 0.82) col = beigeS;
          if (u > base.x + base.w * 0.55 && u < base.x + base.w * 0.85 && v > base.y + base.h * 0.35 && v < base.y + base.h * 0.62) col = beigeD; // drive slot
          if (u > base.x + base.w * 0.08 && u < base.x + base.w * 0.3 && Math.abs(v - (base.y + base.h * 0.5)) < base.h * 0.06) col = beigeD;
        }
        var sideTopShift = (u - side.x) * 0.35;
        if (u >= side.x && u < side.x + side.w && v >= mon.y + sideTopShift * W / H && v < mon.y + mon.h - sideTopShift * W / H * 0.2) col = mixc(beigeS, beigeD, (u - side.x) / side.w * 0.8);
        if (inside(mon)) {
          col = beige;
          if (v > mon.y + mon.h * 0.86) col = mixc(beige, beigeS, 0.6);
          if (inside(scr)) {
            var sv = (v - scr.y) / scr.h, su = (u - scr.x) / scr.w;
            col = mixc([62, 112, 214], [36, 76, 170], sv * 0.8 + su * 0.2);
            if (su < 0.04 || sv < 0.05) col = mixc(col, ink, 0.55); // bevel
            if (su > 0.08 && su < 0.42 && sv > 0.1 && sv < 0.3) col = mixc(col, [150, 190, 250], 0.35); // glare
          }
          if (u > mon.x + mon.w * 0.68 && u < mon.x + mon.w * 0.84 && Math.abs(v - (mon.y + mon.h * 0.92)) < mon.h * 0.02) col = beigeD;
        }
        // shadow under the computer
        if (v > base.y + base.h && v < base.y + base.h + 0.025 && u > base.x + 0.01 && u < base.x + base.w + 0.05 && v > hillY(u)) col = mixc(col, gD, 0.55);
        // ordered dither to a small palette
        var th = (B4[(y & 3) * 4 + (x & 3)] / 16 - 0.5) * 34;
        var i = (y * W + x) * 4;
        d[i] = Math.max(0, Math.min(255, Math.round((col[0] + th) / 34) * 34));
        d[i + 1] = Math.max(0, Math.min(255, Math.round((col[1] + th) / 34) * 34));
        d[i + 2] = Math.max(0, Math.min(255, Math.round((col[2] + th) / 34) * 34));
        d[i + 3] = 255;
      }
    }
    c.putImageData(img, 0, 0);
    cv._img = img;
    return { x: scr.x, y: scr.y, w: scr.w, h: scr.h, mon: mon };
  }

  /* Reveal the painted canvas pixel by pixel in Bayer order (t from 0 to 1). */
  function reveal(cv, t, bg) {
    var img = cv._img; if (!img) return;
    var c = cv.getContext("2d"), W = cv.width, H = cv.height;
    var out = c.createImageData(W, H), s = img.data, d = out.data, k = t * 16;
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var i = (y * W + x) * 4, on = B4[(y & 3) * 4 + (x & 3)] < k;
      d[i] = on ? s[i] : bg[0]; d[i + 1] = on ? s[i + 1] : bg[1]; d[i + 2] = on ? s[i + 2] : bg[2]; d[i + 3] = 255;
    }
    c.putImageData(out, 0, 0);
  }
  window.ESScene = { paint: paint, reveal: reveal };
})();
