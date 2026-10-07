/* 카드: 별의 스펙트럼 — 분광기로 찍은 연속 스펙트럼에 플랑크 곡선을 맞추고, 빈 법칙·흡수선 깊이와 비교 */
(() => {
  const root = document.getElementById("card-labearth-stellar-spectrum");
  if (!root) return;
  const { C, F, fit, axes, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sT = $(".tt"), cbResp = $(".resp");
  /* [이름, 분광형, 표면 온도(K) 대표값] */
  const STARS = [["태양", "G2V", 5772], ["스피카", "B1V", 25000], ["리겔", "B8Ia", 12100], ["시리우스", "A1V", 9940], ["베가", "A0V", 9600],
    ["프로키온", "F5IV-V", 6530], ["아크투루스", "K1.5III", 4290], ["알데바란", "K5III", 3900], ["베텔게우스", "M1-2Ia", 3600]];
  const L0 = 350, L1 = 1000, N = L1 - L0 + 1;
  const WIEN = 2.898e6;
  let si = 0, spec = null, pv = "line";

  const planck = (lam, T) => { const x = 1.4388e7 / (lam * T); return 1 / (lam ** 5 * (Math.exp(Math.min(x, 700)) - 1)); };   // λ: nm, 상대값
  const g = (x, s) => Math.exp(-0.5 * (x / s) ** 2);
  const resp = (lam) => g(lam - 610, 170) * (lam < 400 ? 0.55 + 0.45 * (lam - 350) / 50 : 1);   // 보정 전 검출기 감도 (모식)

  /* 흡수선 깊이 (모식): 온도에 따른 경향 */
  function depths(T) {
    const lt = Math.log10(T);
    return {
      H: 0.75 * Math.exp(-(((lt - Math.log10(9500)) / 0.16) ** 2)),
      Ca: 0.85 * (T < 6000 ? 1 : Math.exp(-(((T - 6000) / 1800) ** 2))),
      He: T > 15000 ? 0.35 * Math.min(1, (T - 15000) / 8000) : 0,
      Na: 0.5 * clamp((6500 - T) / 2500, 0, 1),
      Met: 0.35 * clamp((7500 - T) / 3000, 0, 1),
      TiO: 0.55 * clamp((4000 - T) / 600, 0, 1),
    };
  }
  function trans(lam, T) {
    const d = depths(T), wH = 0.9 + 2 * d.H;
    let a = 0;
    for (const c of [656.3, 486.1, 434.0, 410.2, 397.0, 388.9]) a += d.H * g(lam - c, wH);
    for (const c of [393.4, 396.8]) a += d.Ca * g(lam - c, 1.1);
    for (const c of [447.1, 402.6, 587.6]) a += d.He * g(lam - c, 0.9);
    for (const c of [589.0, 589.6]) a += d.Na * g(lam - c, 0.8);
    for (const c of [430.5, 517.3, 527.0, 438.4, 422.7]) a += d.Met * g(lam - c, 1);
    for (const c of [476.1, 495.4, 516.7, 544.8, 615.9, 705.3]) if (lam >= c) a += d.TiO * Math.exp(-(lam - c) / 14);
    if (lam < 364.6) a += 0.6 * d.H;   // 발머 불연속
    a += 0.5 * g(lam - 760, 2.2) + 0.25 * g(lam - 687, 1.4) + 0.3 * g(lam - 935, 12);   // 지구 대기 (O₂ A·B 띠, 수증기)
    return Math.exp(-a);
  }

  function shoot() {
    const T = STARS[si][2], raw = [];
    for (let i = 0; i < N; i++) { const lam = L0 + i; raw.push(planck(lam, T) * trans(lam, T) * (cbResp.checked ? resp(lam) : 1)); }
    const mx = Math.max(...raw);
    spec = { si, resp: cbResp.checked, y: raw.map((v) => Math.max(0, v / mx + 0.012 * L.gauss())) };
  }
  const at = (lam) => spec.y[Math.round(lam - L0)];
  const avg = (a, b) => { let s = 0, n = 0; for (let l = a; l <= b; l++) { s += at(l); n++; } return s / n; };
  function analyse() {
    if (!spec) return null;
    const sm = spec.y.map((_, i) => { let s = 0, n = 0; for (let k = -7; k <= 7; k++) { const v = spec.y[i + k]; if (v != null) { s += v; n++; } } return s / n; });
    let k = 0; sm.forEach((v, i) => { if (v > sm[k]) k = i; });
    const pk = L0 + k;
    const ha = 1 - avg(655, 657) / ((avg(636, 642) + avg(670, 676)) / 2);
    const ca = 1 - avg(393, 394) / ((avg(380, 384) + avg(403, 407)) / 2);
    return { pk, edge: k < 12, tw: WIEN / pk, ha: Math.max(0, ha), ca: Math.max(0, ca) };
  }
  const Tfit = () => 10 ** +sT.value;
  function model() {
    if (!spec) return null;
    const T = Tfit(), m = [];
    for (let i = 0; i < N; i++) m.push(planck(L0 + i, T));
    let sxy = 0, sxx = 0;
    for (let i = 0; i < N; i++) { const lam = L0 + i; if (lam < 400 || (lam > 750 && lam < 775) || (lam > 900)) continue; sxy += m[i] * spec.y[i]; sxx += m[i] * m[i]; }
    const k = sxy / sxx * 1.04;   // 흡수선 때문에 조금 위로 (연속선 높이)
    return m.map((v) => v * k);
  }

  const main = fit($(".ss-main"), () => drawMain());
  const pl = fit($(".ss-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "name", label: "별" }, { key: "spt", label: "분광형" }, { key: "Tf", label: "맞춤 T (K)", res: 10 },
    { key: "pk", label: "λ_max (nm)", res: 1 }, { key: "tw", label: "빈 T (K)", res: 10 }, { key: "ha", label: "Hα", res: 0.01 }, { key: "ca", label: "Ca K", res: 0.01 },
  ], () => drawPlot());

  function rgb(lam) {
    let r = 0, gg = 0, b = 0;
    if (lam < 440) { r = (440 - lam) / 60; b = 1; } else if (lam < 490) { gg = (lam - 440) / 50; b = 1; } else if (lam < 510) { gg = 1; b = (510 - lam) / 20; }
    else if (lam < 580) { r = (lam - 510) / 70; gg = 1; } else if (lam < 645) { r = 1; gg = (645 - lam) / 65; } else r = 1;
    const f = lam < 420 ? 0.3 + 0.7 * (lam - 380) / 40 : lam > 700 ? 0.3 + 0.7 * (750 - lam) / 50 : 1;
    return [r * f, gg * f, b * f].map((v) => Math.round(255 * clamp(v, 0, 1)));
  }

  function drawMain() {
    const { ctx } = main, { w, h } = main.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 40, y0: 44, w: w - 54, h: h - 78 };
    const X = (l) => box.x0 + (l - L0) / (L1 - L0) * box.w, Y = (v) => box.y0 + box.h - v / 1.15 * box.h;
    // 스펙트럼 띠
    ctx.fillStyle = "#111"; ctx.fillRect(box.x0, 6, box.w, 22);
    if (spec) {
      for (let px = 0; px < box.w; px++) {
        const lam = L0 + px / box.w * (L1 - L0), v = clamp(at(lam) * 1.3, 0, 1);
        if (lam < 380 || lam > 750) continue;
        const [r, gg, b] = rgb(lam); ctx.fillStyle = `rgb(${Math.round(r * v)},${Math.round(gg * v)},${Math.round(b * v)})`; ctx.fillRect(box.x0 + px, 6, 1.2, 22);
      }
    }
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("자외선", box.x0 + 2, 39); ctx.textAlign = "right"; ctx.fillText("적외선", box.x0 + box.w - 2, 39);
    axes(ctx, { ...box, X, Y, xt: [400, 500, 600, 700, 800, 900, 1000].map((v) => [v, String(v)]), yt: [0, 0.5, 1].map((v) => [v, String(v)]), xlabel: "파장 (nm)", ylabel: "" });
    if (!spec) { ctx.fillStyle = C.ink3; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("'스펙트럼 찍기'를 누르세요", box.x0 + box.w / 2, box.y0 + box.h / 2); return; }
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath();
    spec.y.forEach((v, i) => { const x = X(L0 + i), y = Y(v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
    const m = model();
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.setLineDash([5, 3]); ctx.beginPath();
    m.forEach((v, i) => { const x = X(L0 + i), y = Y(v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillStyle = C.ink2;
    ctx.fillText(`${STARS[spec.si][0]} (${STARS[spec.si][1]})${spec.resp ? " · 감도 보정 안 함" : ""}`, box.x0 + box.w - 4, box.y0 + 12);
    ctx.fillStyle = C.warn; ctx.fillText(`플랑크 곡선 T = ${Math.round(Tfit())} K`, box.x0 + box.w - 4, box.y0 + 27);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    [["Hα", 656.3], ["Hβ", 486.1], ["K", 393.4], ["Na D", 589.3], ["O₂ A", 760]].forEach(([t, l]) => ctx.fillText(t, X(l), box.y0 + box.h - 4));
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 48, y0: 20, w: w - 62, h: h - 54 }, rows = tbl.rows;
    if (pv === "line") {
      const o = L.plot(ctx, box, { pts: rows.map((r) => ({ x: Math.log10(r.Tf), y: r.ha })), xr: [3.45, 4.45], yr: [0, 0.8], xlabel: "log T (맞춤 온도)", ylabel: "흡수선 깊이" });
      ctx.fillStyle = C.amber; rows.forEach((r) => { ctx.beginPath(); ctx.rect(o.X(Math.log10(r.Tf)) - 3, o.Y(r.ca) - 3, 6, 6); ctx.fill(); });
      ctx.font = `11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillStyle = C.forest; ctx.fillText("● 수소 Hα", box.x0 + box.w - 4, box.y0 + 12);
      ctx.fillStyle = C.amber; ctx.fillText("■ Ca II K", box.x0 + box.w - 4, box.y0 + 27);
      ctx.fillStyle = C.ink3; ctx.textAlign = "left"; [[3.5, "M"], [3.62, "K"], [3.76, "G"], [3.84, "F"], [3.98, "A"], [4.25, "B"]].forEach(([x, t]) => ctx.fillText(t, o.X(x), box.y0 + 12));
    } else {
      const o = L.plot(ctx, box, { pts: rows.map((r) => ({ x: r.Tf, y: r.tw })), xr: [0, 27000], yr: [0, 27000], xlabel: "플랑크 맞춤 T (K)", ylabel: "빈 법칙 T (K)" });
      ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(o.X(0), o.Y(0)); ctx.lineTo(o.X(27000), o.Y(27000)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("두 값이 같으면 점선 위", box.x0 + box.w - 4, box.y0 + box.h - 8);
    }
  }

  function nums() {
    const a = analyse();
    $(".n-pk").textContent = a ? (a.edge ? "≤ " : "") + a.pk + " nm" : "—";
    $(".n-tw").textContent = a ? (a.edge ? "≥ " : "") + Math.round(a.tw / 10) * 10 + " K" : "—";
    $(".n-ha").textContent = a ? a.ha.toFixed(2) : "—";
    $(".n-ca").textContent = a ? a.ca.toFixed(2) : "—";
  }
  function record() {
    const a = analyse(); if (!a) return;
    tbl.add({ name: STARS[spec.si][0] + (spec.resp ? "*" : ""), spt: STARS[spec.si][1], Tf: Tfit(), pk: a.pk, tw: a.tw, ha: a.ha, ca: a.ca });
  }
  const upd = () => { $(".t-out").textContent = Math.round(Tfit()); drawMain(); };
  sT.addEventListener("input", upd);
  $(".shot").addEventListener("click", () => { shoot(); nums(); drawMain(); });
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".ss-star").addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]"); if (!b) return;
    si = +b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    spec = null; nums(); drawMain();
  });
  $(".ss-pv").addEventListener("click", (e) => {
    const b = e.target.closest("[data-v]"); if (!b) return;
    pv = b.dataset.v; root.querySelectorAll("[data-v]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  upd();
  if (L.demo) {
    STARS.forEach((s, i) => { si = i; shoot(); sT.value = Math.log10(s[2] * (1 + 0.04 * L.gauss())); record(); });
    si = 0; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.s === "0")));
    shoot(); sT.value = Math.log10(5800); nums(); upd();
  }
})();
