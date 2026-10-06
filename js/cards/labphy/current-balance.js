/* 카드: 전자저울 눈금만으로 자기장의 세기를 잴 수 있을까? — 전류 천칭, F = BIL sinθ, 플레밍 왼손 규칙 */
(() => {
  const root = document.getElementById("card-labphy-current-balance");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sI = $(".i"), sN = $(".n"), cRev = $(".rev"), cTilt = $(".tilt");
  /* 참값: 자석 틀 사이 자기장 (화면에 보이지 않음) */
  const B = 0.112, W = 1.4, G = 9.80;
  let len = 8, xmode = "il";
  const tbl = L.table($(".tbl-host"), [
    { key: "i", label: "I (A)", res: 0.01 }, { key: "l", label: "L (cm)", res: 1 }, { key: "n", label: "자석", res: 1 },
    { key: "dm", label: "Δm (g)", res: 0.01 }, { key: "f", label: "F (mN)", res: 0.1 },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());
  const sgn = () => (cRev.checked ? -1 : 1);
  const leff = () => Math.min(len, +sN.value * W);
  /* 저울 눈금 변화 (g) 참값: 자석이 받는 반작용이 아래쪽이면 + */
  const dmTrue = (I = +sI.value) => B * sgn() * I * leff() / 100 * (cTilt.checked ? Math.sin(Math.PI / 3) : 1) / G * 1000;
  function arrow(ctx, x0, y0, x1, y1, col, lw = 2) {
    const a = Math.atan2(y1 - y0, x1 - x0), d = Math.hypot(x1 - x0, y1 - y0);
    if (d < 2) return;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - 7 * Math.cos(a), y1 - 7 * Math.sin(a)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 9 * Math.cos(a - 0.4), y1 - 9 * Math.sin(a - 0.4)); ctx.lineTo(x1 - 9 * Math.cos(a + 0.4), y1 - 9 * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill();
  }
  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const lw = w * 0.62, sc = (lw - 40) / 10.5, cx = lw / 2, I = +sI.value, n = +sN.value, s = sgn();
    /* 전자저울 */
    const by = h - 52;
    ctx.fillStyle = "#e4e5df"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1;
    ctx.fillRect(14, by, lw - 28, 40); ctx.strokeRect(14.5, by + 0.5, lw - 29, 40);
    ctx.fillStyle = "#cfd1c8"; ctx.fillRect(cx - 5 * sc, by - 6, 10 * sc, 6);
    const dm = dmTrue(), disp = L.snap(dm, 0.01);
    ctx.fillStyle = C.night; ctx.fillRect(cx - 52, by + 9, 104, 22);
    ctx.fillStyle = "#9fe08a"; ctx.font = `600 14px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillText(`${(Math.abs(disp) < 0.005 ? 0 : disp).toFixed(2)} g`, cx + 46, by + 25);
    /* 자석 틀 (강철 요크) */
    const hy0 = by - 92, hy1 = by - 6, hw = 9 * sc;
    ctx.fillStyle = "#8e9095"; ctx.fillRect(cx - hw / 2 - 6, hy0, hw + 12, hy1 - hy0);
    ctx.fillStyle = "#b9bbbf"; ctx.fillRect(cx - hw / 2, hy0 + 14, hw, hy1 - hy0 - 26);
    /* 앞쪽 극면: 자석 n개 (N극이 화면 앞을, 즉 자기장이 화면 속으로) */
    const my = hy0 + 22, mh = hy1 - hy0 - 42, mx0 = cx - n * W * sc / 2;
    for (let k = 0; k < n; k++) {
      const x = mx0 + k * W * sc;
      ctx.fillStyle = "#c8463a"; ctx.fillRect(x + 1, my, W * sc - 2, mh);
      ctx.fillStyle = "#fff"; ctx.font = `600 10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("N", x + W * sc / 2, my + 12);
    }
    /* 도선 (기판 위 구리선) + 스탠드에 매단 두 다리 */
    const wy = my + mh / 2 + 4, wx0 = cx - len * sc / 2, wx1 = cx + len * sc / 2;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(wx0, wy); ctx.lineTo(wx0, 18); ctx.moveTo(wx1, wy); ctx.lineTo(wx1, 18); ctx.stroke();
    ctx.fillStyle = "#6b6e74"; ctx.fillRect(Math.min(wx0, cx - 60) - 10, 10, Math.max(wx1 - wx0, 120) + 20, 8);
    ctx.strokeStyle = "#b8742e"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(wx0, wy); ctx.lineTo(wx1, wy); ctx.stroke();
    if (I > 0.01) {
      const a0 = s > 0 ? cx - 26 : cx + 26;
      arrow(ctx, a0, hy0 - 10, a0 + 52 * s, hy0 - 10, C.apple, 2);
      ctx.fillStyle = C.apple; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("I", cx, hy0 - 16);
      /* 도선이 받는 힘 (화살표 길이는 힘에 비례) */
      const fl = Math.min(46, Math.abs(dm) * 22) * (dm > 0 ? -1 : 1);
      arrow(ctx, wx1 + 14, wy, wx1 + 14, wy + fl, C.forest, 2.4);
      ctx.fillStyle = C.forest; ctx.textAlign = "left"; ctx.fillText("F", wx1 + 20, wy + fl / 2 + 4);
    }
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(`자기장: 앞 N극 → 뒤 S극 (화면 속으로)`, 14, h - 2);
    /* 오른쪽: 벡터 그림 (왼손 규칙) */
    const vx = w * 0.66, vw = w - vx - 8, ox = vx + vw * 0.42, oy = h * 0.5;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(vx + 0.5, 8.5, vw, h - 26);
    ctx.fillStyle = C.ink2; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("왼손 규칙", vx + vw / 2, 24);
    const r = Math.min(vw * 0.42, h * 0.3);
    /* B: 화면 속으로 (원근으로 오른쪽 위 짧게) */
    const tilt = cTilt.checked ? -0.5 : 0;
    arrow(ctx, ox, oy, ox + r * 0.55 * Math.cos(-0.7 + tilt), oy + r * 0.55 * Math.sin(-0.7 + tilt), "#3f6fa3", 2);
    ctx.fillStyle = "#3f6fa3"; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText("B 검지", ox + r * 0.42, oy - r * 0.52);
    arrow(ctx, ox, oy, ox + r * s, oy, C.apple, 2);
    ctx.fillStyle = C.apple; ctx.textAlign = s > 0 ? "right" : "left"; ctx.fillText("I 중지", ox + r * s, oy + 16);
    arrow(ctx, ox, oy, ox, oy - r * 0.95 * s, C.forest, 2.4);
    ctx.fillStyle = C.forest; ctx.textAlign = "right"; ctx.fillText("F 엄지", ox - 6, oy - r * 0.95 * s + (s > 0 ? 8 : -2));
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText(s > 0 ? "도선 ↑, 자석·저울 ↓" : "도선 ↓, 자석·저울 ↑", vx + vw / 2, h - 26);
    $(".n-m").textContent = `${disp >= 0 ? "+" : ""}${disp.toFixed(2)} g`;
    $(".n-f").textContent = `${(disp * G).toFixed(1)} mN`;
  }
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const xv = (r) => (xmode === "i" ? r.i : xmode === "l" ? r.l : r.i * r.l / 100);
    const pts = tbl.rows.map((r) => ({ x: xv(r), y: r.f }));
    const ft = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y), true) : null;
    const xl = xmode === "i" ? "I (A)" : xmode === "l" ? "L (cm)" : "I × L (A·m)";
    L.plot(ctx, { x0: 50, y0: 18, w: w - 64, h: h - 52 }, { pts, fit: ft, xlabel: xl, ylabel: "F (mN)" });
    const nb = $(".n-b");
    if (xmode === "il" && ft) nb.textContent = `${(ft.a / 1000).toFixed(4)} ± ${(ft.sa / 1000).toFixed(4)} T`;
    else nb.textContent = xmode === "il" ? "점 2개 이상" : "가로축 I × L에서";
  }
  function record() {
    const I = +sI.value, dm = L.measure(dmTrue(I), { sd: 0.012, rel: 0.004, res: 0.01 });
    tbl.add({ i: sgn() * L.measure(I, { sd: 0.004, res: 0.01 }), l: len, n: +sN.value, dm, f: dm * G });
  }
  const upd = () => { $(".i-out").textContent = (+sI.value).toFixed(2); $(".n-out").textContent = sN.value; draw(); };
  [sI, sN].forEach((el) => el.addEventListener("input", upd));
  [cRev, cTilt].forEach((el) => el.addEventListener("change", upd));
  root.querySelectorAll(".len .chip").forEach((b) => b.addEventListener("click", () => {
    len = +b.dataset.l; root.querySelectorAll(".len .chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b))); draw();
  }));
  root.querySelectorAll(".ax .chip").forEach((b) => b.addEventListener("click", () => {
    xmode = b.dataset.x; root.querySelectorAll(".ax .chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b))); drawPlot();
  }));
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => tbl.clear());
  upd();
  if (L.demo) {
    [0.5, 1, 1.5, 2, 2.5, 3].forEach((i) => { sI.value = i; record(); });
    sI.value = 2;
    [2, 4, 6].forEach((l) => { len = l; record(); });
    len = 8; cRev.checked = true; record(); cRev.checked = false;
    upd(); drawPlot();
  }
})();
