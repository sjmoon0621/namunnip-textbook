/* 카드: 제산제 한 알은 위산을 얼마나 중화할까? — 성분별 몰 질량·받는 H⁺ 수, pH 곡선, CO₂ 발생 */
(() => {
  const root = document.getElementById("card-chem-antacid");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  // [이름, 몰 질량, 받는 H⁺ 수, CO₂ 생기는지, 넘친 뒤 pH, 색]
  const ING = { mg: ["수산화 마그네슘", 58.32, 2, 0, 10.0, "#3f6fa3"], ca: ["탄산 칼슘", 100.09, 2, 1, 7.5, "#2f8f6a"], na: ["탄산수소 나트륨", 84.01, 1, 1, 8.3, "#e0a02a"], al: ["수산화 알루미늄", 78.0, 3, 0, 7.0, "#8a5fd0"] };
  const NH = 0.010, V = 0.1;
  let cur = "mg";
  $(".ing").innerHTML += Object.entries(ING).map(([k, s]) => `<button class="chip" data-i="${k}" aria-pressed="${k === cur}">${s[0]}</button>`).join("");
  function ph(k, g) { const s = ING[k], base = g / s[1] * s[2], left = NH - base; if (left > 1e-6) return -Math.log10(left / V); const ex = -left; return Math.min(s[4], 7 + Math.log10(1 + ex * 4000)); }
  const tbl = L.table($(".tbl-host"), [{ key: "n", label: "성분" }, { key: "g", label: "양 (g)", res: 0.01 }, { key: "p", label: "pH", res: 0.01 }], () => draw());
  const { ctx, size } = fit($("canvas"), () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = L.plot(ctx, { x0: 40, y0: 18, w: w - 54, h: h - 50 }, { pts: [], xr: [0, 2], yr: [0, 11], xlabel: "넣은 양 (g)", ylabel: "pH" });
    Object.entries(ING).forEach(([k, s]) => {
      ctx.strokeStyle = s[5]; ctx.globalAlpha = k === cur ? 1 : 0.25; ctx.lineWidth = k === cur ? 2 : 1.2; ctx.beginPath();
      for (let i = 0; i <= 200; i++) { const g = 2 * i / 200, p = ph(k, g); i ? ctx.lineTo(r.X(g), r.Y(p)) : ctx.moveTo(r.X(g), r.Y(p)); } ctx.stroke(); ctx.globalAlpha = 1;
      const idx = Object.keys(ING).indexOf(k); ctx.fillStyle = s[5]; ctx.font = `${k === cur ? 600 : 400} 10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`— ${s[0]} (중화점 ${(NH / s[2] * s[1]).toFixed(2)} g)`, r.X(1.05), r.Y(4.4 - idx * 0.9));
      tbl.rows.filter((q) => q.k === k).forEach((q) => { ctx.beginPath(); ctx.arc(r.X(q.g), r.Y(q.p), 3.5, 0, Math.PI * 2); ctx.fill(); });
    });
    const g = +$(".g").value; ctx.strokeStyle = C.ink; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(r.X(g), 18); ctx.lineTo(r.X(g), h - 32); ctx.stroke(); ctx.setLineDash([]);
    const s = ING[cur];
    $(".n-c").textContent = `${(1 / s[1] * s[2] * 1000).toFixed(1)} mmol`;
    $(".n-gas").textContent = s[3] ? `CO₂ ${(1 / s[1] * 22.4 * 1000 * (cur === "na" ? 1 : 1)).toFixed(0)} mL` : "없음";
    $(".n-p").textContent = ph(cur, g).toFixed(2);
  }
  $(".ing").addEventListener("click", (e) => { const b = e.target.closest("[data-i]"); if (!b) return; cur = b.dataset.i; root.querySelectorAll("[data-i]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); });
  $(".g").addEventListener("input", () => { $(".g-out").textContent = (+$(".g").value).toFixed(2); draw(); });
  $(".rec").addEventListener("click", () => { const g = +$(".g").value; tbl.add({ k: cur, n: ING[cur][0], g, p: L.measure(ph(cur, g), { sd: 0.03, res: 0.01 }) }); });
  $(".clear").addEventListener("click", () => tbl.clear());
  draw();
})();
