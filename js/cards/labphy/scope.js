/* 카드: 화면의 눈금 칸만 세어서 신호의 진동수와 전압을 알 수 있을까? — 오실로스코프와 함수 발생기 */
(() => {
  const root = document.getElementById("card-labphy-scope");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sF = $(".f"), sA = $(".amp"), sO = $(".off"), sT = $(".trg"), selV = $(".vdiv"), selT = $(".tdiv"), msg = $(".sc-msg");
  const PHOS = "#7be08a";
  const VD = [0.1, 0.2, 0.5, 1, 2, 5];
  const TD = [10e-6, 20e-6, 50e-6, 100e-6, 200e-6, 500e-6, 1e-3, 2e-3, 5e-3, 10e-3];
  const tLab = (t) => (t < 1e-3 ? `${Math.round(t * 1e6)} µs` : `${+(t * 1e3).toPrecision(3)} ms`);
  const fLab = (f) => (f >= 1000 ? `${(f / 1000).toPrecision(3)} kHz` : `${f.toPrecision(3)} Hz`);
  VD.forEach((v) => selV.insertAdjacentHTML("beforeend", `<option value="${v}">${v} V</option>`));
  TD.forEach((t) => selT.insertAdjacentHTML("beforeend", `<option value="${t}">${tLab(t)}</option>`));
  selV.value = "1"; selT.value = String(200e-6);

  // 함수 발생기 눈금의 숨은 어긋남 (참값은 화면에 보이지 않는다)
  const sgn = () => (Math.random() < 0.5 ? -1 : 1);
  const dF = sgn() * (0.01 + 0.02 * Math.random()), dA = sgn() * (0.02 + 0.03 * Math.random());
  const NAME = { sin: "사인", sq: "사각", tri: "삼각" }, KR = { sin: 2 * Math.SQRT2, sq: 2, tri: 2 * Math.sqrt(3) };
  let wave = "sin", cpl = "DC", xy = false, tau = 0, drift = 0;

  const dial = () => ({ f: +(10 ** +sF.value).toPrecision(3), a: +sA.value, o: +sO.value });
  const truth = () => { const d = dial(); return { f: d.f * (1 + dF), a: d.a * (1 + dA), o: d.o }; };
  const shape = (p) => {
    p -= Math.floor(p);
    if (wave === "sin") return Math.sin(2 * Math.PI * p);
    if (wave === "sq") return p < 0.5 ? 1 : -1;
    return p < 0.25 ? 4 * p : p < 0.75 ? 2 - 4 * p : 4 * p - 4;
  };
  const dcOf = (tr) => (cpl === "DC" ? tr.o : 0);
  const sig = (tr, t) => (cpl === "GND" ? 0 : dcOf(tr) + tr.a / 2 * shape(tr.f * t));
  // 트리거: 신호가 레벨을 올라가며 지나는 위상
  function trigPhase(tr) {
    if (cpl === "GND") return null;
    const u = (+sT.value - dcOf(tr)) / (tr.a / 2);
    if (!(u > -1 && u < 1)) return null;
    if (wave === "sin") return Math.asin(u) / (2 * Math.PI);
    if (wave === "tri") return u / 4;
    return 0;
  }

  const sc = fit($(".cv-wide"), () => drawScope());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "w", label: "파형" }, { key: "td", label: "TIME/DIV" }, { key: "Tc", label: "주기 칸", res: 0.1 }, { key: "T", label: "T (ms)", res: 0.001 }, { key: "f", label: "f (Hz)", res: 1 },
    { key: "vd", label: "V/DIV" }, { key: "Vc", label: "세로 칸", res: 0.1 }, { key: "Vpp", label: "Vpp (V)", res: 0.01 }, { key: "Vr", label: "Vrms (V)", res: 0.01 },
  ], () => { drawPlot(); nums(); });

  function drawScope() {
    const { ctx } = sc, { w, h } = sc.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const dv = Math.floor((h - 16) / 8), x0 = 8, y0 = 8, W = dv * 10, H = dv * 8, cy = y0 + H / 2;
    ctx.fillStyle = C.night; ctx.fillRect(x0 - 4, y0 - 4, W + 8, H + 8);
    ctx.strokeStyle = "rgba(255,255,255,.14)"; ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) { ctx.beginPath(); ctx.moveTo(x0 + i * dv + .5, y0); ctx.lineTo(x0 + i * dv + .5, y0 + H); ctx.stroke(); }
    for (let j = 0; j <= 8; j++) { ctx.beginPath(); ctx.moveTo(x0, y0 + j * dv + .5); ctx.lineTo(x0 + W, y0 + j * dv + .5); ctx.stroke(); }
    ctx.strokeStyle = "rgba(255,255,255,.3)";
    for (let i = 0; i <= 50; i++) { const x = x0 + i * dv / 5 + .5; ctx.beginPath(); ctx.moveTo(x, cy - 3); ctx.lineTo(x, cy + 3); ctx.stroke(); }
    for (let j = 0; j <= 40; j++) { const y = y0 + j * dv / 5 + .5; ctx.beginPath(); ctx.moveTo(x0 + W / 2 - 3, y); ctx.lineTo(x0 + W / 2 + 3, y); ctx.stroke(); }
    const tr = truth(), vd = +selV.value, td = +selT.value;
    const Y = (v) => clamp(cy - v / vd * dv, y0 - 2, y0 + H + 2);
    ctx.save(); ctx.beginPath(); ctx.rect(x0 - 2, y0 - 2, W + 4, H + 4); ctx.clip();
    ctx.lineWidth = 1.6; ctx.strokeStyle = PHOS; ctx.shadowColor = PHOS; ctx.shadowBlur = 4;
    let trig = true;
    if (xy) {
      // CH1 → 가로, CH2(500 Hz, 진폭 3칸) → 세로. 비가 p/q에 가까우면 거의 멈춘 도형
      const r = tr.f / 500; let best = [1, 1, 9];
      for (let q = 1; q <= 4; q++) { const p = Math.max(1, Math.round(r * q)), e = Math.abs(r - p / q); if (e < best[2] - 1e-9) best = [p, q, e]; }
      const [p, q, e] = best, stable = e / r < 0.03, cyc = stable ? q : 8;
      ctx.beginPath();
      for (let i = 0; i <= 1600; i++) {
        const th = cyc * i / 1600, x = (cpl === "GND" ? 0 : dcOf(tr) + tr.a / 2 * shape((stable ? p / q : r) * th + drift)) / vd;
        const px = x0 + W / 2 + clamp(x, -5.1, 5.1) * dv, py = cy - 3 * Math.sin(2 * Math.PI * th) * dv;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
    } else {
      const ph = trigPhase(tr); trig = ph !== null;
      const per = tr.f * td * 10;
      const runs = trig ? [ph / tr.f] : [Math.random(), Math.random(), Math.random()].map((u) => u / tr.f);
      runs.forEach((t0, k) => {
        ctx.globalAlpha = trig ? 1 : 0.35 + 0.2 * k;
        if (per > W / 3 && cpl !== "GND") {   // 화면에 주기가 너무 많으면 띠로 번져 보인다
          const top = Y(dcOf(tr) + tr.a / 2), bot = Y(dcOf(tr) - tr.a / 2);
          ctx.fillStyle = "rgba(123,224,138,.35)"; ctx.fillRect(x0, top, W, Math.max(2, bot - top));
          return;
        }
        ctx.beginPath();
        const n = Math.ceil(W * 2);
        let prev = null;
        for (let i = 0; i <= n; i++) {
          const t = t0 + i / n * 10 * td, px = x0 + i / n * W, py = Y(sig(tr, t)) + 0.6 * L.gauss() * (vd < 0.3 ? 1 : 0.3);
          if (prev !== null && Math.abs(py - prev) > dv * 0.8) ctx.lineTo(px, prev);
          i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); prev = py;
        }
        ctx.stroke();
      });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      // 트리거 레벨 표시와 0 V 기준
      const ty = Y(+sT.value);
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.moveTo(x0 + W, ty); ctx.lineTo(x0 + W - 7, ty - 4); ctx.lineTo(x0 + W - 7, ty + 4); ctx.fill();
      ctx.fillStyle = "#9fc4ff"; ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x0 + 7, cy - 4); ctx.lineTo(x0 + 7, cy + 4); ctx.fill();
    }
    ctx.restore();

    // 오른쪽: 장치 설정 패널
    const px = x0 + W + 14, d = dial(), lh = 15;
    let y = y0 + 10;
    const line = (s, col, font) => { ctx.fillStyle = col || C.ink; ctx.font = font || `11px ${F.mono}`; ctx.fillText(s, px, y); y += lh; };
    ctx.textAlign = "left";
    line("함수 발생기", C.ink3, `11px ${F.sans}`);
    ctx.fillStyle = C.ink; ctx.fillRect(px, y - 10, Math.min(118, w - px - 6), 34);
    ctx.fillStyle = "#ffd27a"; ctx.font = `600 13px ${F.mono}`; ctx.fillText(fLab(d.f), px + 6, y + 5);
    ctx.font = `11px ${F.mono}`; ctx.fillText(`${d.a.toFixed(1)} Vpp ${NAME[wave]}`, px + 6, y + 19);
    y += 38;
    line(`오프셋 ${d.o.toFixed(1)} V`, C.ink2);
    y += 6;
    line("오실로스코프", C.ink3, `11px ${F.sans}`);
    line(`CH1 ${selV.value} V/div`, C.forest);
    line(`결합 ${cpl}`, C.forest);
    if (xy) { line("XY 모드", C.warn); line("CH2 500 Hz 기준", C.ink2); }
    else {
      line(`${tLab(+selT.value)}/div`, C.forest);
      line(`트리거 ${(+sT.value).toFixed(1)} V`, C.amber);
      line(trig ? "● TRIG'D" : "○ 트리거 안 됨", trig ? C.forest : C.warn);
    }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 46, y0: 22, w: w - 60, h: h - 58 }, xr = [0, 10.5], yr = [0.8, 1.2];
    const fp = tbl.rows.map((r) => ({ x: r.Tc, y: r.fr, ey: r.fr * 0.1 / r.Tc }));
    const vp = tbl.rows.map((r) => ({ x: r.Vc, y: r.vr, ey: r.vr * 0.1 / r.Vc }));
    L.plot(ctx, box, { pts: fp, xr, yr, xlabel: "화면에서 차지한 칸 수", ylabel: "측정값 ÷ 눈금값", model: () => 1 });
    L.plot(ctx, box, { pts: vp.map((p) => ({ ...p, x: p.x + 0.08 })), xr, yr, color: C.amber });
    ctx.font = `11px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillStyle = C.forest; ctx.fillText("● 진동수 f (주기 칸)", w - 14, 14);
    ctx.fillStyle = C.amber; ctx.fillText("● Vpp (세로 칸)", w - 160, 14);
  }

  function nums() {
    const r = tbl.rows[tbl.rows.length - 1];
    $(".n-f").textContent = r ? `${Math.round(r.f)} ± ${Math.round(r.f * 0.1 / r.Tc)} Hz` : "—";
    $(".n-v").textContent = r ? `${r.Vpp.toFixed(2)} ± ${(r.Vpp * 0.1 / r.Vc).toFixed(2)} V` : "—";
    $(".n-r").textContent = r ? `${r.Vr.toFixed(2)} V` : "—";
  }

  function measure(quiet) {
    if (xy) return say("XY 모드에서는 주기를 읽을 수 없습니다. XY 모드를 끄세요.");
    if (cpl === "GND") return say("GND 결합에서는 신호가 들어오지 않습니다.");
    const tr = truth(), d = dial(), vd = +selV.value, td = +selT.value;
    if (trigPhase(tr) === null) return say("파형이 흘러가서 칸을 셀 수 없습니다. 트리거 레벨을 파형 범위 안으로 옮기세요.");
    const Td = 1 / tr.f / td, Vd = tr.a / vd, top = Math.abs(dcOf(tr)) / vd + Vd / 2;
    if (Td > 10) return say("한 주기가 화면(10칸)보다 깁니다. TIME/DIV를 줄이세요.");
    if (Td < 0.3) return say("주기가 너무 짧아 칸을 셀 수 없습니다. TIME/DIV를 키우세요.");
    if (top > 4) return say("파형이 화면 위아래로 넘칩니다. VOLTS/DIV를 키우세요.");
    if (Vd < 0.3) return say("파형이 너무 납작합니다. VOLTS/DIV를 줄이세요.");
    const Tc = Math.max(0.1, L.measure(Td, { sd: 0.04, res: 0.1 })), Vc = Math.max(0.1, L.measure(Vd, { sd: 0.04, res: 0.1 }));
    const T = Tc * td, f = 1 / T, Vpp = Vc * vd;
    tbl.add({ w: NAME[wave], td: tLab(td), Tc, T: T * 1e3, f, vd: vd + " V", Vc, Vpp, Vr: Vpp / KR[wave], fr: f / d.f, vr: Vpp / d.a });
    if (!quiet) say("");
  }
  function say(s) { msg.textContent = s; }

  loop($(".cv-wide"), (dt) => { tau += dt; drift += dt * 0.25; drawScope(); });
  const upd = () => {
    const d = dial();
    $(".f-out").textContent = fLab(d.f); $(".a-out").textContent = d.a.toFixed(1); $(".o-out").textContent = d.o.toFixed(1); $(".t-out").textContent = (+sT.value).toFixed(1);
    drawScope();
  };
  [sF, sA, sO, sT].forEach((el) => el.addEventListener("input", upd));
  [selV, selT].forEach((el) => el.addEventListener("change", upd));
  const group = (sel, attr, set) => $(sel).addEventListener("click", (e) => {
    const b = e.target.closest(`[${attr}]`); if (!b) return;
    root.querySelectorAll(`${sel} [${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); set(b.getAttribute(attr)); upd();
  });
  group(".wv", "data-w", (v) => { wave = v; });
  group(".cp", "data-c", (v) => { cpl = v; });
  $(".xy").addEventListener("click", (e) => { xy = !xy; e.currentTarget.setAttribute("aria-pressed", String(xy)); upd(); });
  $(".meas").addEventListener("click", () => measure());
  $(".clear").addEventListener("click", () => { tbl.clear(); say(""); });
  upd();
  if (L.demo) {
    const set = (w, td, vd) => { wave = w; selT.value = String(td); selV.value = String(vd); measure(true); };
    [["sin", 1e-3, 5], ["sin", 500e-6, 2], ["sin", 200e-6, 1], ["sin", 100e-6, 1], ["sq", 200e-6, 1], ["tri", 100e-6, 1]].forEach((a) => set(...a));
    wave = "sin"; selT.value = String(200e-6); selV.value = "1"; upd();
  }
})();
