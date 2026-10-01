/* 카드: 센서가 보낸 숫자를 어떻게 온도로 바꿀까? — 서미스터 ADC 보정 (2점 / 최소제곱), 범위 밖 외삽 */
(() => {
  const root = document.getElementById("card-sie2-calib");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sT = $(".t");
  let meth = "ls", jitter = 0;
  const adcOf = (tc) => { const R = 10000 * Math.exp(3950 * (1 / (tc + 273.15) - 1 / 298.15)); return 1023 * 10000 / (R + 10000); };
  const tbl = L.table($(".tbl-host"), [{ key: "ref", label: "기준 온도계 (°C)", res: 0.1 }, { key: "adc", label: "ADC 값", res: 1 }], () => { drawPlot(); nums(); });
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function calib() {
    const r = tbl.rows; if (r.length < 2) return null;
    if (meth === "two") {
      const lo = r.reduce((a, b) => (b.ref < a.ref ? b : a)), hi = r.reduce((a, b) => (b.ref > a.ref ? b : a));
      if (hi.adc === lo.adc) return null;
      const a = (hi.ref - lo.ref) / (hi.adc - lo.adc); return { a, b: lo.ref - a * lo.adc };
    }
    return L.linfit(r.map((x) => x.adc), r.map((x) => x.ref));
  }
  function nums() {
    const f = calib(), adc = Math.round(adcOf(+sT.value) + jitter);
    $(".n-f").textContent = f ? `T = ${f.a.toFixed(4)}·ADC ${f.b < 0 ? "−" : "+"} ${Math.abs(f.b).toFixed(1)}` : "기록 2개 이상";
    if (f) {
      const s = f.a * adc + f.b, err = s - +sT.value;
      $(".n-s").textContent = `${s.toFixed(1)} °C (${err >= 0 ? "+" : ""}${err.toFixed(1)})`;
      $(".n-s").className = "n-s " + (Math.abs(err) > 1 ? "bad" : "good");
      const me = Math.max(...tbl.rows.map((r) => Math.abs(f.a * r.adc + f.b - r.ref)));
      $(".n-e").textContent = `${me.toFixed(2)} °C`;
    } else { $(".n-s").textContent = "—"; $(".n-e").textContent = "—"; }
  }
  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const tc = +sT.value, adc = Math.round(adcOf(tc) + jitter);
    // 물통
    const bx = 20, by = h * 0.35, bw = w * 0.36, bh = h * 0.58;
    const u = tc / 80;
    ctx.fillStyle = `rgba(${Math.round(110 + 120 * u)},${Math.round(164 - 60 * u)},${Math.round(230 - 150 * u)},.35)`; ctx.fillRect(bx, by + 12, bw, bh - 12);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
    // 기준 온도계
    const tx = bx + bw * 0.3;
    ctx.fillStyle = C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.fillRect(tx - 4, 14, 8, by + bh - 30); ctx.strokeRect(tx - 4, 14, 8, by + bh - 30);
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(tx, by + bh - 14, 7, 0, Math.PI * 2); ctx.fill();
    const top = by + bh - 20 - (by + bh - 40) * (tc + 5) / 95; ctx.fillRect(tx - 2, top, 4, by + bh - 20 - top);
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("기준 온도계", tx, 10);
    // 센서와 선
    const sx = bx + bw * 0.7;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(sx, by + bh - 20); ctx.lineTo(sx, by - 30); ctx.quadraticCurveTo(sx, 20, w * 0.52, 30); ctx.stroke();
    ctx.fillStyle = "#3b3b40"; ctx.fillRect(sx - 4, by + bh - 26, 8, 12);
    ctx.fillStyle = C.ink2; ctx.fillText("서미스터", sx + 18, by + bh - 30);
    // 마이크로컨트롤러
    const mx = w * 0.52, my = 14, mw = w * 0.44, mh = h * 0.5;
    ctx.fillStyle = "#1f6f8b"; ctx.fillRect(mx, my, mw, mh);
    ctx.fillStyle = "#e9f2f5"; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("MCU · A0 (10-bit)", mx + 8, my + 16);
    ctx.fillStyle = "#0e1a1f"; ctx.fillRect(mx + 8, my + 24, mw - 16, mh - 34);
    ctx.fillStyle = "#8fd16f"; ctx.font = `600 ${Math.min(26, mh * 0.3)}px ${F.mono}`; ctx.fillText(String(adc), mx + 16, my + 24 + (mh - 34) * 0.62);
    const f = calib();
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = "#cfe8d8";
    ctx.fillText(f ? `→ ${(f.a * adc + f.b).toFixed(1)} °C` : "→ ? °C (보정 전)", mx + 16, my + mh - 16);
    ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`기준: ${tc.toFixed(1)} °C`, w - 10, h - 10);
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const f = calib();
    const r = L.plot(ctx, { x0: 44, y0: 18, w: w - 58, h: h - 52 }, { pts: tbl.rows.map((x) => ({ x: x.adc, y: x.ref })), fit: f, model: null, xr: [150, 950], yr: [-10, 90], xlabel: "ADC 값", ylabel: "온도 (°C)" });
    // 실제 S자 관계 (점선)
    ctx.save(); ctx.beginPath(); ctx.rect(44, 18, w - 58, h - 52); ctx.clip();
    ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath();
    for (let t = -10; t <= 90; t += 2) { const x = r.X(adcOf(t)), y = r.Y(t); t === -10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("점선: 실제 관계 (기록이 쌓이면 이 곡선을 따라 점이 놓임)", 50, 30);
    if (meth === "two" && f) { ctx.fillStyle = C.warn; ctx.fillText("2점 보정: 가장 낮은·높은 기록만 씀", 50, 44); }
    // 지금 물 온도 표시
    const adc = adcOf(+sT.value); ctx.strokeStyle = C.forest; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(r.X(adc), 18); ctx.lineTo(r.X(adc), h - 34); ctx.stroke();
  }
  function record() {
    const tc = +sT.value;
    tbl.add({ ref: L.measure(tc, { sd: 0.2, res: 0.1 }), adc: Math.round(L.measure(adcOf(tc), { sd: 1.5 })) });
  }
  loop($(".cv-wide"), () => { jitter = Math.round(L.gauss() * 1.2); drawApp(); return; });
  const upd = () => { $(".t-out").textContent = sT.value; drawApp(); drawPlot(); nums(); };
  sT.addEventListener("input", upd);
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".meth").addEventListener("click", (e) => { const b = e.target.closest("[data-m]"); if (!b) return; meth = b.dataset.m; root.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); upd(); });
  upd();
  if (L.demo) { [20, 22, 25, 27, 30].forEach((t) => { sT.value = t; record(); }); sT.value = 70; upd(); }
})();
