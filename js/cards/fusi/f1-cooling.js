/* 카드: 어떤 측정 계획이라야 두 가설 가운데 하나를 고를 수 있을까? — 직선 냉각 vs 뉴턴 냉각, 측정 기간·간격·온도계 설계 */
(() => {
  const root = document.getElementById("card-fusi-cooling");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sD = $(".dur"), sI = $(".iv");
  const IV = [0.5, 1, 2, 5], TA = 20;
  const CUP = { paper: { nm: "종이컵", k: 0.045 }, mug: { nm: "머그컵", k: 0.03 }, flask: { nm: "보온병", k: 0.004 } };
  const TH = { dig: { nm: "디지털", sd: 0.15, res: 0.1 }, alc: { nm: "알코올", sd: 0.3, res: 1 } };
  let ck = "mug", tk = "dig", data = null, fits = null;

  function fitExp(ts, ys) {
    let best = null;
    for (let i = 0; i <= 240; i++) {
      const k = 1e-4 * Math.pow(10, i / 80);
      let se = 0, ee = 0; ts.forEach((t, j) => { const e = Math.exp(-k * t); se += (ys[j] - TA) * e; ee += e * e; });
      const A = se / ee;
      let sse = 0; ts.forEach((t, j) => { sse += (ys[j] - TA - A * Math.exp(-k * t)) ** 2; });
      if (!best || sse < best.sse) best = { k, A, sse };
    }
    return { f: (t) => TA + best.A * Math.exp(-best.k * t), rms: Math.sqrt(best.sse / Math.max(1, ts.length - 2)), k: best.k };
  }

  function run() {
    const cup = CUP[ck], th = TH[tk], dur = +sD.value, iv = IV[+sI.value], T0 = 80 + 0.6 * L.gauss();
    const ts = [], ys = [];
    for (let t = 0; t <= dur + 1e-9; t += iv) { ts.push(t); ys.push(L.measure(TA + (T0 - TA) * Math.exp(-cup.k * t), { sd: th.sd, res: th.res })); }
    data = { ts, ys, ck, tk, dur };
    const lf = L.linfit(ts, ys);
    const r1 = Math.sqrt(ts.reduce((s, t, j) => s + (ys[j] - lf.a * t - lf.b) ** 2, 0) / Math.max(1, ts.length - 2));
    fits = { lin: { f: (t) => lf.a * t + lf.b, rms: r1 }, exp: fitExp(ts, ys) };
    report(); draw();
  }

  function report() {
    if (!data) return;
    const th = TH[data.tk], sig = Math.sqrt(th.sd ** 2 + th.res ** 2 / 12);
    const r1 = fits.lin.rms, r2 = fits.exp.rms, vd = $(".cl-verdict");
    $(".r1").textContent = r1.toFixed(2) + " °C"; $(".r2").textContent = r2.toFixed(2) + " °C";
    $(".r1").className = "r1 " + (r1 > 2.5 * sig ? "bad" : ""); $(".r2").className = "r2 " + (r2 > 2.5 * sig ? "bad" : "");
    $(".nn").textContent = data.ts.length + "번";
    const lead = `${CUP[data.ck].nm}, ${data.dur}분 측정 · 온도계 우연 오차 약 ${sig.toFixed(2)} °C. `;
    if (data.ts.length < 4) { vd.className = "cl-verdict no"; vd.textContent = lead + "측정값이 너무 적어 두 모형을 비교할 수 없습니다."; return; }
    if (r1 > 2.5 * sig && r2 <= 2 * sig) { vd.className = "cl-verdict ok"; vd.textContent = lead + `직선은 측정값에서 체계적으로 벗어나고(어긋남이 오차의 ${(r1 / sig).toFixed(1)}배), 지수 곡선은 오차 수준으로 맞습니다. 가설 1을 버리고 가설 2를 지지할 수 있습니다.`; }
    else if (r1 <= 2 * sig && r2 <= 2 * sig) { vd.className = "cl-verdict no"; vd.textContent = lead + "두 모형 모두 오차 수준으로 맞습니다. 이 계획으로는 어느 가설도 버릴 수 없습니다. 두 선이 어디서부터 갈라지는지 보세요."; }
    else { vd.className = "cl-verdict no"; vd.textContent = lead + "차이가 보이기 시작하지만 아직 분명하지 않습니다. 측정 기간이나 온도계를 바꿔 다시 재 보세요."; }
  }

  const view = fit($("canvas"), () => draw());
  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 40, y0: 20, w: w - 52, h: h - 54 }, TM = 90;
    const X = (t) => box.x0 + t / TM * box.w, Y = (v) => box.y0 + box.h - (v - 15) / 70 * box.h;
    axes(ctx, { ...box, X, Y, xt: [0, 15, 30, 45, 60, 75, 90].map((v) => [v, String(v)]), yt: [20, 40, 60, 80].map((v) => [v, String(v)]), xlabel: "시간 (분)", ylabel: "온도 (°C)" });
    ctx.strokeStyle = C.rule; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(0), Y(TA)); ctx.lineTo(X(TM), Y(TA)); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("실내 20 °C", X(TM) - 2, Y(TA) - 4);
    /* 계획한 측정 구간 */
    const dur = +sD.value;
    ctx.fillStyle = "rgba(116,171,102,0.10)"; ctx.fillRect(X(0), box.y0, X(dur) - X(0), box.h);
    if (data) {
      ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
      const line = (f, col, a, b, dash) => { ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.setLineDash(dash); ctx.beginPath(); for (let i = 0; i <= 90; i++) { const t = a + (b - a) * i / 90; i ? ctx.lineTo(X(t), Y(f(t))) : ctx.moveTo(X(t), Y(f(t))); } ctx.stroke(); ctx.setLineDash([]); };
      line(fits.lin.f, C.warn, 0, data.dur, []); line(fits.lin.f, C.warn, data.dur, TM, [5, 4]);
      line(fits.exp.f, "#4a6fa5", 0, data.dur, []); line(fits.exp.f, "#4a6fa5", data.dur, TM, [5, 4]);
      ctx.restore();
      ctx.fillStyle = C.ink;
      data.ts.forEach((t, j) => { ctx.beginPath(); ctx.arc(X(t), Y(data.ys[j]), 2.6, 0, Math.PI * 2); ctx.fill(); });
      /* 두 예측이 2 °C 이상 갈리는 시각 */
      let tSplit = null; for (let t = 0; t <= TM; t += 0.5) if (Math.abs(fits.lin.f(t) - fits.exp.f(t)) > 2) { tSplit = t; break; }
      if (tSplit !== null) {
        ctx.strokeStyle = C.ink2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(tSplit), box.y0 + 14); ctx.lineTo(X(tSplit), box.y0 + box.h); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = C.ink2; ctx.textAlign = tSplit > 60 ? "right" : "left"; ctx.font = `11px ${F.sans}`;
        ctx.fillText(`두 예측이 2 °C 넘게 갈리는 때 ≈ ${tSplit.toFixed(0)}분`, X(tSplit) + (tSplit > 60 ? -4 : 4), box.y0 + 12);
      }
    }
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillStyle = C.warn; ctx.fillText("─ 가설 1 직선", box.x0 + box.w - 4, box.y0 + 32);
    ctx.fillStyle = "#4a6fa5"; ctx.fillText("─ 가설 2 지수 곡선", box.x0 + box.w - 4, box.y0 + 47);
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("점선: 측정 구간 밖으로 연장한 예측", box.x0 + box.w, box.y0 + box.h - 8);
  }

  const sel = (grp, attr, set) => $(grp).addEventListener("click", (e) => {
    const b = e.target.closest(`[data-${attr}]`); if (!b) return;
    set(b.dataset[attr]); $(grp).querySelectorAll(`[data-${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
  sel(".csel", "c", (x) => { ck = x; });
  sel(".tsel", "t", (x) => { tk = x; });
  const upd = () => { $(".d-out").textContent = sD.value; $(".i-out").textContent = IV[+sI.value]; draw(); };
  [sD, sI].forEach((el) => el.addEventListener("input", upd));
  $(".run").addEventListener("click", run);
  upd();
  if (L.demo) { sD.value = 5; upd(); run(); }
})();
