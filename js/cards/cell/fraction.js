/* 카드: 세포를 갈아 돌리면 소기관을 하나씩 골라낼 수 있을까? — 분별 원심 분리 모식. 가라앉는 거리 ∝ (알갱이 계수) × g × 시간 */
(() => {
  const root = document.getElementById("card-cell-fraction");
  if (!root) return;
  const { C, F, fit, loop, ease } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sG = $(".g"), sT = $(".t"), oG = $(".g-out"), oT = $(".t-out");
  // s: 1 g·분당 관 길이(=1) 대비 가라앉는 거리 (상대값, 모식)
  const TYPES = [
    { k: "nuc", name: "핵", s: 1.5e-4, n: 10, col: "#8a4fb0", r: 6 },
    { k: "mit", name: "미토콘드리아", s: 3e-6, n: 26, col: "#d4493a", r: 3.2 },
    { k: "mic", name: "소포체 조각", s: 2.5e-7, n: 34, col: "#e0a02a", r: 2.2 },
    { k: "rib", name: "리보솜", s: 4.5e-8, n: 50, col: "#3f6fa3", r: 1.3 },
    { k: "sol", name: "녹은 단백질", s: 1e-10, n: 50, col: "#8d8d92", r: 0.9 },
  ];
  let seed = 3; const rnd = () => { const x = Math.sin(seed++ * 91.7) * 43758.5453; return x - Math.floor(x); };
  let parts = [], fracs = [], anim = 1, lastDist = 0;
  function reset() {
    seed = 3; parts = []; fracs = []; anim = 1;
    TYPES.forEach((T, ti) => { for (let i = 0; i < T.n; i++) parts.push({ ti, s: T.s * Math.exp((rnd() - 0.5) * 0.6), y0: rnd(), x: rnd(), y: 0, gone: false }); });
    parts.forEach((p) => (p.y = p.y0));
  }
  const gVal = () => { const v = Math.pow(10, +sG.value), m = Math.pow(10, Math.floor(Math.log10(v)) - 1); return Math.round(v / m) * m; };
  function spin() {
    // 앞 단계의 침전물은 이미 떼어 냈고, 상층액을 새 관에 옮기면 고르게 섞인다
    parts.filter((p) => !p.gone).forEach((p) => { p.y0 = rnd(); p.y = p.y0; });
    const g = gVal(), t = +sT.value, pel = TYPES.map(() => 0);
    parts.filter((p) => !p.gone).forEach((p) => {
      p.d = p.s * g * t; p.y1 = Math.min(1, p.y0 + p.d);
      if (p.y1 >= 1) { p.pel = fracs.length; pel[p.ti]++; } else p.pel = -1;
    });
    fracs.push({ g, t, pel });
    anim = 0;
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    // 관
    const tx = 20, tw = Math.min(90, w * 0.2), ty = 34, th = h - 70;
    ctx.fillStyle = C.ink2; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(fracs.length ? `${fracs.length}번째 원심 분리 뒤` : "간세포를 간 액체", tx, 20);
    ctx.fillStyle = "#f4efe2"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx, ty + th - tw / 2); ctx.arc(tx + tw / 2, ty + th - tw / 2, tw / 2, Math.PI, 0, true); ctx.lineTo(tx + tw, ty); ctx.fill(); ctx.stroke();
    const e = ease(Math.min(1, anim));
    const cur = fracs.length - 1;
    parts.forEach((p, i) => {
      if (p.gone) return;
      const T = TYPES[p.ti];
      let y = p.y0;
      if (cur >= 0 && p.y1 !== undefined) y = p.y0 + (p.y1 - p.y0) * e;
      let px = tx + 8 + p.x * (tw - 16), py = ty + 6 + y * (th - 18);
      if (p.pel === cur && cur >= 0 && e >= 0.999) { // 바닥에 쌓인 침전물
        const k = (i * 7) % 11; px = tx + tw / 2 + (k - 5) * tw / 14; py = ty + th - 6 - (i % 3) * 3 - (p.ti === 0 ? 4 : 0);
      }
      ctx.fillStyle = T.col; ctx.beginPath();
      if (p.ti === 1) ctx.ellipse(px, py, T.r * 1.4, T.r * 0.8, 0.5, 0, 6.29); else ctx.arc(px, py, T.r, 0, 6.29);
      ctx.fill();
    });
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText(fracs.length ? "↓ 바닥: 침전물" : "", tx + tw / 2, ty + th + 18);
    // 범례
    ctx.textAlign = "left";
    const lx0 = tx + tw + 24;
    TYPES.forEach((T, i) => {
      const lx = lx0 + (i % 3) * ((w - lx0) / 3), ly = 18 + Math.floor(i / 3) * 16;
      ctx.fillStyle = T.col; ctx.beginPath(); ctx.arc(lx + 4, ly - 4, 4, 0, 6.29); ctx.fill();
      ctx.fillStyle = C.ink2; ctx.fillText(T.name, lx + 12, ly);
    });
    // 분획표
    const x0 = lx0, x1 = w - 8, y0 = 58;
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`;
    const cols = { what: x0, dna: x0 + (x1 - x0) * 0.6, res: x0 + (x1 - x0) * 0.75, pro: x0 + (x1 - x0) * 0.9 };
    ctx.fillText("침전물 속 알갱이", cols.what, y0);
    ctx.textAlign = "center";
    [["dna", "DNA", ""], ["res", "호흡", "효소"], ["pro", "단백질", "합성"]].forEach(([k, a, b]) => { ctx.fillText(a, cols[k] + 7, y0 - 11); ctx.fillText(b, cols[k] + 7, y0); });
    ctx.textAlign = "left";
    const rowH = Math.min(52, (h - y0 - 20) / 5);
    const rows = fracs.map((f, i) => ({ label: `침전물 ${i + 1} · ${f.g.toLocaleString()} g, ${f.t}분`, cnt: f.pel }));
    const sup = TYPES.map((T, ti) => parts.filter((p) => !p.gone && p.ti === ti && !(p.pel === cur && cur >= 0)).length);
    rows.push({ label: fracs.length ? "지금 상층액" : "아직 돌리지 않음 (전체)", cnt: sup, sup: true });
    const maxN = { dna: TYPES[0].n, res: TYPES[1].n, pro: TYPES[3].n + TYPES[2].n * 0.5 };
    rows.forEach((r, i) => {
      const ry = y0 + 12 + i * rowH;
      ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x0, ry - 2 + .5); ctx.lineTo(x1, ry - 2 + .5); ctx.stroke();
      ctx.fillStyle = r.sup ? C.ink3 : C.ink; ctx.font = `600 11px ${F.sans}`; ctx.fillText(r.label, x0, ry + 12);
      // 조성 막대
      const tot = r.cnt.reduce((a, b) => a + b, 0), bw = cols.dna - x0 - 10;
      let bx = x0;
      r.cnt.forEach((c, ti) => { if (!c) return; const ww = c / Math.max(tot, 1) * bw; ctx.fillStyle = TYPES[ti].col; ctx.fillRect(bx, ry + 18, ww, 9); bx += ww; });
      if (!tot) { ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.fillText("거의 없음", x0, ry + 27); }
      // 활성
      const act = { dna: r.cnt[0] / maxN.dna, res: r.cnt[1] / maxN.res, pro: (r.cnt[3] + r.cnt[2] * 0.5) / maxN.pro };
      [["dna", "#8a4fb0"], ["res", "#d4493a"], ["pro", "#3f6fa3"]].forEach(([k, col]) => {
        const v = act[k], bh = rowH - 16;
        ctx.fillStyle = "#e7e8e1"; ctx.fillRect(cols[k], ry + 2, 14, bh);
        ctx.fillStyle = col; ctx.fillRect(cols[k], ry + 2 + bh * (1 - v), 14, bh * v);
      });
    });
  }

  function update() {
    oG.textContent = gVal().toLocaleString(); oT.textContent = sT.value;
    root.querySelectorAll("[data-p]").forEach((b) => { const [g, t] = b.dataset.p.split(",").map(Number); b.setAttribute("aria-pressed", g === gVal() && t === +sT.value ? "true" : "false"); });
    draw();
  }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { const [g, t] = b.dataset.p.split(",").map(Number); sG.value = Math.log10(g); sT.value = t; update(); }));
  [sG, sT].forEach((el) => el.addEventListener("input", update));
  $(".spin").addEventListener("click", () => {
    // 앞 침전물은 떼어 낸다
    const cur = fracs.length - 1;
    if (cur >= 0) parts.forEach((p) => { if (p.pel === cur) p.gone = true; });
    spin(); update();
  });
  $(".reset").addEventListener("click", () => { reset(); update(); });
  loop(cv, (dt) => { if (anim >= 1) return; anim = Math.min(1, anim + dt / 1.2); draw(); });
  reset(); update();
})();
