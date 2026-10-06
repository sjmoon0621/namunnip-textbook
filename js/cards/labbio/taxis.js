/* 카드: 쥐며느리는 정말 어둡고 축축한 곳을 고를까? — 선택 상자, 주성과 무정위 운동성, 카이제곱 검정 (모식 시뮬레이션) */
(() => {
  const root = document.getElementById("card-labbio-taxis");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sN = $(".n");
  const ANI = { iso: "쥐며느리", pla: "플라나리아", art: "아르테미아" };
  const STI = { light: "빛", wet: "습도", food: "간 즙", none: "없음" };
  const SIDE = { light: ["어둠", "밝음"], wet: ["젖음", "마름"], food: ["간 즙", "물"], none: ["왼쪽", "오른쪽"] };
  // 왼쪽(자극 쪽)에 대한 선호 세기 (+: 왼쪽에 모임, −: 오른쪽에 모임). 모식값
  const PREF = { iso: { light: 0.8, wet: 0.9, none: 0 }, pla: { light: 0.7, food: 0.6, none: 0 }, art: { light: -0.75, food: 0.15, none: 0 } };
  const W = 1, H = 0.5;
  let ani = "iso", sti = "light", run = null, last = null;

  const tbl = L.table($(".tbl-host"), [
    { key: "a", label: "동물" }, { key: "s", label: "자극" }, { key: "n", label: "N", res: 1 },
    { key: "o1", label: "왼쪽", res: 1 }, { key: "o2", label: "오른쪽", res: 1 }, { key: "chi", label: "χ²", res: 0.01 }, { key: "j", label: "판단" },
  ]);
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function makeRun() {
    const n = +sN.value, s = PREF[ani][sti];
    const bugs = Array.from({ length: n }, () => ({ x: W / 2 + 0.03 * L.gauss(), y: H / 2 + 0.03 * L.gauss(), th: Math.random() * Math.PI * 2 }));
    return { n, s, ani, sti, bugs, t: 0, counts: [count(bugs)], done: false };
  }
  const count = (bugs) => bugs.filter((b) => b.x < W / 2).length;
  // 1초(실험 시간) 진행: 싫은 쪽에서 더 빠르고 자주 방향을 바꿈 + 좋은 쪽을 향하는 약한 방향 치우침
  function step(r) {
    const base = r.ani === "art" ? 0.012 : r.ani === "pla" ? 0.004 : 0.008;
    for (const b of r.bugs) {
      const good = r.s === 0 ? true : (b.x < W / 2) === (r.s > 0);
      const v = base * (good ? 1 - 0.4 * Math.abs(r.s) : 1 + 0.3 * Math.abs(r.s));
      const target = r.s >= 0 ? Math.PI : 0;
      b.th += (good ? 0.35 : 0.6) * L.gauss() - 0.02 * Math.abs(r.s) * Math.sin(b.th - target);
      b.x += v * Math.cos(b.th); b.y += v * Math.sin(b.th);
      if (b.x < 0.01 || b.x > W - 0.01) { b.th = Math.PI - b.th; b.x = Math.min(W - 0.01, Math.max(0.01, b.x)); }
      if (b.y < 0.01 || b.y > H - 0.01) { b.th = -b.th; b.y = Math.min(H - 0.01, Math.max(0.01, b.y)); }
    }
    r.t += 1;
    if (r.t % 60 === 0) r.counts.push(count(r.bugs));
  }
  function finish(r) {
    const o1 = r.counts[10], o2 = r.n - o1, E = r.n / 2;
    const chi = (o1 - E) ** 2 / E + (o2 - E) ** 2 / E;
    r.done = true; last = r;
    tbl.add({ a: ANI[r.ani], s: STI[r.sti], n: r.n, o1, o2, chi: L.snap(chi, 0.01), j: chi > 3.84 ? (o1 > o2 ? `${SIDE[r.sti][0]} 쪽 치우침` : `${SIDE[r.sti][1]} 쪽 치우침`) : "우연 범위" });
    drawPlot();
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = run, st = r ? r.sti : sti, an = r ? r.ani : ani;
    const bx = 16, bw = w - 32, by = 30, bh = Math.min(h - 50, bw * H);
    const X = (x) => bx + x * bw, Y = (y) => by + y * bh / H;
    // 오른쪽 기본 바닥
    ctx.fillStyle = st === "light" ? "#fff6d6" : st === "wet" ? "#efe8da" : "#eef1ea"; ctx.fillRect(X(0.5), by, bw / 2, bh);
    // 왼쪽 자극
    ctx.fillStyle = { light: "#3a3d38", wet: "#b8cbd8", food: "#e3d6cf", none: "#eef1ea" }[st]; ctx.fillRect(bx, by, bw / 2, bh);
    if (st === "food") { const g = ctx.createRadialGradient(X(0.12), Y(0.25), 2, X(0.12), Y(0.25), bw * 0.3); g.addColorStop(0, "rgba(150,50,40,.45)"); g.addColorStop(1, "rgba(150,50,40,0)"); ctx.fillStyle = g; ctx.fillRect(bx, by, bw / 2, bh); }
    if (an !== "iso") { ctx.fillStyle = "rgba(170,205,235,.25)"; ctx.fillRect(bx, by, bw, bh); }
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.strokeRect(bx, by, bw, bh);
    ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(X(0.5), by); ctx.lineTo(X(0.5), by + bh); ctx.stroke(); ctx.setLineDash([]);
    // 동물
    const bugs = r ? r.bugs : [];
    for (const b of bugs) {
      ctx.save(); ctx.translate(X(b.x), Y(b.y)); ctx.rotate(b.th);
      if (an === "iso") { ctx.fillStyle = "#6f6a66"; ctx.beginPath(); ctx.ellipse(0, 0, 6, 3.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#4b4744"; ctx.lineWidth = 0.6; for (let i = -3; i <= 3; i += 2) { ctx.beginPath(); ctx.moveTo(i, -3.4); ctx.lineTo(i, 3.4); ctx.stroke(); } }
      else if (an === "pla") { ctx.fillStyle = "#6b4b36"; ctx.beginPath(); ctx.ellipse(0, 0, 7, 2.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillRect(4, -1.2, 1, 1); ctx.fillRect(4, 0.4, 1, 1); }
      else { ctx.fillStyle = "#d9792a"; ctx.beginPath(); ctx.ellipse(0, 0, 3.4, 1.8, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    // 글자
    ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillStyle = st === "light" ? "#f3f4ef" : C.ink; ctx.fillText(SIDE[st][0], X(0.25), by + 16);
    ctx.fillStyle = C.ink; ctx.fillText(SIDE[st][1], X(0.75), by + 16);
    ctx.textAlign = "left"; ctx.font = `12px ${F.mono}`; ctx.fillStyle = C.ink2;
    ctx.fillText(`${ANI[an]} · 자극 ${STI[st]}`, bx, 18);
    ctx.textAlign = "right";
    if (r) { const c = count(r.bugs); ctx.fillStyle = C.ink; ctx.fillText(`${(r.t / 60).toFixed(1)} 분 · 왼쪽 ${c} / 오른쪽 ${r.n - c}`, bx + bw, 18); }
    else ctx.fillText("관찰 대기", bx + bw, 18);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 20, w: w - 58, h: h - 54 };
    const r = run && !run.done ? run : last;
    const n = r ? r.n : +sN.value, half = Math.sqrt(3.84 * n / 4) / n * 100;
    const P = L.plot(ctx, box, { pts: [], xr: [0, 10.3], yr: [0, 100], xlabel: "시간 (분)", ylabel: `왼쪽(${SIDE[r ? r.sti : sti][0]}) 개체 비율 (%)` });
    ctx.fillStyle = "rgba(141,141,146,.16)"; ctx.fillRect(box.x0, P.Y(50 + half), box.w, P.Y(50 - half) - P.Y(50 + half));
    ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(box.x0, P.Y(50)); ctx.lineTo(box.x0 + box.w, P.Y(50)); ctx.stroke(); ctx.setLineDash([]);
    if (r) {
      const pts = r.counts.map((c, i) => ({ x: i, y: 100 * c / r.n }));
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.4; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(P.X(p.x), P.Y(p.y)) : ctx.moveTo(P.X(p.x), P.Y(p.y)))); ctx.stroke();
      L.plot(ctx, box, { pts, xr: [0, 10.3], yr: [0, 100] });
    }
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillText(`회색 띠: N = ${n}일 때 우연 범위 50 ± ${half.toFixed(0)}%`, box.x0 + box.w - 4, box.y0 + box.h - 8);
  }

  loop($(".cv-wide"), (dt) => {
    if (run && !run.done) {
      const k = Math.max(1, Math.round(dt * 60));
      for (let i = 0; i < k && run.t < 600; i++) step(run);
      if (run.t % 60 === 0 || run.t >= 600) drawPlot();
      if (run.t >= 600) finish(run);
    }
    drawApp();
  });
  function allow() {
    root.querySelectorAll("[data-s]").forEach((b) => { b.disabled = !(b.dataset.s in PREF[ani]); });
    if (!(sti in PREF[ani])) { sti = "light"; }
    root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.s === sti)));
  }
  const reset = () => { if (run && run.done) run = null; drawApp(); drawPlot(); };
  $(".ani").addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]"); if (!b || (run && !run.done)) return;
    ani = b.dataset.a; root.querySelectorAll("[data-a]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); allow(); reset();
  });
  $(".sti").addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]"); if (!b || b.disabled || (run && !run.done)) return;
    sti = b.dataset.s; allow(); reset();
  });
  sN.addEventListener("input", () => { $(".n-out").textContent = sN.value; reset(); });
  $(".run").addEventListener("click", () => { if (run && !run.done) return; run = makeRun(); });
  $(".clear").addEventListener("click", () => { run = null; last = null; tbl.clear(); drawApp(); drawPlot(); });
  allow(); drawApp();
  if (L.demo) {
    const sim = (a, s) => { ani = a; sti = s; const r = makeRun(); while (r.t < 600) step(r); finish(r); return r; };
    sim("iso", "none"); sim("iso", "none"); sim("iso", "wet"); sim("pla", "light"); sim("art", "light");
    const r = sim("iso", "light");
    ani = "iso"; sti = "light"; allow(); run = r; drawApp(); drawPlot();
  }
})();
