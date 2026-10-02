/* 카드: 2100년의 지구는 우리가 고르는 길에 따라 얼마나 달라질까? — IPCC AR6 WG1 SPM 값(기온·해수면·폭염), 방파제 적응 */
(() => {
  const root = document.getElementById("card-is2-ssp");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  // [이름, 색, 2021–40, 2041–60, 2081–2100 기온(°C), 2100 해수면(m) 중앙값, 범위]
  const S = [
    ["SSP1-1.9", "#2f8f6a", 1.5, 1.6, 1.4, 0.38, [0.28, 0.55]],
    ["SSP1-2.6", "#3f6fa3", 1.5, 1.7, 1.8, 0.44, [0.32, 0.62]],
    ["SSP2-4.5", "#d0a020", 1.5, 2.0, 2.7, 0.56, [0.44, 0.76]],
    ["SSP3-7.0", "#d06a2a", 1.5, 2.1, 3.6, 0.68, [0.55, 0.90]],
    ["SSP5-8.5", "#a8322a", 1.6, 2.4, 4.4, 0.77, [0.63, 1.01]],
  ];
  // 50년에 한 번 폭염의 빈도 (1850–1900 대비 배수): 1 °C 4.8, 1.5 °C 8.6, 2 °C 13.9, 4 °C 39.2
  const heat = (T) => { const xs = [1, 1.5, 2, 4], ys = [4.8, 8.6, 13.9, 39.2]; if (T >= 4) return 39.2 + (T - 4) * 13; for (let i = 1; i < 4; i++) if (T <= xs[i]) return ys[i - 1] + (ys[i] - ys[i - 1]) * (T - xs[i - 1]) / (xs[i] - xs[i - 1]); return ys[0]; };
  let sel = 2;
  const path = (s) => [[2015, 1.1], [2030, s[2]], [2050, s[3]], [2090, s[4]], [2100, s[4] + (s[4] - s[3]) / 40 * 10 * (s[4] > s[3] ? 1 : 0.3)]];
  const { ctx, size } = fit($("canvas"), () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const gx = 38, gy = 16, gw = w * 0.58 - gx, gh = h - 44;
    const X = (y) => gx + (y - 2015) / 85 * gw, Y = (t) => gy + gh - t / 5 * gh;
    axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [2020, 2040, 2060, 2080, 2100].map((y) => [y, String(y)]), yt: [0, 1, 2, 3, 4, 5].map((t) => [t, String(t)]), ylabel: "기온 상승 (°C, 1850–1900 대비)" });
    ctx.strokeStyle = C.warn; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(gx, Y(1.5)); ctx.lineTo(gx + gw, Y(1.5)); ctx.moveTo(gx, Y(2)); ctx.lineTo(gx + gw, Y(2)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("1.5 °C", gx + 3, Y(1.5) - 3); ctx.fillText("2 °C (파리 협정)", gx + 3, Y(2) - 3);
    S.forEach((s, i) => {
      const p = path(s); ctx.strokeStyle = s[1]; ctx.lineWidth = i === sel ? 3 : 1.2; ctx.globalAlpha = i === sel ? 1 : 0.45;
      ctx.beginPath(); p.forEach(([y, t], k) => (k ? ctx.lineTo(X(y), Y(t)) : ctx.moveTo(X(y), Y(t)))); ctx.stroke();
      ctx.globalAlpha = 1; ctx.fillStyle = s[1]; ctx.font = `${i === sel ? 600 : 400} 10px ${F.mono}`; ctx.fillText(s[0], X(2100) + 3 - 50, Y(p[4][1]) - 4);
    });
    // 오른쪽: 해안 도시 단면
    const s = S[sel], wall = +$(".wall").value, surge = 2.0 + s[5], hi = 2.0 + s[6][1];
    const bx = w * 0.62, bw = w - bx - 8, base = h - 16, sc = (h - 60) / 4.2, Z = (m) => base - m * sc;
    ctx.fillStyle = "#cfe0ee"; ctx.fillRect(bx, Z(surge), bw * 0.45, base - Z(surge));
    ctx.fillStyle = "rgba(63,111,163,.25)"; ctx.fillRect(bx, Z(hi), bw * 0.45, Z(surge) - Z(hi));
    ctx.fillStyle = "#8d8d92"; ctx.fillRect(bx + bw * 0.45, Z(wall), 8, base - Z(wall));
    ctx.fillStyle = "#e3dccd"; ctx.fillRect(bx + bw * 0.45 + 8, Z(0.6), bw * 0.55 - 8, base - Z(0.6));
    for (let k = 0; k < 4; k++) { ctx.fillStyle = "#b9b0a0"; ctx.fillRect(bx + bw * 0.5 + 8 + k * bw * 0.12, Z(0.6) - 18 - (k % 2) * 10, bw * 0.08, 18 + (k % 2) * 10); }
    const over = surge > wall;
    if (over) { ctx.fillStyle = "rgba(63,111,163,.45)"; ctx.fillRect(bx + bw * 0.45 + 8, Z(Math.min(surge - wall + 0.6, 2)), bw * 0.55 - 8, Z(0.6) - Z(Math.min(surge - wall + 0.6, 2))); }
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("2100년", bx + bw * 0.22, Z(surge) + 14); ctx.fillText("100년 빈도 해일", bx + bw * 0.22, Z(surge) + 28);
    ctx.font = `10px ${F.mono}`; ctx.fillText(`${surge.toFixed(2)} m`, bx + bw * 0.22, Z(surge) + 42);
    ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText(`방파제 ${wall.toFixed(1)} m`, bx + bw * 0.45 + 12, Z(wall) + 4);
    $(".n-t").textContent = `${s[4]} °C`; $(".n-s").textContent = `+${s[5]} m`; $(".n-h").textContent = `${heat(s[4]).toFixed(0)}배 자주`;
    $(".n-w").textContent = over ? "넘침" : surge + (hi - surge) > wall ? "범위 위쪽이면 넘침" : "버팀";
    $(".n-w").className = "n-w " + (over ? "bad" : hi > wall ? "" : "good");
  }
  $(".ssp").addEventListener("click", (e) => { const b = e.target.closest("[data-s]"); if (!b) return; sel = +b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); });
  $(".wall").addEventListener("input", () => { $(".w-out").textContent = (+$(".wall").value).toFixed(1); draw(); });
  draw();
})();
