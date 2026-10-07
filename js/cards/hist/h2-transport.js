/* 카드: 교통수단별 승객 1명·1 km당 에너지와 CO₂ (모식: 일정 속력, F = ½ρCdA v² + Crr m g) */
(() => {
  const root = document.getElementById("card-hist-transport-energy");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const RHO = 1.2, G = 9.8;
  /* 대표 대략값: 질량 kg, CdA m², Crr, 바퀴까지 효율, 좌석, 연료 1 kWh당 CO₂ kg(null이면 전기), 최고·대표 속력 */
  const V = [
    { name: "휘발유 승용차", m: 1500, cda: 0.66, crr: 0.010, eff: 0.25, seats: 5, co2: 0.24, vmax: 160, vt: 100, col: C.warn },
    { name: "전기 승용차", m: 1900, cda: 0.60, crr: 0.009, eff: 0.85, seats: 5, co2: null, vmax: 160, vt: 100, col: C.amber },
    { name: "고속버스", m: 15000, cda: 5.0, crr: 0.007, eff: 0.35, seats: 45, co2: 0.27, vmax: 110, vt: 100, col: "#6b8fb8" },
    { name: "고속 열차", m: 700000, cda: 12, crr: 0.0012, eff: 0.85, seats: 935, co2: null, vmax: 320, vt: 300, col: C.forest },
  ];
  const PLANE = { name: "비행기 (참고)", e100: 0.21, co2: 0.265, vt: 800, col: C.ink3 };
  const sV = $(".v"), sO = $(".o"), sG = $(".g");
  let sel = 0;

  /* 승객 1명·1 km당 에너지 (kWh), 공기 저항 몫 */
  function per(k, vkmh, load) {
    const q = V[k], v = vkmh / 3.6;
    const fa = 0.5 * RHO * q.cda * v * v, fr = q.crr * q.m * G;
    const kwh = (fa + fr) * 1000 / q.eff / 3.6e6;
    const pax = Math.max(1, Math.round(q.seats * load));
    return { e: kwh / pax, air: fa / (fa + fr), pax };
  }
  const co2 = (k, e) => e * (V[k].co2 === null ? +sG.value : V[k].co2);

  const cv = fit($(".cv-wide"), () => drawCurves());
  const bar = fit($(".cv-bar"), () => drawBars());

  function drawCurves() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const load = +sO.value / 100;
    const box = { x0: 52, y0: 22, w: w - 66, h: h - 56 };
    const ymax = 0.6;
    const X = (v) => box.x0 + v / 320 * box.w, Y = (e) => box.y0 + box.h - Math.min(e, ymax * 1.05) / ymax * box.h;
    axes(ctx, { ...box, X, Y, xt: [0, 50, 100, 150, 200, 250, 300].map((v) => [v, String(v)]), yt: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6].map((e) => [e, e.toFixed(1)]), xlabel: "속력 (km/h)", ylabel: "kWh / 명·km" });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    V.forEach((q, k) => {
      ctx.strokeStyle = q.col; ctx.lineWidth = k === sel ? 2.6 : 1.3; ctx.globalAlpha = k === sel ? 1 : 0.55;
      ctx.beginPath();
      for (let v = 10; v <= q.vmax; v += 2) { const y = Y(per(k, v, load).e); v === 10 ? ctx.moveTo(X(v), y) : ctx.lineTo(X(v), y); }
      ctx.stroke();
    });
    ctx.restore(); ctx.globalAlpha = 1;
    ctx.font = `11.5px ${F.sans}`; ctx.textAlign = "left";
    V.forEach((q, k) => {
      const v = q.vmax, e = per(k, v, load).e;
      let ly = Y(e) - 6; if (e > ymax) ly = box.y0 + 10 + k * 14;
      ctx.fillStyle = q.col; ctx.globalAlpha = k === sel ? 1 : 0.7;
      const lx = Math.min(X(v) - 4, box.x0 + box.w - ctx.measureText(q.name).width - 2);
      ctx.fillText(q.name, e > ymax ? X(v * 0.7) : lx, ly);
    });
    ctx.globalAlpha = 1;
    const v = +sV.value, p = per(sel, v, load);
    ctx.fillStyle = V[sel].col; ctx.beginPath(); ctx.arc(X(v), Y(p.e), 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillText(`좌석 채움 ${sO.value}% · ${V[sel].name} ${p.pax}명 탑승`, box.x0 + box.w, box.y0 - 8);
  }

  function drawBars() {
    const { ctx } = bar, { w, h } = bar.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const load = +sO.value / 100;
    const rows = V.map((q, k) => { const e = per(k, q.vt, load).e; return { name: `${q.name} ${q.vt}`, c: co2(k, e), col: q.col, k }; });
    rows.push({ name: `${PLANE.name} ${PLANE.vt}`, c: PLANE.e100 / Math.max(0.05, load) * PLANE.co2, col: PLANE.col, k: -1 });
    const lw = Math.min(170, w * 0.36), x0 = lw + 8, bw = w - x0 - 60, rh = (h - 26) / rows.length;
    const top = Math.max(0.05, ...rows.map((r) => r.c));
    ctx.font = `11.5px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("대표 속력(km/h)에서 승객 1명·1 km당 CO₂", 4, 12);
    rows.forEach((r, i) => {
      const y = 22 + i * rh, bh = Math.min(16, rh * 0.6);
      ctx.fillStyle = r.k === sel ? C.ink : C.ink2; ctx.textAlign = "right"; ctx.font = `${r.k === sel ? 600 : 400} 11.5px ${F.sans}`;
      ctx.fillText(r.name, lw, y + rh / 2 + 4);
      ctx.fillStyle = r.col; ctx.globalAlpha = r.k === -1 ? 0.6 : 1;
      ctx.fillRect(x0, y + (rh - bh) / 2, Math.max(1, r.c / top * bw), bh); ctx.globalAlpha = 1;
      ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.font = `11px ${F.mono}`;
      ctx.fillText(`${(r.c * 1000).toFixed(0)} g`, x0 + r.c / top * bw + 5, y + rh / 2 + 4);
    });
  }

  function upd() {
    const q = V[sel];
    if (+sV.value > q.vmax) sV.value = q.vmax;
    $(".v-out").textContent = sV.value; $(".o-out").textContent = sO.value; $(".g-out").textContent = (+sG.value).toFixed(2);
    const p = per(sel, +sV.value, +sO.value / 100);
    $(".n-a").textContent = Math.round(p.air * 100) + "%";
    $(".n-e").textContent = p.e.toFixed(3) + " kWh";
    $(".n-c").textContent = Math.round(co2(sel, p.e) * 1000) + " g";
    drawCurves(); drawBars();
  }
  $(".veh").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    sel = +b.dataset.v; root.querySelectorAll(".veh .chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    sV.value = V[sel].vt; upd();
  });
  [sV, sO, sG].forEach((el) => el.addEventListener("input", upd));
  upd();
})();
