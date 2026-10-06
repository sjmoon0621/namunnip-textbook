/* 카드: 귀리 싹의 끝을 가리면 왜 빛 쪽으로 굽지 않을까? — 다윈·보이센 옌센·웬트 실험 재현, 굴중성과 클리노스탯, 굽은 각도–시간 */
(() => {
  const root = document.getElementById("card-labbio-tropism");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  // A: 3시간 뒤 다다르는 굽은 각(°), lag: 굽기 시작까지(분). 모식값
  const TRT = {
    light: [
      { k: "ctrl", n: "그대로", A: 40, lag: 20 },
      { k: "cut", n: "끝 자르기", A: 0, lag: 20 },
      { k: "cap", n: "끝에 불투명 덮개", A: 2, lag: 20 },
      { k: "band", n: "끝 아래에 덮개", A: 38, lag: 20 },
      { k: "gel", n: "끝과 아래 사이 젤라틴", A: 33, lag: 30 },
      { k: "mshade", n: "그늘 쪽에 운모", A: 2, lag: 20 },
      { k: "mlight", n: "빛 쪽에 운모", A: 35, lag: 20 },
      { k: "agar", n: "끝 올렸던 한천을 왼쪽에 (어둠)", A: 24, lag: 30 },
      { k: "agar0", n: "빈 한천을 왼쪽에 (어둠)", A: 0, lag: 30 },
    ],
    grav: [
      { k: "shoot", n: "줄기 눕히기", A: 65, lag: 15 },
      { k: "root", n: "뿌리 눕히기", A: 55, lag: 15 },
      { k: "clino", n: "클리노스탯 위 뿌리", A: 0, lag: 15 },
      { k: "nocap", n: "뿌리골무 자른 뿌리", A: 4, lag: 15 },
    ],
  };
  const SER = ["#3b7c2a", "#b5532f", "#1f4e8c", "#e0a02a", "#8a4fa0", "#5d5d61"];
  const TIMES = [0, 30, 60, 90, 120, 150, 180];
  let mode = "light", trt = "ctrl", run = null;

  const curve = (t, o) => (t <= o.lag ? 0 : o.A * (1 - Math.exp(-(t - o.lag) / 70)) / (1 - Math.exp(-(180 - o.lag) / 70)));
  const find = (m, k) => TRT[m].find((o) => o.k === k);
  const tbl = L.table($(".tbl-host"), [
    { key: "m", label: "자극" }, { key: "n", label: "처리" }, { key: "a60", label: "60분", res: 1 }, { key: "a120", label: "120분", res: 1 }, { key: "a180", label: "180분 (°)", res: 1 },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function experiment(m, k) {
    const o = find(m, k), g = 1 + 0.12 * L.gauss();
    const ang = TIMES.map((t) => (t === 0 ? 0 : L.snap(curve(t, o) * g + 1.5 * L.gauss(), 1)));
    return { m, k, n: o.n, o, g, ang };
  }
  const rowOf = (ex) => ({ m: ex.m === "light" ? "빛" : "중력", n: ex.n, a60: ex.ang[2], a120: ex.ang[4], a180: ex.ang[6], ang: ex.ang });

  function buildChips() {
    const host = $(".trt");
    host.innerHTML = `<span class="mono small dim">처리</span>` + TRT[mode].map((o) => `<button class="chip" data-t="${o.k}" aria-pressed="${o.k === trt}">${o.n}</button>`).join("");
  }

  // 휘는 막대(자엽초·뿌리) 그리기: 시작점, 시작 방향(라디안), 길이, 굽는 각(라디안, +는 반시계)
  function stalk(ctx, x, y, dir, len, bend, wid, col) {
    const n = 24, pts = [[x, y]];
    let a = dir, px = x, py = y;
    for (let i = 1; i <= n; i++) {
      if (i > n * 0.35) a += bend / (n * 0.65);
      px += Math.cos(a) * len / n; py -= Math.sin(a) * len / n; pts.push([px, py]);
    }
    ctx.strokeStyle = col; ctx.lineWidth = wid; ctx.lineCap = "round"; ctx.beginPath();
    pts.forEach(([u, v], i) => (i ? ctx.lineTo(u, v) : ctx.moveTo(u, v))); ctx.stroke();
    return { tip: pts[n], dirTip: a, pts };
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = run ? run.ex.m : mode, k = run ? run.ex.k : trt, o = find(m, k);
    const t = run ? Math.min(180, run.sim) : 0;
    const ang = run ? curve(t, o) * run.ex.g : 0, rad = ang * Math.PI / 180;
    ctx.lineCap = "butt";
    if (m === "light") {
      const dark = k === "agar" || k === "agar0";
      if (!dark) {
        // 오른쪽 빛
        ctx.fillStyle = "rgba(255,214,90,.25)"; ctx.fillRect(w * 0.62, 20, w * 0.38 - 10, h - 60);
        ctx.fillStyle = "#ffd25a"; ctx.beginPath(); ctx.arc(w - 26, h * 0.32, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#d9a520"; ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) { const yy = h * 0.22 + i * 22; ctx.beginPath(); ctx.moveTo(w - 46, yy); ctx.lineTo(w - 84, yy); ctx.lineTo(w - 76, yy - 5); ctx.moveTo(w - 84, yy); ctx.lineTo(w - 76, yy + 5); ctx.stroke(); }
      } else { ctx.fillStyle = "rgba(40,42,38,.12)"; ctx.fillRect(10, 10, w - 20, h - 40); }
      // 흙
      const gx = w * 0.4, gy = h - 34;
      ctx.fillStyle = "#8b6b4a"; ctx.fillRect(gx - 60, gy, 120, 14);
      const stub = k === "cut" || k === "agar" || k === "agar0";
      const len = stub ? h * 0.42 : h * 0.55;
      const s = stalk(ctx, gx, gy, Math.PI / 2, len, -rad, 12, "#c9d98a");
      const [tx, ty] = s.tip, nx = Math.cos(s.dirTip), ny = -Math.sin(s.dirTip);
      const at = (back) => [tx - nx * back, ty - ny * back];
      if (!stub) { ctx.fillStyle = "#c9d98a"; ctx.beginPath(); ctx.arc(tx, ty, 6, 0, Math.PI * 2); ctx.fill(); }
      if (k === "cap") { ctx.fillStyle = "#2c2c2c"; ctx.beginPath(); ctx.arc(tx, ty, 9, 0, Math.PI * 2); ctx.fill(); }
      if (k === "band") { const [bx, by] = at(32); ctx.save(); ctx.translate(bx, by); ctx.rotate(-s.dirTip); ctx.fillStyle = "#2c2c2c"; ctx.fillRect(-12, -9, 24, 18); ctx.restore(); }
      if (k === "gel") { const [bx, by] = at(12); ctx.save(); ctx.translate(bx, by); ctx.rotate(-s.dirTip); ctx.fillStyle = "#f0dc8a"; ctx.fillRect(-3, -8, 6, 16); ctx.restore(); }
      if (k === "mshade" || k === "mlight") {
        const [bx, by] = at(12); ctx.save(); ctx.translate(bx, by); ctx.rotate(-s.dirTip);
        ctx.fillStyle = "#9aa3a8"; ctx.fillRect(-1.5, k === "mshade" ? -12 : 0, 3, 12);   // 회전 좌표: +y가 빛 쪽(오른쪽), −y가 그늘 쪽
        ctx.restore();
      }
      if (k === "agar" || k === "agar0") { ctx.save(); ctx.translate(tx, ty); ctx.rotate(-s.dirTip + Math.PI / 2); ctx.fillStyle = k === "agar" ? "#e9c86a" : "#eee6c8"; ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.fillRect(-7, -9, 7, 9); ctx.strokeRect(-7, -9, 7, 9); ctx.restore(); }
      // 각도기
      ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(gx, gy - len * 0.35); ctx.lineTo(gx, gy - len * 0.35 - 70); ctx.stroke(); ctx.setLineDash([]);
    } else {
      // 굴중성: 눕힌 유식물 (씨앗 왼쪽, 기관이 오른쪽으로 뻗음)
      const sx = w * 0.18, sy = h * 0.5;
      ctx.fillStyle = "rgba(40,42,38,.08)"; ctx.fillRect(10, 10, w - 20, h - 40);
      ctx.fillStyle = "#d8c27a"; ctx.beginPath(); ctx.ellipse(sx, sy, 16, 11, 0, 0, Math.PI * 2); ctx.fill();
      const isShoot = k === "shoot";
      const sg = isShoot ? 1 : -1;
      const s = stalk(ctx, sx + 14, sy, 0, w * 0.5, sg * rad, isShoot ? 10 : 6, isShoot ? "#c9d98a" : "#efe6cf");
      if (!isShoot && k !== "nocap") { const [tx, ty] = s.tip; ctx.fillStyle = "#d9c79b"; ctx.beginPath(); ctx.arc(tx, ty, 4, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx + 14, sy); ctx.lineTo(sx + 14 + w * 0.56, sy); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillText("↓ 중력", 18, h - 40);
      if (k === "clino") {
        ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(sx, sy, 30, 0.3 + (run ? run.sim / 10 : 0), 0.3 + (run ? run.sim / 10 : 0) + 4.6); ctx.stroke();
        ctx.fillStyle = C.forest; ctx.fillText("클리노스탯 회전", sx - 40, sy + 48);
      }
    }
    ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(o.n, 16, 26);
    ctx.font = `12px ${F.mono}`; ctx.fillStyle = C.ink2;
    ctx.fillText(run ? `${t.toFixed(0)} 분 · 굽은 각 ${Math.round(ang)}°` : "관찰 대기", 16, 44);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 20, w: w - 58, h: h - 54 };
    const show = tbl.rows.slice(-6);
    const ymax = Math.max(45, ...show.flatMap((r) => r.ang)) * 1.5;
    L.plot(ctx, box, { pts: [], xr: [0, 190], yr: [-5, ymax], xlabel: "시간 (분)", ylabel: "굽은 각도 (°)" });
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    show.forEach((r, i) => {
      const pts = TIMES.map((t, j) => ({ x: t, y: r.ang[j] }));
      const P = L.plot(ctx, box, { pts, xr: [0, 190], yr: [-5, ymax], color: SER[i] });
      ctx.strokeStyle = SER[i]; ctx.lineWidth = 1.2; ctx.beginPath(); pts.forEach((p, j) => (j ? ctx.lineTo(P.X(p.x), P.Y(p.y)) : ctx.moveTo(P.X(p.x), P.Y(p.y)))); ctx.stroke();
      ctx.fillStyle = SER[i]; ctx.fillText(`${r.m} · ${r.n}`, box.x0 + 8, box.y0 + 12 + i * 14);
    });
    if (!show.length) { ctx.fillStyle = C.ink3; ctx.fillText("기록한 처리가 여기에 선으로 그려집니다 (최근 6개)", box.x0 + 8, box.y0 + 12); }
  }

  loop($(".cv-wide"), (dt) => {
    if (run && !run.done) {
      run.sim += dt * 30;
      if (run.sim >= 181) { run.done = true; tbl.add(rowOf(run.ex)); }
    }
    drawApp();
  });
  $(".mode").addEventListener("click", (e) => {
    const b = e.target.closest("[data-m]"); if (!b || (run && !run.done)) return;
    mode = b.dataset.m; trt = TRT[mode][0].k; root.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    buildChips(); run = null; drawApp();
  });
  $(".trt").addEventListener("click", (e) => {
    const b = e.target.closest("[data-t]"); if (!b || (run && !run.done)) return;
    trt = b.dataset.t; root.querySelectorAll("[data-t]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); run = null; drawApp();
  });
  $(".run").addEventListener("click", () => { if (run && !run.done) return; run = { ex: experiment(mode, trt), sim: 0, done: false }; });
  $(".clear").addEventListener("click", () => { run = null; tbl.clear(); drawApp(); });
  buildChips(); drawApp();
  if (L.demo) {
    ["ctrl", "cut", "cap", "band", "mshade"].forEach((k) => { tbl.add(rowOf(experiment("light", k))); });
    tbl.add(rowOf(experiment("light", "agar")));
    trt = "band"; buildChips(); run = { ex: experiment("light", "band"), sim: 180, done: true }; drawApp();
  }
})();
