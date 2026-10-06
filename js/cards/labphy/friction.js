/* 카드: 처음 움직일 때와 끌려가는 동안의 마찰력 — 힘 센서 F–t, 최대 정지·운동 마찰력, F–N 기울기 */
(() => {
  const root = document.getElementById("card-labphy-friction");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sK = $(".k");
  const G = 9.8, BLOCK = 0.25, W = 0.2, DUR = 3.2, HZ = 50;
  // 나무토막 바닥과 각 바닥 사이의 마찰 계수 (예시값)
  const SURF = {
    wood: { name: "나무판", s: 0.45, k: 0.30, col: "#c9a46b" }, rubber: { name: "고무판", s: 0.85, k: 0.65, col: "#4a4a4f" },
    sand: { name: "사포", s: 0.75, k: 0.58, col: "#b89a6a" }, glass: { name: "유리판", s: 0.30, k: 0.21, col: "#bcd6de" },
  };
  let surf = "wood", face = "wide", pull = null, trace = null;

  const tbl = L.table($(".tbl-host"), [
    { key: "sn", label: "바닥" }, { key: "fn", label: "닿는 면" }, { key: "N", label: "N (N)", res: 0.01 },
    { key: "fs", label: "최대 정지 (N)", res: 0.01 }, { key: "fk", label: "운동 (N)", res: 0.01 },
  ], () => drawPlot());
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());
  const normal = () => (BLOCK + W * +sK.value) * G;

  function makeTrace() {
    const S = SURF[surf], N = normal(), area = face === "narrow" ? 1 + 0.01 * L.gauss() : 1;
    const fs = S.s * N * area * (1 + 0.06 * L.gauss()), fk = S.k * N * area * (1 + 0.02 * L.gauss());
    const rate = fs / (0.9 + 0.4 * Math.random()), ts = fs / rate + 0.25, pts = [];
    let slip = 0;
    for (let i = 0; i <= DUR * HZ; i++) {
      const t = i / HZ;
      let f;
      if (t < 0.25) f = 0;
      else if (t < ts) f = (t - 0.25) * rate;
      else { slip = t - ts; f = fk + (fs - fk) * Math.exp(-slip / 0.04) + (0.035 * fk + 0.01) * L.gauss(); }
      pts.push({ t, f: L.snap(Math.max(0, f + 0.006 * L.gauss()), 0.01) });
    }
    const kin = pts.filter((p) => p.t > ts + 0.4).map((p) => p.f);
    return { pts, ts, N, fmax: Math.max(...pts.map((p) => p.f)), fk: L.stats(kin).mean, surf, face };
  }
  function start() { if (pull) return; pull = { tr: makeTrace(), el: 0 }; }
  function finish() {
    const tr = pull.tr; trace = tr; pull = null;
    tbl.add({ sn: SURF[tr.surf].name, fn: tr.face === "wide" ? "넓은 면" : "좁은 면", s: tr.surf, N: tr.N, fs: tr.fmax, fk: tr.fk });
  }

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const cur = pull ? pull.tr : trace, el = pull ? pull.el : cur ? DUR : 0, S = SURF[pull ? pull.tr.surf : surf];
    // 바닥판
    const fy = 70; ctx.fillStyle = S.col; ctx.fillRect(16, fy, w - 32, 10);
    if (surf === "sand" || S === SURF.sand) { ctx.fillStyle = "rgba(80,60,30,.35)"; for (let x = 18; x < w - 18; x += 3) ctx.fillRect(x, fy + (x * 7 % 5), 1, 1); }
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(S.name, 18, fy + 22);
    // 나무토막: 미끄러지기 시작하면 일정한 속력으로 이동
    const moved = cur && el > cur.ts ? (el - cur.ts) * 26 : 0, fc = pull ? pull.tr.face : face;
    const bw = fc === "wide" ? 70 : 34, bh = fc === "wide" ? 30 : 52, bx = 40 + moved, by = fy - bh;
    ctx.fillStyle = "#d9b77e"; ctx.fillRect(bx, by, bw, bh); ctx.strokeStyle = "#9a7a45"; ctx.strokeRect(bx + .5, by + .5, bw - 1, bh - 1);
    const k = +sK.value;
    for (let i = 0; i < k; i++) { ctx.fillStyle = "#8d8d92"; ctx.fillRect(bx + bw / 2 - 9, by - 9 * (i + 1), 18, 8); }
    // 실과 힘 센서, 당기는 손(일정 속력)
    const sx = bx + bw + 70 + (cur && el > cur.ts ? 0 : 0), syy = fy - 12;
    const f = cur ? (cur.pts[Math.min(cur.pts.length - 1, Math.floor(el * HZ))] || {}).f || 0 : 0;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx + bw, syy); ctx.lineTo(sx, syy); ctx.stroke();
    ctx.fillStyle = "#3f6fa3"; ctx.fillRect(sx, syy - 9, 40, 18); ctx.fillStyle = "#fff"; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(`${f.toFixed(2)} N`, sx + 20, syy + 4);
    ctx.strokeStyle = C.ink2; ctx.beginPath(); ctx.moveTo(sx + 40, syy); ctx.lineTo(sx + 60, syy); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("힘 센서 → 일정한 속력으로 당김", Math.min(sx, w - 150), syy - 16);
    // F–t 기록
    const box = { x0: 40, y0: 118, w: w - 56, h: h - 148 };
    if (!cur) { ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("당기면 힘–시간 그래프가 여기에 그려집니다", w / 2, box.y0 + box.h / 2); return; }
    const fm = Math.max(1, Math.ceil(cur.fmax * 1.2));
    const vis = cur.pts.filter((p) => p.t <= el);
    const P = L.plot(ctx, box, { pts: [], xr: [0, DUR], yr: [0, fm], xlabel: "t (s)", ylabel: "F (N)" });
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.4; ctx.beginPath();
    vis.forEach((p, i) => (i ? ctx.lineTo(P.X(p.t), P.Y(p.f)) : ctx.moveTo(P.X(p.t), P.Y(p.f)))); ctx.stroke();
    if (!pull) {
      ctx.setLineDash([4, 3]); ctx.strokeStyle = C.warn; ctx.beginPath(); ctx.moveTo(P.X(cur.ts + 0.4), P.Y(cur.fk)); ctx.lineTo(P.X(DUR), P.Y(cur.fk)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.warn; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
      const lx = Math.min(P.X(cur.ts) + 8, box.x0 + box.w - 120);
      ctx.fillText(`최대 ${cur.fmax.toFixed(2)} N`, lx, Math.max(box.y0 + 10, P.Y(cur.fmax) + 4));
      ctx.fillText(`평균 ${cur.fk.toFixed(2)} N`, box.x0 + box.w - 92, P.Y(cur.fk) - 14);
    }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows.filter((r) => r.s === surf);
    const ks = rows.map((r) => ({ x: r.N, y: r.fk })), ss = rows.map((r) => ({ x: r.N, y: r.fs }));
    const fk = ks.length > 1 ? L.linfit(ks.map((p) => p.x), ks.map((p) => p.y), true) : null;
    const fs = ss.length > 1 ? L.linfit(ss.map((p) => p.x), ss.map((p) => p.y), true) : null;
    const ym = Math.max(2, ...ss.map((p) => p.y * 1.15));
    const box = { x0: 46, y0: 20, w: w - 60, h: h - 54 };
    L.plot(ctx, box, { pts: ks, fit: fk, xr: [0, 11], yr: [0, ym], xlabel: "N (N)", ylabel: "마찰력 (N)" });
    const P = L.plot(ctx, { ...box }, { pts: ss, xr: [0, 11], yr: [0, ym], color: C.amber });
    if (fs) { ctx.save(); ctx.strokeStyle = C.amber; ctx.setLineDash([5, 3]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(P.X(0), P.Y(0)); ctx.lineTo(P.X(11), P.Y(Math.min(ym, fs.a * 11))); ctx.stroke(); ctx.restore(); }
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = C.amber; ctx.fillText("● 최대 정지 마찰력", box.x0 + 8, box.y0 + 14);
    ctx.fillStyle = C.forest; ctx.fillText("● 운동 마찰력", box.x0 + 8, box.y0 + 30);
    $(".n-s").textContent = fs ? `${fs.a.toFixed(2)} ± ${fs.sa.toFixed(2)}` : "점 2개 이상";
    $(".n-k").textContent = fk ? `${fk.a.toFixed(3)} ± ${fk.sa.toFixed(3)}` : "점 2개 이상";
    $(".n-surf").textContent = SURF[surf].name;
  }

  const sel = (grp, b) => root.querySelectorAll(grp + " .chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  root.querySelectorAll(".surf .chip").forEach((b) => b.addEventListener("click", () => { if (pull) return; surf = b.dataset.s; sel(".surf", b); trace = null; draw(); drawPlot(); }));
  root.querySelectorAll(".face .chip").forEach((b) => b.addEventListener("click", () => { if (pull) return; face = b.dataset.f; sel(".face", b); trace = null; draw(); }));
  sK.addEventListener("input", () => { $(".k-out").textContent = sK.value; if (!pull) { trace = null; draw(); } });
  $(".pull").addEventListener("click", start);
  $(".clear").addEventListener("click", () => { tbl.clear(); trace = null; draw(); });
  loop($(".cv-wide"), (dt) => { if (pull) { pull.el += dt; if (pull.el >= DUR) finish(); draw(); } });
  draw();
  if (L.demo) {
    [0, 1, 2, 3, 4].forEach((k) => { sK.value = k; start(); finish(); });
    face = "narrow"; sK.value = 2; start(); finish(); face = "wide";
    sK.value = 2; $(".k-out").textContent = "2"; start(); finish(); draw(); drawPlot();
  }
})();
