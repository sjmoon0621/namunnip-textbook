/* 카드: 파도는 왜 해안에 가까워지면 느려지고 높아질까? — 분산 관계, 물 입자 궤도, 심해파/천해파 */
(() => {
  const root = document.getElementById("card-esys-waves");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sL = $(".l"), oL = $(".l-out"), sD = $(".d"), oD = $(".d-out"), nR = $(".n-r"), nK = $(".n-k"), nC = $(".n-c"), nT = $(".n-t");
  const g = 9.8;
  const cOf = (L, d) => Math.sqrt(g * L / (2 * Math.PI) * Math.tanh(2 * Math.PI * d / L));
  const fmt = (x) => x >= 1000 ? `${+(x / 1000).toFixed(x >= 1e4 ? 0 : 1)} km` : `${+x.toFixed(x < 10 ? 1 : 0)} m`;
  let ph = 0;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const L = 10 ** +sL.value, d = 10 ** +sD.value, k = 2 * Math.PI / L;
    // 위: 단면. 가로 = 파장 2개, 세로 = min(d, L) 까지
    const x0 = 12, x1 = w * 0.62, top = 26, bot = h - 20, view = Math.min(d, L * 0.8), sx = (x1 - x0) / (2 * L), sy = (bot - top - 20) / view, A = 10;
    ctx.fillStyle = "rgba(110,164,230,.18)"; ctx.fillRect(x0, top + 10, x1 - x0, bot - top - 10);
    if (d <= view * 1.001) { ctx.fillStyle = "#c9a98a"; ctx.fillRect(x0, top + 10 + d * sy, x1 - x0, 8); ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("바닥", x0 + 4, top + 10 + d * sy - 3); }
    else { ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`바닥은 ${fmt(d)} 아래 (그림 밖)`, x0 + 4, bot - 4); }
    const eta = (x) => A * Math.cos(k * x - ph);
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.beginPath();
    for (let px = x0; px <= x1; px += 2) { const y = top + 10 - eta((px - x0) / sx); px === x0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y); } ctx.stroke();
    // 입자 궤도 (깊이 5단계)
    const sh = Math.sinh(k * d);
    for (let j = 0; j < 5; j++) {
      const z = view * j / 5 + view * 0.02, a = A * (d > L ? Math.exp(-k * z) : Math.cosh(k * (d - z)) / sh), b = A * (d > L ? Math.exp(-k * z) : Math.sinh(k * (d - z)) / sh);
      for (let i = 0; i < 4; i++) {
        const xm = L * (0.25 + i * 0.5), cx = x0 + xm * sx, cy = top + 10 + z * sy;
        ctx.strokeStyle = "rgba(63,111,163,.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(cx, cy, Math.max(0.5, a), Math.max(0.5, b), 0, 0, Math.PI * 2); ctx.stroke();
        const th = k * xm - ph; ctx.fillStyle = "#1d1d1f"; ctx.beginPath(); ctx.arc(cx - a * Math.sin(th), cy - b * Math.cos(th), 2.4, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`← 파장 ${fmt(L)} × 2 →`, x0 + 4, 12);
    // 아래(오른쪽): c 대 d/L 그래프 (로그–로그), 파장 고정
    const gx0 = w * 0.68, gx1 = w - 12, gy0 = h - 30, gy1 = 22;
    const lr0 = -3, lr1 = 1, X = (r) => gx0 + (Math.log10(r) - lr0) / (lr1 - lr0) * (gx1 - gx0);
    const cMax = Math.sqrt(g * L / (2 * Math.PI)), Y = (c) => gy0 - c / cMax / 1.15 * (gy0 - gy1);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, gy1); ctx.lineTo(gx0, gy0); ctx.lineTo(gx1, gy0); ctx.stroke();
    ctx.fillStyle = "rgba(181,83,47,.10)"; ctx.fillRect(gx0, gy1, X(0.05) - gx0, gy0 - gy1); ctx.fillStyle = "rgba(63,111,163,.10)"; ctx.fillRect(X(0.5), gy1, gx1 - X(0.5), gy0 - gy1);
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.warn; ctx.textAlign = "center"; ctx.fillText("천해파", (gx0 + X(0.05)) / 2, gy1 + 12); ctx.fillStyle = "#3f6fa3"; ctx.fillText("심해파", (X(0.5) + gx1) / 2, gy1 + 12);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; [[0.001, "1/1000"], [0.05, "1/20"], [0.5, "1/2"], [10, "10"]].forEach(([r, t]) => ctx.fillText(t, X(r), gy0 + 13));
    ctx.fillText("수심 / 파장", (gx0 + gx1) / 2, gy0 + 26);
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.warn; ctx.beginPath(); for (let i = 0; i <= 60; i++) { const r = 10 ** (lr0 + (lr1 - lr0) * i / 60), c = Math.sqrt(g * r * L); if (c > cMax * 1.15) break; i ? ctx.lineTo(X(r), Y(c)) : ctx.moveTo(X(r), Y(c)); } ctx.stroke();
    ctx.strokeStyle = "#3f6fa3"; ctx.beginPath(); ctx.moveTo(gx0, Y(cMax)); ctx.lineTo(gx1, Y(cMax)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 80; i++) { const r = 10 ** (lr0 + (lr1 - lr0) * i / 80), c = cOf(L, r * L); i ? ctx.lineTo(X(r), Y(c)) : ctx.moveTo(X(r), Y(c)); } ctx.stroke();
    const r = Math.min(10, Math.max(1e-3, d / L)); ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(X(r), Y(cOf(L, r * L)), 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.font = `10px ${F.sans}`; ctx.fillText("속도 (이 파장에서)", gx0 + 4, gy1 - 8);
  }
  function update() {
    const L = 10 ** +sL.value, d = 10 ** +sD.value, r = d / L, c = cOf(L, d);
    oL.textContent = fmt(L).replace(/ (k?m)$/, ""); oL.parentNode.lastChild.textContent = L >= 1000 ? " km" : " m";
    oD.textContent = fmt(d).replace(/ (k?m)$/, ""); oD.parentNode.lastChild.textContent = d >= 1000 ? " km" : " m";
    nR.textContent = r >= 0.1 ? r.toFixed(2) : `1/${Math.round(1 / r)}`;
    nK.textContent = r > 0.5 ? "심해파 — 속도는 파장으로 정해짐" : r < 0.05 ? "천해파 — 속도는 수심으로 정해짐" : "중간(천이파)";
    nC.textContent = `${c < 10 ? c.toFixed(1) : Math.round(c)} m/s (시속 ${Math.round(c * 3.6)} km)`;
    const T = L / c; nT.textContent = T < 120 ? `${T.toFixed(1)} 초` : `${(T / 60).toFixed(0)} 분`;
    draw();
  }
  sL.addEventListener("input", update); sD.addEventListener("input", update); update();
  loop(cv, (dt) => { ph += dt * 2.2; draw(); });
})();
