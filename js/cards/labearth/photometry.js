/* 카드: CCD 차등 측광 — 같은 사진의 비교성으로 기기 등급을 표준 V, B−V로 바꾸고, 구름·대기량의 영향이 지워지는지 확인 */
(() => {
  const root = document.getElementById("card-labearth-photometry");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sAlt = $(".alt"), cbCloud = $(".cloud");
  /* 예시 시야: [이름, x, y (0~1), 표준 V, 표준 B−V]. 표적 T의 값은 카드가 숨겨 둔 참값 */
  const STARS = [["C1", 0.2, 0.3, 10.62, 0.12], ["C2", 0.72, 0.22, 11.48, 0.58], ["C3", 0.36, 0.74, 12.05, 1.21], ["C4", 0.84, 0.7, 12.9, 0.35], ["C5", 0.55, 0.5, 11.1, 0.89], ["표적", 0.12, 0.62, 12.37, 0.65]];
  const KV = 0.22, KB = 0.36, EV = -0.04, EB = 0.06, ZV = 22.5, ZB = 22.3, T_EXP = 30, NPIX = 50, SKY = 300, RN = 10;
  let frame = 0, pv = "tr", last = null;
  const frames = [];

  const X = () => 1 / Math.sin(+sAlt.value * Math.PI / 180);
  /* 측광 한 번: 카운트(포아송·배경 잡음) → 기기 등급 */
  function phot(m0) {
    const N = T_EXP * 10 ** (-0.4 * m0), sd = Math.sqrt(N + NPIX * (SKY + RN * RN));
    const Nm = Math.max(1, N + sd * L.gauss());
    return { N: Nm, m: -2.5 * Math.log10(Nm / T_EXP) };
  }
  const dwarfs = (window.NMDwarfs || []).filter((r) => r[4] != null).map((r) => [r[4], r[1]]).sort((a, b) => a[0] - b[0]);
  const teff = (bv) => {
    if (!dwarfs.length || bv < dwarfs[0][0] || bv > dwarfs[dwarfs.length - 1][0]) return NaN;
    for (let i = 1; i < dwarfs.length; i++) if (bv <= dwarfs[i][0]) { const [x0, y0] = dwarfs[i - 1], [x1, y1] = dwarfs[i]; return y0 + (y1 - y0) * (bv - x0) / (x1 - x0 || 1); }
    return NaN;
  };

  const ccd = fit($(".ph-ccd"), () => drawCcd());
  const pl = fit($(".ph-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "f", label: "프레임" }, { key: "s", label: "별" }, { key: "X", label: "X", res: 0.01 }, { key: "N", label: "N_V", res: 1 },
    { key: "v", label: "v", res: 0.001 }, { key: "b", label: "b", res: 0.001 }, { key: "V", label: "V 표준", res: 0.01 }, { key: "BV", label: "B−V 표준", res: 0.01 },
  ], () => { solveAll(); drawPlot(); nums(); });

  function shoot() {
    frame++;
    const x = X(), cl = cbCloud.checked ? Math.abs(0.25 * L.gauss()) : 0;
    const rows = STARS.map(([s, , , V, BV]) => {
      const B = V + BV, pv_ = phot(V - ZV + KV * x + EV * BV + cl), pb = phot(B - ZB + KB * x + EB * BV + cl * 1.03);
      const tgt = s === "표적";
      return { f: frame, s, X: x, N: pv_.N, v: pv_.m, b: pb.m, V: tgt ? "?" : V, BV: tgt ? "?" : BV, _cl: cl };
    });
    last = { f: frame, cl, X: x, stars: rows };
    rows.forEach((r) => tbl.add(r));
  }
  /* 프레임 하나의 변환식과 표적 값 */
  function solve(f) {
    const rs = tbl.rows.filter((r) => r.f === f), cs = rs.filter((r) => r.s !== "표적"), t = rs.find((r) => r.s === "표적");
    if (cs.length < 2 || !t) return null;
    const fc = L.linfit(cs.map((r) => r.b - r.v), cs.map((r) => r.BV));
    const fv = L.linfit(cs.map((r) => r.BV), cs.map((r) => r.V - r.v));
    if (!fc || !fv) return null;
    const BV = fc.a * (t.b - t.v) + fc.b, V = t.v + fv.a * BV + fv.b;
    return { f, X: t.X, V, BV, fv, cs, t };
  }
  function solveAll() { frames.length = 0; [...new Set(tbl.rows.map((r) => r.f))].forEach((f) => { const s = solve(f); if (s) frames.push(s); }); }

  function drawCcd() {
    const { ctx } = ccd, { w, h } = ccd.size; if (!w) return;
    ctx.fillStyle = "#0d0f0c"; ctx.fillRect(0, 0, w, h);
    const fade = last ? 10 ** (-0.4 * (KV * last.X + last.cl)) : 10 ** (-0.4 * KV * X());
    if (cbCloud.checked) { ctx.fillStyle = "rgba(170,175,180,.10)"; ctx.fillRect(0, 0, w, h); }
    for (const [s, x, y, V] of STARS) {
      const px = 20 + x * (w - 40), py = 14 + y * (h - 28), r = 2 + 2.6 * Math.max(0, 13.5 - V) * Math.sqrt(fade);
      const gr = ctx.createRadialGradient(px, py, 0, px, py, r * 2.2);
      gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.4, "rgba(230,235,255,.7)"); gr.addColorStop(1, "rgba(230,235,255,0)");
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(px, py, r * 2.2, 0, 7); ctx.fill();
      ctx.strokeStyle = s === "표적" ? C.amber : C.sprout; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(px, py, 13, 0, 7); ctx.stroke();
      ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.arc(px, py, 19, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = s === "표적" ? C.amber : C.sprout; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(s, px + 22, py + 4);
    }
    ctx.fillStyle = "#aab"; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillText(last ? `프레임 ${last.f} · X = ${last.X.toFixed(2)} · 30 s` : "아직 찍지 않음", w - 8, h - 8);
    ctx.textAlign = "left"; ctx.fillText("실선 원: 별빛 구경 · 점선 고리 안쪽: 하늘 배경", 8, h - 8);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 50, y0: 20, w: w - 64, h: h - 54 };
    const note = (t, y = 12, col = C.warn) => { ctx.fillStyle = col; ctx.font = `11px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(t, box.x0 + box.w - 4, box.y0 + y); };
    if (pv === "tr") {
      const s = frames[frames.length - 1];
      const pts = s ? s.cs.map((r) => ({ x: r.BV, y: r.V - r.v })) : [];
      L.plot(ctx, box, { pts, fit: s ? s.fv : null, xr: [0, 1.4], xlabel: "표준 B − V", ylabel: "V − v (등급)" });
      if (s) note(`기울기 ε = ${s.fv.a.toFixed(3)} · 영점 ζ = ${s.fv.b.toFixed(3)}`);
    } else if (pv === "tg") {
      const pts = frames.map((s) => ({ x: s.f, y: s.V }));
      const f0 = frames[0];
      const abs = f0 ? frames.map((s) => ({ x: s.f, y: s.t.v + f0.fv.a * s.BV + f0.fv.b })) : [];
      const all = pts.concat(abs).map((p) => p.y);
      const yr = all.length ? [Math.min(12.2, ...all) - 0.05, Math.max(12.55, ...all) + 0.05] : [12, 12.8];
      const o = L.plot(ctx, box, { pts, xr: [0, Math.max(6, frame + 1)], yr, xlabel: "프레임 번호", ylabel: "표적 V" });
      ctx.fillStyle = C.amber; abs.forEach((p) => { ctx.beginPath(); ctx.rect(o.X(p.x) - 3, o.Y(p.y) - 3, 6, 6); ctx.fill(); });
      ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillStyle = C.forest; ctx.fillText("● 차등 측광 (같은 사진의 비교성)", box.x0 + 6, box.y0 + 12); ctx.fillStyle = C.amber; ctx.fillText("■ 1번 프레임 영점을 빌려 씀", box.x0 + 6, box.y0 + 27);
    } else {
      const c1 = tbl.rows.filter((r) => r.s === "C1"), pts = c1.map((r) => ({ x: r.X, y: r.v }));
      const fk = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)) : null;
      L.plot(ctx, box, { pts, fit: fk, xr: [1, 3], xlabel: "대기량 X", ylabel: "C1의 기기 등급 v" });
      if (fk) note(`기울기 k_V = ${fk.a.toFixed(3)} ± ${fk.sa.toFixed(3)} 등급/대기량`);
    }
  }

  function nums() {
    const s = frames[frames.length - 1];
    $(".n-f").textContent = s ? s.f : "—";
    $(".n-v").textContent = s ? s.V.toFixed(2) : "—";
    $(".n-bv").textContent = s ? s.BV.toFixed(2) : "—";
    const T = s ? teff(s.BV) : NaN;
    $(".n-t").textContent = Number.isFinite(T) ? "약 " + Math.round(T / 50) * 50 + " K" : "—";
  }
  const upd = () => { $(".h-out").textContent = sAlt.value; $(".x-out").textContent = X().toFixed(2); drawCcd(); };
  sAlt.addEventListener("input", upd);
  cbCloud.addEventListener("change", drawCcd);
  $(".shot").addEventListener("click", () => { shoot(); drawCcd(); });
  $(".clear").addEventListener("click", () => { frame = 0; last = null; tbl.clear(); drawCcd(); });
  $(".ph-pv").addEventListener("click", (e) => {
    const b = e.target.closest("[data-v]"); if (!b) return;
    pv = b.dataset.v; root.querySelectorAll("[data-v]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  upd();
  if (L.demo) {
    [75, 55, 40].forEach((a) => { sAlt.value = a; shoot(); });
    cbCloud.checked = true;
    [32, 25].forEach((a) => { sAlt.value = a; shoot(); });
    sAlt.value = 25; upd(); root.querySelector('[data-v="tg"]').click();
  }
})();
