/* 카드: 성간 소광과 색초과 — 분광형으로 고유 색·절대 등급을 얻고, 관측 색과의 차(색초과)로 소광을 빼 거리를 바로잡는다 */
(() => {
  const root = document.getElementById("card-labearth-extinction");
  if (!root || !window.NMDwarfs) return;
  const { C, F, fit, axes } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  /* 표준표: B0V~K5V 중 값이 있는 행 [분광형, M_V, (B−V)0] */
  const TAB = NMDwarfs.filter((r) => r[3] != null && r[4] != null && /^(B|A|F|G|K[0-5])/.test(r[0]) && !r[0].includes(".")).map((r) => [r[0], r[3], r[4]]);
  const FIELD = {
    hi: { E: (d) => 0.025 * d / 1000 },
    plane: { E: (d) => 0.22 * d / 1000 + (d > 420 ? 0.62 : 0) },   // 약 420 pc에 성간운 (모식)
  };
  const RV_TRUE = 3.1;
  let fd = "hi", rv = 3.1, pv = "ed", cnt = { hi: 0, plane: 0 };

  function makeStar() {
    for (let k = 0; k < 200; k++) {
      const i = Math.floor(Math.random() * TAB.length), [spt, Mv, bv0] = TAB[i];
      const d = Math.random() < 0.5 ? 100 * 25 ** Math.random() : 100 + 2400 * Math.random();   // 100~2,500 pc
      const E = FIELD[fd].E(d), V = Mv + 5 * Math.log10(d) - 5 + RV_TRUE * E;
      if (V > 14.5) continue;
      const j = Math.random() < 0.3 ? Math.min(TAB.length - 1, Math.max(0, i + (Math.random() < 0.5 ? -1 : 1))) : i;   // 분류 오차
      return { spt: TAB[j][0], Mv: TAB[j][1], bv0: TAB[j][2], V: L.measure(V, { sd: 0.02, res: 0.01 }), BV: L.measure(bv0 + E, { sd: 0.02, res: 0.01 }) };
    }
    return null;
  }
  const calc = (s) => {
    const E = s.BV - s.bv0, A = rv * E;
    return { E, A, dn: 10 ** ((s.V - s.Mv + 5) / 5), dc: 10 ** ((s.V - s.Mv - A + 5) / 5) };
  };

  const cmd = fit($(".ex-cmd"), () => drawCmd());
  const pl = fit($(".ex-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "name", label: "별" }, { key: "spt", label: "분광형" }, { key: "V", label: "V", res: 0.01 }, { key: "BV", label: "B−V", res: 0.01 },
    { key: "bv0", label: "(B−V)₀", res: 0.01 }, { key: "E", label: "E", res: 0.01 }, { key: "A", label: "A_V", res: 0.01 },
    { key: "dn", label: "d 무시 (pc)", res: 1 }, { key: "dc", label: "d 보정 (pc)", res: 1 },
  ], () => { drawCmd(); drawPlot(); nums(); });
  const rows = () => tbl.rows.filter((r) => r.fd === fd);

  function drawCmd() {
    const { ctx } = cmd, { w, h } = cmd.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const b = { x0: 40, y0: 20, w: w - 54, h: h - 54 }, XR = [-0.4, 1.8], YR = [3, 15];
    const X = (v) => b.x0 + (v - XR[0]) / (XR[1] - XR[0]) * b.w, Y = (v) => b.y0 + (v - YR[0]) / (YR[1] - YR[0]) * b.h;
    axes(ctx, { ...b, X, Y, xt: [-0.4, 0, 0.4, 0.8, 1.2, 1.6].map((v) => [v, String(v)]), yt: [3, 6, 9, 12, 15].map((v) => [v, String(v)]), xlabel: "B − V", ylabel: "V (위가 밝음)" });
    ctx.save(); ctx.beginPath(); ctx.rect(b.x0, b.y0, b.w, b.h); ctx.clip();
    for (const r of rows()) {
      const x0 = X(r.bv0), y0 = Y(r.V - r.A), x1 = X(r.BV), y1 = Y(r.V);
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x0, y0, 3, 0, 7); ctx.stroke();
      ctx.strokeStyle = C.warn; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(x1, y1, 3, 0, 7); ctx.fill();
    }
    ctx.restore();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillStyle = C.ink3; ctx.fillText("○ 티끌이 없을 때 (고유 색)", b.x0 + b.w - 4, b.y0 + 12);
    ctx.fillStyle = C.warn; ctx.fillText("● 관측 — 화살표: 어두워지고 붉어짐", b.x0 + b.w - 4, b.y0 + 27);
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const b = { x0: 48, y0: 20, w: w - 62, h: h - 54 }, rs = rows();
    if (pv === "ed") {
      L.plot(ctx, b, { pts: rs.map((r) => ({ x: r.dc, y: r.E })), xr: [0, 3000], yr: [-0.1, 1.4], xlabel: "보정 거리 (pc)", ylabel: "색초과 E(B−V)" });
    } else {
      const o = L.plot(ctx, b, { pts: rs.map((r) => ({ x: r.dc, y: r.dn })), xr: [0, 3000], yr: [0, 9000], xlabel: "보정 거리 (pc)", ylabel: "소광 무시 거리 (pc)" });
      ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(o.X(0), o.Y(0)); ctx.lineTo(o.X(3000), o.Y(3000)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("점선: 두 거리가 같을 때", b.x0 + b.w - 4, b.y0 + 12);
    }
  }
  function nums() {
    const rs = rows();
    $(".n-n").textContent = rs.length;
    $(".n-e").textContent = rs.length ? L.stats(rs.map((r) => r.E)).mean.toFixed(2) : "—";
    $(".n-r").textContent = rs.length ? "평균 " + L.stats(rs.map((r) => r.dn / r.dc)).mean.toFixed(2) + "배" : "—";
  }
  function observe() {
    const s = makeStar(); if (!s) return;
    cnt[fd]++;
    tbl.add({ fd, name: (fd === "hi" ? "H" : "P") + cnt[fd], ...s, ...calc(s) });
  }
  $(".obs1").addEventListener("click", observe);
  $(".obs5").addEventListener("click", () => { for (let i = 0; i < 5; i++) observe(); });
  $(".clear").addEventListener("click", () => { cnt = { hi: 0, plane: 0 }; tbl.clear(); });
  const sel = (sel_, attr, cb) => $(sel_).addEventListener("click", (e) => {
    const b = e.target.closest(`[${attr}]`); if (!b) return;
    $(sel_).querySelectorAll(`[${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); cb(b.getAttribute(attr));
  });
  sel(".ex-fd", "data-f", (v) => { fd = v; drawCmd(); drawPlot(); nums(); });
  sel(".ex-pv", "data-v", (v) => { pv = v; drawPlot(); });
  sel(".ex-rv", "data-r", (v) => {
    rv = +v; tbl.rows.forEach((r) => Object.assign(r, calc(r)));
    if (tbl.rows.length) tbl.add(tbl.rows.pop());   // 표를 다시 그린다
  });
  nums();
  if (L.demo) {
    for (let i = 0; i < 8; i++) observe();
    fd = "plane"; root.querySelectorAll("[data-f]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.f === "plane")));
    for (let i = 0; i < 18; i++) observe();
  }
})();
