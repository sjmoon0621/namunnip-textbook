/* 카드: 자석을 빨리 떨어뜨리면 코일 전압은 커질까, 오래갈까? — 쌍극자 자석 낙하, ε = −N dΦ/dt, 봉우리 높이와 넓이 */
(() => {
  const root = document.getElementById("card-labphy-induction");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sH = $(".h"), cFr = $(".fric");
  /* 참값: 코일 반지름 a (m), 자기 쌍극자 모멘트 m (A·m²) */
  const MU0 = 4e-7 * Math.PI, A = 0.015, G = 9.80, MOM = { big: 0.75, small: 0.30 }, WIN = 0.040, DT = 1e-4;
  let N = 400, mag = "big", pole = 1, xm = "v", ym = "pk", last = null;
  const tbl = L.table($(".tbl-host"), [
    { key: "h", label: "h (cm)", res: 1 }, { key: "v", label: "v (m/s)", res: 0.01 }, { key: "n", label: "N", res: 1 },
    { key: "mg", label: "자석" }, { key: "pl", label: "아래" }, { key: "p1", label: "ε₁ (V)", res: 0.01 },
    { key: "p2", label: "ε₂ (V)", res: 0.01 }, { key: "ar", label: "넓이 (mV·s)", res: 0.1 },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());
  /* 한 번 떨어뜨린 기록: 코일 가운데를 지나는 순간을 t = 0으로 */
  function drop() {
    const h = +sH.value / 100, g = cFr.checked ? G * 0.72 : G, tc = Math.sqrt(2 * h / g), k = 1.5 * MU0 * MOM[mag] * A * A * N * pole;
    const ts = [], vs = [];
    for (let t = -WIN; t <= WIN + 1e-9; t += DT) {
      const tt = tc + t, z = -h + 0.5 * g * tt * tt, v = g * tt;
      ts.push(t * 1000); vs.push(L.measure(-k * z * v / Math.pow(A * A + z * z, 2.5), { sd: 0.004, res: 0.005 }));
    }
    let imax = 0, imin = 0;
    vs.forEach((v, i) => { if (v > vs[imax]) imax = i; if (v < vs[imin]) imin = i; });
    const i1 = Math.min(imax, imin), i2 = Math.max(imax, imin);
    let ic = i1;
    while (ic < i2 && Math.sign(vs[ic]) === Math.sign(vs[i1])) ic++;
    let ar = 0;
    for (let i = 0; i < ic; i++) ar += vs[i] * DT;
    return { ts, vs, i1, i2, ic, p1: vs[i1], p2: vs[i2], ar: ar * 1000 };
  }
  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    /* 왼쪽: 관, 코일, 자석 */
    const tx = w * 0.15, top = 14, bot = h - 18, cy = bot - 34, sc = (cy - top - 10) / 52, hh = +sH.value;
    ctx.fillStyle = "rgba(160,190,220,.18)"; ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.fillRect(tx - 12, top, 24, bot - top); ctx.strokeRect(tx - 12.5, top + 0.5, 25, bot - top - 1);
    const nt = N / 100;
    ctx.fillStyle = "#b8742e";
    for (let k = 0; k < nt + 2; k++) ctx.fillRect(tx - 18, cy - 9 + k * 18 / (nt + 1), 36, 1.6);
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`${N}회`, tx + 22, cy + 4);
    const my = cy - hh * sc;
    ctx.fillStyle = pole > 0 ? "#3f6fa3" : "#c8463a"; ctx.fillRect(tx - 8, my - 16, 16, 8);
    ctx.fillStyle = pole > 0 ? "#c8463a" : "#3f6fa3"; ctx.fillRect(tx - 8, my - 8, 16, 8);
    ctx.fillStyle = "#fff"; ctx.font = `600 8px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(pole > 0 ? "S" : "N", tx, my - 9.5); ctx.fillText(pole > 0 ? "N" : "S", tx, my - 1.5);
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(tx - 26, my); ctx.lineTo(tx - 16, my); ctx.moveTo(tx - 26, cy); ctx.lineTo(tx - 20, cy); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(tx - 23, my); ctx.lineTo(tx - 23, cy); ctx.stroke();
    ctx.save(); ctx.translate(tx - 28, (my + cy) / 2); ctx.rotate(-Math.PI / 2); ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.fillText(`h = ${hh} cm`, 0, 0); ctx.restore();
    ctx.fillStyle = "#e4e5df"; ctx.fillRect(tx - 22, bot, 44, 6);
    /* 오른쪽: 기록기 화면 */
    const gx = w * 0.33 + 22, gy = 16, gw = w - gx - 10, gh = h - 44;
    const vmax = last ? Math.max(0.5, Math.abs(last.p1), Math.abs(last.p2)) * 1.15 : 2;
    const yt = L.ticks(-vmax, vmax, 4);
    const X = (t) => gx + (t + WIN * 1000) / (2 * WIN * 1000) * gw, Y = (v) => gy + gh / 2 - v / vmax * gh / 2;
    NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [-40, -20, 0, 20, 40].map((v) => [v, String(v)]), yt: yt.filter((v) => Math.abs(v) <= vmax).map((v) => [v, String(+v.toPrecision(3))]), xlabel: "t (ms)", ylabel: "ε (V)" });
    if (!last) {
      ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("‘자석 떨어뜨려 기록’을 누르세요", gx + gw / 2, gy + gh / 2 - 10);
      return;
    }
    /* 첫 봉우리 넓이 칠하기 */
    ctx.save(); ctx.beginPath(); ctx.rect(gx, gy, gw, gh); ctx.clip();
    ctx.fillStyle = "rgba(116,171,102,.3)"; ctx.beginPath(); ctx.moveTo(X(last.ts[0]), Y(0));
    for (let i = 0; i <= last.ic; i++) ctx.lineTo(X(last.ts[i]), Y(last.vs[i]));
    ctx.lineTo(X(last.ts[last.ic]), Y(0)); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.4; ctx.beginPath();
    last.ts.forEach((t, i) => (i ? ctx.lineTo(X(t), Y(last.vs[i])) : ctx.moveTo(X(t), Y(last.vs[i]))));
    ctx.stroke(); ctx.restore();
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`;
    const lab = (i, s) => { const up = last.vs[i] > 0; ctx.textAlign = i === last.i1 ? "right" : "left"; ctx.fillText(s, X(last.ts[i]) + (i === last.i1 ? -6 : 6), Y(last.vs[i]) + (up ? 10 : -4)); };
    lab(last.i1, "① 다가옴"); lab(last.i2, "② 멀어짐");
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pts = tbl.rows.map((r) => ({ x: xm === "v" ? r.v : r.n, y: Math.abs(ym === "pk" ? r.p1 : r.ar) }));
    const ft = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y), ym === "pk") : null;
    L.plot(ctx, { x0: 50, y0: 18, w: w - 64, h: h - 52 }, { pts, fit: ft, xlabel: xm === "v" ? "v = √(2gh) (m/s)" : "N (회)", ylabel: ym === "pk" ? "|ε₁| (V)" : "|∫ε dt| (mV·s)" });
    const u = ym === "pk" ? (xm === "v" ? "V/(m/s)" : "V/회") : (xm === "v" ? "mV·s/(m/s)" : "mV·s/회");
    $(".n-s").textContent = ft ? `${ft.a.toPrecision(3)} ${u}` : "점 2개 이상";
  }
  function record() {
    last = drop();
    const h = +sH.value;
    tbl.add({ h, v: Math.sqrt(2 * G * h / 100), n: N, mg: mag === "big" ? "큰" : "작은", pl: pole > 0 ? "N" : "S", p1: last.p1, p2: last.p2, ar: last.ar });
    $(".n-p").textContent = `${last.p1.toFixed(2)} V`;
    $(".n-a").textContent = `${last.ar.toFixed(1)} mV·s`;
    draw();
  }
  const pick = (sel, b) => root.querySelectorAll(sel).forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
  sH.addEventListener("input", () => { $(".h-out").textContent = sH.value; draw(); });
  root.querySelectorAll(".turns .chip").forEach((b) => b.addEventListener("click", () => { N = +b.dataset.n; pick(".turns .chip", b); draw(); }));
  root.querySelectorAll(".mag .chip[data-m]").forEach((b) => b.addEventListener("click", () => { mag = b.dataset.m; pick(".mag .chip[data-m]", b); }));
  $(".pole").addEventListener("click", (e) => { pole = -pole; e.currentTarget.textContent = pole > 0 ? "N극 ↓" : "S극 ↓"; e.currentTarget.setAttribute("aria-pressed", String(pole < 0)); draw(); });
  root.querySelectorAll(".ax .chip[data-x]").forEach((b) => b.addEventListener("click", () => { xm = b.dataset.x; pick(".ax .chip[data-x]", b); drawPlot(); }));
  root.querySelectorAll(".ax .chip[data-y]").forEach((b) => b.addEventListener("click", () => { ym = b.dataset.y; pick(".ax .chip[data-y]", b); drawPlot(); }));
  cFr.addEventListener("change", draw);
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => { tbl.clear(); last = null; draw(); });
  draw();
  if (L.demo) {
    [5, 10, 15, 20, 30, 40, 50].forEach((h) => { sH.value = h; record(); });
    sH.value = 20; $(".h-out").textContent = "20"; record();
  }
})();
