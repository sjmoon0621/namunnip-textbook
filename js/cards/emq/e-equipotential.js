/* 카드: 등전위면 간격만 보고 전기장의 세기를 알 수 있을까? — 점전하의 V(r), E(r), ΔV/Δr */
(() => {
  const root = document.getElementById("card-emq-equipotential");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sQ = $(".q"), oQ = $(".q-out"), sR = $(".r"), oR = $(".r-out"), nV = $(".n-v"), nE = $(".n-e"), nD = $(".n-d");
  const K = 9e9, DV = 20;
  const fmt = (x, u) => `${Math.abs(x) >= 1000 ? Math.round(x).toLocaleString() : x.toFixed(Math.abs(x) < 10 ? 1 : 0)} ${u}`;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const Q = +sQ.value * 1e-9, r = +sR.value / 100, sgn = Math.sign(Q) || 1;
    // 왼쪽: 등전위면 (전하는 왼쪽 가장자리 가운데, 반지름 60 cm까지)
    const lw = w * 0.5, cx = 14, cy = h / 2, sc = (lw - 20) / 0.62, col = Q >= 0 ? "#b5532f" : "#3f6fa3";
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, lw, h); ctx.clip();
    if (Q !== 0) for (let n = 1; n < 400; n++) { const V = n * DV, rr = K * Math.abs(Q) / V; if (rr < 0.02) break; if (rr > 0.7) continue; ctx.strokeStyle = col; ctx.globalAlpha = n % 5 === 0 ? 0.9 : 0.35; ctx.lineWidth = n % 5 === 0 ? 1.4 : 1; ctx.beginPath(); ctx.arc(cx, cy, rr * sc, -Math.PI / 2, Math.PI / 2); ctx.stroke(); }
    ctx.globalAlpha = 1;
    // 전기력선 (방사형)
    ctx.strokeStyle = "rgba(35,35,38,.18)"; for (let a = -80; a <= 80; a += 20) { const t = a * Math.PI / 180; ctx.beginPath(); ctx.moveTo(cx + 8 * Math.cos(t), cy + 8 * Math.sin(t)); ctx.lineTo(cx + 0.7 * sc * Math.cos(t), cy + 0.7 * sc * Math.sin(t)); ctx.stroke(); }
    ctx.restore();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = `700 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(Q >= 0 ? "+" : "−", cx, cy + 4);
    // 측정점과 전기장 화살표
    const px = cx + r * sc, E = K * Q / (r * r), aL = Math.max(-60, Math.min(60, Math.sign(E) * Math.min(60, 8 + Math.log10(1 + Math.abs(E)) * 12)));
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(px, cy, 4, 0, Math.PI * 2); ctx.fill();
    if (Q !== 0) { ctx.strokeStyle = C.forest; ctx.fillStyle = C.forest; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px + aL, cy); ctx.stroke(); const d = Math.sign(aL); ctx.beginPath(); ctx.moveTo(px + aL + d * 6, cy); ctx.lineTo(px + aL - d * 3, cy - 5); ctx.lineTo(px + aL - d * 3, cy + 5); ctx.fill(); ctx.font = `600 11px ${F.sans}`; ctx.fillText("E", px + aL + d * 12, cy - 6); }
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`등전위면: ${DV} V 간격 (진한 선은 ${DV * 5} V마다)`, 8, h - 8);
    // 오른쪽: V(r), E(r) 그래프
    const gx0 = w * 0.58, gx1 = w - 10, X = (rr) => gx0 + rr / 0.62 * (gx1 - gx0);
    const panel = (top, bot, f, maxv, label, colr) => {
      const Y = (v) => bot - v / maxv * (bot - top);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, top); ctx.lineTo(gx0, bot); ctx.lineTo(gx1, bot); ctx.stroke();
      ctx.strokeStyle = colr; ctx.lineWidth = 2; ctx.beginPath(); let first = true; for (let rr = 0.03; rr <= 0.62; rr += 0.005) { const v = Math.min(maxv * 1.05, Math.abs(f(rr))); first ? ctx.moveTo(X(rr), Y(v)) : ctx.lineTo(X(rr), Y(v)); first = false; } ctx.stroke();
      ctx.fillStyle = colr; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(label, gx0 + 6, top + 10);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(r), Y(Math.min(maxv, Math.abs(f(r)))), 4, 0, Math.PI * 2); ctx.fill();
      return Y;
    };
    const Vm = K * Math.max(0.5e-9, Math.abs(Q)) / 0.05, Em = K * Math.max(0.5e-9, Math.abs(Q)) / 0.0025 / 4;
    const Yv = panel(12, h * 0.45, (rr) => K * Q / rr, Vm, "|V| (V)", "#8a4fb5");
    // 접선: 기울기 = −E
    if (Q !== 0) { const V0 = Math.abs(K * Q / r), s = -Math.abs(K * Q) / (r * r), d = 0.06; ctx.strokeStyle = C.forest; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X(r - d), Yv(V0 - s * d)); ctx.lineTo(X(r + d), Yv(V0 + s * d)); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = C.forest; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("기울기의 크기 = E", X(r + d) + 3, Yv(V0 + s * d)); }
    panel(h * 0.55, h - 22, (rr) => K * Q / (rr * rr), Em, "|E| (V/m)", C.forest);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; [0, 20, 40, 60].forEach((c) => ctx.fillText(`${c} cm`, X(c / 100), h - 8));
  }
  function update() {
    const Q = +sQ.value * 1e-9, r = +sR.value / 100; oQ.textContent = (+sQ.value).toFixed(1); oR.textContent = sR.value;
    const V = K * Q / r, E = K * Q / (r * r);
    nV.textContent = fmt(V, "V"); nE.textContent = `${fmt(Math.abs(E), "V/m")}${Q ? (Q > 0 ? " (바깥쪽)" : " (전하 쪽)") : ""}`;
    if (Q === 0) nD.textContent = "—"; else { const n = Math.abs(V) / DV, r1 = K * Math.abs(Q) / (Math.ceil(n + 1e-9) * DV), r2 = K * Math.abs(Q) / (Math.max(1, Math.floor(n)) * DV); nD.textContent = r2 > r1 ? `${DV} V ÷ ${((r2 - r1) * 100).toFixed(1)} cm ≈ ${fmt(DV / (r2 - r1), "V/m")}` : "—"; }
    draw();
  }
  sQ.addEventListener("input", update); sR.addEventListener("input", update); update();
})();
