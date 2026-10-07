/* 카드: 핵분열 연쇄 반응 — 증배 계수 k와 세대 길이(지연 중성자)로 원자로와 핵무기 비교 (모식) */
(() => {
  const root = document.getElementById("card-hist-chain");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const sK = $(".k");
  const BETA = 0.0065, TAU_D = 0.08, LAM_R = 1e-4, LAM_B = 1e-8, N_KG = 2.6e24;
  const MODES = [
    { k0: 0.995, k1: 1.015, def: 1.0, dig: 4 },
    { k0: 0.9, k1: 2.4, def: 2.0, dig: 2 },
  ];
  let mode = 0, tree = [];

  const kVal = () => { const m = MODES[mode]; return m.k0 + (m.k1 - m.k0) * (+sK.value) / 1000; };
  const setK = (k) => { const m = MODES[mode]; sK.value = Math.round((k - m.k0) / (m.k1 - m.k0) * 1000); };

  /* e-배 시간 T (음수면 줄어듦, Infinity면 일정) */
  function period(k) {
    const r = k - 1;
    if (Math.abs(r) < 2e-5) return Infinity;
    if (mode === 1) return r > 0 ? LAM_B / r : -LAM_B / -r;
    if (r > BETA) return LAM_R / (r - BETA);
    if (r > 0) return TAU_D * (BETA - r * 0.999) / (BETA * r);
    return -Math.max(80, TAU_D / -r);
  }

  function poisson(m) { const L = Math.exp(-m); let k = 0, p = 1; do { k++; p *= Math.random(); } while (p > L); return k - 1; }
  function grow() {
    const k = kVal(); tree = [Array.from({ length: mode ? 1 : 12 }, () => ({ p: -1 }))];
    for (let g = 1; g <= 7; g++) {
      const prev = tree[g - 1], cur = [];
      prev.forEach((nd, i) => { if (i >= 160) return; const c = poisson(k); for (let j = 0; j < c; j++) cur.push({ p: i }); });
      tree.push(cur);
    }
  }

  const tv = fit($(".cv-tree"), () => drawTree());
  const pv = fit($(".cv-plot"), () => drawPlot());

  function drawTree() {
    const { ctx } = tv, { w, h } = tv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const G = tree.length, top = 22, gx = (g) => 40 + g * (w - 110) / (G - 1);
    const pos = tree.map((gen) => { const n = Math.min(gen.length, 160); return gen.map((_, i) => (i < n ? top + (i + 0.5) * (h - top - 22) / n : null)); });
    ctx.lineWidth = 0.7; ctx.strokeStyle = "rgba(93,93,97,.35)";
    for (let g = 1; g < G; g++) tree[g].forEach((nd, i) => {
      const y = pos[g][i], py = pos[g - 1][nd.p]; if (y === null || py == null) return;
      ctx.beginPath(); ctx.moveTo(gx(g - 1), py); ctx.lineTo(gx(g), y); ctx.stroke();
    });
    tree.forEach((gen, g) => {
      gen.forEach((_, i) => { const y = pos[g][i]; if (y === null) return; ctx.fillStyle = mode ? C.apple : C.forest; ctx.beginPath(); ctx.arc(gx(g), y, gen.length > 60 ? 1.6 : 3, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(`${g}세대 ${gen.length}`, gx(g), 12);
    });
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.font = `10.5px ${F.sans}`;
    ctx.fillText(`k = ${kVal().toFixed(MODES[mode].dig)} · 한 번의 시행 (우연이 섞임)`, w - 6, h - 6);
  }

  function drawPlot() {
    const { ctx } = pv, { w, h } = pv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = kVal(), T = period(k);
    const box = { x0: 48, y0: 22, w: w - 76, h: h - 56 };
    const tmax = mode ? 2e-6 : 300, ylo = mode ? -2 : -1, yhi = mode ? 26 : 4;
    const X = (t) => box.x0 + t / tmax * box.w, Y = (l) => box.y0 + box.h - (l - ylo) / (yhi - ylo) * box.h;
    const xt = mode ? [0, 0.5, 1, 1.5, 2].map((v) => [v * 1e-6, v + " μs"]) : [0, 60, 120, 180, 240, 300].map((v) => [v, v + " s"]);
    const yt = (mode ? [0, 5, 10, 15, 20, 25] : [-1, 0, 1, 2, 3, 4]).map((v) => [v, "10" + String(v).replace("-", "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d])]);
    axes(ctx, { ...box, X, Y, xt, yt, xlabel: "시간", ylabel: "중성자 수 (처음의 몇 배)" });
    const goal = mode ? Math.log10(N_KG) : 3;
    ctx.strokeStyle = C.warn; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(box.x0, Y(goal)); ctx.lineTo(box.x0 + box.w, Y(goal)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(mode ? "1 kg이 모두 분열 (2.6×10²⁴)" : "출력 1000배", box.x0 + 6, Y(goal) - 5);
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    ctx.strokeStyle = mode ? C.apple : C.forest; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let i = 0; i <= 300; i++) { const t = tmax * i / 300, l = Number.isFinite(T) ? Math.min(yhi + 1, t / T / Math.LN10) : 0; i ? ctx.lineTo(X(t), Y(l)) : ctx.moveTo(X(t), Y(l)); }
    ctx.stroke(); ctx.restore();
  }

  const fmtT = (s) => {
    if (!Number.isFinite(s)) return "—";
    if (s < 1e-6) return (s * 1e9).toPrecision(2) + " ns";
    if (s < 1e-3) return (s * 1e6).toPrecision(2) + " μs";
    if (s < 1) return (s * 1e3).toPrecision(2) + " ms";
    if (s < 10) return s.toPrecision(2) + " 초";
    if (s < 600) return Math.round(s) + " 초";
    return Math.round(s / 60) + " 분";
  };

  function upd(regrow) {
    const k = kVal(), T = period(k), r = k - 1;
    $(".k-out").textContent = k.toFixed(MODES[mode].dig);
    const s = $(".n-s");
    let st, cls;
    if (!Number.isFinite(T)) { st = "임계 (일정)"; cls = "good"; }
    else if (T < 0) { st = "미임계 (꺼짐)"; cls = ""; }
    else if (mode === 0 && r <= BETA) { st = "초임계 · 조절 가능"; cls = "good"; }
    else { st = mode ? "폭주 (폭발 조건)" : "즉발 임계 · 폭주"; cls = "bad"; }
    s.textContent = st; s.className = "n-s " + cls;
    $(".n-d").textContent = T > 0 && Number.isFinite(T) ? fmtT(T * Math.LN2) : "—";
    $(".n-gl").textContent = mode ? "1 kg이 모두 분열할 때까지" : "출력이 1000배가 될 때까지";
    if (T > 0 && Number.isFinite(T)) {
      const lg = mode ? Math.log(N_KG) : Math.log(1000);
      $(".n-g").textContent = mode ? `${Math.round(lg / Math.log(k))}세대 · ${fmtT(T * lg)}` : fmtT(T * lg);
    } else $(".n-g").textContent = "도달 못 함";
    if (regrow) grow();
    drawTree(); drawPlot();
  }

  $(".mode").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    mode = +b.dataset.m; root.querySelectorAll(".mode .chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    setK(MODES[mode].def); upd(true);
  });
  sK.addEventListener("input", () => upd(true));
  $(".regrow").addEventListener("click", () => { grow(); drawTree(); });
  setK(/[?&]demo\b/.test(location.search) ? 1.001 : MODES[0].def);
  upd(true);
})();
