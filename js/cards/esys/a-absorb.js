/* 카드: 공기는 어떤 빛을 막고, 어떤 빛을 통과시킬까? — 흡수 띠(모식), 태양·지구 복사, 대기의 창 */
(() => {
  const root = document.getElementById("card-esys-absorb");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), nS = $(".n-s"), nUV = $(".n-uv"), nE = $(".n-e");
  const on = { h2o: true, co2: true, o3: true, ch4: true };
  // [중심 파장 μm, log10 폭, 흡수율] — 위치는 실제, 세기는 모식
  const BANDS = {
    o3: [[0.2, 0.12, 1], [0.25, 0.07, 0.99], [0.29, 0.04, 0.985], [0.6, 0.08, 0.05], [9.6, 0.025, 0.7]],
    h2o: [[0.94, 0.015, 0.5], [1.13, 0.015, 0.5], [1.38, 0.02, 0.9], [1.87, 0.02, 0.95], [2.7, 0.04, 1], [6.3, 0.07, 1], [25, 0.18, 1], [60, 0.4, 1]],
    co2: [[2.7, 0.02, 0.6], [4.3, 0.025, 1], [15, 0.06, 1]],
    ch4: [[3.3, 0.02, 0.5], [7.7, 0.03, 0.8], [4.5, 0.01, 0.4]],
  };
  const COL = { h2o: "#3f6fa3", co2: "#6a6a6a", o3: "#8a4fb5", ch4: "#3b7c2a" };
  const absOf = (g, lam) => BANDS[g].reduce((t, [c, wd, a]) => { const u = (Math.log10(lam) - Math.log10(c)) / wd; return t * (1 - a * Math.exp(-u * u)); }, 1);
  const trans = (lam) => Object.keys(on).reduce((t, g) => t * (on[g] ? absOf(g, lam) : 1), lam < 0.2 && on.o3 ? 0 : 1);
  const planck = (lam, T) => 1 / (lam ** 5 * (Math.exp(14388 / (lam * T)) - 1));
  const L0 = -1, L1 = 2; // 0.1 ~ 100 μm
  const grid = Array.from({ length: 600 }, (_, i) => 10 ** (L0 + (L1 - L0) * (i + 0.5) / 600));
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 36, x1 = w - 12, X = (l) => x0 + (Math.log10(l) - L0) / (L1 - L0) * (x1 - x0);
    // 위: 복사 곡선 (λ·B_λ, 각각 최대 1)
    const b0 = h * 0.6, b1 = h - 30, t0 = 16, t1 = h * 0.47, Yt = (v) => t1 - v * (t1 - t0);
    ctx.fillStyle = "rgba(141,141,146,.08)"; ctx.fillRect(X(0.38), t0, X(0.75) - X(0.38), t1 - t0);
    ctx.fillStyle = "rgba(63,111,163,.08)"; ctx.fillRect(X(8), t0, X(13) - X(8), h - 30 - t0);
    [[5800, "#e0a02a", "태양 복사 (약 5800 K)"], [288, C.warn, "지구 복사 (약 288 K)"]].forEach(([T, col, lab]) => {
      const v = grid.map((l) => l * planck(l, T)), m = Math.max(...v);
      ctx.fillStyle = col + "33"; ctx.beginPath(); ctx.moveTo(X(grid[0]), t1); grid.forEach((l, i) => ctx.lineTo(X(l), Yt(v[i] / m * trans(l)))); ctx.lineTo(X(grid[599]), t1); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath(); grid.forEach((l, i) => (i ? ctx.lineTo(X(l), Yt(v[i] / m)) : ctx.moveTo(X(l), Yt(v[i] / m)))); ctx.stroke();
      const im = v.indexOf(m); ctx.fillStyle = col; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(lab, X(grid[im]), t0 + 2);
    });
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("선: 대기 위 · 칠한 부분: 대기를 지난 뒤", x0 + 2, t1 + 14);
    ctx.textAlign = "center"; ctx.fillText("가시광선", X(0.53), t0 + 30); ctx.fillStyle = "#3f6fa3"; ctx.fillText("대기의 창", X(10.3), b0 + 12);
    // 아래: 기체별 흡수 (쌓아서)
    const Yb = (a) => b1 - a * (b1 - b0);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, b0); ctx.lineTo(x0, b1); ctx.lineTo(x1, b1); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("100%", x0 - 3, b0 + 4); ctx.fillText("0", x0 - 3, b1);
    ["o3", "h2o", "co2", "ch4"].forEach((g) => {
      if (!on[g]) return;
      ctx.fillStyle = COL[g] + "88"; ctx.beginPath(); ctx.moveTo(X(grid[0]), b1);
      grid.forEach((l) => ctx.lineTo(X(l), Yb(1 - absOf(g, l) * (g === "o3" && l < 0.2 ? 0 : 1)))); ctx.lineTo(X(grid[599]), b1); ctx.fill();
    });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.beginPath(); grid.forEach((l, i) => (i ? ctx.lineTo(X(l), Yb(1 - trans(l))) : ctx.moveTo(X(l), Yb(1 - trans(l))))); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.font = `10px ${F.sans}`; ctx.fillText("흡수율 (검은 선: 전체)", X(0.33), b0 + 10);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; [0.1, 0.3, 1, 3, 10, 30, 100].forEach((l) => ctx.fillText(`${l}`, X(l), h - 16)); ctx.fillText("파장 (μm)", (x0 + x1) / 2, h - 4);
    ["o3", "h2o", "co2", "ch4"].forEach((g, i) => { ctx.fillStyle = on[g] ? COL[g] : C.rule; ctx.fillRect(x1 - 210 + i * 54, t1 + 6, 10, 10); ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText({ o3: "O₂·O₃", h2o: "H₂O", co2: "CO₂", ch4: "CH₄" }[g], x1 - 197 + i * 54, t1 + 15); });
  }
  function frac(T, a, b, f = () => true) { let s = 0, t = 0; grid.forEach((l, i) => { if (l < a || l > b) return; const dl = l * Math.log(10) * (L1 - L0) / 600, p = planck(l, T) * dl; if (!f(l)) return; t += p; s += p * trans(l); }); return [s, t]; }
  function update() {
    root.querySelectorAll("[data-g]").forEach((b) => b.setAttribute("aria-pressed", String(on[b.dataset.g])));
    const [s, t] = frac(5800, 0.1, 100); nS.textContent = `${Math.round(s / t * 100)} %`;
    const [u, ut] = frac(5800, 0.1, 0.3); nUV.textContent = `대기 위의 ${Math.max(0, u / ut * 100).toFixed(u / ut < 0.1 ? 1 : 0)} %`;
    const [e, et] = frac(288, 0.1, 100); nE.textContent = `${Math.round(e / et * 100)} %`;
    draw();
  }
  root.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => { on[b.dataset.g] = !on[b.dataset.g]; update(); }));
  update();
})();
