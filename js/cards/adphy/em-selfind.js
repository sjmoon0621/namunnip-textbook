/* 카드: 솔레노이드의 자체 유도 계수 L = μ₀μrN²A/ℓ 과 RL 회로의 전류 변화, 유도 기전력 */
(() => {
  const root = document.getElementById("card-adphy-selfind");
  if (!root) return;
  const { C: COL, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sN = $(".n"), oN = $(".n-out"), sL = $(".l"), oL = $(".l-out"), sA = $(".a"), oA = $(".a-out"), sM = $(".m"), oM = $(".m-out"), sR = $(".r"), oR = $(".r-out");
  const nL = $(".n-l"), nT = $(".n-t"), nU = $(".n-u");
  const MU0 = 4 * Math.PI * 1e-7, EMF = 6;
  const par = () => {
    const N = +sN.value, len = +sL.value / 100, rad = +sA.value / 100, mur = Math.round(10 ** +sM.value), R = +sR.value;
    const A = Math.PI * rad * rad, L = MU0 * mur * N * N * A / len;
    return { N, len, rad, mur, R, A, L, tau: L / R, I0: EMF / R };
  };
  const tfmt = (t) => t < 1e-3 ? `${(t * 1e6).toPrecision(3)} μs` : t < 1 ? `${(t * 1e3).toPrecision(3)} ms` : `${t.toPrecision(3)} s`;
  const Lfmt = (L) => L < 1e-3 ? `${(L * 1e6).toPrecision(3)} μH` : L < 1 ? `${(L * 1e3).toPrecision(3)} mH` : `${L.toPrecision(3)} H`;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = par(), topH = Math.round(h * 0.36);
    /* 코일 그림 (길이·반지름 비례, 감은 수는 10회당 1회로 줄여 그림) */
    const sc = Math.min((w - 120) / 0.30, (topH - 30) / 0.06), cw = p.len * sc, ch = 2 * p.rad * sc, cx = w / 2, cy = topH / 2 + 4;
    if (p.mur > 1) { ctx.fillStyle = `rgba(93,93,97,${Math.min(.55, .12 + Math.log10(p.mur) * .14).toFixed(2)})`; ctx.fillRect(cx - cw / 2 - 10, cy - ch / 2 + 3, cw + 20, ch - 6); }
    const nd = Math.max(3, Math.round(p.N / 10)), sp = cw / nd;
    ctx.strokeStyle = "#b5532f"; ctx.lineWidth = Math.max(0.8, Math.min(2.2, sp * .5));
    for (let i = 0; i < nd; i++) { const x = cx - cw / 2 + (i + .5) * sp; ctx.beginPath(); ctx.ellipse(x, cy, Math.max(1.5, sp * .35), ch / 2, 0, 0, 2 * Math.PI); ctx.stroke(); }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = COL.ink2; ctx.textAlign = "center";
    ctx.fillText(`ℓ = ${(p.len * 100).toFixed(0)} cm`, cx, cy + ch / 2 + 14);
    ctx.textAlign = "left"; ctx.fillText(`지름 ${(p.rad * 200).toFixed(1)} cm`, cx + cw / 2 + 14, cy + 4);
    ctx.fillStyle = COL.ink3; ctx.fillText(`감은 수 ${p.N}회 (그림은 10회를 1회로)${p.mur > 1 ? ` · 심 μr = ${p.mur}` : " · 공기 심"}`, 6, 13);

    /* 아래: 스위치를 닫고(t = 0) 6τ 뒤 전지를 빼고 코일과 저항만 남김 */
    const x0 = 44, x1 = w - 44, y1 = topH + 30, y0 = h - 34, T = 12 * p.tau;
    ctx.strokeStyle = COL.rule; ctx.beginPath(); ctx.moveTo(0, topH + 8); ctx.lineTo(w, topH + 8); ctx.stroke();
    const X = (t) => x0 + t / T * (x1 - x0), Y = (v) => (y0 + y1) / 2 - v * (y0 - y1) / 2 * .92;
    const xt = []; for (let k = 0; k <= 12; k += 2) xt.push([k * p.tau, k ? `${k}τ` : "0"]);
    NM.axes(ctx, { x0, y0: y1, w: x1 - x0, h: y0 - y1, X, Y, xt, yt: [[1, "+1"], [0, "0"], [-1, "−1"]], xlabel: `시간 (τ = L/R = ${tfmt(p.tau)})`, ylabel: "전류 I/I₀ · 코일 기전력 ε_L/ε (상대값)" });
    ctx.fillStyle = "rgba(116,171,102,.10)"; ctx.fillRect(X(0), y1, X(6 * p.tau) - X(0), y0 - y1);
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = COL.ink3; ctx.textAlign = "center";
    ctx.fillText("← 전지 연결 →", X(3.6 * p.tau), Y(0.45)); ctx.fillText("← 전지 빼고 R로 방전 →", X(9 * p.tau), Y(0.45));
    const I = (t) => t < 6 * p.tau ? 1 - Math.exp(-t / p.tau) : (1 - Math.exp(-6)) * Math.exp(-(t - 6 * p.tau) / p.tau);
    const eL = (t) => t < 6 * p.tau ? -Math.exp(-t / p.tau) : (1 - Math.exp(-6)) * Math.exp(-(t - 6 * p.tau) / p.tau);
    const curve = (f, col) => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); let prev = null; for (let i = 0; i <= 400; i++) { const t = T * i / 400, v = f(t); const x = X(t), y = Y(v); if (prev !== null && Math.abs(i / 400 * 12 - 6) < 0.031) ctx.lineTo(x, Y(prev)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); prev = v; } ctx.stroke(); };
    curve(I, COL.forest); curve(eL, COL.warn);
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = COL.forest; ctx.fillText("전류 I", X(1.2 * p.tau), Y(0.62));
    ctx.fillStyle = COL.warn; ctx.fillText("유도 기전력 −L dI/dt", X(0.9 * p.tau), Y(-0.75));
  }
  function update() {
    const p = par();
    oN.textContent = p.N; oL.textContent = (+sL.value).toFixed(0); oA.textContent = (+sA.value).toFixed(1); oM.textContent = p.mur; oR.textContent = (+sR.value).toFixed(0);
    nL.textContent = Lfmt(p.L); nT.textContent = tfmt(p.tau);
    const U = 0.5 * p.L * p.I0 * p.I0; nU.textContent = U < 1e-3 ? `${(U * 1e6).toPrecision(3)} μJ` : `${(U * 1e3).toPrecision(3)} mJ`;
    draw();
  }
  [sN, sL, sA, sM, sR].forEach((el) => el.addEventListener("input", update));
  update();
})();
