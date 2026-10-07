/* 카드: 섀플리의 방법 — Harris 목록의 구상 성단 (l, b, R)을 직교 좌표로 바꿔 무게중심으로 은하 중심까지의 거리 R₀를 구한다 */
(() => {
  const root = document.getElementById("card-labearth-shapley");
  if (!root || !window.NMGlobulars) return;
  const { C, F, fit, axes } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const cbExt = $(".noext"), cbFar = $(".far");
  const GC = NMGlobulars;
  const order = GC.map((_, i) => i).sort(() => Math.random() - 0.5);
  let next = 0, vw = "xz", pv = "l";
  const rad = Math.PI / 180;

  function xyz(r) {
    const R = r.R0 * (cbExt.checked ? 10 ** (0.2 * 3.1 * (r.E || 0)) : 1);
    const cb = Math.cos(r.b * rad);
    return { R, X: R * cb * Math.cos(r.l * rad), Y: R * cb * Math.sin(r.l * rad), Z: R * Math.sin(r.b * rad) };
  }
  const used = () => tbl.rows.filter((r) => !(cbFar.checked && r.R > 40));

  const map = fit($(".sh-map"), () => drawMap());
  const pl = fit($(".sh-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "name", label: "성단" }, { key: "l", label: "l (°)", res: 0.1 }, { key: "b", label: "b (°)", res: 0.1 }, { key: "R", label: "R (kpc)", res: 0.1 },
    { key: "X", label: "X", res: 0.1 }, { key: "Y", label: "Y", res: 0.1 }, { key: "Z", label: "Z", res: 0.1 },
  ], () => { drawMap(); drawPlot(); nums(); });

  function cen() {
    const u = used(); if (!u.length) return null;
    const m = (k) => u.reduce((s, r) => s + r[k], 0) / u.length;
    const xs = u.map((r) => r.X).sort((a, b) => a - b);
    return { n: u.length, X: m("X"), Y: m("Y"), Z: m("Z"), med: xs[Math.floor(xs.length / 2)] };
  }

  function drawMap() {
    const { ctx } = map, { w, h } = map.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const b = { x0: 40, y0: 22, w: w - 54, h: h - 58 }, XR = [-15, 35], VR = [-25, 25];
    const X = (v) => b.x0 + (v - XR[0]) / (XR[1] - XR[0]) * b.w, Y = (v) => b.y0 + b.h - (v - VR[0]) / (VR[1] - VR[0]) * b.h;
    const vk = vw === "xz" ? "Z" : "Y";
    axes(ctx, { ...b, X, Y, xt: [-10, 0, 10, 20, 30].map((v) => [v, String(v)]), yt: [-20, -10, 0, 10, 20].map((v) => [v, String(v)]), xlabel: "X (kpc, 은하 중심 방향 →)", ylabel: `${vk} (kpc${vw === "xz" ? ", 북은극 ↑" : ", 회전 방향 ↑"})` });
    ctx.save(); ctx.beginPath(); ctx.rect(b.x0, b.y0, b.w, b.h); ctx.clip();
    // 은하 원반의 대략 크기 (모식, 반지름 15 kpc)
    ctx.fillStyle = "rgba(116,171,102,.10)";
    if (vw === "xz") ctx.fillRect(X(8.2 - 15), Y(0.4), X(8.2 + 15) - X(8.2 - 15), Y(-0.4) - Y(0.4));
    else { ctx.beginPath(); ctx.ellipse(X(8.2), Y(0), X(15) - X(0), Y(0) - Y(15), 0, 0, 7); ctx.fill(); }
    let out = 0;
    ctx.fillStyle = C.forest;
    for (const r of used()) {
      const px = X(r.X), py = Y(r[vk]);
      if (px < b.x0 || px > b.x0 + b.w || py < b.y0 || py > b.y0 + b.h) { out++; continue; }
      ctx.beginPath(); ctx.arc(px, py, 2.6, 0, 7); ctx.fill();
    }
    ctx.fillStyle = C.amber; ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(X(0), Y(0), 5, 0, 7); ctx.fill(); ctx.stroke();
    const c = cen();
    if (c) {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2; const cx = X(c.X), cy = Y(c[vk]);
      ctx.beginPath(); ctx.moveTo(cx - 9, cy - 9); ctx.lineTo(cx + 9, cy + 9); ctx.moveTo(cx + 9, cy - 9); ctx.lineTo(cx - 9, cy + 9); ctx.stroke();
    }
    ctx.restore();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillStyle = C.ink2;
    ctx.fillText("태양", X(0) - 8, Y(0) - 8);
    ctx.textAlign = "right"; ctx.fillStyle = C.warn; ctx.fillText("✕ 성단들의 평균 위치", b.x0 + b.w - 4, b.y0 + 14);
    if (out) { ctx.fillStyle = C.ink3; ctx.fillText(`그림 밖 ${out}개 (평균에는 포함)`, b.x0 + b.w - 4, b.y0 + 29); }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const b = { x0: 44, y0: 20, w: w - 58, h: h - 54 }, u = used();
    if (pv === "l") L.hist(ctx, b, u.map((r) => (r.l > 180 ? r.l - 360 : r.l)), { xr: [-180, 180], bins: 12, xlabel: "은경 l (°, 0 = 궁수자리 방향)" });
    else {
      const o = L.hist(ctx, b, u.map((r) => r.X), { xr: [-20, 40], bins: 15, xlabel: "X (kpc)" });
      const c = cen();
      if (c) { ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(o.X(c.X), b.y0); ctx.lineTo(o.X(c.X), b.y0 + b.h); ctx.stroke(); }
      ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "right"; if (c) ctx.fillText(`평균 X = ${c.X.toFixed(1)} kpc`, b.x0 + b.w - 4, b.y0 + 12);
    }
  }
  function nums() {
    const c = cen();
    $(".n-n").textContent = c ? c.n : 0;
    $(".n-x").textContent = c ? c.X.toFixed(1) + " kpc" : "—";
    $(".n-m").textContent = c ? c.med.toFixed(1) + " kpc" : "—";
  }
  function read(n) {
    for (let k = 0; k < n && next < order.length; k++) {
      const [name, l, b, R0, E] = GC[order[next++]];
      const r = { name, l, b, R0, E };
      Object.assign(r, xyz(r));
      tbl.add(r);
    }
  }
  function redo() { tbl.rows.forEach((r) => Object.assign(r, xyz(r))); if (tbl.rows.length) tbl.add(tbl.rows.pop()); else { drawMap(); drawPlot(); nums(); } }
  $(".r10").addEventListener("click", () => read(10));
  $(".rall").addEventListener("click", () => read(order.length));
  $(".clear").addEventListener("click", () => { next = 0; tbl.clear(); });
  cbExt.addEventListener("change", redo);
  cbFar.addEventListener("change", () => { drawMap(); drawPlot(); nums(); });
  const sel = (s, attr, cb) => $(s).addEventListener("click", (e) => {
    const b = e.target.closest(`[${attr}]`); if (!b) return;
    $(s).querySelectorAll(`[${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); cb(b.getAttribute(attr));
  });
  sel(".sh-vw", "data-w", (v) => { vw = v; drawMap(); });
  sel(".sh-pv", "data-v", (v) => { pv = v; drawPlot(); });
  nums();
  if (L.demo) read(60);
})();
