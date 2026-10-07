/* 카드: 촉매와 활성화 에너지 — 촉매 없는 경로와 두 단계 촉매 경로, 중간체 에너지에 따른 화산 곡선 (모식) */
(() => {
  const root = document.getElementById("card-adchem-catalyst");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sE = $(".ei"), sT = $(".t");
  const DH = -98, EU = 75, E0 = 70, AL = 0.5, R = 8.314e-3;
  const CAT = {
    homo: { ei: -28, i: "IO⁻ + H₂O", r: "H₂O₂ + I⁻", p: "H₂O + ½O₂ + I⁻" },
    hetero: { ei: -55, i: "흡착된 O*·H₂O", r: "H₂O₂ + 표면", p: "H₂O + ½O₂ + 표면" },
    enz: { ei: -45, i: "효소 중간체", r: "H₂O₂ + 효소", p: "H₂O + ½O₂ + 효소" },
  };
  let cat = "homo";
  function path(ei) {
    const ea1 = Math.max(E0 + AL * ei, Math.max(ei, 0) + 2);
    const ea2 = Math.max(E0 + AL * (DH - ei), Math.max(DH - ei, 0) + 2);
    return { ea1, ea2, eff: Math.max(ea1, ea2 + Math.max(0, ei)) };
  }
  const big = (x) => (x >= 1e4 ? `${(x / 10 ** Math.floor(Math.log10(x))).toFixed(1)}×10${String(Math.floor(Math.log10(x))).replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d])}` : x >= 10 ? x.toFixed(0) : x.toFixed(2));
  const { ctx, size } = fit($("canvas"), () => draw());
  function curve(pts, X, Y) {
    ctx.beginPath(); ctx.moveTo(X(0), Y(pts[0]));
    for (let s = 0; s < pts.length - 1; s++) {
      const xa = X(s / (pts.length - 1)), xb = X((s + 1) / (pts.length - 1)), ya = Y(pts[s]), yb = Y(pts[s + 1]), well = s % 2 === 0;
      if (well) ctx.bezierCurveTo(xa + (xb - xa) * 0.55, ya, xb - (xb - xa) * 0.35, yb, xb, yb);
      else ctx.bezierCurveTo(xa + (xb - xa) * 0.35, ya, xb - (xb - xa) * 0.55, yb, xb, yb);
    }
    ctx.stroke();
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const ei = +sE.value, T = +sT.value, P = path(ei), c = CAT[cat];
    /* 왼쪽: 에너지 도표 */
    const x0 = 16, x1 = w * 0.54, y0 = 24, y1 = h - 34, emax = 95, emin = -120;
    const Y = (e) => y0 + (emax - e) / (emax - emin) * (y1 - y0), X = (f) => x0 + 14 + f * (x1 - x0 - 28);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("에너지 (kJ/mol)", x0 + 4, y0 - 10);
    ctx.strokeStyle = C.rule; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x1, Y(0)); ctx.moveTo(x0, Y(DH)); ctx.lineTo(x1, Y(DH)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = "#9a9aa0"; ctx.lineWidth = 2; curve([0, EU, DH], X, Y);
    ctx.strokeStyle = "#3b7c2a"; ctx.lineWidth = 2.4; curve([0, P.ea1, ei, ei + P.ea2, DH], X, Y);
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillStyle = "#77777d"; ctx.fillText(`촉매 없음 ${EU}`, X(0.5), Y(EU) - 6);
    /* 유효 문턱 화살표 */
    const lowE = Math.min(0, ei), topE = lowE + P.eff, ax = X(ei < 0 ? 0.62 : 0.14);
    ctx.strokeStyle = C.warn; ctx.fillStyle = C.warn; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(ax, Y(lowE)); ctx.lineTo(ax, Y(topE) + 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax - 3.5, Y(topE) + 9); ctx.lineTo(ax, Y(topE) + 2); ctx.lineTo(ax + 3.5, Y(topE) + 9); ctx.fill();
    ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(ax - 14, Y(topE)); ctx.lineTo(ax + 14, Y(topE)); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign = "left"; ctx.fillText(`유효 Eₐ ${P.eff.toFixed(0)}`, ax + 16, Y(topE) - 4);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText(c.r, x0 + 4, Y(0) + 14);
    ctx.textAlign = "center"; ctx.fillStyle = "#3b7c2a"; ctx.fillText(c.i, X(0.5), Math.min(Y(ei) + 15, y1 + 12));
    ctx.textAlign = "right"; ctx.fillStyle = C.ink; ctx.fillText(c.p, x1, Y(DH) + 14);
    /* 오른쪽: 화산 곡선 log10(k_cat/k_uncat) */
    const vx0 = w * 0.62, vx1 = w - 10, vy0 = 24, vy1 = h - 34, eA = -110, eB = 20;
    const lg = (e) => (EU - path(e).eff) / (R * T * Math.LN10);
    let lmax = 0; for (let e = eA; e <= eB; e += 1) lmax = Math.max(lmax, lg(e));
    const ytop = Math.ceil(lmax + 0.5), ybot = -1;
    const VX = (e) => vx0 + (e - eA) / (eB - eA) * (vx1 - vx0), VY = (l) => vy0 + (ytop - l) / (ytop - ybot) * (vy1 - vy0);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (let l = ybot; l <= ytop; l += ytop > 8 ? 2 : 1) { ctx.strokeStyle = l === 0 ? C.ink : C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(vx0, VY(l)); ctx.lineTo(vx1, VY(l)); ctx.stroke(); ctx.fillText(l === 0 ? "1" : `10${l < 0 ? "⁻" : ""}${"⁰¹²³⁴⁵⁶⁷⁸⁹"[Math.abs(l)]}`, vx0 - 4, VY(l) + 3); }
    ctx.textAlign = "center"; [-100, -50, 0].forEach((e) => ctx.fillText(String(e), VX(e), vy1 + 13));
    ctx.strokeStyle = "#3b7c2a"; ctx.lineWidth = 2; ctx.beginPath();
    for (let e = eA; e <= eB; e += 1) { const yy = VY(lg(e)); e === eA ? ctx.moveTo(VX(e), yy) : ctx.lineTo(VX(e), yy); }
    ctx.stroke();
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(VX(ei), VY(lg(ei)), 4, 0, 7); ctx.fill();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("k(촉매) / k(촉매 없음)", vx0 - 26, vy0 - 10);
    ctx.textAlign = "right"; ctx.fillText("중간체 에너지 (kJ/mol)", vx1, vy1 + 27);
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText("← 세게 붙음", vx0 + 2, VY(ybot) - 5);
    ctx.textAlign = "right"; ctx.fillText("약하게 붙음 →", vx1 - 2, VY(ybot) - 5);
  }
  function update() {
    root.querySelectorAll("[data-c]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.c === cat)));
    const ei = +sE.value, T = +sT.value, P = path(ei);
    $(".ei-out").textContent = String(ei).replace("-", "−"); $(".t-out").textContent = `${T} (${T - 273} °C)`;
    const f = Math.exp((EU - P.eff) / (R * T));
    $(".n-e").textContent = `${P.eff.toFixed(0)} kJ/mol`;
    $(".n-f").textContent = `×${big(f)}`;
    $(".n-r").textContent = `×${big(f)}`;
    $(".n-k").textContent = "×1 (변화 없음)";
    draw();
  }
  root.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => { cat = b.dataset.c; sE.value = CAT[cat].ei; update(); }));
  [sE, sT].forEach((s) => s.addEventListener("input", update));
  update();
})();
