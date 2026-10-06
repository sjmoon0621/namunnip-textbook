/* 카드: 염산을 10배씩 묽히면 pH는 끝없이 커질까? — 자동 이온화를 넣은 정확한 pH, 적양배추 지시약 색 */
(() => {
  const root = document.getElementById("card-chem-dilute-ph");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const KW = 1e-14;
  let st = "hcl", n = 0;
  const phOf = (k) => { const c = 0.1 / 10 ** k; if (st === "hcl") { const h = (c + Math.sqrt(c * c + 4 * KW)) / 2; return -Math.log10(h); } const oh = (c + Math.sqrt(c * c + 4 * KW)) / 2; return 14 + Math.log10(oh); };
  // 적양배추(안토시아닌) 색: pH 1 빨강 … 13 노랑
  const CAB = [[1, [200, 30, 60]], [3, [210, 60, 120]], [5, [140, 60, 150]], [7, [90, 70, 170]], [8, [50, 90, 190]], [10, [40, 150, 130]], [12, [120, 180, 60]], [13, [220, 210, 60]]];
  const cab = (p) => { for (let i = 1; i < CAB.length; i++) if (p <= CAB[i][0]) { const [p0, c0] = CAB[i - 1], [p1, c1] = CAB[i], u = Math.max(0, (p - p0) / (p1 - p0)); return `rgb(${c0.map((v, j) => Math.round(v + (c1[j] - v) * u)).join(",")})`; } return "rgb(220,210,60)"; };
  const tbl = L.table($(".tbl-host"), [{ key: "k", label: "희석 횟수" }, { key: "c", label: "농도 (M)" }, { key: "p", label: "pH 측정", res: 0.01 }, { key: "t", label: "pH 이론", res: 0.01 }], () => drawPlot());
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());
  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const tw = Math.min(40, (w - 40) / 10), gap = (w - 40) / 9;
    for (let k = 0; k <= 8; k++) {
      const x = 20 + k * gap, top = 30, bot = h - 34, done = k <= n;
      if (done) { ctx.fillStyle = $(".cab").checked ? cab(phOf(k)) : "rgba(220,235,245,.9)"; ctx.fillRect(x, top + 20, tw, bot - top - 20); }
      ctx.strokeStyle = done ? C.ink2 : C.rule; ctx.lineWidth = 1.2; ctx.strokeRect(x, top, tw, bot - top);
      ctx.fillStyle = done ? C.ink : C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(`10⁻${k + 1}`, x + tw / 2, top - 8); if (done) ctx.fillText(phOf(k).toFixed(2), x + tw / 2, bot + 14);
    }
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("위: 산(또는 염기)의 농도 M · 아래: pH", 20, h - 4);
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = L.plot(ctx, { x0: 40, y0: 18, w: w - 54, h: h - 52 }, { pts: tbl.rows.map((q) => ({ x: +q.k, y: q.p })), model: (k) => phOf(k), xr: [0, 8], yr: [0, 14], xlabel: "희석 횟수", ylabel: "pH" });
    ctx.strokeStyle = C.warn; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(r.X(0), r.Y(st === "hcl" ? 1 : 13)); ctx.lineTo(r.X(8), r.Y(st === "hcl" ? 9 : 5)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("빨간 점선: 물의 이온화를 무시한 단순 예측", 46, 30);
  }
  function rec() { const t = phOf(n); tbl.add({ k: String(n), c: (0.1 / 10 ** n).toExponential(0), p: L.measure(t, { sd: 0.03, res: 0.01 }), t }); }
  $(".step").addEventListener("click", () => { if (n < 8) { n++; rec(); draw(); } });
  $(".clear").addEventListener("click", () => { n = 0; tbl.clear(); rec(); draw(); });
  $(".cab").addEventListener("change", draw);
  $(".st").addEventListener("click", (e) => { const b = e.target.closest("[data-s]"); if (!b) return; st = b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); $(".clear").click(); });
  rec(); draw();
  if (L.demo) { for (let k = 0; k < 8; k++) $(".step").click(); $(".cab").checked = true; draw(); }
})();
