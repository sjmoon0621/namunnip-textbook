/* 카드: 상을 맺지 못하는 오목 렌즈의 초점 거리는 어떻게 잴까? — 보조 볼록 렌즈법, 허물체, 1/d–1/b 직선 */
(() => {
  const root = document.getElementById("card-labphy-lens2");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sD = $(".d"), sB = $(".b");
  const FC = -14.3, OBJ = 5, CVX = 35, I1 = 50;   // 오목 렌즈 초점 거리(숨김), 위치 (cm)
  let step = 1;
  const tbl = L.table($(".tbl-host"), [{ key: "k", label: "단계" }, { key: "d", label: "d (cm)", res: 0.1 }, { key: "b", label: "b (cm)", res: 0.1 }, { key: "id", label: "1/d (1/cm)", res: 0.0001 }, { key: "ib", label: "1/b (1/cm)", res: 0.0001 }], () => drawPlot());
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());
  const bTrue = () => { const d = +sD.value; return step ? 1 / (1 / d + 1 / FC) : d; };
  const err = () => { const bt = bTrue(); return Math.abs(+sB.value - bt) / (0.04 * bt + 0.5); };

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const d = +sD.value, b = +sB.value, sc = (w - 30) / 145, X = (c) => 15 + c * sc, y = h * 0.5, hp = 14;
    const xc = X(I1 - d), sx = X(I1 - d + b), bt = bTrue();
    ctx.fillStyle = "#8d8d92"; ctx.fillRect(10, h - 26, w - 20, 5);
    ctx.fillStyle = C.ink3; ctx.font = `9px ${F.mono}`; ctx.textAlign = "center";
    for (let c = 0; c <= 140; c += 10) { const x = X(c); ctx.fillRect(x, h - 21, 1, 4); if (c % 20 === 0) ctx.fillText(c, x, h - 8); }
    ctx.setLineDash([2, 3]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(w - 10, y); ctx.stroke(); ctx.setLineDash([]);
    // 물체 (화살표)
    const ox = X(OBJ), ty = y - 2 * hp;
    ctx.strokeStyle = C.amber; ctx.fillStyle = C.amber; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox, ty); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, ty); ctx.lineTo(ox - 4, ty + 7); ctx.lineTo(ox + 4, ty + 7); ctx.fill();
    // 볼록 렌즈
    const x1 = X(CVX), H = Math.min(46, h * 0.32);
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.fillStyle = "rgba(110,164,230,.2)"; ctx.beginPath(); ctx.ellipse(x1, y, 6, H, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // 오목 렌즈
    if (step) {
      ctx.beginPath(); ctx.moveTo(xc - 7, y - H); ctx.lineTo(xc + 7, y - H); ctx.quadraticCurveTo(xc + 1, y, xc + 7, y + H); ctx.lineTo(xc - 7, y + H); ctx.quadraticCurveTo(xc - 1, y, xc - 7, y - H); ctx.fill(); ctx.stroke();
    }
    // 광선: 물체 끝 → 볼록 렌즈 위·아래 → I₁ 끝으로 수렴 (오목 렌즈가 있으면 거기서 꺾여 새 상 끝으로)
    const i1x = X(I1), i1y = y + hp, fy = y + hp * (step ? bt / d : 1), fx = X(I1 - d + bt);
    ctx.strokeStyle = "rgba(240,140,30,.65)"; ctx.lineWidth = 1;
    [-H * 0.8, H * 0.8].forEach((dy) => {
      const ly = y + dy; ctx.beginPath(); ctx.moveTo(ox, ty); ctx.lineTo(x1, ly);
      const at = (x0, y0, tx, tyy, x) => y0 + (tyy - y0) * (x - x0) / (tx - x0);
      if (step) { const cy = at(x1, ly, i1x, i1y, xc); ctx.lineTo(xc, cy); ctx.lineTo(sx, at(xc, cy, fx, fy, sx)); }
      else ctx.lineTo(sx, at(x1, ly, i1x, i1y, sx));
      ctx.stroke();
    });
    // I₁ 표시
    ctx.setLineDash([3, 3]); ctx.strokeStyle = "rgba(181,83,47,.6)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(i1x, y); ctx.lineTo(i1x, i1y); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.fillText("I₁", i1x, i1y + 14);
    // 스크린
    ctx.fillStyle = "#fff"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.fillRect(sx - 2, y - 52, 4, 84); ctx.strokeRect(sx - 2, y - 52, 4, 84);
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText(`스크린: 볼록 렌즈 뒤 ${(I1 - d + b - CVX).toFixed(1)} cm`, 14, 16);
    const e = err(); $(".n-s").textContent = e < 0.5 ? "아주 선명" : e < 1.5 ? "조금 흐림" : "흐림";
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows.filter((r) => typeof r.id === "number"), pts = rows.map((r) => ({ x: r.id, y: r.ib }));
    const ft = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)) : null;
    L.plot(ctx, { x0: 50, y0: 18, w: w - 64, h: h - 52 }, { pts, fit: ft, xr: [0, 0.3], yr: [-0.08, 0.2], xlabel: "1/d (1/cm)", ylabel: "1/b (1/cm)" });
    $(".n-a").textContent = ft ? `${ft.a.toFixed(2)} (이론 1)` : "—";
    $(".n-f").textContent = ft ? `${(1 / ft.b).toFixed(1)} cm` : "점 2개 이상";
  }

  function record() {
    const d = +sD.value, b = L.snap(+sB.value + 0.15 * L.gauss(), 0.5);
    if (step) tbl.add({ k: "② 오목", d, b, id: 1 / d, ib: 1 / b });
    else tbl.add({ k: "① I₁ 확인", d: "—", b: L.snap(I1 - d + b - CVX + 0.3 * L.gauss(), 0.5), id: "—", ib: "—" });
  }
  const upd = () => { $(".d-out").textContent = (+sD.value).toFixed(1); $(".b-out").textContent = (+sB.value).toFixed(1); draw(); };
  [sD, sB].forEach((el) => el.addEventListener("input", upd));
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".ksel").addEventListener("click", (e) => {
    const bt = e.target.closest("[data-k]"); if (!bt) return;
    step = +bt.dataset.k; root.querySelectorAll("[data-k]").forEach((x) => x.setAttribute("aria-pressed", String(x === bt))); upd();
  });
  upd();
  if (L.demo) {
    step = 0; sD.value = 8; sB.value = 8; record(); step = 1;
    [5, 6, 7, 8, 9, 10, 11].forEach((d) => { sD.value = d; sB.value = L.snap(bTrue() + (0.15 + 0.015 * bTrue()) * L.gauss(), 0.5); record(); });
    sD.value = 8; sB.value = L.snap(bTrue(), 0.5); upd();
  }
})();
