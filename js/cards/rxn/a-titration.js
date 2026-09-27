/* 카드: 적정 곡선의 모양에서 산의 세기를 읽을 수 있을까? — 강산·약산을 NaOH로 적정 */
(() => {
  const root = document.getElementById("card-rxn-titration");
  if (!root || !window.NMAcid) return;
  const { C, F, fit } = NM, A = NMAcid;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sV = $(".v"), oV = $(".v-out"), nPh = $(".n-ph"), nEq = $(".n-eq"), nIn = $(".n-in");
  const ACIDS = { HCl: [null, C.warn, "염산"], AcOH: [1.8e-5, "#3f6fa3", "아세트산"], HCN: [6.2e-10, "#8a4fb5", "HCN"] };
  const on = { HCl: true, AcOH: true, HCN: false };
  const IND = [["메틸 오렌지", 3.1, 4.4, "rgba(212,73,58,.16)"], ["BTB", 6.0, 7.6, "rgba(59,124,42,.14)"], ["페놀프탈레인", 8.2, 10.0, "rgba(200,60,160,.14)"]];
  const pHat = (key, v) => { const Ka = ACIDS[key][0], Vt = 25 + v, cA = 0.1 * 25 / Vt, cNa = 0.1 * v / Vt; return Ka === null ? A.pH({ strongA: cA, strongB: cNa }) : A.pH({ Ca: cA, Ka, strongB: cNa }); };
  const shown = () => Object.keys(on).filter((k) => on[k]);
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 36, x1 = w - 90, y0 = h - 24, y1 = 12, X = (v) => x0 + v / 50 * (x1 - x0), Y = (p) => y0 - p / 14 * (y0 - y1);
    IND.forEach(([n, a, b, col]) => { ctx.fillStyle = col; ctx.fillRect(x0, Y(b), x1 - x0, Y(a) - Y(b)); ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(n, x1 + 4, (Y(a) + Y(b)) / 2 + 3); });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; [0, 7, 14].forEach((p) => ctx.fillText(p, x0 - 4, Y(p) + 3)); ctx.textAlign = "center"; [0, 12.5, 25, 37.5, 50].forEach((v) => ctx.fillText(v, X(v), y0 + 13));
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink3; [12.5, 25].forEach((v) => { ctx.beginPath(); ctx.moveTo(X(v), y1); ctx.lineTo(X(v), y0); ctx.stroke(); }); ctx.setLineDash([]);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.fillText("반중화점", X(12.5), y1 + 10); ctx.fillText("중화점", X(25), y1 + 10);
    shown().forEach((k) => { const col = ACIDS[k][1]; ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); for (let v = 0; v <= 50; v += 0.1) { const y = Y(pHat(k, v)); v ? ctx.lineTo(X(v), y) : ctx.moveTo(X(v), y); } ctx.stroke(); const v = +sV.value; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(v), Y(pHat(k, v)), 4.5, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = C.ink2; ctx.textAlign = "right"; ctx.fillText("NaOH (mL)", x1, y0 - 4);
  }
  function update() {
    root.querySelectorAll("[data-a]").forEach((b) => b.setAttribute("aria-pressed", String(on[b.dataset.a])));
    const v = +sV.value; oV.textContent = v.toFixed(1); const ks = shown();
    nPh.textContent = ks.map((k) => `${ACIDS[k][2]} ${pHat(k, v).toFixed(2)}`).join(" · ") || "—";
    nEq.textContent = ks.map((k) => `${ACIDS[k][2]} ${pHat(k, 25).toFixed(2)}`).join(" · ") || "—";
    nIn.textContent = ks.map((k) => { const p = pHat(k, 25), jump = pHat(k, 25.1) - pHat(k, 24.9); const lo = pHat(k, 24.9), hi = pHat(k, 25.1), good = IND.filter(([, a, b]) => (p > a && p < b) || (a >= lo && b <= hi)).map(([n]) => n); return `${ACIDS[k][2]}: ${jump < 1 ? "급변 구간이 짧아 지시약으로 찾기 어려움" : good.join(", ") || "—"}`; }).join(" · ") || "—";
    draw();
  }
  root.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => { on[b.dataset.a] = !on[b.dataset.a]; update(); }));
  sV.addEventListener("input", update); update();
})();
