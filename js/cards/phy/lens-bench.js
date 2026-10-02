/* 카드: 스크린에 맺힌 상만으로 초점 거리를 잴 수 있을까? — 광학대, 선명도, 1/a–1/b 직선 맞춤 */
(() => {
  const root = document.getElementById("card-phy-lens-bench");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sA = $(".a"), sB = $(".b");
  let f = 12.4;
  const tbl = L.table($(".tbl-host"), [{ key: "a", label: "a (cm)", res: 0.1 }, { key: "b", label: "b (cm)", res: 0.1 }, { key: "ia", label: "1/a (1/cm)", res: 0.0001 }, { key: "ib", label: "1/b (1/cm)", res: 0.0001 }], () => drawPlot());
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());
  const bTrue = () => { const a = +sA.value; return a > f ? 1 / (1 / f - 1 / a) : Infinity; };
  function blur() { const a = +sA.value, b = +sB.value, bt = bTrue(); if (!isFinite(bt)) return 1; return Math.min(1, Math.abs(b - bt) / bt * 4 * (a / (a - f)) * 0.3 + 0.0); }
  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sA.value, b = +sB.value, sc = (w - 120) / 150, lx = 30 + 60 * sc, y = h * 0.55;
    ctx.fillStyle = "#8d8d92"; ctx.fillRect(10, y + 30, w - 20, 6);
    ctx.fillStyle = C.ink3; ctx.font = `9px ${F.mono}`; ctx.textAlign = "center";
    for (let c = 0; c <= 150; c += 10) { const x = 30 + c * sc; ctx.fillRect(x, y + 36, 1, 5); if (c % 50 === 0) ctx.fillText(c, x, y + 50); }
    // 촛불 (물체)
    const ox = lx - a * sc; ctx.fillStyle = "#efe2b8"; ctx.fillRect(ox - 4, y - 22, 8, 52); ctx.fillStyle = "#f0a030"; ctx.beginPath(); ctx.moveTo(ox - 5, y - 22); ctx.quadraticCurveTo(ox, y - 44, ox + 5, y - 22); ctx.fill();
    // 렌즈
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(lx, y - 10, 6, 44, 0, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = "rgba(110,164,230,.2)"; ctx.fill();
    // 스크린
    const sx = lx + b * sc; ctx.fillStyle = "#fff"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.fillRect(sx - 2, y - 60, 4, 90); ctx.strokeRect(sx - 2, y - 60, 4, 90);
    // 광선: 촛불 끝에서 렌즈 위·아래 가장자리로, 렌즈 뒤에서는 상의 점을 향해 (스크린에서 멈춤)
    const bt = bTrue(), yA = y - 10, ix = lx + bt * sc, iy = yA + 30 * bt / a;
    ctx.strokeStyle = "rgba(240,140,30,.6)"; ctx.lineWidth = 1;
    [-38, 38].forEach((dy) => {
      const ly = yA + dy; ctx.beginPath(); ctx.moveTo(ox, yA - 30); ctx.lineTo(lx, ly);
      if (isFinite(bt)) { const k = (sx - lx) / (ix - lx); ctx.lineTo(sx, ly + (iy - ly) * k); }
      ctx.stroke();
    });
    ctx.setLineDash([2, 3]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(20, yA); ctx.lineTo(w - 110, yA); ctx.stroke(); ctx.setLineDash([]);
    // 스크린에 보이는 상 (오른쪽 창)
    const bl = blur(), m = isFinite(bt) ? b / a : 0, wx = w - 92, wy = 14;
    ctx.fillStyle = "#fbfbf8"; ctx.strokeStyle = C.rule; ctx.fillRect(wx, wy, 80, 80); ctx.strokeRect(wx, wy, 80, 80);
    ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, 80, 80); ctx.clip();
    ctx.filter = `blur(${(bl * 12).toFixed(1)}px)`;
    const hh = Math.min(60, 30 * (bt / a || 0.01)); ctx.fillStyle = `rgba(240,160,48,${0.9 - bl * 0.6})`;
    ctx.beginPath(); ctx.moveTo(wx + 34, wy + 40); ctx.quadraticCurveTo(wx + 40, wy + 40 + hh * 0.8, wx + 46, wy + 40); ctx.fill();   // 거꾸로 선 불꽃
    ctx.fillStyle = `rgba(200,180,120,${0.8 - bl * 0.6})`; ctx.fillRect(wx + 37, wy + 40 - hh * 0.9, 6, hh * 0.9);
    ctx.restore(); ctx.filter = "none";
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("스크린", wx + 40, wy + 92);
    $(".n-s").textContent = bl < 0.03 ? "아주 선명" : bl < 0.12 ? "조금 흐림" : !isFinite(bt) ? "상이 맺히지 않음" : "흐림";
    $(".n-m").textContent = isFinite(bt) ? `${(b / a).toFixed(2)}배 (거꾸로)` : "—";
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pts = tbl.rows.map((r) => ({ x: r.ia, y: r.ib }));
    const ft = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)) : null;
    L.plot(ctx, { x0: 50, y0: 18, w: w - 64, h: h - 52 }, { pts, fit: ft, xr: [0, 0.1], yr: [0, 0.1], xlabel: "1/a (1/cm)", ylabel: "1/b (1/cm)" });
    $(".n-f").textContent = ft ? `${(1 / ft.b).toFixed(1)} cm` : "점 2개 이상";
  }
  const upd = () => { $(".a-out").textContent = (+sA.value).toFixed(1); $(".b-out").textContent = (+sB.value).toFixed(1); draw(); };
  [sA, sB].forEach((el) => el.addEventListener("input", upd));
  $(".rec").addEventListener("click", () => { const a = +sA.value, b = L.snap(+sB.value + 0.3 * L.gauss(), 0.5); tbl.add({ a, b, ia: 1 / a, ib: 1 / b }); });
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".lens2").addEventListener("click", (e) => { f = f === 12.4 ? 18.7 : 12.4; e.currentTarget.setAttribute("aria-pressed", String(f !== 12.4)); tbl.clear(); draw(); });
  upd();
  if (L.demo) { [20, 25, 30, 40, 50, 60].forEach((a) => { sA.value = a; const b = L.snap(bTrue() + 0.3 * L.gauss(), 0.5); tbl.add({ a, b, ia: 1 / a, ib: 1 / b }); }); sA.value = 30; sB.value = L.snap(bTrue(), 0.5); upd(); }
})();
