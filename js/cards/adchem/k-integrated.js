/* 카드: 적분 속도식 — 0·1·2차 반응의 [A], ln[A], 1/[A]–t 그래프와 반감기, 미지 시료 판정 */
(() => {
  const root = document.getElementById("card-adchem-integrated");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sA = $(".a0"), sK = $(".lk"), guess = $(".ig-guess"), msg = $(".ig-msg");
  let mode = "1", mys = null, seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const gs = () => { let u = 0, v = 0; while (!u) u = rnd(); v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const UNIT = ["M s⁻¹", "s⁻¹", "M⁻¹ s⁻¹"];
  const conc = (n, a0, k, t) => (n === 0 ? Math.max(a0 - k * t, 1e-9) : n === 1 ? a0 * Math.exp(-k * t) : a0 / (1 + k * a0 * t));
  const tEnd = (n, a0, k) => (n === 0 ? 0.9 * a0 / k : n === 1 ? Math.log(10) / k : 9 / (k * a0));
  const tHalf = (n, a, k) => (n === 0 ? a / (2 * k) : n === 1 ? Math.LN2 / k : 1 / (k * a));
  function params() {
    if (mode === "m") return mys;
    return { n: +mode, a0: +sA.value, k: 10 ** +sK.value };
  }
  function newMystery() {
    seed = (Date.now() % 100000) + 11;
    if (L.demo) seed = 4242;
    const n = Math.floor(rnd() * 3);
    mys = { n, a0: +(0.4 + rnd() * 1.4).toFixed(2), k: +(10 ** (-2.6 + rnd() * 1.4)).toPrecision(2), seed: Math.floor(rnd() * 1e6) + 1, solved: false };
    msg.textContent = "세 그래프를 보고 차수를 고르세요."; msg.className = "ig-msg";
  }
  const fmtT = (s) => (s >= 100 ? `${s.toFixed(0)} s` : `${s.toPrecision(3)} s`);
  const cv = $("canvas");
  const { ctx, size } = fit(cv, () => draw());
  function data(p) {
    seed = p.seed || Math.round(p.a0 * 1000 + p.k * 1e5 + p.n * 7) + 3;
    const te = tEnd(p.n, p.a0, p.k), pts = [];
    for (let i = 0; i <= 9; i++) { const t = te * i / 9; pts.push({ x: t, y: conc(p.n, p.a0, p.k, t) * (1 + 0.015 * gs()) }); }
    return { te, pts };
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = params(), { te, pts } = data(p);
    const top = { x0: 46, y0: 22, w: w - 60, h: h * 0.40 - 22 };
    const P1 = L.plot(ctx, top, { pts, model: (t) => conc(p.n, p.a0, p.k, t), xr: [0, te * 1.02], yr: [0, p.a0 * 1.1], ylabel: "[A] (M)", xlabel: "t (s)", color: "#3f6fa3" });
    /* 반감기 표시 */
    let a = p.a0, t0 = 0;
    ctx.font = `10px ${F.mono}`;
    for (let i = 0; i < 3; i++) {
      const t1 = t0 + tHalf(p.n, a, p.k); a /= 2;
      if (t1 > te * 1.02) break;
      ctx.strokeStyle = "#e0a02a"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(P1.X(t1), top.y0 + top.h); ctx.lineTo(P1.X(t1), P1.Y(a)); ctx.lineTo(top.x0, P1.Y(a)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#b47a10"; ctx.textAlign = "left"; ctx.fillText(`t½${["①", "②", "③"][i]}`, P1.X(t1) + 3, P1.Y(a) - 4);
      t0 = t1;
    }
    /* 아래 두 그래프 */
    const gap = 54, bw = (w - 46 - 14 - gap) / 2, by0 = h * 0.40 + 46, bh = h - by0 - 30;
    const sets = [
      { box: { x0: 46, y0: by0, w: bw, h: bh }, f: (y) => Math.log(y), lab: "ln[A]" },
      { box: { x0: 46 + bw + gap, y0: by0, w: bw, h: bh }, f: (y) => 1 / y, lab: "1/[A] (M⁻¹)" },
    ];
    const r2s = [];
    const f0 = L.linfit(pts.map((q) => q.x), pts.map((q) => q.y));
    r2s.push(f0 ? f0.r2 : NaN);
    sets.forEach((s) => {
      const tp = pts.map((q) => ({ x: q.x, y: s.f(q.y) }));
      const fl = L.linfit(tp.map((q) => q.x), tp.map((q) => q.y));
      L.plot(ctx, s.box, { pts: tp, fit: fl, xr: [0, te * 1.02], ylabel: s.lab, xlabel: "t (s)", color: "#3f6fa3" });
      r2s.push(fl ? fl.r2 : NaN);
    });
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "right";
    ctx.fillText(`[A]–t 직선 맞춤 R² = ${r2s[0].toFixed(4)}`, top.x0 + top.w, top.y0 + 4);
    sets.forEach((s, i) => { ctx.fillText(`R² = ${r2s[i + 1].toFixed(4)}`, s.box.x0 + s.box.w, s.box.y0 - 7); });
  }
  function update() {
    root.querySelectorAll("[data-o]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.o === mode)));
    const m = mode === "m";
    guess.classList.toggle("on", m);
    $(".ctl-row").classList.toggle("dim", m);
    const p = params();
    $(".a-out").textContent = m ? p.a0.toFixed(2) : (+sA.value).toFixed(2);
    $(".k-out").textContent = m ? (p.solved ? `${p.k} ${UNIT[p.n]}` : "?") : `${(10 ** +sK.value).toPrecision(2)} ${UNIT[+mode]}`;
    let a = p.a0; const hs = [];
    for (let i = 0; i < 3; i++) { hs.push(tHalf(p.n, a, p.k)); a /= 2; }
    [".n-h1", ".n-h2", ".n-h3"].forEach((c, i) => { $(c).textContent = fmtT(hs[i]); });
    draw();
  }
  root.querySelectorAll("[data-o]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.o; if (mode === "m" && !mys) newMystery(); update(); }));
  root.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => {
    const g = +b.dataset.g, ok = g === mys.n;
    if (ok) { mys.solved = true; msg.textContent = `맞습니다. ${["[A]", "ln[A]", "1/[A]"][g]}–t가 직선입니다. 기울기로 k를 구해 아래 값과 비교하세요.`; msg.className = "ig-msg good"; }
    else { msg.textContent = `${g}차라면 ${["[A]", "ln[A]", "1/[A]"][g]}–t가 직선이어야 합니다. 점들이 맞춤선에서 어떻게 휘는지 보세요.`; msg.className = "ig-msg bad"; }
    update();
  }));
  $("[data-new]").addEventListener("click", () => { newMystery(); update(); });
  [sA, sK].forEach((s) => s.addEventListener("input", update));
  if (L.demo) { mode = "m"; newMystery(); }
  update();
})();
