/* 카드: 서로를 도는 두 별은 어떻게 별의 저울이 될까? — M_A + M_B = a³/P², 질량 중심, L ∝ M^3.5 */
(() => {
  const root = document.getElementById("card-space-binary");
  if (!root) return;
  const { C, F, fit, loop, reduce } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA = $(".a"), oA = $(".a-out"), sP = $(".p"), oP = $(".p-out"), sQ = $(".q"), oQ = $(".q-out"), nT = $(".n-t"), nE = $(".n-e"), nL = $(".n-l");
  let ph = 0.6;
  const calc = () => { const a = +sA.value, P = +sP.value, q = +sQ.value, M = a ** 3 / P ** 2, MA = M * q / (1 + q), MB = M / (1 + q); return { a, P, q, M, MA, MB }; };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = calc(), cx = w * 0.25, cy = h / 2, R = Math.min(w * 0.22, h * 0.42), aA = R / (1 + k.q), aB = R * k.q / (1 + k.q);
    ctx.fillStyle = "#0c1020"; ctx.fillRect(0, 0, w * 0.5, h);
    ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.beginPath(); ctx.arc(cx, cy, aA, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, aB, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#f5c542"; ctx.beginPath(); ctx.moveTo(cx - 4, cy); ctx.lineTo(cx + 4, cy); ctx.moveTo(cx, cy - 4); ctx.lineTo(cx, cy + 4); ctx.stroke();
    const rA = 4 + Math.min(10, k.MA ** 0.5 * 3), rB = 4 + Math.min(10, k.MB ** 0.5 * 3), ax = cx + aA * Math.cos(ph), ay = cy - aA * Math.sin(ph), bx = cx - aB * Math.cos(ph), by = cy + aB * Math.sin(ph);
    ctx.fillStyle = "#cfe0ff"; ctx.beginPath(); ctx.arc(ax, ay, rA, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#ffcf8f"; ctx.beginPath(); ctx.arc(bx, by, rB, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ddd"; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("A", ax, ay - rA - 4); ctx.fillText("B", bx, by - rB - 4); ctx.fillStyle = "#f5c542"; ctx.fillText("질량 중심", cx, cy + 16);
    // 오른쪽: 질량–광도
    const x0 = w * 0.6, x1 = w - 12, y0 = h - 24, y1 = 14, X = (m) => x0 + (Math.log10(m) + 1) / 2.5 * (x1 - x0), Y = (l) => y0 - (Math.log10(l) + 3) / 9 * (y0 - y1);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 3]); ctx.beginPath(); for (let lm = -1; lm <= 1.5; lm += 0.05) { const m = 10 ** lm, l = m ** 3.5; lm === -1 ? ctx.moveTo(X(m), Y(l)) : ctx.lineTo(X(m), Y(l)); } ctx.stroke(); ctx.setLineDash([]);
    [[k.MA, "#3f6fa3", "A"], [k.MB, C.warn, "B"]].forEach(([m, col, t]) => { if (m < 0.1 || m > 31) return; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(m), Y(m ** 3.5), 5, 0, Math.PI * 2); ctx.fill(); ctx.font = `600 10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(t, X(m) + 7, Y(m ** 3.5) + 3); });
    ctx.fillStyle = "#e0a02a"; ctx.beginPath(); ctx.arc(X(1), Y(1), 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.ink2; ctx.font = `9.5px ${F.sans}`; ctx.fillText("태양", X(1) + 6, Y(1) + 12);
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "center"; [0.1, 1, 10].forEach((m) => ctx.fillText(m, X(m), y0 + 12)); ctx.textAlign = "right"; [0.001, 1, 1000, 1e6].forEach((l) => ctx.fillText(l >= 1000 ? `10${["", "", "", "³", "", "", "⁶"][Math.log10(l)]}` : l, x0 - 3, Y(l) + 3));
    ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.fillText("광도 (태양 = 1) — 질량 (태양 = 1)", x0 + 4, y1 + 4);
  }
  function update() {
    const k = calc(); oA.textContent = k.a; oP.textContent = k.P; oQ.textContent = k.q.toFixed(1);
    const f = (m) => m < 10 ? m.toFixed(2) : m.toFixed(1); nT.textContent = `${f(k.M)} 태양 질량`; nE.textContent = `A ${f(k.MA)} · B ${f(k.MB)} (A가 질량 중심에 더 가까움)`;
    const lf = (m) => { const l = m ** 3.5; return l < 10 ? l.toFixed(2) : Math.round(l).toLocaleString(); }; nL.textContent = `A ${lf(k.MA)} · B ${lf(k.MB)} (태양 = 1)`;
    draw();
  }
  [sA, sP, sQ].forEach((s) => s.addEventListener("input", update)); update();
  loop(cv, (dt) => { if (reduce) return false; ph += dt * 2 * Math.PI / 6; draw(); });
})();
