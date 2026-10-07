/* 카드: 인산을 적정하면 pH는 왜 두 번 뛸까? — 다양성자 산 적정 곡선, 화학종 분율, 완충 능력 β */
(() => {
  const root = document.getElementById("card-adchem-polyprotic");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const Kw = 1e-14, V0 = 25, C0 = 0.10, CT = 0.10;
  /* pKa 목록, 처음 Na⁺ 당량(시료 1 mol당), 적정 용액(NaOH 또는 HCl), 화학종 이름 */
  const S = {
    hcl: { pk: [-7], na0: 0, t: "NaOH", sp: ["HCl", "Cl⁻"], lab: "염산" },
    ac: { pk: [4.76], na0: 0, t: "NaOH", sp: ["CH₃COOH", "CH₃COO⁻"], lab: "아세트산" },
    p: { pk: [2.15, 7.20, 12.35], na0: 0, t: "NaOH", sp: ["H₃PO₄", "H₂PO₄⁻", "HPO₄²⁻", "PO₄³⁻"], lab: "인산" },
    co3: { pk: [6.35, 10.33], na0: 2, t: "HCl", sp: ["H₂CO₃", "HCO₃⁻", "CO₃²⁻"], lab: "탄산 나트륨" },
  };
  const COL = ["#3f6fa3", C.forest, C.warn, "#8a5aa8"];
  let s = "p";
  const c1 = $(".c1"), c2 = $(".c2"), sv = $(".v"), ov = $(".v-out"), tn = $(".t-name");
  const nPh = $(".n-ph"), nB = $(".n-b"), nD = $(".n-d"), nW = $(".n-w");
  /* 분율 α_j (j = 내놓은 양성자 수) */
  function alpha(pH) {
    const pk = S[s].pk; let acc = 0; const lt = [0];
    pk.forEach((p, j) => { acc += -p + pH; lt.push(acc); });
    const m = Math.max(...lt), e = lt.map((v) => 10 ** (v - m)), sum = e.reduce((a, b) => a + b, 0);
    return e.map((v) => v / sum);
  }
  /* 조성(전체 산 Ca, Na⁺, Cl⁻ 농도)으로 pH 풀기 */
  function solve(Ca, Na, Cl) {
    let lo = -1.5, hi = 15;
    for (let i = 0; i < 90; i++) {
      const m = (lo + hi) / 2, h = 10 ** -m, a = alpha(m), nb = a.reduce((t, v, j) => t + j * v, 0);
      const f = h + Na - Kw / h - Cl - Ca * nb;
      if (f > 0) lo = m; else hi = m;
    }
    return (lo + hi) / 2;
  }
  function comp(v) {
    const p = S[s], V = V0 + v, Ca = C0 * V0 / V, add = CT * v / V;
    return { V, Ca, Na: p.na0 * Ca + (p.t === "NaOH" ? add : 0), Cl: p.t === "HCl" ? add : 0 };
  }
  const pHv = (v) => { const c = comp(v); return solve(c.Ca, c.Na, c.Cl); };
  function beta(pH, Ca) {
    const a = alpha(pH), m1 = a.reduce((t, v, j) => t + j * v, 0), m2 = a.reduce((t, v, j) => t + j * j * v, 0), h = 10 ** -pH;
    return Math.LN10 * (h + Kw / h + Ca * (m2 - m1 * m1));
  }
  const nEq = () => S[s].pk.length;
  const f1 = fit(c1, () => draw1()), f2 = fit(c2, () => draw2());
  function draw1() {
    const { ctx } = f1, { w, h } = f1.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 36, x1 = w - 12, y0 = 18, y1 = h - 30;
    const X = (v) => x0 + v / 75 * (x1 - x0), Y = (p) => y1 - clamp(p, 0, 14) / 14 * (y1 - y0);
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X, Y, xt: [0, 25, 50, 75].map((v) => [v, String(v)]), yt: [0, 2, 4, 6, 8, 10, 12, 14].map((v) => [v, String(v)]), xlabel: `넣은 ${S[s].t} (mL) →`, ylabel: "pH" });
    /* 중화점 표시 */
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    for (let k = 1; k <= nEq(); k++) {
      const ve = 25 * k; if (ve > 70) break;
      const p = pHv(ve); ctx.strokeStyle = C.rule; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(ve), y0); ctx.lineTo(X(ve), y1); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink2; ctx.fillText(`${k}번째 중화점 pH ${p.toFixed(2)}`, X(ve) + 4, k % 2 ? y0 + 10 : y0 + 23);
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 400; i++) { const v = 75 * i / 400, y = Y(pHv(v)); i ? ctx.lineTo(X(v), y) : ctx.moveTo(X(v), y); } ctx.stroke();
    const v = +sv.value, py = Y(pHv(v));
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(X(v), py, 5, 0, Math.PI * 2); ctx.fill();
  }
  function draw2() {
    const { ctx } = f2, { w, h } = f2.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 36, x1 = w - 46, y0 = 14, y1 = h - 32;
    const X = (p) => x0 + p / 14 * (x1 - x0), Y = (a) => y1 - a * (y1 - y0);
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X, Y, xt: [0, 2, 4, 6, 8, 10, 12, 14].map((v) => [v, String(v)]), yt: [[0, "0"], [0.5, "0.5"], [1, "1"]], xlabel: "pH →" });
    const v = +sv.value, c = comp(v);
    /* β (지금 전체 농도 기준), 오른쪽 눈금 */
    let bmax = 0; const bs = [];
    for (let i = 0; i <= 280; i++) { const p = 14 * i / 280, b = beta(p, c.Ca); bs.push([p, b]); }
    bmax = 0.05;
    ctx.fillStyle = "rgba(224,160,42,.22)"; ctx.beginPath(); ctx.moveTo(X(0), y1);
    bs.forEach(([p, b]) => ctx.lineTo(X(p), y1 - clamp(b / bmax, 0, 1) * (y1 - y0))); ctx.lineTo(X(14), y1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#a87614"; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
    [0, 0.025, 0.05].forEach((b) => ctx.fillText(String(b * 1000), x1 + 4, y1 - b / bmax * (y1 - y0) + 3));
    ctx.fillText("β", x1 + 4, (y0 + y1) / 2 + 16);
    /* 분율 곡선 */
    const n = S[s].sp.length;
    for (let j = 0; j < n; j++) {
      ctx.strokeStyle = COL[j]; ctx.lineWidth = 1.8; ctx.beginPath();
      for (let i = 0; i <= 280; i++) { const p = 14 * i / 280, y = Y(alpha(p)[j]); i ? ctx.lineTo(X(p), y) : ctx.moveTo(X(p), y); } ctx.stroke();
    }
    /* 이름표: 각 화학종이 우세한 pH 구간 가운데 */
    const pk = S[s].pk, edges = [0, ...pk.map((p) => clamp(p, 0, 14)), 14];
    ctx.font = `600 10px ${F.sans}`; ctx.textAlign = "center";
    for (let j = 0; j < n; j++) { const mid = (edges[j] + edges[j + 1]) / 2; if (edges[j + 1] - edges[j] < 0.8) continue; ctx.fillStyle = COL[j]; ctx.fillText(S[s].sp[j], X(mid), y0 + 10); }
    /* 지금 pH */
    const ph = solve(c.Ca, c.Na, c.Cl);
    ctx.strokeStyle = C.apple; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X(ph), y0); ctx.lineTo(X(ph), y1); ctx.stroke();
  }
  function update() {
    const v = +sv.value, c = comp(v), ph = solve(c.Ca, c.Na, c.Cl), b = beta(ph, c.Ca);
    ov.textContent = v.toFixed(1); tn.textContent = S[s].t;
    nPh.textContent = ph.toFixed(2); nB.textContent = (b * 1000).toFixed(1);
    /* 지금 용액(V mL)에 HCl 0.10 mmol을 넣은 뒤의 pH (부피 변화 무시) */
    const dCl = 0.10 / c.V, ph2 = solve(c.Ca, c.Na, c.Cl + dCl);
    nD.textContent = `ΔpH ${(ph2 - ph).toFixed(2)}`;
    const pw = -Math.log10(dCl);
    nW.textContent = `pH ${pw.toFixed(2)}`;
    root.querySelectorAll("[data-s]").forEach((q) => q.setAttribute("aria-pressed", String(q.dataset.s === s)));
    draw1(); draw2();
  }
  root.querySelectorAll("[data-s]").forEach((q) => q.addEventListener("click", () => { s = q.dataset.s; update(); }));
  sv.addEventListener("input", update);
  update();
})();
