/* 카드: 석회석은 몇 도부터 저절로 분해될까? — ΔG = ΔH − TΔS, 절편 ΔH · 기울기 −ΔS */
(() => {
  const root = document.getElementById("card-adchem-gibbs-t");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t");
  /* dH kJ, dS J/K — CRC Handbook 25 °C 값으로 계산 */
  const RX = {
    caco3: { eq: "CaCO₃(s) → CaO(s) + CO₂(g)", dH: 179.2, dS: 160.2 },
    nh3: { eq: "N₂(g) + 3H₂(g) → 2NH₃(g)", dH: -91.8, dS: -198.1 },
    h2o2: { eq: "2H₂O₂(l) → 2H₂O(l) + O₂(g)", dH: -196.0, dS: 126.0 },
    o3: { eq: "3O₂(g) → 2O₃(g)", dH: 285.4, dS: -137.8 },
    vap: { eq: "H₂O(l) → H₂O(g)", dH: 44.0, dS: 118.8 },
  };
  const CASE = {
    "-+": "ΔH < 0, ΔS > 0 : 모든 온도에서 자발적",
    "--": "ΔH < 0, ΔS < 0 : 낮은 온도에서만 자발적",
    "++": "ΔH > 0, ΔS > 0 : 높은 온도에서만 자발적",
    "+-": "ΔH > 0, ΔS < 0 : 모든 온도에서 비자발적",
  };
  let r = "caco3";
  const TMAX = 1500;
  const G = (T) => RX[r].dH - T * RX[r].dS / 1000;
  const fmt = (x, d = 1) => (x > 0 ? "+" : "") + x.toFixed(d).replace("-", "−");

  const { ctx, size } = fit(cv, () => draw());
  function arrow(x, y0, y1, col) {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
    if (Math.abs(y1 - y0) < 9) return;
    const d = y1 > y0 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x - 4, y1 - 8 * d); ctx.lineTo(x + 4, y1 - 8 * d); ctx.closePath(); ctx.fill();
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const R = RX[r], T = +sT.value;
    const x0 = 52, x1 = w - 14, top = 30, bot = h - 30;
    const vals = [0, R.dH, G(TMAX)];
    let lo = Math.min(...vals), hi = Math.max(...vals); const pad = (hi - lo) * 0.08;
    lo -= pad; hi += pad;
    const X = (t) => x0 + t / TMAX * (x1 - x0), Y = (g) => top + (hi - g) / (hi - lo) * (bot - top);
    /* 자발 영역 */
    ctx.fillStyle = "rgba(59,124,42,.07)"; ctx.fillRect(x0, Y(0), x1 - x0, bot - Y(0));
    ctx.fillStyle = "rgba(181,83,47,.06)"; ctx.fillRect(x0, top, x1 - x0, Y(0) - top);
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillStyle = C.warn; if (Y(0) - top > 18) ctx.fillText("ΔG > 0 비자발적", x1 - 4, top + 13);
    ctx.fillStyle = C.forest; if (bot - Y(0) > 18) ctx.fillText("ΔG < 0 자발적", x1 - 4, bot - 6);
    /* 축 */
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, top - 4); ctx.lineTo(x0, bot); ctx.moveTo(x0, Y(0)); ctx.lineTo(x1, Y(0)); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    [0, 300, 600, 900, 1200, 1500].forEach((t) => ctx.fillText(t, X(t), bot + 14));
    ctx.textAlign = "right"; ctx.fillText("T (K)", x1, bot + 26 > h ? bot + 14 : bot + 26);
    ctx.textAlign = "left"; ctx.fillText("ΔG° (kJ)", 4, 14);
    ctx.textAlign = "right"; ctx.fillText("0", x0 - 4, Y(0) + 3);
    /* 0 ~ 100 K 구간은 외삽(점선), 그 위는 실선 */
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.4;
    ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(0), Y(G(0))); ctx.lineTo(X(100), Y(G(100))); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(X(100), Y(G(100))); ctx.lineTo(X(TMAX), Y(G(TMAX))); ctx.stroke();
    /* 절편 표시 */
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(0), Y(R.dH), 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText(`절편 ΔH° = ${fmt(R.dH)}`, X(0) + 7, Y(R.dH) + (R.dH > 0 ? -7 : 14));
    /* ΔG = 0 온도 */
    const Tx = R.dH / R.dS * 1000;
    if (Tx > 0 && Tx < TMAX) {
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(X(Tx), top); ctx.lineTo(X(Tx), bot); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = X(Tx) > (x0 + x1) / 2 ? "right" : "left";
      ctx.fillText(`${Tx.toFixed(0)} K`, X(Tx) + (X(Tx) > (x0 + x1) / 2 ? -4 : 4), top - 10 + 12);
    }
    /* 고른 온도에서 ΔH와 −TΔS 분해 */
    const xa = X(T), g = G(T);
    ctx.globalAlpha = 0.85;
    arrow(xa - 6, Y(0), Y(R.dH), "#3f6fa3");
    arrow(xa + 6, Y(R.dH), Y(g), C.amber);
    ctx.globalAlpha = 1;
    ctx.fillStyle = g < 0 ? C.forest : C.warn; ctx.beginPath(); ctx.arc(xa, Y(g), 5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `10.5px ${F.sans}`;
    const yH = (Y(0) + Y(R.dH)) / 2 + 4, room = xa < x1 - 50;
    ctx.textAlign = "right"; ctx.fillStyle = "#3f6fa3"; ctx.fillText("ΔH", xa - 12, yH);
    ctx.fillStyle = C.amber;
    if (room) { ctx.textAlign = "left"; ctx.fillText("−TΔS", xa + 12, (Y(R.dH) + Y(g)) / 2 + 4); }
    else ctx.fillText("−TΔS", xa - 12, yH + 16);
    /* 경우 */
    ctx.fillStyle = C.ink; ctx.font = `600 11.5px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText(CASE[(R.dH < 0 ? "-" : "+") + (R.dS < 0 ? "-" : "+")], (x0 + x1) / 2, 16);
  }

  function update() {
    root.querySelectorAll("[data-r]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.r === r)));
    const R = RX[r], T = +sT.value, g = G(T);
    $(".eq").textContent = `${R.eq}   ΔH° = ${fmt(R.dH)} kJ, ΔS° = ${fmt(R.dS)} J/K`;
    $(".t-out").textContent = `${T} K (${(T - 273.15).toFixed(0).replace("-", "−")} °C)`;
    const n = $(".n-g"); n.textContent = fmt(g); n.className = "n-g " + (g < 0 ? "good" : "bad");
    $(".n-ts").textContent = fmt(-T * R.dS / 1000);
    $(".n-u").textContent = fmt(-g * 1000 / T) + " J/K";
    const Tx = R.dH / R.dS * 1000;
    $(".n-x").textContent = Tx > 0 ? `${Tx.toFixed(0)} K` : "없음";
    draw();
  }
  root.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => { r = b.dataset.r; update(); }));
  sT.addEventListener("input", update);
  if (/demo/.test(location.search)) sT.value = 1119;
  update();
})();
