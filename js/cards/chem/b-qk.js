/* 카드: Q와 K를 비교하면 무엇을 알 수 있을까? — N₂O₄ ⇌ 2NO₂ (25 °C, Kc = 4.6×10⁻³) 농도 평면 */
(() => {
  const root = document.getElementById("card-chem-qk");
  if (!root) return;
  const { C, F, clamp, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), go = $(".run");
  const dQ = $(".q"), dCmp = $(".cmp"), dDir = $(".dir"), dN = $(".c-n2o4"), dD = $(".c-no2"), sw = $(".swatch");
  const K = 4.6e-3, XM = 0.05, YM = 0.03;
  const BROWN = "#9a4a1c";

  let st = { x: 0.04, y: 0 }, from = null, xi = 0, xiEq = 0, anim = -1, trail = [];
  const Q = (s) => s.x > 0 ? s.y * s.y / s.x : Infinity;
  function solve(x0, y0) {
    let lo = -y0 / 2, hi = x0;
    const f = (e) => (y0 + 2 * e) ** 2 - K * (x0 - e);
    for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; f(m) > 0 ? hi = m : lo = m; }
    return (lo + hi) / 2;
  }
  function set(x, y) {
    st = { x: clamp(x, 0, XM), y: clamp(y, 0, YM) }; from = { ...st }; xi = 0; anim = -1; trail = [{ ...st }];
    xiEq = solve(st.x, st.y); update();
  }
  function run() { if (!from) return; from = { ...st }; xiEq = solve(st.x, st.y); xi = 0; anim = 0; trail = [{ ...st }]; }

  const { ctx, size } = fit(cv, () => draw());
  let geo = null;
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const split = Math.round(w * 0.70);
    const x0 = 46, y0 = 22, pw = split - x0 - 16, ph = h - y0 - 40;
    const X = (v) => x0 + v / XM * pw, Y = (v) => y0 + (1 - v / YM) * ph;
    geo = { x0, y0, pw, ph };
    // 영역 칠하기: 곡선 위 = Q > K, 아래 = Q < K
    ctx.fillStyle = "rgba(181,83,47,.07)"; ctx.beginPath(); ctx.moveTo(X(0), Y(YM));
    for (let v = 0; v <= XM + 1e-9; v += XM / 100) ctx.lineTo(X(v), Y(Math.min(YM, Math.sqrt(K * v))));
    ctx.lineTo(X(XM), Y(YM)); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(59,124,42,.07)"; ctx.beginPath(); ctx.moveTo(X(0), Y(0));
    for (let v = 0; v <= XM + 1e-9; v += XM / 100) ctx.lineTo(X(v), Y(Math.min(YM, Math.sqrt(K * v))));
    ctx.lineTo(X(XM), Y(0)); ctx.closePath(); ctx.fill();
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [0, 0.01, 0.02, 0.03, 0.04, 0.05].map((v) => [v, v.toFixed(2)]),
      yt: [0, 0.01, 0.02, 0.03].map((v) => [v, v.toFixed(2)]), xlabel: "[N₂O₄] (mol/L)", ylabel: "[NO₂] (mol/L)" });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath();
    for (let v = 0; v <= XM + 1e-9; v += XM / 200) { const yy = Y(Math.sqrt(K * v)); v ? ctx.lineTo(X(v), yy) : ctx.moveTo(X(v), yy); }
    ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink; ctx.textAlign = "right";
    ctx.fillText("평형 (Q = K)", X(XM) - 4, Y(Math.sqrt(K * XM)) + 16);
    ctx.fillStyle = C.warn; ctx.textAlign = "left"; ctx.fillText("Q > K", X(0.002), Y(0.028));
    ctx.fillStyle = C.forest; ctx.textAlign = "right"; ctx.fillText("Q < K", X(0.049), Y(0.003));
    // 반응 경로 안내선 (기울기 −2)
    if (from) {
      ctx.setLineDash([3, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
      const e1 = -from.y / 2, e2 = from.x;
      ctx.beginPath(); ctx.moveTo(X(from.x - e1), Y(from.y + 2 * e1)); ctx.lineTo(X(from.x - e2), Y(Math.min(YM * 2, from.y + 2 * e2))); ctx.save(); ctx.rect(x0, y0, pw, ph); ctx.clip(); ctx.stroke(); ctx.restore(); ctx.setLineDash([]);
    }
    ctx.strokeStyle = BROWN; ctx.lineWidth = 2.4; ctx.beginPath();
    trail.forEach((p, i) => i ? ctx.lineTo(X(p.x), Y(p.y)) : ctx.moveTo(X(p.x), Y(p.y))); ctx.stroke();
    ctx.beginPath(); ctx.arc(X(st.x), Y(st.y), 6, 0, Math.PI * 2); ctx.fillStyle = BROWN; ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("그래프를 눌러 처음 농도 정하기", x0, y0 + ph + 28);

    // ── 오른쪽: log Q 눈금
    const ax = split + (w - split) * 0.42, top = 22, bot = h - 40;
    const L0 = -5, L1 = 0, YL = (q) => bot - (clamp(Math.log10(q), L0, L1) - L0) / (L1 - L0) * (bot - top);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ax + .5, top); ctx.lineTo(ax + .5, bot); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (let e = L0; e <= L1; e++) { ctx.fillText(e === 0 ? "1" : `10${sup(e)}`, ax - 6, YL(10 ** e) + 3); ctx.beginPath(); ctx.moveTo(ax - 3, YL(10 ** e) + .5); ctx.lineTo(ax + 3, YL(10 ** e) + .5); ctx.stroke(); }
    ctx.textAlign = "center"; ctx.fillText("Q (로그)", ax, top - 8);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax - 14, YL(K)); ctx.lineTo(ax + 14, YL(K)); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.fillText("K", ax + 18, YL(K) + 4);
    const q = Q(st);
    if (q > 0) {
      const yq = isFinite(q) ? YL(q) : top;
      ctx.beginPath(); ctx.moveTo(ax - 12, yq); ctx.lineTo(ax - 4, yq - 5); ctx.lineTo(ax - 4, yq + 5); ctx.closePath();
      ctx.fillStyle = BROWN; ctx.fill();
      if (Math.abs(Math.log10(q / K)) > 0.02) {
        ctx.strokeStyle = BROWN; ctx.lineWidth = 1.5; const yk = YL(K), dir = Math.sign(yk - yq);
        ctx.beginPath(); ctx.moveTo(ax + 26, yq); ctx.lineTo(ax + 26, yk - dir * 6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax + 26, yk); ctx.lineTo(ax + 22, yk - dir * 7); ctx.lineTo(ax + 30, yk - dir * 7); ctx.closePath(); ctx.fillStyle = BROWN; ctx.fill();
      }
    } else if (st.x > 0) {
      ctx.fillStyle = BROWN; ctx.textAlign = "center"; ctx.fillText("Q = 0", ax, bot + 16);
    }
    ctx.textAlign = "left";
  }
  const sup = (e) => String(e).split("").map((c) => "⁻⁰¹²³⁴⁵⁶⁷⁸⁹"["-0123456789".indexOf(c)]).join("");

  const fmtE = (v) => { if (!isFinite(v)) return "∞"; if (v === 0) return "0"; const e = Math.floor(Math.log10(v)); return `${(v / 10 ** e).toFixed(2)}×10${sup(e)}`; };
  function update() {
    const q = Q(st);
    dQ.textContent = fmtE(q);
    dN.textContent = st.x.toFixed(4); dD.textContent = st.y.toFixed(4);
    const r = q / K;
    if (Math.abs(Math.log10(r)) < 0.01 || (st.x === 0 && st.y === 0)) { dCmp.textContent = "Q = K"; dDir.textContent = st.x || st.y ? "평형 (변화 없음)" : "—"; }
    else if (r < 1) { dCmp.textContent = "Q < K"; dDir.textContent = "정반응 (NO₂ 생성)"; }
    else { dCmp.textContent = "Q > K"; dDir.textContent = "역반응 (N₂O₄ 생성)"; }
    sw.style.background = `rgba(154,74,28,${clamp(st.y / YM, 0, 1) * 0.95 + 0.03})`;
    draw();
  }

  cv.addEventListener("pointerdown", (e) => {
    if (!geo) return;
    const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    const x = (px - geo.x0) / geo.pw * XM, y = (1 - (py - geo.y0) / geo.ph) * YM;
    if (x < -0.002 || x > XM * 1.02 || y < -0.002 || y > YM * 1.02) return;
    set(x, y);
  });
  go.addEventListener("click", run);
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => {
    const p = b.dataset.p;
    if (p === "no2") set(0, 0.024);
    else if (p === "n2o4") set(0.04, 0);
    else {
      // 먼저 [N₂O₄] 0.03 M 근처의 평형 혼합물을 만든 뒤 교란
      const ex = 0.03, ey = Math.sqrt(K * ex);
      if (p === "addno2") set(ex, ey + 0.01);
      if (p === "dilute") set(ex / 2, ey / 2);
    }
    run();
  }));
  loop(cv, (dt) => {
    if (anim < 0 || anim >= 1) return;
    anim = Math.min(1, anim + dt / 2);
    xi = xiEq * (1 - Math.exp(-5 * anim)) / (1 - Math.exp(-5));
    st = { x: from.x - xi, y: from.y + 2 * xi }; trail.push({ ...st });
    update();
  });
  set(0.04, 0);
})();
