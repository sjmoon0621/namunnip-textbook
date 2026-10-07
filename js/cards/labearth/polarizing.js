/* 카드: 박편 속 투명한 알갱이들을 편광 현미경으로 어떻게 구별할까? — 개방·직교 니콜, 다색성, 간섭색(미셸-레비), 소광각, 쌍정 */
(() => {
  const root = document.getElementById("card-labearth-polarizing");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const D2R = Math.PI / 180;
  const N = 320;

  /* 광물 자료. d: 복굴절(대표값), ppl: 개방 니콜 색(선형 투과율), par/perp: 벽개가 하부 편광판과 나란할 때/수직일 때 색(다색성),
     ext: 벽개·긴 방향에서 잰 소광각 범위(°), rel: 돋을새김(윤곽 진하기), cl: 벽개 간격(px) */
  const M = {
    qz: { name: "석영", d: 0.009, ppl: [0.97, 0.97, 0.96], rel: 0.12, ref: false },
    or: { name: "정장석", d: 0.006, ppl: [0.86, 0.84, 0.8], rel: 0.14, ext: [5, 12], twin: "carls", ref: true, cl: 9, cla: 0.12 },
    pl: { name: "사장석", d: 0.009, ppl: [0.96, 0.96, 0.95], rel: 0.16, ext: [10, 28], twin: "albite", ref: true },
    bt: { name: "흑운모", d: 0.05, par: [0.36, 0.2, 0.08], perp: [0.93, 0.84, 0.6], rel: 0.3, ext: [0, 2], ref: true, cl: 3, cla: 0.35 },
    hb: { name: "각섬석", d: 0.022, par: [0.22, 0.42, 0.22], perp: [0.76, 0.8, 0.52], rel: 0.4, ext: [15, 25], ref: true, cl: 6, cla: 0.3 },
    px: { name: "휘석", d: 0.025, par: [0.88, 0.86, 0.76], perp: [0.92, 0.9, 0.82], rel: 0.55, ext: [38, 45], ref: true, cl: 6, cla: 0.25 },
    ol: { name: "감람석", d: 0.04, ppl: [0.95, 0.97, 0.9], rel: 0.6, ext: [0, 1], ref: true, crack: true },
    cc: { name: "방해석", d: 0.172, ppl: [0.97, 0.97, 0.97], rel: 0.2, twin: "poly", ref: false, twinkle: true },
    gl: { name: "화산 유리", iso: true, ppl: [0.72, 0.58, 0.42], rel: 0.1, ref: false },
    mt: { name: "자철석", opaque: true, rel: 1, ref: false },
  };
  const SAMP = { granite: "A", basalt: "B", marble: "C" };
  const HINT = {
    qz: "무색, 벽개 없음, 1차 회백색이고 쌍정이 없습니다. 풍화된 흔적이 없어 맑습니다.",
    or: "약간 뿌옇고(풍화로 생긴 점토), 1차 회색입니다. 알갱이가 반쪽씩 따로 소광하는 칼스바드 쌍정을 찾으세요.",
    pl: "무색이고 1차 회백색이지만 줄무늬가 번갈아 소광합니다(알바이트 쌍정).",
    bt: "개방 니콜에서 갈색 ↔ 연노랑으로 색이 크게 바뀌고(다색성), 벽개와 나란하게 소광합니다.",
    hb: "초록색 다색성, 2차 간섭색, 벽개에서 15~25° 기울어 소광합니다.",
    px: "거의 무색이고 윤곽이 뚜렷하며, 2차 간섭색과 약 40°의 경사 소광을 보입니다.",
    ol: "무색, 윤곽이 진하고 불규칙한 균열이 있으며, 2~3차의 화려한 간섭색과 평행 소광을 보입니다.",
    cc: "재물대를 돌리면 윤곽이 깜박이듯 바뀌고, 간섭색이 고차 백색입니다. 가는 쌍정 줄무늬가 있습니다.",
    gl: "결정이 아니어서 직교 니콜에서 어느 각도로 돌려도 검습니다.",
    mt: "빛이 통하지 않아 두 니콜 모두에서 검습니다(불투명 광물).",
  };

  /* ── 간섭색: T(λ) = sin²(πΔ/λ)를 CIE 1931 색 맞춤 함수(Wyman 등 2013 근사)로 적분 ── */
  const g = (x, m, s1, s2) => { const t = (x - m) / (x < m ? s1 : s2); return Math.exp(-0.5 * t * t); };
  const cmf = (l) => [
    1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2),
    0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1),
    1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8),
  ];
  const LAM = [], CM = [];
  for (let l = 380; l <= 720; l += 4) { LAM.push(l); CM.push(cmf(l)); }
  const xyz2rgb = ([X, Y, Z]) => [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z];
  const spec = (T) => { let X = 0, Y = 0, Z = 0; LAM.forEach((l, i) => { const t = T(l); X += CM[i][0] * t; Y += CM[i][1] * t; Z += CM[i][2] * t; }); return [X, Y, Z]; };
  const WHITE = xyz2rgb(spec(() => 1));
  const DSTEP = 4, DMAX = 8000;
  const ICOL = [];
  for (let d = 0; d <= DMAX; d += DSTEP) {
    const rgb = xyz2rgb(spec((l) => Math.sin(Math.PI * d / l) ** 2));
    const c = rgb.map((v, k) => v / WHITE[k]), Yl = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    ICOL.push(c.map((v) => Math.max(0, Yl + (v - Yl) * 0.85)));
  }
  const icol = (d) => ICOL[Math.min(ICOL.length - 1, Math.max(0, Math.round(d / DSTEP)))];
  const GAM = new Uint8ClampedArray(4097);
  for (let i = 0; i <= 4096; i++) { const v = i / 4096; GAM[i] = 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055); }
  const enc = (v) => GAM[Math.round(Math.min(1, Math.max(0, v)) * 4096)];
  const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

  /* ── 박편 만들기 (씨앗이 고정된 난수) ── */
  const rng = (seed) => () => { seed |= 0; seed = seed + 0x6d2b79f5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  function makeSection(kind) {
    const R = rng({ granite: 11, basalt: 29, marble: 7 }[kind]);
    const U = (a, b) => a + (b - a) * R();
    const seeds = [];
    const add = (min, w, a, x, y) => {
      const m = M[min], ori = U(0, Math.PI);
      const s = { min, w, a, ori, x: x ?? U(0, N), y: y ?? U(0, N), f: min === "cc" ? U(0.55, 1) : R() < 0.3 ? U(0.92, 1) : U(0.35, 0.92), ext: m.ext ? U(m.ext[0], m.ext[1]) * D2R : U(0, Math.PI / 2) };
      if (m.crack) s.cracks = [0, 1, 2].map(() => ({ x: s.x + U(-12, 12), y: s.y + U(-12, 12), t: U(0, Math.PI) }));
      seeds.push(s);
    };
    const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    if (kind === "granite") {
      const list = shuffle([].concat(Array(13).fill("qz"), Array(12).fill("or"), Array(11).fill("pl"), Array(5).fill("bt"), Array(3).fill("hb"), Array(2).fill("mt")));
      const pts = jitterGrid(R, 7, 7, list.length);
      list.forEach((m, i) => add(m, m === "mt" ? 0.45 : m === "bt" || m === "hb" ? U(0.8, 0.95) : U(0.95, 1.25), { bt: 2.2, hb: 1.8, pl: 1.6, or: 1.25 }[m] || 1.12, pts[i][0], pts[i][1]));
    } else if (kind === "basalt") {
      const ph = [["ol", 0.28, 0.3], ["ol", 0.72, 0.24], ["ol", 0.55, 0.7], ["ol", 0.2, 0.75], ["px", 0.45, 0.4], ["px", 0.82, 0.55], ["px", 0.3, 0.52], ["pl", 0.62, 0.18], ["pl", 0.78, 0.82]];
      ph.forEach(([m, x, y]) => {
        add(m, 1, 1, x * N + U(-8, 8), y * N + U(-8, 8));
        const s = seeds[seeds.length - 1], Lh = m === "pl" ? U(30, 36) : U(26, 34), H = m === "ol" ? Lh * 0.6 : m === "px" ? Lh * 0.7 : 9;
        s.poly = m === "ol" ? [[-Lh, 0], [-Lh * 0.55, H], [Lh * 0.55, H], [Lh, 0], [Lh * 0.55, -H], [-Lh * 0.55, -H]]
          : m === "px" ? [[-Lh, -H * 0.5], [-Lh * 0.7, H], [Lh * 0.7, H], [Lh, H * 0.5], [Lh, -H * 0.5], [Lh * 0.7, -H], [-Lh * 0.7, -H], [-Lh, -H * 0.5]].map(([u, v], i) => (i === 0 ? [-Lh, H * 0.5] : [u, v]))
          : [[-Lh, -H], [-Lh, H], [Lh, H], [Lh, -H]];
        if (s.cracks) s.cracks.forEach((c) => { c.x = s.x + U(-10, 10); c.y = s.y + U(-8, 8); });
      });
      const pts = jitterGrid(R, 16, 16, 256);
      pts.forEach(([x, y]) => { const r = R(); add(r < 0.52 ? "pl" : r < 0.78 ? "px" : r < 0.94 ? "gl" : "mt", r < 0.94 ? 1 : 0.6, r < 0.52 ? 3.6 : 1.25, x, y); });
    } else {
      const pts = jitterGrid(R, 6, 6, 36);
      pts.forEach(([x, y], i) => add(i % 13 === 5 ? "qz" : "cc", U(0.9, 1.15), 1.2, x, y));
    }
    seeds.forEach((s) => { s.c = Math.cos(s.ori); s.s = Math.sin(s.ori); });
    const lab = new Int16Array(N * N), par = new Uint8Array(N * N), dark = new Float32Array(N * N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let best = 1e18, bi = -1;
      for (let i = 0; i < seeds.length && bi < 0; i++) {
        const s = seeds[i]; if (!s.poly) continue;
        const dx = x - s.x, dy = y - s.y, u = dx * s.c + dy * s.s, v = -dx * s.s + dy * s.c;
        if (inPoly(s.poly, u, v)) bi = i;
      }
      if (bi >= 0) { lab[y * N + x] = bi; continue; }
      bi = 0;
      for (let i = 0; i < seeds.length; i++) {
        const s = seeds[i], dx = x - s.x, dy = y - s.y;
        if (s.poly) continue;
        if (Math.abs(dx) > 90 * s.w || Math.abs(dy) > 90 * s.w) continue;
        const u = dx * s.c + dy * s.s, v = -dx * s.s + dy * s.c;
        const d = (u * u / s.a + v * v * s.a) / (s.w * s.w);
        if (d < best) { best = d; bi = i; }
      }
      lab[y * N + x] = bi;
    }
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const k = y * N + x, s = seeds[lab[k]], m = M[s.min];
      const dx = x - s.x, dy = y - s.y, v = -dx * s.s + dy * s.c;
      let p = 0, dk = 0;
      if (m.twin === "albite") p = s.a > 3 ? (v > 0 ? 1 : 0) : Math.floor(v / 4.5) & 1;
      else if (m.twin === "carls") p = v > 0 ? 1 : 0;
      else if (m.twin === "poly") { const u2 = -dx * Math.sin(s.ori + 1) + dy * Math.cos(s.ori + 1); p = ((u2 % 9) + 9) % 9 < 2.2 ? 1 : 0; }
      if (m.cl) { const ph = ((v % m.cl) + m.cl) % m.cl; if (ph < 0.9) dk = m.cla; }
      if (s.cracks) for (const c of s.cracks) { const dd = Math.abs(-(x - c.x) * Math.sin(c.t) + (y - c.y) * Math.cos(c.t)); if (dd < 0.7) dk = 0.45; }
      par[k] = p; dark[k] = dk;
    }
    const edge = new Uint8Array(N * N);
    for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
      const k = y * N + x, l = lab[k];
      if (lab[k - 1] !== l || lab[k + 1] !== l || lab[k - N] !== l || lab[k + N] !== l) edge[k] = 1;
      else if (M[seeds[l].min].rel > 0.35 && x > 1 && y > 1 && x < N - 2 && y < N - 2 && (lab[k - 2] !== l || lab[k + 2] !== l || lab[k - 2 * N] !== l || lab[k + 2 * N] !== l)) edge[k] = 2;
    }
    /* 시야(원) 안의 알갱이 번호를 1부터 다시 매긴다 */
    let no = 0;
    seeds.forEach((s) => { const dx = s.x - N / 2, dy = s.y - N / 2; s.no = dx * dx + dy * dy < (N / 2 - 4) ** 2 ? ++no : 0; });
    return { seeds, lab, par, dark, edge };
  }
  function inPoly(P, x, y) {
    let c = false;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
      const [xi, yi] = P[i], [xj, yj] = P[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  function jitterGrid(R, nx, ny, n) {
    const out = [];
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) out.push([(i + 0.15 + 0.7 * R()) * N / nx, (j + 0.15 + 0.7 * R()) * N / ny]);
    for (let i = out.length - 1; i > 0; i--) { const k = Math.floor(R() * (i + 1)); [out[i], out[k]] = [out[k], out[i]]; }
    return out.slice(0, n);
  }

  /* ── 상태 ── */
  const cache = {};
  let kind = "granite", sec = null, cross = false, sel = -1, pickD = null;
  const sRot = $(".rot"), cbThick = $(".thick");
  const thick = () => (cbThick.checked ? 38 : 30);
  const off = document.createElement("canvas"); off.width = N; off.height = N;
  const octx = off.getContext("2d"), img = octx.createImageData(N, N);

  /* 알갱이(쌍정 짝 p)의 색: 선형 RGB */
  function grainColor(s, p, th) {
    const m = M[s.min];
    if (m.opaque) return [0.02, 0.02, 0.02];
    const ang = s.ori + th;
    let body = m.ppl;
    if (m.par) { const k = Math.cos(ang) ** 2; body = m.par.map((v, i) => v * k + m.perp[i] * (1 - k)); }
    if (!cross) return body;
    if (m.iso) return [0.012, 0.01, 0.01];
    const e = p ? (m.twin === "poly" ? s.ori + 0.9 : s.ori - s.ext) : s.ori + s.ext;
    const amp = Math.sin(2 * (e + th)) ** 2;
    const col = icol(thick() * 1000 * m.d * s.f * (p && m.twin === "poly" ? 0.8 : 1));
    const tint = m.par ? body.map((v) => Math.min(1, v * 1.25)) : [1, 1, 1];
    return col.map((v, i) => v * amp * tint[i] * 0.97 + 0.006);
  }
  function render() {
    const th = +sRot.value * D2R, d = img.data, S = sec.seeds;
    const cols = S.map((s) => [grainColor(s, 0, th), M[s.min].twin ? grainColor(s, 1, th) : null]);
    const relief = S.map((s) => { const m = M[s.min]; return m.twinkle ? 0.15 + 0.5 * Math.cos(s.ori + th) ** 2 : m.rel; });
    for (let k = 0; k < N * N; k++) {
      const li = sec.lab[k], c = (sec.par[k] && cols[li][1]) || cols[li][0];
      let f = 1 - sec.dark[k] * (cross ? 0.35 : 1);
      if (sec.edge[k] === 1) f *= cross ? 0.55 : 1 - 0.75 * relief[li];
      else if (sec.edge[k] === 2 && !cross) f *= 1 - 0.45 * relief[li];
      const o = k * 4;
      if (li === sel && sec.edge[k] === 1) { d[o] = 240; d[o + 1] = 170; d[o + 2] = 40; }
      else { d[o] = enc(c[0] * f); d[o + 1] = enc(c[1] * f); d[o + 2] = enc(c[2] * f); }
      d[o + 3] = 255;
    }
    octx.putImageData(img, 0, 0);
  }
  const brightness = () => {
    if (sel < 0) return NaN;
    const s = sec.seeds[sel];
    return lum(grainColor(s, 0, +sRot.value * D2R));
  };

  /* ── 시야 그리기 ── */
  const vw = fit($(".pz-view"), () => drawView());
  function geom() { const { w, h } = vw.size; const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 30; return { cx, cy, R }; }
  function drawView() {
    const { ctx } = vw, { w, h } = vw.size; if (!w) return;
    const { cx, cy, R } = geom(), th = +sRot.value * D2R;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = C.night; ctx.beginPath(); ctx.arc(cx, cy, R + 26, 0, Math.PI * 2); ctx.fill();
    /* 재물대 눈금 (재물대와 함께 돈다) */
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(th);
    ctx.strokeStyle = "#9a9a90"; ctx.fillStyle = "#c9c9bf"; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    for (let a = 0; a < 360; a += 5) {
      const r0 = R + (a % 10 ? 4 : a % 30 ? 4 : 2), r1 = R + (a % 10 ? 8 : 11);
      ctx.save(); ctx.rotate(a * D2R); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -r0); ctx.lineTo(0, -r1); ctx.stroke();
      if (a % 30 === 0) ctx.fillText(String((360 - a) % 360), 0, -R - 15);
      ctx.restore();
    }
    ctx.restore();
    /* 고정 지표 */
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.moveTo(cx, cy - R - 1); ctx.lineTo(cx - 5, cy - R - 9); ctx.lineTo(cx + 5, cy - R - 9); ctx.closePath(); ctx.fill();
    /* 박편 */
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
    ctx.translate(cx, cy); ctx.rotate(th); ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, -R, -R, 2 * R, 2 * R);
    ctx.restore();
    /* 십자선 */
    ctx.strokeStyle = cross ? "rgba(255,255,255,.55)" : "rgba(30,30,30,.55)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
    /* 알갱이 번호 */
    if (sel >= 0) {
      const s = sec.seeds[sel], k = R / (N / 2);
      const ux = (s.x - N / 2) * k, uy = (s.y - N / 2) * k;
      const px = cx + ux * Math.cos(th) - uy * Math.sin(th), py = cy + ux * Math.sin(th) + uy * Math.cos(th);
      ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillStyle = "rgba(20,20,20,.72)"; ctx.fillRect(px - 15, py - 9, 30, 16);
      ctx.fillStyle = "#ffd27a"; ctx.fillText("#" + s.no, px, py + 3);
    }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = "#c9c9bf"; ctx.textAlign = "left";
    ctx.fillText(cross ? "직교 니콜 (+)" : "개방 니콜", 8, 14);
    ctx.textAlign = "right"; ctx.fillText("편광판 ↔", w - 8, 14);
    ctx.fillText(`시료 ${SAMP[kind]}`, w - 8, h - 8);
    ctx.textAlign = "left"; ctx.fillText(`d = 30 μm 가정`, 8, h - 8);
  }

  /* ── 미셸-레비 간섭색표 ── */
  const XR = [0, 2400], YR = [0, 50];
  const ch = fit($(".pz-chart"), () => drawChart());
  const cbox = () => { const { w, h } = ch.size; return { x0: 42, y0: 38, w: w - 88, h: h - 72 }; };
  function drawChart() {
    const { ctx } = ch, { w, h } = ch.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const b = cbox();
    const X = (v) => b.x0 + (v - XR[0]) / (XR[1] - XR[0]) * b.w, Y = (v) => b.y0 + b.h - (v - YR[0]) / (YR[1] - YR[0]) * b.h;
    for (let px = 0; px < Math.ceil(b.w); px++) {
      const d = XR[0] + (px + 0.5) / b.w * (XR[1] - XR[0]), c = icol(d);
      ctx.fillStyle = `rgb(${enc(c[0])},${enc(c[1])},${enc(c[2])})`; ctx.fillRect(b.x0 + px, b.y0, 1.5, b.h);
    }
    axes(ctx, { ...b, X, Y, xt: L.ticks(0, 2400, 6).map((v) => [v, String(v)]), yt: [0, 10, 20, 30, 40, 50].map((v) => [v, String(v)]), xlabel: "광로차 Δ (nm)" });
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("박편 두께 d (μm)", b.x0 - 30, 12);
    ctx.save(); ctx.beginPath(); ctx.rect(b.x0, b.y0, b.w, b.h); ctx.clip();
    ctx.strokeStyle = "rgba(20,20,20,.55)"; ctx.lineWidth = 1;
    const DL = [0.009, 0.022, 0.03, 0.04, 0.05];
    DL.forEach((dl) => { ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(50 * 1000 * dl), Y(50)); ctx.stroke(); });
    ctx.setLineDash([5, 3]); ctx.strokeStyle = "rgba(20,20,20,.8)"; ctx.beginPath(); ctx.moveTo(b.x0, Y(30)); ctx.lineTo(b.x0 + b.w, Y(30)); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    [["1차", 275], ["2차", 825], ["3차", 1375], ["4차", 1925]].forEach(([t, x]) => {
      ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.fillRect(X(x) - 13, Y(3.5) - 10, 26, 14); ctx.fillStyle = C.ink; ctx.fillText(t, X(x), Y(3.5));
    });
    if (pickD != null) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(pickD), b.y0); ctx.lineTo(X(pickD), b.y0 + b.h); ctx.stroke();
    }
    tbl.rows.forEach((r) => {
      if (typeof r.D !== "number") return;
      ctx.fillStyle = C.ink; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(X(Math.min(r.D, 2390)), Y(30), 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });
    ctx.restore();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2;
    DL.forEach((dl) => {
      const xe = 50 * 1000 * dl;
      if (xe <= XR[1]) { ctx.textAlign = "center"; ctx.fillText("δ " + dl.toFixed(3).replace(/0$/, ""), Math.min(X(xe), b.x0 + b.w - 22), b.y0 - 6); }
      else { ctx.textAlign = "left"; ctx.fillText("δ " + dl.toFixed(2), b.x0 + b.w + 2, Y(XR[1] / (1000 * dl)) + 3); }
    });
    ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.fillText("30 μm", b.x0 + b.w + 2, Y(30) + 3);
  }

  /* ── 기록 표 ── */
  const tbl = L.table($(".tbl-host"), [
    { key: "sp", label: "시료" }, { key: "g", label: "알갱이" }, { key: "th", label: "소광 θ (°)", res: 1 },
    { key: "ea", label: "소광각 (°)", res: 1 }, { key: "D", label: "Δ (nm)", res: 10 }, { key: "dl", label: "δ = Δ/d", res: 0.001 }, { key: "id", label: "판정" },
  ], () => drawChart());

  const verdict = (t, ok) => { const v = $(".pz-v"); v.textContent = t; v.className = "verdict pz-v" + (ok == null ? "" : ok ? " good" : " bad"); };
  const fold = (a) => { let x = ((a % 90) + 90) % 90; return x > 45 ? 90 - x : x; };

  function record(silent) {
    if (sel < 0) { verdict("먼저 시야에서 알갱이를 눌러 고르세요."); return false; }
    if (!cross) { verdict("소광과 간섭색은 상부 니콜을 넣은 직교 니콜에서 봅니다."); return false; }
    const s = sec.seeds[sel], m = M[s.min], b = brightness();
    if (!m.iso && !m.opaque && b > 0.025 && !silent) { verdict(`아직 소광 위치가 아닙니다(밝기 ${(b * 100).toFixed(0)}%). 재물대를 조금씩 돌려 가장 어두울 때 기록하세요.`, false); return false; }
    const th = +sRot.value;
    let ea = "—";
    if (m.ref && !m.iso && !m.opaque) { const thc = -s.ori / D2R + 1.5 * L.gauss(); ea = L.snap(fold(th - thc), 1); }
    const D = pickD == null ? "—" : pickD;
    tbl.add({ sp: SAMP[kind], g: "#" + s.no, th, ea, D, dl: typeof D === "number" ? D / 30000 : "—", id: "—", _min: s.min });
    if (!silent) verdict(`#${s.no} 기록했습니다. 아래 '판정'에서 광물 이름을 고르세요.`);
    return true;
  }

  /* ── 조작 ── */
  function setSample(k) {
    kind = k; sec = cache[k] || (cache[k] = makeSection(k)); sel = -1;
    root.querySelectorAll(".pz-samp [data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === k)));
    refresh();
  }
  function refresh() {
    render(); drawView();
    $(".rot-out").textContent = sRot.value;
    $(".n-g").textContent = sel >= 0 ? "#" + sec.seeds[sel].no : "—";
    $(".n-d").textContent = pickD == null ? "—" : pickD + " nm";
    const b = brightness();
    $(".n-b").textContent = Number.isFinite(b) ? (b * 100).toFixed(0) + "%" : "—";
  }
  sRot.addEventListener("input", refresh);
  cbThick.addEventListener("change", refresh);
  $(".pz-nicol").addEventListener("click", (e) => {
    const b = e.target.closest("[data-n]"); if (!b) return;
    cross = b.dataset.n === "cross";
    root.querySelectorAll(".pz-nicol [data-n]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    refresh();
  });
  $(".pz-samp").addEventListener("click", (e) => { const b = e.target.closest("[data-s]"); if (b) setSample(b.dataset.s); });
  $(".pz-view").addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect(), { cx, cy, R } = geom(), th = +sRot.value * D2R;
    const x = e.clientX - r.left - cx, y = e.clientY - r.top - cy;
    if (x * x + y * y > R * R) return;
    const ux = x * Math.cos(-th) - y * Math.sin(-th), uy = x * Math.sin(-th) + y * Math.cos(-th);
    const px = Math.floor(ux / R * N / 2 + N / 2), py = Math.floor(uy / R * N / 2 + N / 2);
    if (px < 0 || py < 0 || px >= N || py >= N) return;
    sel = sec.lab[py * N + px];
    if (!sec.seeds[sel].no) sel = -1;
    refresh();
  });
  $(".pz-chart").addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect(), b = cbox();
    const x = e.clientX - r.left;
    if (x < b.x0 || x > b.x0 + b.w) return;
    pickD = Math.round((XR[0] + (x - b.x0) / b.w * (XR[1] - XR[0])) / 10) * 10;
    refresh(); drawChart();
  });
  $(".rec").addEventListener("click", () => record(false));
  $(".clear").addEventListener("click", () => { tbl.clear(); verdict(""); });
  $(".pz-id").addEventListener("click", (e) => {
    const b = e.target.closest("[data-m]"); if (!b) return;
    const r = tbl.rows[tbl.rows.length - 1];
    if (!r) { verdict("먼저 알갱이 하나를 기록하세요."); return; }
    const ok = b.dataset.m === r._min;
    r.id = M[b.dataset.m].name + (ok ? " ✓" : " ✗");
    tbl.add(tbl.rows.pop());
    verdict(ok ? `맞습니다. ${M[r._min].name}: ${HINT[r._min]}` : `다시 보세요. 기록한 값과 개방 니콜의 모습을 함께 보세요. 고른 '${M[b.dataset.m].name}'의 특징: ${HINT[b.dataset.m]}`, ok);
  });

  setSample("granite");
  if (L.demo) {
    /* 시료 A에서 광물마다 가장 큰 Δ를 보인 알갱이를 골라 소광 위치에서 기록한 예 */
    const want = ["qz", "pl", "or", "bt", "hb"];
    cross = true;
    root.querySelectorAll(".pz-nicol [data-n]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.n === "cross")));
    const pickFrom = (k, mins) => {
      setSample(k);
      mins.forEach((mn) => {
        const cand = sec.seeds.map((s, i) => [s, i]).filter(([s]) => s.min === mn && s.no).sort((a, b) => b[0].f - a[0].f)[0];
        if (!cand) return;
        const [s, i] = cand; sel = i;
        pickD = M[mn].d ? Math.round(30000 * M[mn].d * s.f / 10) * 10 : 0;
        const e = s.ori + (M[mn].ext ? s.ext : 0);
        sRot.value = Math.round((((-e / D2R) % 90) + 90) % 90);
        record(true);
        tbl.rows[tbl.rows.length - 1].id = M[mn].name + " ✓";
      });
    };
    pickFrom("basalt", ["ol", "px"]);
    pickFrom("granite", want);
    tbl.add(tbl.rows.pop());
    const bt = sec.seeds.map((s, i) => [Math.hypot(s.x - N / 2, s.y - N / 2) + (s.min === "pl" && s.no ? 0 : 1e9), i]).sort((a, b) => a[0] - b[0])[0][1];
    sel = bt; sRot.value = 37; pickD = 280;
    refresh(); drawChart();
  }

})();
