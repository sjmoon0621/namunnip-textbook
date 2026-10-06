/* 카드: 스크린에 잡히지 않는 상의 위치는 어떻게 잴까? — 오목·볼록 거울, 스크린과 시차법, 1/a–1/b 직선 */
(() => {
  const root = document.getElementById("card-labphy-mirror");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sA = $(".a"), sB = $(".b");
  const FOC = { cc: 14.6, cv: -18.2 }, NAME = { cc: "오목", cv: "볼록" }, M = 95;
  let mode = "cc";
  const tbl = L.table($(".tbl-host"), [{ key: "kind", label: "거울" }, { key: "a", label: "a (cm)", res: 0.1 }, { key: "b", label: "b (cm)", res: 0.1 }, { key: "ia", label: "1/a (1/cm)", res: 0.0001 }, { key: "ib", label: "1/b (1/cm)", res: 0.0001 }, { key: "hp", label: "상 높이 (cm)", res: 0.1 }], () => drawPlot());
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());
  const bTrue = () => { const a = +sA.value, inv = 1 / FOC[mode] - 1 / a; return Math.abs(inv) < 1e-4 ? Infinity : 1 / inv; };

  function state() {
    const b = +sB.value, bt = bTrue();
    if (!isFinite(bt)) return { txt: "상이 아주 멀리", ok: false };
    if (Math.abs(b) < 1) return { txt: "거울에 너무 가까움", ok: false };
    if (bt > 0) {
      if (b < 0) return { txt: "핀과 상이 따로 움직임", ok: false };
      const e = Math.abs(b - bt) / (0.05 * bt + 0.6);
      return { txt: e < 0.5 ? "스크린에 선명한 상" : e < 1.5 ? "조금 흐림" : "흐림", ok: e < 1.5, real: true };
    }
    if (b > 0) return { txt: "스크린에 상 없음", ok: false };
    const e = Math.abs(b - bt) / (0.04 * -bt + 0.4);
    return { txt: e < 0.5 ? "시차 없음 (일치)" : e < 1.5 ? "시차 조금" : "시차 큼", ok: e < 1.5, real: false };
  }

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sA.value, b = +sB.value, bt = bTrue(), f = FOC[mode];
    const sc = (w - 30) / 150, X = (c) => 15 + c * sc, y = h * 0.55, xm = X(M), hp = 14;
    // 광학대와 눈금 (거울에서 잰 거리)
    ctx.fillStyle = "#8d8d92"; ctx.fillRect(10, h - 26, w - 20, 5);
    ctx.fillStyle = C.ink3; ctx.font = `9px ${F.mono}`; ctx.textAlign = "center";
    for (let c = -50; c <= 90; c += 10) { const x = X(M - c); if (x < 10 || x > w - 10) continue; ctx.fillRect(x, h - 21, 1, 4); if (c % 20 === 0) ctx.fillText(c, x, h - 8); }
    ctx.setLineDash([2, 3]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(w - 10, y); ctx.stroke(); ctx.setLineDash([]);
    // 거울
    const k = (mode === "cc" ? -1 : 1) * 0.006, H = Math.min(64, h * 0.4);
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 3; ctx.beginPath();
    for (let d = -H; d <= H; d += 2) { const x = xm + k * d * d; d === -H ? ctx.moveTo(x, y + d) : ctx.lineTo(x, y + d); }
    ctx.stroke(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    for (let d = -H + 4; d <= H; d += 8) { const x = xm + k * d * d; ctx.beginPath(); ctx.moveTo(x + 1, y + d); ctx.lineTo(x + 6, y + d - 5); ctx.stroke(); }
    ctx.fillStyle = C.ink2; ctx.beginPath(); ctx.arc(X(M - f), y, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `10px ${F.mono}`; ctx.fillText("F", X(M - f), y + 14);
    // 물체
    const ox = X(M - a), ty = y - 2 * hp;
    const arrow = (x, y0, y1, col, dash) => { ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.2; ctx.setLineDash(dash ? [4, 3] : []); ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); ctx.setLineDash([]); const s = y1 < y0 ? 1 : -1; ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x - 4, y1 + 7 * s); ctx.lineTo(x + 4, y1 + 7 * s); ctx.fill(); };
    arrow(ox, y, ty, C.amber);
    // 광선
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h - 28); ctx.clip();
    if (isFinite(bt)) {
      const m = -bt / a, ix = X(M - bt), iy = y - Math.max(-h * 0.9, Math.min(h * 0.9, 2 * hp * m));
      [[xm + k * 4 * hp * hp, ty], [xm, y]].forEach(([px, py]) => {
        ctx.strokeStyle = "rgba(240,140,30,.75)"; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(ox, ty); ctx.lineTo(px, py);
        let dx = bt > 0 ? ix - px : px - ix, dy = bt > 0 ? iy - py : py - iy; const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;
        const t = (px - 8) / Math.max(0.05, -dx); ctx.lineTo(px + dx * t, py + dy * t); ctx.stroke();
        if (bt < 0) { ctx.setLineDash([3, 3]); ctx.strokeStyle = "rgba(240,140,30,.5)"; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ix, iy); ctx.stroke(); ctx.setLineDash([]); }
      });
      if (ix > 0 && ix < w) arrow(ix, y, iy, bt > 0 ? C.warn : "rgba(181,83,47,.7)", bt < 0);
    }
    ctx.restore();
    // 스크린 또는 시차 핀
    const bx = X(M - b); ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    if (b > 0) { ctx.fillStyle = "#fff"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.fillRect(bx - 2, y - 46, 4, 62); ctx.strokeRect(bx - 2, y - 46, 4, 62); ctx.fillStyle = C.ink2; ctx.fillText("스크린", bx, y - 52); }
    else { ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, y + 2); ctx.lineTo(bx, y - 44); ctx.stroke(); ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(bx, y - 46, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.fillText("시차 핀", bx, y - 54); }
    const st = state(); $(".n-s").textContent = st.txt;
    $(".n-m").textContent = st.ok && isFinite(bt) ? `${Math.abs(bt / a).toFixed(2)}배, ${st.real ? "거꾸로" : "바로"}` : "—";
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows.filter((r) => r.m === mode), pts = rows.map((r) => ({ x: r.ia, y: r.ib }));
    const ft = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)) : null;
    L.plot(ctx, { x0: 50, y0: 18, w: w - 64, h: h - 52 }, { pts, fit: ft, xr: [0, 0.18], yr: mode === "cc" ? [-0.12, 0.12] : [-0.24, 0], xlabel: "1/a (1/cm)", ylabel: `1/b (1/cm) · ${NAME[mode]} 거울 기록만` });
    $(".n-f").textContent = ft ? `${(1 / ft.b).toFixed(1)} cm` : "점 2개 이상";
  }

  function record() {
    const a = +sA.value, b = L.snap(+sB.value + 0.2 * L.gauss(), 0.5), st = state(), bt = bTrue();
    if (Math.abs(b) < 1) return;
    const hp = st.ok && st.real ? L.measure(-2 * bt / a, { sd: 0.05, res: 0.1 }) : "—";
    tbl.add({ m: mode, kind: NAME[mode], a, b, ia: 1 / a, ib: 1 / b, hp });
  }
  const upd = () => { $(".a-out").textContent = (+sA.value).toFixed(1); $(".b-out").textContent = (+sB.value).toFixed(1); draw(); };
  [sA, sB].forEach((el) => el.addEventListener("input", upd));
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".msel").addEventListener("click", (e) => {
    const bt = e.target.closest("[data-m]"); if (!bt) return;
    mode = bt.dataset.m; root.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x === bt))); upd(); drawPlot();
  });
  upd();
  if (L.demo) {
    const put = (a, sd) => { sA.value = a; sB.value = L.snap(bTrue() + sd * L.gauss(), 0.5); record(); };
    [20, 25, 30, 40, 50, 60].forEach((a) => put(a, 0.4)); [6, 8, 10].forEach((a) => put(a, 0.5));
    mode = "cv"; [10, 20, 30, 45, 60].forEach((a) => put(a, 0.4)); mode = "cc";
    sA.value = 10; sB.value = L.snap(bTrue(), 0.5); upd();
  }
})();
