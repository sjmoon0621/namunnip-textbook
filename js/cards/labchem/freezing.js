/* 카드: 얼려 보기만 해도 흰 가루의 화학식량을 알 수 있을까? — 냉각 곡선, 과냉각, 외삽으로 어는점, M = Kf·w·1000/(ΔTf·W) */
(() => {
  const root = document.getElementById("card-labchem-freezing");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sW = $(".w"), sWW = $(".ww"), cBias = $(".bias");
  const KF = 1.86, TB = -12, KC = 0.25, T0 = 20, DT = 1 / 6, TEND = 15;

  const NACL = [[0, 1], [0.1, 0.932], [0.5, 0.921], [1, 0.936], [2, 0.983], [3, 1.045]];
  const phiNaCl = (m) => { for (let i = 1; i < NACL.length; i++) if (m <= NACL[i][0]) { const [a, pa] = NACL[i - 1], [b, pb] = NACL[i]; return pa + (pb - pa) * (m - a) / (b - a); } return 1.05; };
  const SMP = [
    { name: "요소", M: 60.06, nu: 1, phi: (m) => 1 - 0.05 * m },
    { name: "포도당", M: 180.16, nu: 1, phi: (m) => 1 + 0.02 * m },
    { name: "설탕", M: 342.3, nu: 1, phi: (m) => 1 + 0.09 * m },
    { name: "염화 나트륨", M: 58.44, nu: 2, phi: phiNaCl },
  ];
  const RCOL = ["#4f7fb0", "#3b7c2a", "#e0a02a", "#b5532f", "#8d6bb0"];
  let k = -1, zoom = "fp", running = null, runs = [], reveal = false, stirT = 0;

  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "nm", label: "시료" }, { key: "w", label: "w (g)", res: 0.01 }, { key: "W", label: "W (g)", res: 0.01 },
    { key: "Tf", label: "Tf 외삽 (°C)", res: 0.01 }, { key: "dT", label: "ΔTf (°C)", res: 0.01 }, { key: "M", label: "M (g/mol)", res: 1 },
  ], () => drawPlot());

  // 참 냉각 곡선 (뉴턴 냉각 + 과냉각 + 응고에 따른 농축)
  function simulate(kk, w, W) {
    const m0 = kk < 0 ? 0 : (w / SMP[kk].M) / (W / 1000);
    const fp = (f) => (kk < 0 ? 0 : -KF * SMP[kk].nu * SMP[kk].phi(m0 / (1 - f)) * m0 / (1 - f));
    const under = 0.7 + 1.3 * Math.random(), bias = cBias.checked ? 0.4 : 0;
    let T = T0 + 0.3 * L.gauss(), f = 0, nuc = false;
    const out = [];
    const sub = 10;
    for (let i = 0; i <= TEND / DT; i++) {
      out.push({ t: i * DT, T: L.measure(T + bias, { sd: 0.02, res: 0.01 }), f });
      for (let j = 0; j < sub; j++) {
        T -= KC * (T - TB) * DT / sub;
        if (!nuc && T < fp(0) - under) nuc = true;
        if (nuc && T < fp(f)) {
          for (let it = 0; it < 3; it++) { const target = fp(f); const df = 4.18 * (target - T) / 334 * 0.6; f = Math.min(0.9, f + Math.max(0, df)); T += 334 * Math.max(0, df) / 4.18; }
          T = Math.min(T, fp(f));
        }
      }
    }
    return { pts: out, m0, fpTrue: fp(0) + bias };
  }

  // 측정값만으로 외삽 어는점 구하기
  function extrap(pts) {
    let n = -1;
    for (let i = 1; i < pts.length - 1; i++) if (pts[i + 1].T - pts[i].T > 0.25 && pts[i].T < 5) { n = i; break; }
    if (n < 4) return null;
    const pre = pts.slice(Math.max(0, n - 4), n + 1);
    const post = pts.slice(n + 4, Math.min(pts.length, n + 40));
    if (post.length < 4) return null;
    const f1 = L.linfit(pre.map((p) => p.t), pre.map((p) => p.T)), f2 = L.linfit(post.map((p) => p.t), post.map((p) => p.T));
    if (!f1 || !f2 || Math.abs(f1.a - f2.a) < 1e-6) return null;
    const tx = (f2.b - f1.b) / (f1.a - f2.a);
    return { f1, f2, tx, Tf: f1.a * tx + f1.b, n, tmax: post[0].t };
  }

  function finish(run) {
    const ex = extrap(run.pts); run.ex = ex;
    runs.push(run);
    if (!ex) { drawPlot(); return; }
    const pure = [...runs].reverse().find((r) => r.k < 0 && r.ex && r.bias === run.bias);
    let dT = NaN, M = NaN;
    if (run.k >= 0 && pure) { dT = pure.ex.Tf - ex.Tf; M = KF * run.w * 1000 / (dT * run.W); }
    tbl.add({ nm: run.k < 0 ? "물만" : "미지 " + "ABCD"[run.k], w: run.k < 0 ? 0 : run.w, W: run.W, Tf: Math.abs(ex.Tf) < 0.005 ? 0 : ex.Tf, dT, M });
  }
  function start() {
    if (running) return;
    const w = +sW.value, W = +sWW.value;
    const sim = simulate(k, w, W);
    running = { k, w, W, bias: cBias.checked, pts: sim.pts, fpTrue: sim.fpTrue, shown: 0, el: 0 };
    $(".run").disabled = true;
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = h / 242, bx = w * 0.12, bw = w * 0.36, by = h * 0.36, bb = h - 12 * s;
    // 냉각제 비커
    ctx.fillStyle = "rgba(200,215,230,0.6)"; ctx.fillRect(bx, by + 10 * s, bw, bb - by - 10 * s);
    ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.strokeStyle = "rgba(140,160,180,0.8)"; ctx.lineWidth = 1;
    for (let i = 0; i < 26; i++) { const x = bx + 6 + ((i * 53) % 100) / 100 * (bw - 18), y = by + 16 * s + ((i * 37) % 100) / 100 * (bb - by - 30 * s); ctx.fillRect(x, y, 9 * s, 7 * s); ctx.strokeRect(x, y, 9 * s, 7 * s); }
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, bb); ctx.lineTo(bx + bw, bb); ctx.lineTo(bx + bw, by); ctx.stroke();
    // 시험관
    const cur = running ? running.pts[Math.min(running.shown, running.pts.length - 1)] : null;
    const tx = bx + bw / 2, tw = 13 * s, tt = h * 0.12, tb = bb - 16 * s, lq = tb - 70 * s;
    ctx.fillStyle = C.card; ctx.fillRect(tx - tw, lq, 2 * tw, tb - lq);
    ctx.fillStyle = "rgba(120,170,220,0.35)"; ctx.fillRect(tx - tw, lq, 2 * tw, tb - lq);
    if (cur && cur.f > 0) {
      ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.strokeStyle = "rgba(120,150,180,0.9)";
      const nIce = Math.round(clamp(cur.f * 120, 2, 40));
      for (let i = 0; i < nIce; i++) { const x = tx - tw + 3 + ((i * 61) % 100) / 100 * (2 * tw - 8), y = lq + 4 + ((i * 29) % 100) / 100 * (tb - lq - 10); ctx.beginPath(); ctx.moveTo(x, y - 3); ctx.lineTo(x + 3, y); ctx.lineTo(x, y + 3); ctx.lineTo(x - 3, y); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(tx - tw, tt); ctx.lineTo(tx - tw, tb); ctx.arc(tx, tb, tw, Math.PI, 0, true); ctx.lineTo(tx + tw, tt); ctx.stroke();
    // 센서와 젓개
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx - 3 * s, tt - 30 * s); ctx.lineTo(tx - 3 * s, tb - 8 * s); ctx.stroke();
    const sy = (running ? Math.sin(stirT * 6) : 0) * 10 * s;
    ctx.strokeStyle = "#8d8d92"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(tx + 7 * s, tt - 20 * s + sy); ctx.lineTo(tx + 7 * s, tb - 14 * s + sy); ctx.lineTo(tx - 8 * s, tb - 14 * s + sy); ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx - 3 * s, tt - 30 * s); ctx.lineTo(w * 0.62, h * 0.14 + 16); ctx.stroke();
    const dx = w * 0.62, dy = h * 0.14;
    ctx.fillStyle = C.night; ctx.fillRect(dx, dy, 128, 50);
    ctx.fillStyle = "#cfe8c4"; ctx.font = `600 15px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillText(cur ? cur.T.toFixed(2) + " °C" : (T0 + (cBias.checked ? 0.4 : 0)).toFixed(2) + " °C", dx + 120, dy + 22);
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = "#9fb59a";
    ctx.fillText(cur ? `t = ${Math.floor(cur.t)}분 ${String(Math.round((cur.t % 1) * 60)).padStart(2, "0")}초` : "대기 중", dx + 120, dy + 40);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("얼음 + 소금 (약 −12 °C)", bx, bb + 10 * s > h - 2 ? h - 2 : bb + 10 * s);
    const lab = k < 0 ? `물 ${(+sWW.value).toFixed(2)} g` : `미지 ${"ABCD"[k]} ${(+sW.value).toFixed(2)} g + 물 ${(+sWW.value).toFixed(2)} g`;
    ctx.fillText(lab, dx, dy + 70);
    if (cur && cur.f > 0) ctx.fillText("얼음 결정 생김", dx, dy + 86);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 20, w: w - 58, h: h - 54 };
    const all = runs.concat(running ? [{ ...running, pts: running.pts.slice(0, running.shown + 1), live: true }] : []);
    const last = [...runs].reverse().find((r) => r.ex);
    let yr = [-14, 22];
    if (zoom === "fp") {
      const fps = runs.filter((r) => r.ex).map((r) => r.ex.Tf);
      const lo = fps.length ? Math.min(...fps) : -2, hi = fps.length ? Math.max(...fps) : 0.5;
      yr = [Math.floor(lo - 3), Math.ceil(hi + 1.5)];
    }
    const m = L.plot(ctx, box, { pts: [], xr: [0, 15], yr, xlabel: "시간 (분)", ylabel: "온도 (°C)" });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    all.forEach((r, i) => {
      const col = RCOL[(r.k + 1) % RCOL.length];
      ctx.strokeStyle = col; ctx.lineWidth = r === last || r.live ? 1.8 : 1; ctx.globalAlpha = r === last || r.live ? 1 : 0.55;
      ctx.beginPath(); r.pts.forEach((p, j) => (j ? ctx.lineTo(m.X(p.t), m.Y(p.T)) : ctx.moveTo(m.X(p.t), m.Y(p.T)))); ctx.stroke();
      ctx.globalAlpha = 1;
    });
    if (last) {
      const e = last.ex;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.setLineDash([4, 3]); ctx.beginPath();
      const ta = e.tx - 1.2, tb2 = Math.min(15, e.tmax + 6);
      ctx.moveTo(m.X(ta), m.Y(e.f1.a * ta + e.f1.b)); ctx.lineTo(m.X(e.tx + 0.4), m.Y(e.f1.a * (e.tx + 0.4) + e.f1.b));
      ctx.moveTo(m.X(e.tx - 0.6), m.Y(e.f2.a * (e.tx - 0.6) + e.f2.b)); ctx.lineTo(m.X(tb2), m.Y(e.f2.a * tb2 + e.f2.b)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(m.X(e.tx), m.Y(e.Tf), 4, 0, Math.PI * 2); ctx.fill();
      ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
      ctx.fillText(`외삽 어는점 ${e.Tf.toFixed(2)} °C`, m.X(e.tx) + 8, m.Y(e.Tf) - 8);
    }
    ctx.restore();
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right";
    ["물만", "미지 A", "미지 B", "미지 C", "미지 D"].forEach((nm, i) => {
      if (!all.some((r) => r.k === i - 1)) return;
      ctx.fillStyle = RCOL[i]; ctx.fillText("— " + nm, box.x0 + box.w - 4, box.y0 + 12 + i * 13);
    });
    if (reveal) {
      ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.font = `10.5px ${F.sans}`;
      ctx.fillText("참값: A 요소 · B 포도당 · C 설탕 · D 염화 나트륨", box.x0 + 6, box.y0 + box.h - 8);
    }
  }

  loop($(".cv-wide"), (dt) => {
    stirT += dt;
    if (running) {
      running.el += dt; running.shown = Math.min(running.pts.length - 1, Math.floor(running.el * 15));
      if (running.shown >= running.pts.length - 1) { const r = running; running = null; $(".run").disabled = false; finish(r); }
      drawPlot();
    }
    drawApp();
  });
  const upd = () => { $(".w-out").textContent = (+sW.value).toFixed(2); $(".ww-out").textContent = (+sWW.value).toFixed(2); drawApp(); };
  [sW, sWW, cBias].forEach((el) => el.addEventListener("input", upd));
  $(".smp").addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]"); if (!b) return;
    k = +b.dataset.k; root.querySelectorAll("[data-k]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); upd();
  });
  $(".zoom").addEventListener("click", (e) => {
    const b = e.target.closest("[data-z]"); if (!b) return;
    zoom = b.dataset.z; root.querySelectorAll("[data-z]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  $(".run").addEventListener("click", start);
  $(".clear").addEventListener("click", () => { runs = []; tbl.clear(); drawPlot(); });
  $(".reveal").addEventListener("click", (e) => { reveal = !reveal; e.currentTarget.setAttribute("aria-pressed", String(reveal)); drawPlot(); });
  if (L.demo) {
    [[-1, 0, 25], [0, 1.5, 25], [1, 3.0, 25], [2, 5.0, 25], [3, 0.5, 25]].forEach(([kk, w, W]) => {
      k = kk; sW.value = w || 2; sWW.value = W;
      const sim = simulate(kk, w, W);
      finish({ k: kk, w, W, bias: false, pts: sim.pts, fpTrue: sim.fpTrue });
    });
    k = -1; sW.value = 2; sWW.value = 25;
  }
  upd();
})();
