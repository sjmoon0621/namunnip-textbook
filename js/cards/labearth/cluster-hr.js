/* 카드: 성단의 H–R도 — Gaia DR3 측광을 절대 등급으로 고쳐 네 성단을 겹치고, 전향점으로 나이를 어림 */
(() => {
  const root = document.getElementById("card-labearth-cluster-hr");
  if (!root || !window.NMClusters) return;
  const { C, F, fit, axes } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const cbO = $(".others"), cbM = $(".msl");
  const CL = {
    pleiades: { name: "플레이아데스", mu: 5.67, E: 0.04, col: "#2f6fb5" },
    m67: { name: "M67", mu: 9.7, E: 0.04, col: C.forest },
    tuc47: { name: "47 Tuc", mu: 13.27, E: 0.04, col: C.warn },
    m13: { name: "M13", mu: 14.26, E: 0.02, col: "#8a4fb0" },
  };
  const XR = [-0.4, 3.2], YR = [-4, 14];
  let key = "pleiades", mark = null;
  const stars = {};
  for (const k in CL) {
    const a = NMClusters[k], c = CL[k], o = [];
    for (let i = 0; i < a.length; i += 2) o.push([a[i + 1] - 1.339 * c.E, a[i] - c.mu - 2.74 * c.E]);
    stars[k] = o;
  }
  const ms = (window.NMDwarfs || []).filter((r) => r[5] != null && r[6] != null).map((r) => [r[5], r[6]]).sort((a, b) => a[0] - b[0]);
  const age = (MG) => { const Lum = 10 ** (-0.4 * (MG - 4.67)), M = Lum ** (1 / 3.5); return { Lum, M, t: 10 * M ** -2.5 }; };

  const cv = $(".chr-cmd");
  const cmd = fit(cv, () => drawCmd());
  const pl = fit($(".chr-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "cl", label: "성단" }, { key: "MG", label: "M_G", res: 0.1 }, { key: "c", label: "(BP−RP)₀", res: 0.01 },
    { key: "Lum", label: "L/L☉", res: 0.1 }, { key: "M", label: "M/M☉", res: 0.01 }, { key: "t", label: "나이 (억 년)", res: 0.1 },
  ], () => drawPlot());
  const box = () => ({ x0: 40, y0: 22, w: cmd.size.w - 54, h: cmd.size.h - 58 });
  const Xf = (b, v) => b.x0 + (v - XR[0]) / (XR[1] - XR[0]) * b.w, Yf = (b, v) => b.y0 + (v - YR[0]) / (YR[1] - YR[0]) * b.h;

  function drawCmd() {
    const { ctx } = cmd, { w } = cmd.size; if (!w) return;
    ctx.clearRect(0, 0, w, cmd.size.h);
    const b = box(), X = (v) => Xf(b, v), Y = (v) => Yf(b, v);
    axes(ctx, { ...b, X, Y, xt: [-0.4, 0, 0.5, 1, 1.5, 2, 2.5, 3].map((v) => [v, String(v)]), yt: [-4, -2, 0, 2, 4, 6, 8, 10, 12, 14].map((v) => [v, String(v)]), xlabel: "고유 색 (BP − RP)₀", ylabel: "절대 등급 M_G (위가 밝음)" });
    ctx.save(); ctx.beginPath(); ctx.rect(b.x0, b.y0, b.w, b.h); ctx.clip();
    if (cbM.checked && ms.length) {
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 6; ctx.globalAlpha = 0.25; ctx.beginPath();
      ms.forEach(([c, m], i) => (i ? ctx.lineTo(X(c), Y(m)) : ctx.moveTo(X(c), Y(m)))); ctx.stroke(); ctx.globalAlpha = 1;
    }
    const order = Object.keys(CL).filter((k) => k !== key).concat(key);
    for (const k of order) {
      if (k !== key && !cbO.checked) continue;
      ctx.fillStyle = CL[k].col; ctx.globalAlpha = k === key ? 0.8 : 0.16;
      for (const [c, m] of stars[k]) { ctx.beginPath(); ctx.arc(X(c), Y(m), k === key ? 1.7 : 1.3, 0, 7); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    if (mark) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; const x = X(mark.c), y = Y(mark.m);
      ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x + 10, y); ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 10); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.stroke();
    }
    ctx.restore();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "right";
    let ty = b.y0 + 14;
    for (const k in CL) { ctx.fillStyle = CL[k].col; ctx.globalAlpha = k === key || cbO.checked ? 1 : 0.35; ctx.fillText(`● ${CL[k].name} (${stars[k].length})`, b.x0 + b.w - 4, ty); ty += 15; }
    ctx.globalAlpha = 1;
    if (!mark) { ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("도표를 눌러 전향점을 표시하세요", b.x0 + 6, b.y0 + b.h - 8); }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const b = { x0: 48, y0: 20, w: w - 62, h: h - 54 };
    const o = L.plot(ctx, b, { pts: [], xr: [-3, 6], yr: [-1.5, 2.5], model: (x) => Math.log10(age(x).t), xlabel: "전향점 M_G", ylabel: "log (나이 / 10억 년)" });
    for (const r of tbl.rows) { ctx.fillStyle = CL[r.key].col; ctx.beginPath(); ctx.arc(o.X(r.MG), o.Y(Math.log10(r.t / 10)), 4, 0, 7); ctx.fill(); }
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("점선: 어림식 (태양 금속 함량)", b.x0 + 6, b.y0 + 12);
  }

  function nums() {
    if (!mark) { $(".n-m").textContent = "—"; $(".n-c").textContent = "—"; $(".n-t").textContent = "—"; return; }
    const a = age(mark.m);
    $(".n-m").textContent = mark.m.toFixed(1); $(".n-c").textContent = mark.c.toFixed(2);
    $(".n-t").textContent = a.t >= 1 ? a.t.toFixed(1) + " × 10⁹ 년" : (a.t * 10).toFixed(1) + " × 10⁸ 년";
  }
  cv.addEventListener("click", (e) => {
    const r = cv.getBoundingClientRect(), b = box(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (x < b.x0 || x > b.x0 + b.w || y < b.y0 || y > b.y0 + b.h) return;
    mark = { c: XR[0] + (x - b.x0) / b.w * (XR[1] - XR[0]), m: YR[0] + (y - b.y0) / b.h * (YR[1] - YR[0]) };
    nums(); drawCmd();
  });
  function record() {
    if (!mark) return;
    const a = age(mark.m);
    tbl.add({ key, cl: CL[key].name, MG: mark.m, c: mark.c, Lum: a.Lum, M: a.M, t: a.t * 10 });
  }
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => tbl.clear());
  [cbO, cbM].forEach((el) => el.addEventListener("change", drawCmd));
  $(".chr-cl").addEventListener("click", (e) => {
    const b = e.target.closest("[data-c]"); if (!b) return;
    key = b.dataset.c; root.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    mark = null; nums(); drawCmd();
  });
  nums();
  if (L.demo) {
    [["pleiades", -1.3, -0.12], ["m67", 3.0, 0.72], ["tuc47", 3.9, 0.62], ["m13", 3.7, 0.52]].forEach(([k, m, c]) => { key = k; mark = { m, c }; record(); });
    key = "m13"; root.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.c === "m13")));
    mark = { m: 3.7, c: 0.52 }; nums(); drawCmd();
  }
})();
