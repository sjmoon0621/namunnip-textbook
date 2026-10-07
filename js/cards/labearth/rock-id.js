/* 카드: 암석 표본의 조직과 성분으로 그 암석이 생긴 과정을 알아낼 수 있을까? — 입자 크기·색지수·SiO₂·염산 반응으로 암석 감정 */
(() => {
  const root = document.getElementById("card-labearth-rock-id");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  /* 대표값(모식): g 입자 크기(mm), ci 색지수(%), si SiO₂(wt%), acid 염산 반응, grp 성인 */
  const ROCK = {
    granite:   { name: "화강암", grp: "화성암", g: 4, ci: 10, si: 72, tex: "crystal", min: [["#e7b9a3", 0.33], ["#f1efe9", 0.3], ["#b9b6b0", 0.27], ["#1f1d1c", 0.1]] },
    diorite:   { name: "섬록암", grp: "화성암", g: 3, ci: 32, si: 57, tex: "crystal", min: [["#efeee9", 0.62], ["#c9c8c2", 0.06], ["#1c1e1c", 0.32]] },
    gabbro:    { name: "반려암", grp: "화성암", g: 4, ci: 55, si: 48, tex: "crystal", min: [["#8d8f8c", 0.45], ["#262826", 0.4], ["#3b3f33", 0.15]] },
    basalt:    { name: "현무암", grp: "화성암", g: 0.05, ci: 50, si: 49, tex: "fine", base: "#3d3e3e", sp: ["#2b2c2c", "#555654", "#474845"], vesicle: true },
    andesite:  { name: "안산암", grp: "화성암", g: 0.05, ci: 30, si: 58, tex: "fine", base: "#7d7f7d", sp: ["#6e706e", "#8d8f8b", "#747472"], pheno: true },
    rhyolite:  { name: "유문암", grp: "화성암", g: 0.03, ci: 5, si: 73, tex: "fine", base: "#d6b9ad", sp: ["#c9a99c", "#e0c7bc", "#cfb2a6"], flow: true },
    conglom:   { name: "역암", grp: "퇴적암", g: 20, ci: 15, si: 76, tex: "conglom", base: "#b8a68c", sp: ["#a8977d", "#c8b79c", "#9e8f78"] },
    sandstone: { name: "사암", grp: "퇴적암", g: 0.3, ci: 5, si: 86, tex: "sand", base: "#d3bf98", sp: ["#c4ad83", "#e4d6b8", "#b39a72", "#f2ece0"] },
    shale:     { name: "셰일", grp: "퇴적암", g: 0.002, ci: 40, si: 61, tex: "fine", base: "#55534f", sp: ["#4b4945", "#605e59"], lam: true },
    limestone: { name: "석회암", grp: "퇴적암", g: 0.01, ci: 2, si: 5, acid: "strong", tex: "fine", base: "#a9aaa5", sp: ["#9fa09b", "#b5b6b1"], fossil: true },
    slate:     { name: "점판암", grp: "변성암", g: 0.005, ci: 40, si: 61, tex: "fine", base: "#3f4549", sp: ["#3a4044", "#474d51"], cleave: true },
    phyllite:  { name: "천매암", grp: "변성암", g: 0.05, ci: 35, si: 60, tex: "fine", base: "#6f7766", sp: ["#667060", "#7c8573"], sheen: true },
    schist:    { name: "편암", grp: "변성암", g: 1, ci: 35, si: 60, tex: "schist", base: "#8b8a83", sp: ["#c8c7bf", "#5c5c56", "#a7a69e"] },
    gneiss:    { name: "편마암", grp: "변성암", g: 3, ci: 28, si: 67, tex: "crystal", band: true, min: [["#ece9e1", 0.42], ["#d5c4b8", 0.3], ["#1d1d1c", 0.28]] },
    quartzite: { name: "규암", grp: "변성암", g: 0.5, ci: 1, si: 95, tex: "crystal", min: [["#efe3dc", 0.5], ["#f7f1ec", 0.35], ["#e3d2c8", 0.15]] },
    marble:    { name: "대리암", grp: "변성암", g: 1, ci: 1, si: 3, acid: "strong", tex: "crystal", sparkle: true, min: [["#f4f4f1", 0.6], ["#e6e7e3", 0.35], ["#d7d9d4", 0.05]] },
    hornfels:  { name: "혼펠스", grp: "변성암", g: 0.02, ci: 45, si: 60, tex: "fine", base: "#2f2f31", sp: ["#28282a", "#38383a"], spots: true },
  };
  const DARK = (c) => { const n = parseInt(c.slice(1), 16); return ((n >> 16) + ((n >> 8) & 255) + (n & 255)) / 3 < 80; };
  ROCK.gneiss.ci = 28;
  const ORDER = ["granite", "shale", "basalt", "gneiss", "limestone", "andesite", "quartzite", "gabbro", "slate", "sandstone", "rhyolite", "marble", "diorite", "conglom", "schist", "hornfels", "phyllite"];
  const CLUE = {
    granite: "맞물린 큰 결정(심성암), 색지수가 작고 SiO₂가 많아 산성입니다.",
    diorite: "맞물린 큰 결정, 흰 장석과 검은 각섬석이 반반쯤 섞인 중성 심성암입니다.",
    gabbro: "맞물린 큰 결정, 어두운 광물이 절반 이상인 염기성 심성암입니다.",
    basalt: "결정이 너무 작아 보이지 않고(화산암) 기공이 있으며, SiO₂가 52 % 미만인 염기성입니다.",
    andesite: "작은 바탕 속에 큰 결정(반정)이 박힌 반상 조직, SiO₂가 중성 범위입니다.",
    rhyolite: "알갱이가 보이지 않고 흐른 줄무늬(유상 구조)가 있으며 밝은색, SiO₂가 많은 산성 화산암입니다.",
    conglom: "둥근 자갈(2 mm 이상)이 모래 바탕에 박혀 있습니다. 쇄설성 퇴적암입니다.",
    sandstone: "0.06~2 mm의 둥근 모래 알갱이가 교결되어 있습니다.",
    shale: "알갱이가 보이지 않고 얇은 층리를 따라 쪼개집니다. 진흙이 굳은 퇴적암입니다.",
    limestone: "알갱이가 보이지 않고 화석 조각이 있으며 염산에 거품을 냅니다(방해석).",
    slate: "아주 고운 알갱이가 평평한 판으로 쪼개지는 엽리(점판 벽개)를 보입니다. 저변성암입니다.",
    phyllite: "엽리면에 비단 같은 광택이 있고 주름져 있습니다. 운모가 막 자라기 시작한 단계입니다.",
    schist: "1 mm 안팎의 운모가 한 방향으로 늘어서 반짝이는 편리를 이룹니다.",
    gneiss: "큰 결정이 밝은 띠와 어두운 띠로 나뉜 편마 구조, 고변성암입니다.",
    quartzite: "엽리 없이 석영 결정이 맞물려 있고 SiO₂가 90 %를 넘습니다. 사암이 변성된 것입니다.",
    marble: "엽리 없이 방해석 결정이 맞물려 반짝이며 염산에 거품을 냅니다. 석회암이 변성된 것입니다.",
    hornfels: "매우 치밀하고 엽리가 없습니다. 셰일이 마그마 옆에서 열만 받아 구워진 접촉 변성암입니다.",
  };

  const rng = (seed) => () => { seed |= 0; seed = seed + 0x6d2b79f5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pickCol = (R, list, darkBoost = 0) => {
    let r = R(), acc = 0;
    const tot = list.reduce((s, [c, f]) => s + f * (DARK(c) ? 1 + darkBoost : 1), 0);
    for (const [c, f] of list) { acc += f * (DARK(c) ? 1 + darkBoost : 1) / tot; if (r < acc) return c; }
    return list[list.length - 1][0];
  };

  /* 결 그리기: (0,0)~(W,H) 영역에 pxmm(1 mm당 픽셀) 배율로 */
  function paint(ctx, W, H, key, pxmm, seed) {
    const s = ROCK[key], R = rng(seed);
    const fineDots = (base, cols, sz) => {
      ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);
      const n = Math.min(9000, W * H / (sz * sz * 1.6));
      for (let i = 0; i < n; i++) { ctx.fillStyle = cols[Math.floor(R() * cols.length)]; ctx.fillRect(R() * W, R() * H, sz, sz); }
    };
    if (s.tex === "crystal") {
      const cell = s.g * pxmm;
      const avg = s.min[0][0];
      ctx.fillStyle = avg; ctx.fillRect(0, 0, W, H);
      if (cell < 2.2) { fineDots(avg, s.min.map((m) => m[0]), 1.4); }
      else {
        const nx = Math.ceil(W / cell) + 1, ny = Math.ceil(H / cell) + 1;
        for (let j = -1; j < ny; j++) for (let i = -1; i < nx; i++) {
          const cx = (i + 0.5 + (R() - 0.5) * 0.6) * cell, cy = (j + 0.5 + (R() - 0.5) * 0.6) * cell;
          const boost = s.band ? 2.6 * Math.sin(cy / (cell * 2.2) * Math.PI) : 0;
          const col = pickCol(R, s.min, s.band ? Math.max(-0.95, boost) : 0);
          const k = 5 + Math.floor(R() * 3), ex = s.band ? 1.35 : 1;
          ctx.fillStyle = col; ctx.beginPath();
          for (let q = 0; q < k; q++) {
            const a = q / k * Math.PI * 2 + R() * 0.5, r = cell * (0.58 + R() * 0.22);
            const px = cx + Math.cos(a) * r * ex, py = cy + Math.sin(a) * r / ex;
            q ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
          }
          ctx.closePath(); ctx.fill();
          if (cell > 14) { ctx.strokeStyle = "rgba(0,0,0,.12)"; ctx.lineWidth = 0.8; ctx.stroke(); }
          if (s.sparkle && R() < 0.25) { ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fillRect(cx, cy, Math.max(1, cell * 0.12), Math.max(1, cell * 0.12)); }
        }
      }
    } else if (s.tex === "fine" || s.tex === "sand") {
      const sz = Math.max(1.2, Math.min(3, s.g * pxmm));
      fineDots(s.base, s.sp, s.tex === "sand" ? Math.max(1.4, s.g * pxmm * 0.9) : sz);
      if (s.tex === "sand" && s.g * pxmm > 3) {
        const cell = s.g * pxmm;
        for (let i = 0; i < W * H / (cell * cell) * 1.1; i++) {
          ctx.fillStyle = s.sp[Math.floor(R() * s.sp.length)];
          ctx.beginPath(); ctx.ellipse(R() * W, R() * H, cell * (0.38 + R() * 0.12), cell * (0.3 + R() * 0.12), R() * 3, 0, Math.PI * 2); ctx.fill();
        }
      }
      if (s.vesicle) for (let i = 0; i < W * H / (pxmm * pxmm * 90); i++) {
        const r = pxmm * (0.6 + R() * 2.4), x = R() * W, y = R() * H;
        ctx.fillStyle = "#1c1c1c"; ctx.beginPath(); ctx.ellipse(x, y, r * 1.2, r, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.beginPath(); ctx.ellipse(x - r * 0.25, y - r * 0.25, r * 0.6, r * 0.45, 0, 0, Math.PI * 2); ctx.fill();
      }
      if (s.pheno) for (let i = 0; i < W * H / (pxmm * pxmm * 30); i++) {
        const x = R() * W, y = R() * H, a = R() * Math.PI;
        ctx.save(); ctx.translate(x, y); ctx.rotate(a);
        if (R() < 0.7) { ctx.fillStyle = "#ecebe5"; const l = pxmm * (1.5 + R() * 2.5); ctx.fillRect(-l / 2, -l * 0.22, l, l * 0.44); }
        else { ctx.fillStyle = "#151515"; const l = pxmm * (1.5 + R() * 2); ctx.fillRect(-l / 2, -l * 0.1, l, l * 0.2); }
        ctx.restore();
      }
      if (s.flow) { ctx.strokeStyle = "rgba(150,110,100,.35)"; ctx.lineWidth = Math.max(1, pxmm * 0.6);
        for (let y0 = -10; y0 < H + 10; y0 += pxmm * (2 + R() * 3)) { ctx.beginPath(); for (let x = 0; x <= W; x += 4) { const y = y0 + Math.sin(x / (pxmm * 12) + y0) * pxmm * 1.5; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); } }
      if (s.lam) { for (let y = 0; y < H; y += Math.max(1.5, pxmm * (0.4 + R() * 0.6))) { ctx.fillStyle = R() < 0.5 ? "rgba(0,0,0,.18)" : "rgba(255,255,255,.07)"; ctx.fillRect(0, y, W, Math.max(0.8, pxmm * 0.15)); } }
      if (s.fossil) { ctx.strokeStyle = "rgba(235,235,228,.85)"; ctx.lineWidth = Math.max(1, pxmm * 0.3);
        for (let i = 0; i < W * H / (pxmm * pxmm * 220); i++) { const x = R() * W, y = R() * H, r = pxmm * (2 + R() * 4), a = R() * 6; ctx.beginPath(); ctx.arc(x, y, r, a, a + 2.4); ctx.stroke(); for (let q = 1; q < 4; q++) { ctx.beginPath(); ctx.moveTo(x + Math.cos(a + q * 0.6) * r * 0.2, y + Math.sin(a + q * 0.6) * r * 0.2); ctx.lineTo(x + Math.cos(a + q * 0.6) * r, y + Math.sin(a + q * 0.6) * r); ctx.stroke(); } } }
      if (s.cleave) { ctx.strokeStyle = "rgba(160,175,185,.28)"; ctx.lineWidth = 1;
        for (let x = -H; x < W; x += Math.max(2, pxmm * 1.2)) { ctx.beginPath(); ctx.moveTo(x, H); ctx.lineTo(x + H * 0.35, 0); ctx.stroke(); } }
      if (s.sheen) {
        const gr = ctx.createLinearGradient(0, 0, W, H); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, "rgba(230,240,220,.28)"); gr.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "rgba(210,225,200,.35)"; ctx.lineWidth = 1;
        for (let y0 = 0; y0 < H + 10; y0 += Math.max(2.5, pxmm * 1.4)) { ctx.beginPath(); for (let x = 0; x <= W; x += 2) { const y = y0 + Math.sin(x / Math.max(3, pxmm * 3)) * Math.max(1, pxmm * 0.6); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
      }
      if (s.spots) for (let i = 0; i < W * H / (pxmm * pxmm * 60); i++) { ctx.fillStyle = "rgba(70,60,60,.35)"; ctx.beginPath(); ctx.arc(R() * W, R() * H, pxmm * (0.5 + R()), 0, Math.PI * 2); ctx.fill(); }
    } else if (s.tex === "conglom") {
      fineDots(s.base, s.sp, Math.max(1.2, 0.4 * pxmm));
      const PC = ["#8a8a86", "#e9e6de", "#4a4a48", "#a8705a", "#c9c3b5", "#6d6a5f"];
      for (let i = 0; i < W * H / (pxmm * pxmm * 260) + 2; i++) {
        const r = pxmm * (3 + R() * 14), x = R() * W, y = R() * H;
        ctx.fillStyle = PC[Math.floor(R() * PC.length)]; ctx.strokeStyle = "rgba(0,0,0,.25)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(x, y, r, r * (0.6 + R() * 0.3), R() * 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
    } else if (s.tex === "schist") {
      ctx.fillStyle = s.base; ctx.fillRect(0, 0, W, H);
      const l = Math.max(2, s.g * pxmm);
      for (let i = 0; i < Math.min(14000, W * H / (l * l) * 3); i++) {
        const x = R() * W, y = R() * H, a = Math.sin(x / (pxmm * 15)) * 0.25 + (R() - 0.5) * 0.15;
        ctx.strokeStyle = s.sp[Math.floor(R() * s.sp.length)]; ctx.lineWidth = Math.max(1, l * 0.25);
        ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * l, y - Math.sin(a) * l); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
      }
      for (let i = 0; i < W * H / (pxmm * pxmm * 400); i++) { ctx.fillStyle = "#7a2d2a"; ctx.beginPath(); ctx.arc(R() * W, R() * H, pxmm * (1 + R()), 0, Math.PI * 2); ctx.fill(); }
    }
  }

  /* 표본 그림 캐시 */
  const cache = {};
  function getImg(key, w, h, pxmm, seed) {
    const id = `${key}|${w}|${h}|${pxmm}`;
    if (cache[id]) return cache[id];
    const cv = document.createElement("canvas"), dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const c = cv.getContext("2d"); c.scale(dpr, dpr); paint(c, w, h, key, pxmm, seed);
    return (cache[id] = cv);
  }

  /* ── 상태 ── */
  let cur = 0;
  const acid = new Set();
  const view = fit($(".ri-cv"), () => draw());
  const pv = fit($(".ri-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "no", label: "표본" }, { key: "g", label: "입자 (mm)", res: 0.1 }, { key: "ci", label: "색지수 (%)", res: 1 },
    { key: "si", label: "SiO₂ (%)", res: 0.1 }, { key: "hcl", label: "염산" }, { key: "id", label: "판정" },
  ], () => drawPlot());
  const rowOf = (i, make) => {
    let r = tbl.rows.find((x) => x._i === i);
    if (!r && make) { r = { _i: i, no: String(i + 1), g: "—", ci: "—", si: "—", hcl: "—", id: "—" }; tbl.add(r); }
    return r;
  };
  const rerender = () => { if (tbl.rows.length) tbl.add(tbl.rows.pop()); };
  const verdict = (t, ok) => { const v = $(".ri-v"); v.textContent = t; v.className = "verdict ri-v" + (ok == null ? "" : ok ? " good" : " bad"); };

  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const key = ORDER[cur], s = ROCK[key];
    /* 표본 (약 10 cm) */
    const sw = Math.round(w * 0.56), sh = Math.round(h * 0.7), sx = 10, sy = Math.round(h * 0.1);
    const pxmm = sw / 100;
    ctx.save();
    ctx.beginPath();
    const P = [[0.04, 0.12], [0.3, 0.02], [0.62, 0.05], [0.93, 0], [1, 0.4], [0.96, 0.85], [0.7, 1], [0.35, 0.95], [0.06, 0.9], [0, 0.5]];
    P.forEach(([u, v], i) => (i ? ctx.lineTo(sx + u * sw, sy + v * sh) : ctx.moveTo(sx + u * sw, sy + v * sh)));
    ctx.closePath(); ctx.clip();
    ctx.drawImage(getImg(key, sw, sh, pxmm, cur * 7 + 3), sx, sy, sw, sh);
    if (acid.has(cur) && s.acid) {
      const R = rng(99 + cur);
      for (let i = 0; i < 46; i++) { const x = sx + sw * (0.38 + R() * 0.24), y = sy + sh * (0.36 + R() * 0.26), r = 1.5 + R() * 3.5; ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    }
    if (acid.has(cur)) { ctx.fillStyle = "rgba(140,190,230,.25)"; ctx.beginPath(); ctx.ellipse(sx + sw * 0.5, sy + sh * 0.48, sw * 0.13, sh * 0.13, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath();
    P.forEach(([u, v], i) => (i ? ctx.lineTo(sx + u * sw, sy + v * sh) : ctx.moveTo(sx + u * sw, sy + v * sh))); ctx.closePath(); ctx.stroke();
    /* 1 cm 막대 */
    ctx.fillStyle = C.ink; ctx.fillRect(sx + 4, sy + sh + 10, 10 * pxmm, 3);
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink2;
    ctx.fillText("1 cm", sx + 10 * pxmm + 10, sy + sh + 15);
    ctx.font = `600 12px ${F.mono}`; ctx.fillStyle = C.ink; ctx.fillText(`표본 ${cur + 1}`, sx, 13);
    /* 돋보기 (10배) */
    const cx = w * 0.8, cy = h * 0.47, R = Math.min(w * 0.18, h * 0.38), lp = pxmm * 10;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(getImg(key, Math.round(2 * R), Math.round(2 * R), lp, cur * 13 + 5), cx - R, cy - R, 2 * R, 2 * R);
    /* 돋보기 눈금 (0.1 mm 간격, 1 mm마다 긴 눈금) */
    ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 1;
    const y0 = cy + R * 0.55, x0 = cx - lp * 1.5;
    ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(x0 - 4, y0 - 12, lp * 3 + 8, 18);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + lp * 3, y0);
    for (let k = 0; k <= 30; k++) { const x = x0 + k * lp / 10; ctx.moveTo(x, y0); ctx.lineTo(x, y0 - (k % 10 ? 3 : k % 5 ? 5 : 7)); }
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 6; ctx.strokeStyle = C.ink2; ctx.beginPath(); ctx.moveTo(cx - R * 0.72, cy + R * 0.72); ctx.lineTo(cx - R * 1.05, cy + R * 1.05); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText("돋보기 ×10 · 눈금 3 mm", cx, cy - R - 6);
    /* 빈 곳 연결선 */
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    ctx.strokeRect(sx + sw * 0.5 - R / 10, sy + sh * 0.48 - R / 10, R / 5, R / 5);
    ctx.beginPath(); ctx.moveTo(sx + sw * 0.5 + R / 10, sy + sh * 0.48 - R / 10); ctx.lineTo(cx - R * 0.7, cy - R * 0.7); ctx.stroke(); ctx.setLineDash([]);
  }

  /* SiO₂–입자 크기 그래프 */
  const LY = [-2.7, 2]; const XR = [0, 100];
  function drawPlot() {
    const { ctx } = pv, { w, h } = pv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const b = { x0: 46, y0: 22, w: w - 60, h: h - 58 };
    const X = (v) => b.x0 + (v - XR[0]) / (XR[1] - XR[0]) * b.w, Y = (lg) => b.y0 + b.h - (lg - LY[0]) / (LY[1] - LY[0]) * b.h;
    /* 화성암 영역 */
    const fields = [[45, 52, "현무암", "반려암"], [52, 63, "안산암", "섬록암"], [63, 77, "유문암", "화강암"]];
    ctx.fillStyle = "rgba(0,0,0,.035)"; ctx.fillRect(b.x0, b.y0, b.w, b.h);
    fields.forEach(([a, c, lo, hi], i) => {
      ctx.fillStyle = ["rgba(59,124,42,.16)", "rgba(59,124,42,.10)", "rgba(59,124,42,.05)"][i];
      ctx.fillRect(X(a), b.y0, X(c) - X(a), b.h);
      ctx.fillStyle = C.forest; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(hi, (X(a) + X(c)) / 2, Y(1.6)); ctx.fillText(lo, (X(a) + X(c)) / 2, Y(-2.35));
    });
    axes(ctx, { ...b, X, Y, xt: [0, 20, 40, 52, 63, 80, 100].map((v) => [v, String(v)]), yt: [[-2, "0.01"], [-1, "0.1"], [0, "1"], [1, "10"], [2, "100"]], xlabel: "SiO₂ (wt %)", ylabel: "입자 크기 (mm, 로그 눈금)" });
    ctx.strokeStyle = C.ink2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(45), Y(0)); ctx.lineTo(X(77), Y(0)); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("심성암 ↑", X(78), Y(0) - 4); ctx.fillText("화산암 ↓", X(78), Y(0) + 12);
    ctx.fillText("화성암 범위 밖", X(84), Y(1.7));
    tbl.rows.forEach((r) => {
      if (typeof r.si !== "number") return;
      const gv = typeof r.g === "number" ? r.g : r.g === "—" ? null : 0.03;
      if (gv == null) return;
      const px = X(r.si), py = Y(Math.log10(gv));
      ctx.fillStyle = typeof r.g === "number" ? C.ink : C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(r.no, px + 6, py - 4);
    });
  }

  /* ── 측정 ── */
  function measureSize(i, quiet) {
    const s = ROCK[ORDER[i]], r = rowOf(i, true);
    r.g = s.g < 0.06 ? "< 0.06" : L.measure(s.g, { rel: 0.15, res: s.g >= 5 ? 1 : 0.1 });
    if (r.g === 0) r.g = 0.1;
    if (!quiet) verdict(s.g < 0.06 ? `표본 ${i + 1}: 알갱이가 너무 작아 돋보기로도 하나하나 구별되지 않습니다.` : `표본 ${i + 1}: 알갱이 지름을 여러 개 재어 평균했습니다.`);
  }
  function measureCI(i, quiet) {
    const s = ROCK[ORDER[i]], r = rowOf(i, true);
    if (s.g < 0.5 || s.tex === "conglom" || s.tex === "sand") { r.ci = "—"; if (!quiet) verdict(s.g < 0.5 ? `표본 ${i + 1}: 알갱이가 작아 점마다 광물을 가릴 수 없습니다.` : `표본 ${i + 1}: 쇄설물은 광물이 아니라 암석 조각이라 색지수를 쓰지 않습니다.`); return; }
    let n = 0; for (let k = 0; k < 100; k++) if (Math.random() * 100 < s.ci) n++;
    r.ci = n;
    if (!quiet) verdict(`표본 ${i + 1}: 점 100개 가운데 ${n}개가 어두운 광물 위에 떨어졌습니다.`);
  }
  function measureSi(i) { const r = rowOf(i, true); r.si = L.measure(ROCK[ORDER[i]].si, { sd: 0.5, res: 0.1 }); }
  function testAcid(i, quiet) {
    const s = ROCK[ORDER[i]], r = rowOf(i, true);
    acid.add(i); r.hcl = s.acid ? "거품 활발" : "반응 없음";
    if (!quiet) verdict(s.acid ? `표본 ${i + 1}: 거품(CO₂)이 활발하게 납니다. 방해석(CaCO₃)이 들어 있습니다.` : `표본 ${i + 1}: 거품이 나지 않습니다.`);
  }

  /* ── 조작 ── */
  const sampHost = $(".ri-samp");
  ORDER.forEach((k, i) => { const b = document.createElement("button"); b.className = "chip"; b.dataset.i = i; b.textContent = i + 1; b.setAttribute("aria-pressed", String(i === 0)); sampHost.appendChild(b); });
  sampHost.addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]"); if (!b) return;
    cur = +b.dataset.i;
    sampHost.querySelectorAll("[data-i]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    verdict(""); draw();
  });
  $(".t-size").addEventListener("click", () => { measureSize(cur); rerender(); });
  $(".t-ci").addEventListener("click", () => { measureCI(cur); rerender(); });
  $(".t-hcl").addEventListener("click", () => { testAcid(cur); rerender(); draw(); });
  $(".t-si").addEventListener("click", () => { measureSi(cur); rerender(); verdict(`표본 ${cur + 1}: SiO₂ 분석값을 표에 적었습니다.`); });
  $(".clear").addEventListener("click", () => { tbl.clear(); acid.clear(); verdict(""); draw(); });
  $(".ri-names").addEventListener("click", (e) => {
    const b = e.target.closest("[data-n]"); if (!b) return;
    const key = ORDER[cur], s = ROCK[key], g = ROCK[b.dataset.n], r = rowOf(cur, true);
    const ok = b.dataset.n === key;
    r.id = g.name + (ok ? " ✓" : " ✗"); rerender();
    if (ok) verdict(`맞습니다. ${s.name}(${s.grp}): ${CLUE[key]}`, true);
    else if (g.grp !== s.grp) verdict(`성인부터 다시 보세요. 고른 '${g.name}'은 ${g.grp}입니다. 알갱이가 맞물린 결정인지, 쌓인 조각인지, 한 방향으로 늘어섰는지 보세요.`, false);
    else verdict(`성인(${g.grp})은 맞습니다. 이름을 좁히는 증거를 더 보세요. '${g.name}'의 특징: ${CLUE[b.dataset.n]}`, false);
  });

  draw();
  if (L.demo) {
    [0, 2, 5, 7, 10, 12, 3, 6, 11, 4].forEach((i) => { measureSize(i, true); measureCI(i, true); measureSi(i); testAcid(i, true); });
    [[0, "granite"], [2, "basalt"], [5, "andesite"], [7, "gabbro"], [6, "marble"]].forEach(([i, n]) => { const r = rowOf(i); r.id = ROCK[n].name + (ORDER[i] === n ? " ✓" : " ✗"); });
    rerender();
    cur = 5; sampHost.querySelectorAll("[data-i]").forEach((x) => x.setAttribute("aria-pressed", String(+x.dataset.i === cur)));
    draw(); verdict("표본 7을 대리암으로 판정했지만 틀렸습니다. 염산 반응과 SiO₂를 다시 보세요.", false);
  }
})();
