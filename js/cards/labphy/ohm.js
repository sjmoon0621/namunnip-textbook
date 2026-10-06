/* 카드: 저항과 꼬마전구의 V–I 관계 — 전원 전압을 바꿔 전압·전류 측정, 기울기 = 저항, 필라멘트 온도로 휘는 곡선 */
(() => {
  const root = document.getElementById("card-labphy-ohm");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sV = $(".vs");
  const RA = 0.5, RS = 0.1, RRES = 99.2;

  /* 꼬마전구 모형 (텅스텐): R = R0 (T/300)^1.2, 손실 P = k1 (T − T0) + k4 (T⁴ − T0⁴).
     6.3 V에서 0.15 A(42 Ω)가 되도록 k4를 맞춘다. 모식 모형 */
  const R0 = 4.0, T0 = 300, EXP = 1.2, K1 = 7.7e-5;
  const Rt = (T) => R0 * (T / T0) ** EXP;
  const THOT = T0 * (42 / R0) ** (1 / EXP), K4 = (6.3 * 0.15 - K1 * (THOT - T0)) / (THOT ** 4 - T0 ** 4);
  function lampT(V) {
    let lo = T0, hi = 3600;
    for (let i = 0; i < 50; i++) { const T = (lo + hi) / 2, f = V * V / Rt(T) - K1 * (T - T0) - K4 * (T ** 4 - T0 ** 4); if (f > 0) lo = T; else hi = T; }
    return (lo + hi) / 2;
  }
  /* 전원 설정 Vs → 소자 양 끝 전압과 전류 (전원 내부 저항 RS, 전류계 RA 직렬) */
  function state(el, Vs) {
    if (el === "r") { const I = Vs / (RRES + RA + RS); return { V: I * RRES, I, T: T0 }; }
    let lo = 0, hi = Vs;
    for (let i = 0; i < 40; i++) { const V = (lo + hi) / 2, R = Rt(lampT(V)), I = V / R; if (V + I * (RA + RS) < Vs) lo = V; else hi = V; }
    const V = (lo + hi) / 2, T = lampT(V);
    return { V, I: V / Rt(T), T };
  }
  let el = "r", st = state(el, 2), rd = null;
  const readMeters = () => ({ v: L.measure(st.V, { sd: 0.003, res: 0.01 }), i: L.measure(st.I * 1000, { rel: 0.003, sd: 0.05, res: 0.1 }) });
  const NAME = { r: "저항", lamp: "전구" };

  const tbl = L.table($(".tbl-host"), [{ key: "el", label: "소자" }, { key: "v", label: "V (V)", res: 0.01 }, { key: "i", label: "I (mA)", res: 0.1 }, { key: "r", label: "V/I (Ω)", res: 0.1 }], () => drawPlot());
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());

  function meterIcon(ctx, x, y, ch) {
    ctx.fillStyle = C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(ch, x, y + 5);
  }
  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const yt = 34, yb = h - 34, xs = 46, xa = w * 0.34, xe = w * 0.6, xv = w * 0.84;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(xs, yt); ctx.lineTo(xv, yt); ctx.lineTo(xv, yb); ctx.lineTo(xs, yb); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(xe, yt); ctx.lineTo(xe, yb); ctx.stroke();
    // 전원 장치
    const ym = (yt + yb) / 2;
    ctx.fillStyle = C.card; ctx.fillRect(xs - 26, ym - 30, 52, 60); ctx.strokeRect(xs - 26, ym - 30, 52, 60);
    ctx.fillStyle = "#1d2a14"; ctx.fillRect(xs - 20, ym - 22, 40, 18);
    ctx.fillStyle = "#9be07a"; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText((+sV.value).toFixed(1), xs, ym - 9);
    ctx.fillStyle = C.ink3; ctx.font = `9px ${F.mono}`; ctx.fillText("DC 전원", xs, ym + 12);
    ctx.fillStyle = C.apple; ctx.fillText("+", xs + 16, ym + 25); ctx.fillStyle = C.ink; ctx.fillText("−", xs - 16, ym + 25);
    // 계기
    meterIcon(ctx, xa, yt, "A"); meterIcon(ctx, xv, ym, "V");
    // 소자
    ctx.fillStyle = C.card; ctx.fillRect(xe - 14, ym - 34, 28, 68);
    if (el === "r") {
      ctx.fillStyle = "#d8c49a"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
      ctx.fillRect(xe - 8, ym - 26, 16, 52); ctx.strokeRect(xe - 8, ym - 26, 16, 52);
      ["#5a3b1e", "#111", "#5a3b1e", "#c9a227"].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(xe - 8, ym - 20 + i * 10 + (i === 3 ? 6 : 0), 16, 4); });
    } else {
      const glow = clamp((st.T - 950) / 1300, 0, 1);
      if (glow > 0) { const g = ctx.createRadialGradient(xe, ym - 6, 2, xe, ym - 6, 20 + 34 * glow); g.addColorStop(0, `rgba(255,214,120,${0.85 * glow})`); g.addColorStop(1, "rgba(255,214,120,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(xe, ym - 6, 20 + 34 * glow, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.3; ctx.fillStyle = "rgba(255,255,255,.35)";
      ctx.beginPath(); ctx.arc(xe, ym - 8, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#9a9da0"; ctx.fillRect(xe - 8, ym + 8, 16, 14);
      const fc = st.T < 800 ? "#555" : `rgb(255,${Math.round(120 + 110 * glow)},${Math.round(40 + 120 * glow)})`;
      ctx.strokeStyle = fc; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(xe - 6, ym + 8); ctx.lineTo(xe - 5, ym - 10);
      for (let k = 0; k < 5; k++) ctx.lineTo(xe - 4 + k * 2, ym - 13 + (k % 2) * 5);
      ctx.lineTo(xe + 5, ym - 10); ctx.lineTo(xe + 6, ym + 8); ctx.stroke();
    }
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(el === "r" ? "저항" : "꼬마전구", xe, yb + 16);
    const tag = (t, x, y) => { const tw = ctx.measureText(t).width; ctx.fillStyle = C.card; ctx.fillRect(x - tw / 2 - 3, y - 10, tw + 6, 14); ctx.fillStyle = C.ink3; ctx.fillText(t, x, y); };
    tag("전류계 (직렬)", xa, yt + 30); tag("전압계 (병렬)", xv, ym + 30);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 18, w: w - 58, h: h - 52 }, xr = [0, 160], yr = [0, 6.5];
    const pick = (e) => tbl.rows.filter((r) => r.el === NAME[e]).map((r) => ({ x: r.i, y: r.v }));
    const other = pick(el === "r" ? "lamp" : "r"), mine = pick(el);
    const ft = mine.length > 1 ? L.linfit(mine.map((p) => p.x), mine.map((p) => p.y)) : null;
    L.plot(ctx, box, { pts: other, xr, yr, color: C.ink3, xlabel: "I (mA)", ylabel: "V (V)" });
    L.plot(ctx, box, { pts: mine, fit: ft, xr, yr, xlabel: "I (mA)", ylabel: "V (V)" });
    $(".n-a").textContent = ft ? `${(ft.a * 1000).toFixed(1)} Ω` : "—";
    $(".n-b").textContent = ft ? `${ft.b.toFixed(2)} V` : "—";
    $(".n-r2").textContent = ft ? ft.r2.toFixed(4) : "점 2개 이상";
  }

  function upd() {
    $(".v-out").textContent = (+sV.value).toFixed(1);
    st = state(el, +sV.value); rd = readMeters();
    $(".n-v").textContent = `${rd.v.toFixed(2)} V`; $(".n-i").textContent = `${rd.i.toFixed(1)} mA`;
    $(".n-r").textContent = rd.i > 0.5 ? `${(rd.v / rd.i * 1000).toFixed(1)} Ω` : "—";
    draw();
  }
  function record() { rd = readMeters(); tbl.add({ el: NAME[el], v: rd.v, i: rd.i, r: rd.i > 0.05 ? rd.v / rd.i * 1000 : NaN }); }
  sV.addEventListener("input", upd);
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => tbl.clear());
  root.querySelectorAll(".el .chip").forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll(".el .chip").forEach((o) => o.setAttribute("aria-pressed", String(o === b))); el = b.dataset.e; upd(); drawPlot();
  }));
  upd();
  if (L.demo) {
    [["r", [0.5, 1, 2, 3, 4, 5, 6]], ["lamp", [0.1, 0.3, 0.6, 1, 1.5, 2, 3, 4, 5, 6.3]]].forEach(([e, vs]) => {
      el = e; vs.forEach((v) => { sV.value = v; st = state(el, v); record(); });
    });
    root.querySelectorAll(".el .chip").forEach((o) => o.setAttribute("aria-pressed", String(o.dataset.e === "lamp")));
    sV.value = 4; upd(); drawPlot();
  }
})();
