/* 카드: 작은 태양 전지 12장으로 휴대 전화 충전 — 단일 다이오드 모형, 직렬·병렬 배열, I–V·P–V, 동작점 */
(() => {
  const root = document.getElementById("card-phy-solar-panel");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const ISC = 0.6, VOC = 0.6, NVT = 0.035, I0 = ISC / (Math.exp(VOC / NVT) - 1);
  let ns = 1;
  const cell = (v, il) => il - I0 * (Math.exp(v / NVT) - 1);
  function array() {
    const il = ISC * (+$(".g").value / 1000) * Math.cos(+$(".a").value * Math.PI / 180), np = 12 / ns;
    const voc = NVT * Math.log(il / I0 + 1) * ns;
    const I = (V) => Math.max(0, cell(V / ns, il) * np);
    let pm = 0, vm = 0; for (let k = 0; k <= 400; k++) { const V = voc * k / 400, P = V * I(V); if (P > pm) { pm = P; vm = V; } }
    return { il, np, voc, isc: il * np, I, pm, vm, ok: I(5) >= 0.5 };
  }
  const { ctx, size } = fit($("canvas"), () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = array();
    // 배열 그림
    const bw = w * 0.3, cw = Math.min(22, bw / ns - 4), rows = a.np, chh = Math.min(22, (h - 40) / rows - 6);
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`${ns}장 직렬 × ${rows}줄 병렬`, 10, 14);
    for (let r = 0; r < rows; r++) for (let c = 0; c < ns; c++) { const x = 16 + c * (cw + 4), y = 26 + r * (chh + 6); ctx.fillStyle = "#1f3f6b"; ctx.fillRect(x, y, cw, chh); ctx.strokeStyle = "#8fb0d8"; ctx.lineWidth = 0.6; ctx.strokeRect(x + 2, y + 2, cw - 4, chh - 4); if (c) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 4, y + chh / 2); ctx.lineTo(x, y + chh / 2); ctx.stroke(); } }
    // I–V, P–V
    const gx = w * 0.4, gy = 16, gw = w - gx - 14, gh = h - 44, Vmax = 8, Imax = 8;
    const X = (v) => gx + v / Vmax * gw, Y = (i) => gy + gh - i / Imax * gh;
    axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [0, 2, 4, 6, 8].map((v) => [v, v + " V"]), yt: [0, 2, 4, 6, 8].map((i) => [i, i + " A"]) });
    ctx.save(); ctx.beginPath(); ctx.rect(gx, gy, gw, gh); ctx.clip();
    ctx.fillStyle = "rgba(63,143,90,.08)"; ctx.fillRect(X(5), gy, X(Vmax) - X(5), Y(0.5) - gy);
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k <= 200; k++) { const v = Math.min(Vmax, a.voc * k / 200), i = a.I(v); k ? ctx.lineTo(X(v), Y(i)) : ctx.moveTo(X(v), Y(i)); } ctx.stroke();
    ctx.strokeStyle = "#e0a02a"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath(); for (let k = 0; k <= 200; k++) { const v = Math.min(Vmax, a.voc * k / 200), p = v * a.I(v); k ? ctx.lineTo(X(v), Y(p / 2)) : ctx.moveTo(X(v), Y(p / 2)); } ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#e0a02a"; ctx.beginPath(); ctx.arc(X(a.vm), Y(a.pm / 2), 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.fillStyle = a.ok ? C.forest : C.warn; ctx.beginPath(); ctx.arc(X(5), Y(0.5), 5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.fillText("충전 동작점 (5 V, 0.5 A)", X(5) + 8, Y(0.5) - 6);
    ctx.fillStyle = "#3f6fa3"; ctx.fillText("전류–전압 (A)", gx + 6, gy + 12); ctx.fillStyle = "#e0a02a"; ctx.fillText("출력 (W, 눈금 ×2)", gx + 84, gy + 12);
    $(".n-v").textContent = `${a.voc.toFixed(2)} V`; $(".n-i").textContent = `${a.isc.toFixed(2)} A`; $(".n-p").textContent = `${a.pm.toFixed(2)} W`;
    $(".n-c").textContent = a.ok ? "가능" : "불가"; $(".n-c").className = "n-c " + (a.ok ? "good" : "bad");
  }
  root.querySelectorAll("input").forEach((el) => el.addEventListener("input", () => { $(".g-out").textContent = $(".g").value; $(".a-out").textContent = $(".a").value; draw(); }));
  $(".cfg").addEventListener("click", (e) => { const b = e.target.closest("[data-s]"); if (!b) return; ns = +b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); });
  draw();
})();
