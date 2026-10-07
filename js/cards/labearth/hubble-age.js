/* 카드: 허블–르메트르 법칙과 우주의 나이 — 허블 1929 자료와 Pantheon+ 초신성으로 H₀를 맞추고 1/H₀와 표준 모형의 나이를 비교 */
(() => {
  const root = document.getElementById("card-labearth-hubble-age");
  if (!root || !window.NMHubble) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const CK = 299792.458, OM = 0.315, OL = 0.685;
  let ds = "h29", MB = -19.253;
  const order = { h29: NMHubble.h29.map((_, i) => i).sort(() => Math.random() - 0.5), sn: NMHubble.sn.map((_, i) => i).sort(() => Math.random() - 0.5) };
  const next = { h29: 0, sn: 0 };

  function item(i) {
    if (ds === "h29") { const [name, d, v] = NMHubble.h29[i]; return { ds, i, name, z: v / CK, m: "—", d, v }; }
    const [name, z, m] = NMHubble.sn[i];
    return { ds, i, name, z, m, d: 10 ** ((m - MB - 25) / 5), v: CK * z * (1 + 0.775 * z) };
  }
  const main = fit($(".hb-main"), () => drawMain());
  const pl = fit($(".hb-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "name", label: "천체" }, { key: "z", label: "z", res: 0.0001 }, { key: "m", label: "m_B", res: 0.01 },
    { key: "d", label: "d (Mpc)", res: 0.01 }, { key: "v", label: "v (km/s)", res: 1 },
  ], () => { drawMain(); drawPlot(); nums(); });
  const mine = () => tbl.rows.filter((r) => r.ds === ds);
  const H0fit = () => { const m = mine(); return m.length > 1 ? L.linfit(m.map((r) => r.d), m.map((r) => r.v), true) : null; };

  function drawMain() {
    const { ctx } = main, { w, h } = main.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const b = { x0: 52, y0: 20, w: w - 66, h: h - 54 }, f = H0fit();
    const xr = ds === "h29" ? [0, 2.2] : [0, 400], yr = ds === "h29" ? [-0.4, 1.2] : [0, 26];
    const o = L.plot(ctx, b, { pts: mine().map((r) => ({ x: r.d, y: r.v / 1000 })), fit: f ? { a: f.a / 1000, b: 0 } : null, xr, yr, xlabel: "거리 d (Mpc)", ylabel: "후퇴 속도 v (1,000 km/s)" });
    if (ds === "h29") { ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(b.x0, o.Y(0)); ctx.lineTo(b.x0 + b.w, o.Y(0)); ctx.stroke(); ctx.setLineDash([]); }
    if (f) { ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`v = ${f.a.toFixed(1)} × d`, b.x0 + 6, b.y0 + 12); }
    if (!mine().length) { ctx.fillStyle = C.ink3; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("'5개 읽기'를 누르세요", b.x0 + b.w / 2, b.y0 + b.h / 2); }
  }
  /* 표준 모형: t(a) = (1/H₀)∫₀^a da / (a E(a)), E = √(Ωm a⁻³ + ΩΛ) */
  function lcdm(H0) {
    const tH = 977.8 / H0, pts = []; let t = 0, a0 = 1e-4;
    const N = 600;
    for (let k = 1; k <= N; k++) {
      const a1 = 1e-4 + (1.15 - 1e-4) * k / N, am = (a0 + a1) / 2;
      t += (a1 - a0) / (am * Math.sqrt(OM / am ** 3 + OL)) * tH; pts.push([t, a1]); a0 = a1;
    }
    const now = pts.find((p) => p[1] >= 1)[0];
    return { now, pts: pts.map(([tt, a]) => [tt - now, a]) };
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const b = { x0: 44, y0: 20, w: w - 58, h: h - 54 }, f = H0fit();
    const o = L.plot(ctx, b, { pts: [], xr: [-16, 2], yr: [0, 1.15], xlabel: "지금으로부터의 시간 (10억 년)", ylabel: "우주의 크기 (지금 = 1)" });
    ctx.save(); ctx.beginPath(); ctx.rect(b.x0, b.y0, b.w, b.h); ctx.clip();
    ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(o.X(-4.54), b.y0); ctx.lineTo(o.X(-4.54), b.y0 + b.h); ctx.stroke(); ctx.setLineDash([]);
    if (f && f.a > 0) {
      const tH = 977.8 / f.a;
      ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(o.X(-tH), o.Y(0)); ctx.lineTo(o.X(2), o.Y(1 + 2 / tH)); ctx.stroke();
      const m = lcdm(f.a);
      ctx.strokeStyle = C.warn; ctx.setLineDash([6, 4]); ctx.beginPath();
      m.pts.forEach(([t, a], i) => (i ? ctx.lineTo(o.X(t), o.Y(a)) : ctx.moveTo(o.X(t), o.Y(a)))); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
      ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
      ctx.fillStyle = C.forest; ctx.fillText(`— 일정한 팽창: ${tH.toFixed(1)} × 10⁹ 년 전 시작`, b.x0 + 6, b.y0 + 12);
      ctx.fillStyle = C.warn; ctx.fillText(`- - 표준 모형: ${m.now.toFixed(1)} × 10⁹ 년 전 시작`, b.x0 + 6, b.y0 + 27);
    } else ctx.restore();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("지구 나이 45억 년", o.X(-4.54) + 4, b.y0 + b.h - 8);
  }
  function nums() {
    const f = H0fit();
    $(".n-h").textContent = f ? `${f.a.toFixed(1)} ± ${f.sa.toFixed(1)}` : "—";
    $(".n-t").textContent = f ? (977.8 / f.a).toFixed(1) + " × 10⁹ 년" : "—";
    $(".n-c").textContent = f ? (CK / f.a * 3.2616e-3).toFixed(1) + " × 10⁹ 광년" : "—";
  }
  function read(n) {
    const ord = order[ds];
    for (let k = 0; k < n && next[ds] < ord.length; k++) tbl.add(item(ord[next[ds]++]));
  }
  $(".r5").addEventListener("click", () => read(5));
  $(".rall").addEventListener("click", () => read(999));
  $(".clear").addEventListener("click", () => { next.h29 = next.sn = 0; tbl.clear(); });
  $(".hb-ds").addEventListener("click", (e) => {
    const b = e.target.closest("[data-d]"); if (!b) return;
    ds = b.dataset.d; root.querySelectorAll("[data-d]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    $(".hb-cal").hidden = ds !== "sn"; drawMain(); drawPlot(); nums();
  });
  $(".hb-cal").addEventListener("click", (e) => {
    const b = e.target.closest("[data-m]"); if (!b) return;
    MB = +b.dataset.m; root.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    tbl.rows.forEach((r) => { if (r.ds === "sn") Object.assign(r, (() => { const s = ds; ds = "sn"; const it = item(r.i); ds = s; return it; })()); });
    if (tbl.rows.length) tbl.add(tbl.rows.pop()); else { drawMain(); drawPlot(); nums(); }
  });
  nums();
  if (L.demo) {
    read(24);
    ds = "sn"; root.querySelectorAll("[data-d]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.d === "sn")));
    $(".hb-cal").hidden = false; read(40);
  }
})();
