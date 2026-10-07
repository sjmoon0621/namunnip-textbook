/* 카드: 값싼 미세먼지 센서가 보낸 숫자를 믿어도 될까? — 반복성(신뢰성)과 기준 비교(타당성), 습도 보정 (모식) */
(() => {
  const root = document.getElementById("card-fusi-pmsensor");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sC = $(".c"), sH = $(".h"), cb = $(".corr");
  // 센서별 특성: 감도 k, 영점 off, 우연 오차 sd + rel·값  (모식)
  const SENS = [{ name: "센서 1", k: 1.0, off: 1, sd: 1.2, rel: 0.03 }, { name: "센서 2", k: 1.12, off: -2, sd: 3.5, rel: 0.09 }];
  const KAPPA = 0.08;
  const grow = (rh) => 1 + KAPPA * rh / (100 - rh);   // 흡습 성장에 따른 과대 측정 배율 (모식)
  let si = 0, lastBatch = [], shown = null, t = 0;
  const PX = Array.from({ length: 40 }, () => Math.random()), PY = Array.from({ length: 40 }, () => Math.random()), PV = Array.from({ length: 40 }, () => 0.05 + 0.05 * Math.random());

  const tbl = L.table($(".tbl-host"), [
    { key: "sn", label: "센서" }, { key: "rh", label: "습도 (%)", res: 1 },
    { key: "ref", label: "기준 (μg/m³)", res: 1 }, { key: "raw", label: "센서 값", res: 1 }, { key: "cor", label: "보정값", res: 1 },
  ], () => { drawPlot(); nums(); });

  function measureOnce() {
    const c = +sC.value, rh = +sH.value, s = SENS[si];
    const ref = L.measure(c, { sd: 1, res: 1 });
    const raw = Math.max(0, L.measure(s.k * grow(rh) * c + s.off, { sd: s.sd, rel: s.rel, res: 1 }));
    const rhIn = Math.min(97, rh + 1.5 * L.gauss());   // 센서 속 습도계 (±1.5 %)
    const cor = L.snap(raw / grow(rhIn), 1);
    return { sn: si + 1, rh, ref, raw, cor };
  }
  function batch() {
    lastBatch = [];
    for (let k = 0; k < 5; k++) { const r = measureOnce(); lastBatch.push(r); tbl.add(r); }
    shown = lastBatch[4];
  }

  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const rhCol = (rh) => {
    const u = Math.min(1, Math.max(0, (rh - 30) / 65));
    const a = u < 0.5 ? [[111, 159, 208], [224, 160, 42], u * 2] : [[224, 160, 42], [181, 83, 47], (u - 0.5) * 2];
    return `rgb(${a[0].map((v, k) => Math.round(v + (a[1][k] - v) * a[2])).join(",")})`;
  };

  function box(ctx, x, y, w, h, title) {
    ctx.fillStyle = C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
    ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = C.ink2; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(title, x + w / 2, y - 7);
  }
  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = +sC.value, rh = +sH.value, g = grow(rh);
    // 기준 측정소
    const bw = w * 0.3, by = 34, bh = h - 70;
    box(ctx, w * 0.05, by, bw, bh, "기준 측정소 (베타선 흡수법)");
    ctx.fillStyle = C.night; ctx.fillRect(w * 0.05 + 12, by + 14, bw - 24, 38);
    ctx.fillStyle = "#9fd88f"; ctx.font = `600 18px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(shown ? String(shown.ref) : "--", w * 0.05 + bw / 2, by + 40);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.fillText("μg/m³", w * 0.05 + bw / 2, by + 68);
    ctx.font = `11px ${F.sans}`; ctx.fillText("수 시간 평균, 비쌈", w * 0.05 + bw / 2, by + bh - 12);
    // 광산란 센서 내부
    const sx = w * 0.42, sw = w * 0.53;
    box(ctx, sx, by, sw, bh, `${SENS[si].name} 내부 (광산란)`);
    const ly = by + bh * 0.42;
    ctx.strokeStyle = C.apple; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx + 10, ly); ctx.lineTo(sx + sw * 0.62, ly); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.fillRect(sx + 4, ly - 6, 10, 12);
    // 광검출기
    ctx.fillStyle = C.ink; ctx.fillRect(sx + sw * 0.36, ly - bh * 0.32, 16, 8);
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink3;
    ctx.fillText("검출기", sx + sw * 0.36 + 20, ly - bh * 0.32 + 8);
    ctx.fillText("레이저", sx + 16, ly + 18);
    // 입자: 개수는 농도, 크기는 습도
    const n = Math.min(40, Math.round(4 + c / 5)), r0 = 2.4, r = r0 * (1 + 1.6 * (g - 1));
    for (let i = 0; i < n; i++) {
      const ph = (PX[i] + t * PV[i]) % 1, yy = by + 12 + PY[i] * (bh - 24);
      const xx = sx + 10 + ph * (sw * 0.6 - 10);
      ctx.fillStyle = "rgba(111,159,208,.35)"; ctx.beginPath(); ctx.arc(xx, yy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ink2; ctx.beginPath(); ctx.arc(xx, yy, r0 * 0.7, 0, Math.PI * 2); ctx.fill();
      if (Math.abs(yy - ly) < r + 1) { ctx.strokeStyle = "rgba(212,73,58,.45)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(sx + sw * 0.36 + 8, ly - bh * 0.32 + 8); ctx.stroke(); }
    }
    // 화면
    const dx = sx + sw * 0.66, dw = sw * 0.3;
    ctx.fillStyle = C.night; ctx.fillRect(dx, by + 14, dw, 38);
    ctx.fillStyle = "#9fd88f"; ctx.font = `600 18px ${F.mono}`; ctx.textAlign = "center";
    const val = shown ? (cb.checked ? shown.cor : shown.raw) : null;
    ctx.fillText(val === null ? "--" : String(val), dx + dw / 2, by + 40);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`;
    ctx.fillText(cb.checked ? "보정값" : "원시값", dx + dw / 2, by + 68);
    ctx.fillText(`RH ${rh}%`, dx + dw / 2, by + 86);
    ctx.font = `11px ${F.sans}`; ctx.fillText("1분마다, 저렴함", dx + dw / 2, by + bh - 12);
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.font = `10.5px ${F.sans}`;
    ctx.fillText("● 마른 입자   ○ 물을 머금은 크기", sx + 10, by + bh + 18);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const key = cb.checked ? "cor" : "raw";
    const rows = tbl.rows, ys = rows.map((r) => r[key]);
    const ymax = Math.max(160, ...ys.map((y) => y * 1.05));
    const f = rows.length > 2 ? L.linfit(rows.map((r) => r.ref), ys) : null;
    const P = L.plot(ctx, { x0: 44, y0: 20, w: w - 58, h: h - 54 }, { pts: [], fit: f, model: (x) => x, xr: [0, 160], yr: [0, ymax], xlabel: "기준 측정소 (μg/m³)", ylabel: cb.checked ? "센서 보정값 (μg/m³)" : "센서 원시값 (μg/m³)" });
    rows.forEach((r) => {
      ctx.fillStyle = rhCol(r.rh); ctx.strokeStyle = r.sn === 2 ? C.ink : "transparent"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(P.X(r.ref), P.Y(r[key]), 3.4, 0, Math.PI * 2); ctx.fill(); if (r.sn === 2) ctx.stroke();
    });
    if (f) {
      ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
      ctx.fillText(`맞춤선: 센서 = ${f.a.toFixed(2)} × 기준 ${f.b >= 0 ? "+" : "−"} ${Math.abs(f.b).toFixed(1)}`, 52, 34);
    }
    if (rows.some((r) => r.sn === 2)) { ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("검은 테두리: 센서 2", 52, 50); }
  }

  function nums() {
    const key = cb.checked ? "cor" : "raw", rows = tbl.rows;
    const rep = L.stats(lastBatch.map((r) => r[key]));
    $(".v-rep").textContent = rep.n > 1 ? rep.sd.toFixed(1) + " μg/m³" : "—";
    const b = L.stats(rows.map((r) => r[key] - r.ref));
    const vb = $(".v-bias");
    vb.textContent = b.n ? (b.mean >= 0 ? "+" : "") + b.mean.toFixed(1) + " μg/m³" : "—";
    vb.classList.toggle("bad", b.n > 0 && Math.abs(b.mean) > 5);
    const f = rows.length > 2 ? L.linfit(rows.map((r) => r.ref), rows.map((r) => r[key])) : null;
    $(".v-r2").textContent = f ? f.r2.toFixed(3) : "—";
  }

  const upd = () => { $(".c-out").textContent = sC.value; $(".h-out").textContent = sH.value; drawApp(); };
  [sC, sH].forEach((el) => el.addEventListener("input", upd));
  cb.addEventListener("change", () => { drawApp(); drawPlot(); nums(); });
  $(".sens").addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]"); if (!b) return;
    si = +b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); lastBatch = []; shown = null; nums(); drawApp();
  });
  $(".meas").addEventListener("click", () => { batch(); drawApp(); });
  $(".clear").addEventListener("click", () => { lastBatch = []; shown = null; tbl.clear(); drawApp(); });
  loop($(".cv-wide"), (dt) => { t += dt; drawApp(); });
  upd();
  if (L.demo) {
    [[20, 50], [60, 50], [110, 50], [40, 90], [90, 85]].forEach(([c, rh]) => { sC.value = c; sH.value = rh; batch(); });
    sC.value = 90; sH.value = 85; upd();
  }
})();
