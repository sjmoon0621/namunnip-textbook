/* 카드: 용액이 갑자기 남색으로 바뀌는 시간으로 반응 속도식을 구할 수 있을까? — 아이오딘 시계 반응, 초기 속도법 */
(() => {
  const root = document.getElementById("card-labchem-clock");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  /* 참값(모식): v = k[S₂O₈²⁻][I⁻], k(25 °C) = 8.0×10⁻³ M⁻¹s⁻¹, Ea = 52 kJ/mol */
  const K25 = 8.0e-3, EA = 52e3, R = 8.314, VT = 50.0, DP = 5.0e-4;
  const kOf = (T) => K25 * Math.exp(-EA / R * (1 / (T + 273.15) - 1 / 298.15));
  let view = "i", run = null;

  const tbl = L.table($(".tbl-host"), [
    { key: "vi", label: "KI (mL)", res: 0.1 }, { key: "vp", label: "S₂O₈²⁻ (mL)", res: 0.1 }, { key: "T", label: "T (°C)", res: 1 },
    { key: "ci", label: "[I⁻]₀ (M)", res: 0.001 }, { key: "cp", label: "[S₂O₈²⁻]₀ (M)", res: 0.001 }, { key: "t", label: "t (s)", res: 0.1 },
    { key: "v", label: "속도 (10⁻⁶ M/s)", res: 0.01 },
  ], () => { drawPlot(); nums(); });
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function trial() {
    const vi = +$(".vi").value, vp = +$(".vp").value, T = +$(".t").value;
    const ci = 0.200 * vi / VT, cp = 0.100 * vp / VT, Tb = T + 0.3 * L.gauss();
    const tTrue = -Math.log(1 - DP / cp) / (kOf(Tb) * ci);   // I⁻는 티오황산으로 계속 되살아나 일정
    const t = L.measure(tTrue, { sd: 0.3, rel: 0.015, res: 0.1 });
    return { vi, vp, T, ci, cp, tTrue, t, v: DP / t * 1e6 };
  }
  const add = (r) => tbl.add({ vi: r.vi, vp: r.vp, T: r.T, ci: r.ci, cp: r.cp, t: r.t, v: r.v });

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const el = run ? run.el : 0, done = run && el >= run.r.tTrue;
    const left = run ? Math.max(0, 1 - el / run.r.tTrue) : 1;
    // 비커
    const bx = w * 0.14, bw = Math.min(110, w * 0.2), bt = h * 0.28, bb = h - 14;
    const blue = run ? Math.min(1, Math.max(0, (el - run.r.tTrue) / 1.2)) : 0;
    ctx.fillStyle = `rgba(${Math.round(225 - 200 * blue)},${Math.round(232 - 200 * blue)},${Math.round(240 - 150 * blue)},${0.5 + 0.45 * blue})`;
    ctx.fillRect(bx - bw / 2, bt + 22, bw, bb - bt - 22);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(bx - bw / 2, bt); ctx.lineTo(bx - bw / 2, bb); ctx.lineTo(bx + bw / 2, bb); ctx.lineTo(bx + bw / 2, bt); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(`${$(".t").value} °C 항온`, bx, bt - 8);
    // 초시계
    const cx = w * 0.37, cy = h * 0.42, Rr = Math.min(44, h * 0.2);
    ctx.fillStyle = C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, Rr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillRect(cx - 6, cy - Rr - 9, 12, 8); ctx.strokeRect(cx - 6, cy - Rr - 9, 12, 8);
    const shown = run ? (done ? run.r.t : el) : 0;
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.sin(shown / 60 * 2 * Math.PI) * Rr * 0.8, cy - Math.cos(shown / 60 * 2 * Math.PI) * Rr * 0.8); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `600 15px ${F.mono}`; ctx.fillText(`${shown.toFixed(1)} s`, cx, cy + Rr + 22);
    if (run && !done) { ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.fillText(`${run.speed.toFixed(0)}배속`, cx, cy + Rr + 37); }
    // 반응 단계와 티오황산 막대
    const tx = w * 0.53, mw = w - tx - 8; ctx.textAlign = "left";
    const eq = (txt, y) => { let fs = 11; ctx.font = `${fs}px ${F.mono}`; while (ctx.measureText(txt).width > mw && fs > 8) { fs -= 0.5; ctx.font = `${fs}px ${F.mono}`; } ctx.fillStyle = C.ink; ctx.fillText(txt, tx, y); };
    const note = (txt, y) => { ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.fillText(txt, tx + 4, y); };
    eq("① S₂O₈²⁻ + 2I⁻ → 2SO₄²⁻ + I₂", 30); note("느림 · 이 속도를 잰다", 46);
    eq("② I₂ + 2S₂O₃²⁻ → 2I⁻ + S₄O₆²⁻", 72); note("아주 빠름 · I₂를 바로 없앤다", 88);
    eq("③ S₂O₃²⁻가 다 떨어지면", 114); eq("   I₂ + 녹말 → 남색", 130);
    const bw2 = w - tx - 16;
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.fillText("남은 S₂O₃²⁻ (모식)", tx, h - 34);
    ctx.fillStyle = C.rule; ctx.fillRect(tx, h - 26, bw2, 8); ctx.fillStyle = C.forest; ctx.fillRect(tx, h - 26, bw2 * left, 8);
  }

  /* 다른 반응물 농도가 가장 흔한 값인 25 °C 행만 골라 log–log 맞춤 */
  function series(key, other) {
    const rows = tbl.rows.filter((r) => r.T === 25);
    const cnt = {}; rows.forEach((r) => { const k = r[other].toFixed(4); cnt[k] = (cnt[k] || 0) + 1; });
    const mode = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];
    const s = rows.filter((r) => r[other].toFixed(4) === mode);
    const pts = s.map((r) => ({ x: Math.log10(r[key]), y: Math.log10(r.v * 1e-6) }));
    const xs = new Set(s.map((r) => r[key].toFixed(4)));
    return { pts, f: xs.size >= 2 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)) : null, fixed: mode };
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 52, y0: 18, w: w - 66, h: h - 52 };
    const s = view === "i" ? series("ci", "cp") : series("cp", "ci");
    const xr = view === "i" ? [-1.75, -1.05] : [-2.05, -1.35];
    L.plot(ctx, box, { pts: s.pts, fit: s.f, xr, yr: [-5.8, -4.6], xlabel: view === "i" ? "log [I⁻]₀" : "log [S₂O₈²⁻]₀", ylabel: "log 초기 속도" });
    ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
    if (s.f) { ctx.fillStyle = C.warn; ctx.fillText(`기울기 = ${s.f.a.toFixed(2)} → ${view === "i" ? "m" : "n"} ≈ ${Math.round(s.f.a)}`, box.x0 + 8, box.y0 + 14); }
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`;
    if (s.fixed) ctx.fillText(`25 °C, ${view === "i" ? "[S₂O₈²⁻]₀" : "[I⁻]₀"} = ${(+s.fixed).toFixed(3)} M로 고정한 기록만`, box.x0 + 8, box.y0 + box.h - 8);
  }
  function nums() {
    const a = series("ci", "cp").f, b = series("cp", "ci").f;
    $(".n-m").textContent = a ? `${a.a.toFixed(2)} ≈ ${Math.round(a.a)}` : "—";
    $(".n-n").textContent = b ? `${b.a.toFixed(2)} ≈ ${Math.round(b.a)}` : "—";
    if (a && b) {
      const m = Math.round(a.a), n = Math.round(b.a);
      const ks = tbl.rows.filter((r) => r.T === 25).map((r) => r.v * 1e-6 / (r.ci ** m * r.cp ** n)), st = L.stats(ks);
      const u = m + n === 2 ? "M⁻¹s⁻¹" : m + n === 1 ? "s⁻¹" : `M^${1 - m - n}·s⁻¹`;
      $(".n-k").textContent = `${(st.mean * 1e3).toFixed(2)}×10⁻³ ${u}`;
    } else $(".n-k").textContent = "—";
  }

  loop($(".cv-wide"), (dt) => {
    if (run) {
      run.el += dt * run.speed;
      if (!run.saved && run.el >= run.r.tTrue + 1.5) { add(run.r); run.saved = true; }
      if (run.el > run.r.tTrue + 6) run.speed = 0;
    }
    drawApp();
  });
  const upd = () => { $(".vi-out").textContent = (+$(".vi").value).toFixed(1); $(".vp-out").textContent = (+$(".vp").value).toFixed(1); $(".t-out").textContent = $(".t").value; run = null; drawApp(); };
  [$(".vi"), $(".vp"), $(".t")].forEach((el) => el.addEventListener("input", upd));
  $(".mix").addEventListener("click", () => { if (run && !run.saved) return; const r = trial(); run = { r, el: 0, speed: Math.max(3, r.tTrue / 8), saved: false }; });
  $(".view").addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (!b) return; view = b.dataset.p; root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot(); });
  $(".clear").addEventListener("click", () => { tbl.clear(); run = null; drawApp(); });
  upd(); nums();

  if (L.demo) {
    const go = (vi, vp, T) => { $(".vi").value = vi; $(".vp").value = vp; $(".t").value = T; add(trial()); };
    [5, 10, 15, 20].forEach((v) => go(v, 10, 25));
    [5, 15, 20].forEach((v) => go(10, v, 25));
    go(10, 10, 25); go(10, 10, 35);
    $(".vi").value = 10; $(".vp").value = 10; $(".t").value = 25; upd();
    const r = trial(); run = { r, el: r.tTrue + 3, speed: 0, saved: true };
    drawApp();
  }
})();
