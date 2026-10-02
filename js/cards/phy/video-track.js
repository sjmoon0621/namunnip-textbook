/* 카드: 동영상 한 편으로 수레의 가속도를 잴 수 있을까? — 프레임별 위치 찍기, x–t·v–t, 기울기 */
(() => {
  const root = document.getElementById("card-phy-video-track");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sF = $(".f"), sT = $(".th"), DT = 0.1, LEN = 2.0, X0 = 0.05;
  const marks = new Map();   // 프레임 → 찍은 위치 (m)
  const acc = () => 9.8 * Math.sin(+sT.value * Math.PI / 180);
  const truePos = (f) => X0 + 0.5 * acc() * (f * DT) ** 2;
  const tbl = L.table($(".tbl-host"), [{ key: "f", label: "프레임" }, { key: "t", label: "t (s)", res: 0.01 }, { key: "x", label: "x (m)", res: 0.001 }, { key: "v", label: "구간 v (m/s)", res: 0.01 }]);
  const fr = fit($(".vt-frame"), () => drawFrame()), pl = fit($(".vt-plot"), () => drawPlot());
  let geo = null;
  function drawFrame() {
    const { ctx } = fr, { w, h } = fr.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#e9e6dc"; ctx.fillRect(0, 0, w, h);
    const x0 = 30, x1 = w - 30, y0 = h * 0.42, y1 = h * 0.42 + (x1 - x0) * 0.12;   // 화면에서는 기울기를 일정하게 그림 (카메라가 빗면과 함께 기울었다고 봄)
    const P = (m) => [x0 + (x1 - x0) * m / LEN, y0 + (y1 - y0) * m / LEN];
    geo = { P, x0, x1, y0, y1 };
    ctx.strokeStyle = "#7a6a50"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    // 자
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
    for (let c = 0; c <= 200; c += 5) { const [x, y] = P(c / 100); const len = c % 50 === 0 ? 12 : c % 10 === 0 ? 8 : 4; ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.lineTo(x, y + 6 + len); ctx.stroke(); if (c % 50 === 0) ctx.fillText(c + " cm", x, y + 32); }
    // 수레 (앞 끝이 위치)
    const f = +sF.value, xm = Math.min(LEN, truePos(f)), [cx, cy] = P(xm), ang = Math.atan2(y1 - y0, x1 - x0);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
    ctx.fillStyle = "#3f6fa3"; ctx.fillRect(-46, -22, 46, 16); ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(-36, -4, 5, 0, Math.PI * 2); ctx.arc(-10, -4, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // 찍은 표시들
    marks.forEach((m, k) => { const [x, y] = P(m); ctx.strokeStyle = k === f ? C.warn : "rgba(181,83,47,.45)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y - 30); ctx.lineTo(x, y - 6); ctx.stroke(); });
    ctx.fillStyle = "rgba(0,0,0,.6)"; ctx.fillRect(w - 118, 8, 110, 22); ctx.fillStyle = "#fff"; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`● REC  ${String(f).padStart(2, "0")}/14`, w - 112, 23);
  }
  function rows() {
    const ks = [...marks.keys()].sort((a, b) => a - b);
    return ks.map((k, i) => { const nx = ks[i + 1]; const v = nx === k + 1 ? (marks.get(nx) - marks.get(k)) / DT : null; return { f: String(k), t: k * DT, x: marks.get(k), v: v ?? "—", tv: k * DT + DT / 2 }; });
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = rows(), half = (w - 20) / 2;
    L.plot(ctx, { x0: 40, y0: 18, w: half - 50, h: h - 52 }, { pts: r.map((p) => ({ x: p.t, y: p.x })), xr: [0, 1.5], yr: [0, 2.1], xlabel: "t (s)", ylabel: "x (m)" });
    const vp = r.filter((p) => typeof p.v === "number").map((p) => ({ x: p.tv, y: p.v }));
    const f = vp.length > 2 ? L.linfit(vp.map((p) => p.x), vp.map((p) => p.y)) : null;
    L.plot(ctx, { x0: half + 40, y0: 18, w: half - 50, h: h - 52 }, { pts: vp, fit: f, xr: [0, 1.5], yr: [0, 5], xlabel: "t (s)", ylabel: "v (m/s)" });
    $(".n-a").textContent = f ? `${f.a.toFixed(2)} m/s²` : "점 3개 이상";
    $(".n-th").textContent = `${acc().toFixed(2)} m/s²`;
    $(".n-e").textContent = f ? `${((f.a / acc() - 1) * 100).toFixed(1)}%` : "—";
  }
  function refresh() { tbl.clear(); rows().forEach((r) => tbl.add(r)); drawPlot(); }
  $(".vt-frame").addEventListener("click", (e) => {
    if (!geo) return;
    const r = e.currentTarget.getBoundingClientRect(), x = e.clientX - r.left;
    const m = Math.max(0, Math.min(LEN, (x - geo.x0) / (geo.x1 - geo.x0) * LEN));
    marks.set(+sF.value, Math.round(m * 1000) / 1000); drawFrame(); refresh();
    if (+sF.value < 14 && truePos(+sF.value + 1) <= LEN) { sF.value = +sF.value + 1; upd(); }
  });
  function upd() { $(".f-out").textContent = sF.value; $(".t-out").textContent = (sF.value * DT).toFixed(2); $(".th-out").textContent = sT.value; drawFrame(); drawPlot(); }
  sF.addEventListener("input", upd);
  sT.addEventListener("input", () => { marks.clear(); refresh(); upd(); });
  $(".next").addEventListener("click", () => { if (+sF.value < 14) { sF.value = +sF.value + 1; upd(); } });
  $(".clear").addEventListener("click", () => { marks.clear(); refresh(); drawFrame(); });
  upd();
  if (L.demo) { for (let f = 0; f <= 14; f++) { const x = truePos(f); if (x <= LEN) marks.set(f, Math.round((x + 0.004 * L.gauss()) * 1000) / 1000); } sF.value = 8; refresh(); upd(); }
})();
