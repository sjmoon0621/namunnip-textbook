/* 카드: 현무암과 화강암은 왜 알갱이 크기가 다를까? — 결정 성장 모의 실험(모식)과 화성암 분류 */
(() => {
  const root = document.getElementById("card-earth-igneous");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sCool = $(".cool"), sSi = $(".si"), oCool = $(".cool-out"), oSi = $(".si-out"), two = $(".two");
  const nTex = $(".ntex"), nName = $(".nname"), nDark = $(".ndark");

  const N = 120; // 박편 격자
  const MIN = [
    { k: "ol", name: "감람석", col: [138, 160, 90], dark: true, asp: 1.2, w: (s) => Math.max(0, 1 - s * 2.6) * 0.22 },
    { k: "px", name: "휘석", col: [62, 74, 54], dark: true, asp: 1.5, w: (s) => (1 - s) * 0.34 },
    { k: "am", name: "각섬석", col: [44, 44, 40], dark: true, asp: 2.2, w: (s) => 0.22 * Math.exp(-((s - 0.45) / 0.25) ** 2) },
    { k: "bt", name: "흑운모", col: [70, 48, 32], dark: true, asp: 1.8, w: (s) => 0.1 * s },
    { k: "pl", name: "사장석", col: [236, 234, 224], dark: false, asp: 2.8, w: (s) => 0.42 * (1 - 0.45 * s) },
    { k: "kf", name: "정장석", col: [229, 185, 165], dark: false, asp: 1.6, w: (s) => 0.36 * s * s },
    { k: "qz", name: "석영", col: [205, 212, 216], dark: false, asp: 1.1, w: (s) => 0.36 * Math.max(0, s - 0.3) / 0.7 },
  ];
  let seed = 1;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  let owner = null, arrive = null, grains = [], tEnd = 1, darkFrac = 0;

  function mix(s) {
    const ws = MIN.map((m) => m.w(s)), sum = ws.reduce((a, b) => a + b, 0);
    return ws.map((x) => x / sum);
  }
  function pickMin(p) { let r = rnd(), i = 0; while (i < p.length - 1 && r > p[i]) { r -= p[i]; i++; } return i; }

  function solidify() {
    seed = 11 + Math.round(+sCool.value * 100) + Math.round(+sSi.value) * 7 + (two.checked ? 3 : 0);
    const cool = +sCool.value, s = (+sSi.value - 45) / 30, p = mix(s);
    grains = [];
    const add = (n, t0, t1, speed) => {
      for (let i = 0; i < n; i++) {
        const m = pickMin(p), M = MIN[m], th = rnd() * Math.PI;
        grains.push({ x: rnd() * N, y: rnd() * N, t: t0 + rnd() * (t1 - t0), v: speed * (0.8 + 0.4 * rnd()), m, c: Math.cos(th), sn: Math.sin(th), a: M.asp, j: 0.9 + 0.2 * rnd() });
      }
    };
    if (two.checked) {
      add(7, 0, 0.1, 0.75);           // 깊은 곳에서 천천히 자란 큰 결정(반정)
      add(Math.round(900 + 900 * cool), 0.55, 0.62, 0.9); // 분출 뒤 빨리 굳은 바탕
    } else if (cool < 0.94) {
      const n = Math.round(10 * Math.pow(10, cool * 2.45));
      add(n, 0, 0.35, 22 / Math.sqrt(n));
    }
    owner = new Int32Array(N * N).fill(-1); arrive = new Float32Array(N * N).fill(1e9);
    // 핵이 많으면 가까운 핵만 찾도록 칸 나누기
    const B = 12, bins = Array.from({ length: B * B }, () => []);
    grains.forEach((g, i) => bins[Math.min(B - 1, Math.floor(g.y / N * B)) * B + Math.min(B - 1, Math.floor(g.x / N * B))].push(i));
    const reach = grains.length > 300 ? 2 : B;
    let darkCells = 0; tEnd = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const bx = Math.floor(x / N * B), by = Math.floor(y / N * B);
      let best = -1, bt = 1e9;
      for (let yy = Math.max(0, by - reach); yy <= Math.min(B - 1, by + reach); yy++) for (let xx = Math.max(0, bx - reach); xx <= Math.min(B - 1, bx + reach); xx++) {
        for (const i of bins[yy * B + xx]) {
          const g = grains[i], dx = x + .5 - g.x, dy = y + .5 - g.y;
          const u = dx * g.c + dy * g.sn, v = -dx * g.sn + dy * g.c;
          const d = Math.sqrt(u * u / g.a + v * v * g.a);
          const t = g.t + d / g.v / 40;
          if (t < bt) { bt = t; best = i; }
        }
      }
      if (two.checked && best >= 0 && grains[best].t < 0.2 && bt > 0.5) {
        // 반정이 분출 전까지만 자라도록: 늦게 도착한 반정 칸은 바탕에 넘긴다
        let b2 = -1, t2 = 1e9;
        for (let yy = Math.max(0, by - 2); yy <= Math.min(B - 1, by + 2); yy++) for (let xx = Math.max(0, bx - 2); xx <= Math.min(B - 1, bx + 2); xx++) {
          for (const i of bins[yy * B + xx]) {
            const g = grains[i]; if (g.t < 0.2) continue;
            const dx = x + .5 - g.x, dy = y + .5 - g.y, u = dx * g.c + dy * g.sn, v = -dx * g.sn + dy * g.c;
            const t = g.t + Math.sqrt(u * u / g.a + v * v * g.a) / g.v / 40;
            if (t < t2) { t2 = t; b2 = i; }
          }
        }
        if (b2 >= 0) { best = b2; bt = t2; }
      }
      owner[y * N + x] = best; arrive[y * N + x] = bt;
      if (best >= 0) { tEnd = Math.max(tEnd, bt); if (MIN[grains[best].m].dark) darkCells++; }
    }
    darkFrac = grains.length ? darkCells / (N * N) : p.reduce((a, q, i) => a + (MIN[i].dark ? q : 0), 0);
    tEnd = Math.max(tEnd, 0.4);
  }

  const off = document.createElement("canvas"); off.width = N; off.height = N;
  const octx = off.getContext("2d");
  function paint(tNow) {
    const img = octx.createImageData(N, N), d = img.data;
    const s = (+sSi.value - 45) / 30;
    const glass = [60 + 90 * s, 58 + 70 * s, 56 + 60 * s];
    for (let i = 0; i < N * N; i++) {
      const o = i * 4, g = owner[i];
      let col;
      if (g < 0) col = glass;
      else if (arrive[i] > tNow) col = [196, 98, 60]; // 아직 녹아 있는 부분
      else {
        const G = grains[g], base = MIN[G.m].col;
        const x = i % N, y = (i / N) | 0;
        const edge = (x < N - 1 && owner[i + 1] !== g) || (y < N - 1 && owner[i + N] !== g);
        const f = edge ? 0.55 : G.j;
        col = [base[0] * f, base[1] * f, base[2] * f];
      }
      d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
    }
    octx.putImageData(img, 0, 0);
  }

  const { ctx, size } = fit(cv, () => draw());
  let tNow = 1e9;
  function draw() {
    const { w, h } = size; if (!w || !owner) return;
    ctx.clearRect(0, 0, w, h);
    const sq = Math.min(h - 30, w * 0.48), sx = 8, sy = 20;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, sx, sy, sq, sq);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(sx + .5, sy + .5, sq, sq);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("확대한 암석 단면 (모식)", sx, 12);
    // 오른쪽: 분류표
    const cool = +sCool.value, si = +sSi.value;
    const col = si < 52 ? 0 : si < 63 ? 1 : 2, row = two.checked || cool >= 0.5 ? 0 : 1;
    const tx = sx + sq + 18, tw = w - tx - 8, cw = tw / 3, th = 38, ty = sy + 30;
    const names = [["현무암", "안산암", "유문암"], ["반려암", "섬록암", "화강암"]];
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    ["염기성", "중성", "산성"].forEach((n, i) => ctx.fillText(n, tx + cw * i + cw / 2, ty - 16));
    ["SiO₂ < 52%", "52~63%", "> 63%"].forEach((n, i) => ctx.fillText(n, tx + cw * i + cw / 2, ty - 4));
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
      const x = tx + c * cw, y = ty + r * th, on = r === row && c === col && cool < 0.94 || (r === row && c === col && two.checked);
      ctx.fillStyle = on ? C.ink : r ? "#ecece5" : "#f3f3ee"; ctx.fillRect(x, y, cw - 2, th - 2);
      ctx.fillStyle = on ? C.paper : C.ink; ctx.font = `600 13px ${F.sans}`;
      ctx.fillText(names[r][c], x + cw / 2 - 1, y + th / 2 + 4);
    }
    ctx.textAlign = "left"; ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink2;
    ctx.fillText("↑ 화산암 · 빨리 식음 · 세립질", tx, ty + 2 * th + 14);
    ctx.fillText("↓ 심성암 · 천천히 식음 · 조립질", tx, ty + 2 * th + 30);
    // 광물 조성 막대
    const by = ty + 2 * th + 52, bh = 14, p = mix((si - 45) / 30);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.fillText("광물 조성 (모식)", tx, by - 5);
    let x = tx;
    p.forEach((q, i) => {
      const ww = q * tw; if (ww < .5) return;
      const cc = MIN[i].col; ctx.fillStyle = `rgb(${cc})`; ctx.fillRect(x, by, ww, bh);
      x += ww;
    });
    ctx.strokeStyle = C.ink3; ctx.strokeRect(tx + .5, by + .5, tw - 1, bh - 1);
    // 범례
    ctx.font = `10.5px ${F.sans}`;
    let lx = tx, ly = by + bh + 14;
    MIN.forEach((m, i) => {
      if (p[i] < 0.02) return;
      const lab = m.name, lw = ctx.measureText(lab).width + 20;
      if (lx + lw > tx + tw) { lx = tx; ly += 15; }
      ctx.fillStyle = `rgb(${m.col})`; ctx.fillRect(lx, ly - 8, 9, 9);
      ctx.strokeStyle = C.ink3; ctx.strokeRect(lx + .5, ly - 7.5, 8, 8);
      ctx.fillStyle = C.ink2; ctx.fillText(lab, lx + 12, ly);
      lx += lw;
    });
  }

  let raf = 0;
  function regrow(animate) {
    solidify();
    cancelAnimationFrame(raf);
    if (!animate || NM.reduce) { tNow = 1e9; paint(tNow); draw(); readout(); return; }
    const t0 = performance.now(), dur = 1600;
    const step = (now) => {
      const q = clamp((now - t0) / dur, 0, 1); tNow = q * tEnd * 1.001; paint(tNow); draw();
      if (q < 1) raf = requestAnimationFrame(step); else { tNow = 1e9; paint(tNow); draw(); }
    };
    raf = requestAnimationFrame(step); readout();
  }
  function readout() {
    const cool = +sCool.value, si = +sSi.value;
    oCool.textContent = cool < 0.25 ? "지하 깊은 곳 · 수만 년 이상" : cool < 0.5 ? "지하 얕은 곳 · 천천히" : cool < 0.94 ? "지표 · 며칠~몇 년" : "물이나 공기에 닿아 급랭";
    oSi.textContent = `${si}%`;
    const col = si < 52 ? 0 : si < 63 ? 1 : 2;
    let tex, name;
    if (two.checked) { tex = "반상 조직"; name = ["현무암", "안산암", "유문암"][col] + " (반상)"; }
    else if (cool >= 0.94) { tex = "유리질"; name = col === 2 ? "흑요암 (화산 유리)" : "화산 유리"; }
    else if (cool >= 0.5) { tex = "세립질"; name = ["현무암", "안산암", "유문암"][col]; }
    else { tex = "조립질"; name = ["반려암", "섬록암", "화강암"][col]; }
    nTex.textContent = tex; nName.textContent = name;
    nDark.textContent = `${Math.round(mix((si - 45) / 30).reduce((a, q, i) => a + (MIN[i].dark ? q : 0), 0) * 100)}%`;
  }
  sCool.addEventListener("change", () => regrow(true));
  sSi.addEventListener("change", () => regrow(true));
  sCool.addEventListener("input", readout);
  sSi.addEventListener("input", () => { readout(); draw(); });
  two.addEventListener("change", () => regrow(true));
  $(".again").addEventListener("click", () => regrow(true));
  root.querySelectorAll("[data-rock]").forEach((b) => b.addEventListener("click", () => {
    const [c, s] = b.dataset.rock.split(","); sCool.value = c; sSi.value = s; two.checked = false; regrow(true);
  }));
  regrow(false);
})();
