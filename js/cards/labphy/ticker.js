/* 카드: 종이테이프에 찍힌 점만으로 가속도를 구할 수 있을까? — 시간기록계(60 Hz), 구간 길이 → v–t 직선 */
(() => {
  const root = document.getElementById("card-labphy-ticker");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sTh = $(".th"), cDrag = $(".drag");
  const G = 9.8, HZ = 60, TRACK = 1000;   // 테이프에 찍히는 이동 거리 1000 mm
  let nSeg = 6, run = null, seg = 0;

  const tbl = L.table($(".tbl-host"), [
    { key: "i", label: "구간", res: 1 }, { key: "t", label: "가운데 시각 t (s)", res: 0.001 },
    { key: "dx", label: "Δx (cm)", res: 0.1 }, { key: "v", label: "v = Δx/Δt (m/s)", res: 0.001 },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());

  const aTrue = () => { const th = +sTh.value * Math.PI / 180; return G * Math.sin(th) - 0.002 * G * Math.cos(th) - (cDrag.checked ? 0.06 : 0); };

  function newRun() {
    const a = aTrue(), ph = Math.random() / HZ, dots = [];
    for (let k = 0; ; k++) {
      const t = k / HZ + ph, x = 500 * a * t * t + (k ? 0.1 * L.gauss() : 0);
      if (x > TRACK) break;
      dots.push(Math.max(0, x));
    }
    let s = 0; while (s < dots.length - 1 && dots[s + 1] - dots[s] < 1) s++;
    run = { a, dots, s, n: nSeg, el: 0, end: Math.sqrt(2 * TRACK / 1000 / a) };
    seg = 0; tbl.clear();
  }
  const segDots = (i) => { if (!run) return null; const a = run.s + i * run.n, b = a + run.n; return b < run.dots.length ? [a, b] : null; };
  const done = () => run && run.el >= run.end;

  function measureSeg() {
    if (!done()) return;
    const ab = segDots(seg); if (!ab) return;
    const dxmm = L.snap(run.dots[ab[1]] - run.dots[ab[0]] + 0.35 * L.gauss(), 1), dt = run.n / HZ;
    tbl.add({ i: seg + 1, t: (seg + 0.5) * dt, dx: dxmm / 10, v: dxmm / 1000 / dt });
    seg++; draw();
  }

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const th = +sTh.value * Math.PI / 180, ux = Math.cos(th), uy = Math.sin(th);
    // 빗면과 수레
    const x0 = 52, y0 = 26, len = (w - 110) / ux, sc = len / TRACK;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 - 30 * ux, y0 + 14 - 30 * uy); ctx.lineTo(x0 + (len + 40) * ux, y0 + 14 + (len + 40) * uy); ctx.stroke();
    ctx.fillStyle = "#e7e6dd"; ctx.beginPath(); ctx.moveTo(x0 - 30 * ux, y0 + 16 - 30 * uy); ctx.lineTo(x0 + (len + 40) * ux, y0 + 16 + (len + 40) * uy); ctx.lineTo(x0 + (len + 40) * ux, y0 + 16 + (len + 40) * uy + 4); ctx.lineTo(x0 - 30 * ux, y0 + 20 + (len + 40) * uy); ctx.closePath(); ctx.fill();
    const el = run ? Math.min(run.el, run.end) : 0, sNow = run ? 500 * run.a * el * el : 0;
    const cxp = x0 + 18 * ux + sNow * sc * ux, cyp = y0 + 18 * uy + sNow * sc * uy;
    // 기록계
    ctx.save(); ctx.translate(x0 - 14 * ux, y0 - 14 * uy); ctx.rotate(th);
    ctx.fillStyle = C.ink; ctx.fillRect(-16, -2, 26, 16); ctx.fillStyle = C.amber; ctx.fillRect(-12, 2, 5, 5); ctx.restore();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("시간기록계 60 Hz", 8, 12);
    // 테이프 (기록계 → 수레 뒤)
    ctx.strokeStyle = "#d8cfa8"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 - 8 * ux, y0 + 4 - 8 * uy); ctx.lineTo(cxp - 4 * ux, cyp + 4 - 4 * uy); ctx.stroke();
    ctx.save(); ctx.translate(cxp, cyp); ctx.rotate(th);
    ctx.fillStyle = "#3f6fa3"; ctx.fillRect(-4, -6, 40, 14); ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.arc(4, 10, 4, 0, Math.PI * 2); ctx.arc(28, 10, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();

    // 전체 테이프
    const ty = Math.round(h * 0.5), tx0 = 20, tw = w - 40, tsc = tw / TRACK;
    ctx.fillStyle = "#f4efd9"; ctx.strokeStyle = "#cfc6a2"; ctx.lineWidth = 1; ctx.fillRect(tx0, ty - 7, tw, 14); ctx.strokeRect(tx0 + .5, ty - 6.5, tw - 1, 13);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("종이테이프 (출발 → 끝)", tx0, ty - 12);
    if (run) {
      const ab = segDots(seg);
      if (ab && done()) { ctx.fillStyle = "rgba(224,160,42,.35)"; ctx.fillRect(tx0 + run.dots[ab[0]] * tsc, ty - 7, (run.dots[ab[1]] - run.dots[ab[0]]) * tsc, 14); }
      ctx.fillStyle = C.ink;
      run.dots.forEach((x, k) => { if (x <= sNow + 0.01) { ctx.beginPath(); ctx.arc(tx0 + x * tsc, ty, 1.1, 0, Math.PI * 2); ctx.fill(); } });
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1;
      for (let i = 0; i <= seg; i++) { const d = run.s + i * run.n; if (d < run.dots.length && done()) { const x = Math.round(tx0 + run.dots[d] * tsc) + .5; ctx.beginPath(); ctx.moveTo(x, ty - 9); ctx.lineTo(x, ty + 9); ctx.stroke(); } }
    }

    // 확대 + 자
    const zy = Math.round(h * 0.66), zh = h - zy - 6;
    ctx.strokeStyle = C.rule; ctx.strokeRect(10.5, zy + .5, w - 21, zh - 1);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    const ab = run && done() ? segDots(seg) : null;
    if (!ab) { ctx.textAlign = "center"; ctx.fillText(!run ? "수레를 놓아 테이프를 찍으세요" : !done() ? "수레가 내려가는 중…" : "테이프 끝까지 다 재었습니다", w / 2, zy + zh / 2 + 4); return; }
    ctx.fillText(`${seg + 1}번째 구간 확대 (자로 재기)`, 18, zy + 13);
    const xa = run.dots[ab[0]], xb = run.dots[ab[1]], span = xb - xa, zs = Math.min(6, (w - 70) / (span + 4)), zx0 = 30 - xa * zs + 4;
    const ry = zy + 26;
    ctx.fillStyle = "#f4efd9"; ctx.fillRect(18, ry - 7, w - 36, 14);
    ctx.fillStyle = C.ink;
    for (let k = ab[0] - 1; k <= ab[1] + 1; k++) { if (k < 0 || k >= run.dots.length) continue; const x = zx0 + run.dots[k] * zs; if (x < 18 || x > w - 18) continue; ctx.beginPath(); ctx.arc(x, ry, 2.2, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.2; [xa, xb].forEach((x) => { const px = zx0 + x * zs; ctx.beginPath(); ctx.moveTo(px, ry - 9); ctx.lineTo(px, ry + 12); ctx.stroke(); });
    // 자: 0을 구간 첫 점에 맞춤
    const rY = ry + 12, mmStep = zs >= 3 ? 1 : 2, lab = zs * 10 >= 22 ? 1 : zs * 20 >= 22 ? 2 : 5;
    ctx.fillStyle = "#fbf6e6"; ctx.fillRect(18, rY, w - 36, Math.min(26, zh - 40)); ctx.strokeStyle = C.ink3; ctx.strokeRect(18.5, rY + .5, w - 37, Math.min(26, zh - 40));
    ctx.strokeStyle = C.ink2; ctx.fillStyle = C.ink2; ctx.font = `9px ${F.mono}`; ctx.textAlign = "center";
    for (let mm = 0; zx0 + (xa + mm) * zs < w - 20; mm += mmStep) {
      const x = Math.round(zx0 + (xa + mm) * zs) + .5, big = mm % 10 === 0, mid = mm % 5 === 0;
      ctx.beginPath(); ctx.moveTo(x, rY); ctx.lineTo(x, rY + (big ? 9 : mid ? 6 : 3.5)); ctx.stroke();
      if (big && (mm / 10) % lab === 0 && x < w - 44) ctx.fillText(String(mm / 10), x, rY + 19);
    }
    ctx.textAlign = "right"; ctx.fillText("cm", w - 22, rY + 19);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pts = tbl.rows.map((r) => ({ x: r.t, y: r.v }));
    const ft = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)) : null;
    const tm = run ? Math.max(0.5, Math.ceil(run.end * 10) / 10) : 2;
    L.plot(ctx, { x0: 46, y0: 20, w: w - 60, h: h - 54 }, { pts, fit: ft, xr: [0, tm], yr: [0, run ? Math.max(0.5, run.a * run.end * 1.1) : 2], xlabel: "t (s)", ylabel: "v (m/s)" });
    $(".n-a").textContent = ft ? `${ft.a.toFixed(3)} ± ${ft.sa.toFixed(3)} m/s²` : "점 2개 이상";
    $(".n-b").textContent = ft ? `${ft.b.toFixed(3)} m/s` : "—";
  }

  function upd() {
    $(".th-out").textContent = (+sTh.value).toFixed(1);
    $(".n-th").textContent = `${(G * Math.sin(+sTh.value * Math.PI / 180)).toFixed(3)} m/s²`;
    draw();
  }
  sTh.addEventListener("input", upd);
  root.querySelectorAll(".seg .chip").forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll(".seg .chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    nSeg = +b.dataset.n;
    if (run) { run.n = nSeg; seg = 0; tbl.clear(); draw(); }
  }));
  $(".run").addEventListener("click", () => { newRun(); drawPlot(); });
  $(".cut").addEventListener("click", measureSeg);
  $(".clear").addEventListener("click", () => { seg = 0; tbl.clear(); draw(); });
  loop($(".cv-wide"), (dt) => { if (run && run.el < run.end) { run.el += dt; draw(); } });
  upd();
  if (L.demo) { newRun(); run.el = run.end; for (let i = 0; i < 10; i++) measureSeg(); upd(); }
})();
