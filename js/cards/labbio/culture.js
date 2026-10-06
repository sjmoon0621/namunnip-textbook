/* 카드: 효모 배양과 혈구 계산판 — 큰 칸 5개 세기, 경계선 규칙, 희석 배수, 로지스틱 생장 곡선 (교육용 모형) */
(() => {
  const root = document.getElementById("card-labbio-culture");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const [cvH, cvP] = root.querySelectorAll("canvas");
  /* 배양 조건: 이름, 생장률 r (/h), 환경 수용력 K (마리/mL), 적응기 (h) — 교육용 모형값 */
  const MED = [
    { n: "5% · 30 °C", r: 0.30, K: 1.2e8, lag: 3, c: C.forest },
    { n: "1% · 30 °C", r: 0.30, K: 3.0e7, lag: 3, c: C.amber },
    { n: "5% · 20 °C", r: 0.13, K: 1.1e8, lag: 6, c: "#3d6fb0" },
  ];
  const N0 = 1.0e6, SQV = 4e-6, CR = 0.0025;   /* 접종 농도, 큰 칸 부피(mL), 세포 반지름(mm) */
  const CNT = [[0, 0], [4, 0], [0, 4], [4, 4], [2, 2]];   /* 세는 큰 칸 (네 귀퉁이 + 가운데) */
  let med = 0, dil = 1, yLog = false, view = null;

  const truth = (m, t) => {
    const M = MED[m], tt = Math.max(0, t - M.lag);
    return M.K / (1 + (M.K / N0 - 1) * Math.exp(-M.r * tt));
  };
  function poisson(lam) {
    if (lam > 40) return Math.max(0, Math.round(lam + Math.sqrt(lam) * L.gauss()));
    const e = Math.exp(-lam); let k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > e);
    return k - 1;
  }

  const hv = fit(cvH, () => drawHemo());
  const pl = fit(cvP, () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "mn", label: "조건" }, { key: "t", label: "t (h)", res: 1 }, { key: "d", label: "희석" },
    { key: "sum", label: "5칸 합", res: 1 }, { key: "c6", label: "농도 (10⁶/mL)", res: 0.01 },
  ], () => { drawPlot(); analyse(); });

  /* 한 번 떠서 계산판에 올린 모습과 센 수 */
  function sample(m, t, d, noRule) {
    const C0 = truth(m, t) * Math.exp(0.06 * L.gauss());   /* 덜 흔들어 생기는 시료 간 차이 */
    const lam = C0 / d * SQV, pad = 0.03, A = (1 + 2 * pad) ** 2 / 0.04;
    const n = poisson(lam * A), cells = [];
    for (let i = 0; i < n; i++) cells.push({ x: -pad + Math.random() * (1 + 2 * pad), y: -pad + Math.random() * (1 + 2 * pad), b: Math.random() < 0.3 ? Math.random() * 6.28 : null, st: 0 });
    const per = CNT.map(([i, j]) => {
      const x0 = i * 0.2, y0 = j * 0.2;
      let c = 0;
      for (const p of cells) {
        const inR = noRule
          ? p.x >= x0 - CR && p.x <= x0 + 0.2 + CR && p.y >= y0 - CR && p.y <= y0 + 0.2 + CR
          : p.x >= x0 - CR && p.x < x0 + 0.2 - CR && p.y >= y0 - CR && p.y < y0 + 0.2 - CR;
        if (inR) { c++; p.st = 1; }
        else if (p.x > x0 - CR * 2 && p.x < x0 + 0.2 + CR * 2 && p.y > y0 - CR * 2 && p.y < y0 + 0.2 + CR * 2 && !p.st) p.st = 2;
      }
      /* 너무 빽빽하면 겹친 세포를 놓친다 */
      const miss = Math.min(0.3, Math.max(0, (lam - 60) / 800));
      return Math.round(c * (1 - miss * (0.8 + 0.4 * Math.random())));
    });
    return { m, t, d, cells, per, lam, sum: per.reduce((s, x) => s + x, 0) };
  }

  function drawHemo() {
    const { ctx } = hv, { w, h } = hv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const side = Math.min(h - 16, w * 0.6), gx = 8, gy = (h - side) / 2, sq = side / 5;
    ctx.fillStyle = "#eef0e6"; ctx.fillRect(gx - 6, gy - 6, side + 12, side + 12);
    const X = (v) => gx + v * side, Y = (v) => gy + v * side;
    /* 센 칸 바탕 */
    CNT.forEach(([i, j]) => { ctx.fillStyle = "rgba(181,215,172,.45)"; ctx.fillRect(X(i * 0.2), Y(j * 0.2), sq, sq); });
    /* 작은 칸 선 */
    ctx.strokeStyle = "rgba(35,35,38,.18)"; ctx.lineWidth = 0.6;
    for (let k = 0; k <= 20; k++) { const v = k * 0.05; ctx.beginPath(); ctx.moveTo(X(v), Y(0)); ctx.lineTo(X(v), Y(1)); ctx.moveTo(X(0), Y(v)); ctx.lineTo(X(1), Y(v)); ctx.stroke(); }
    ctx.strokeStyle = "rgba(35,35,38,.55)"; ctx.lineWidth = 1.3;
    for (let k = 0; k <= 5; k++) { const v = k * 0.2; ctx.beginPath(); ctx.moveTo(X(v), Y(0)); ctx.lineTo(X(v), Y(1)); ctx.moveTo(X(0), Y(v)); ctx.lineTo(X(1), Y(v)); ctx.stroke(); }
    ctx.save(); ctx.beginPath(); ctx.rect(gx - 6, gy - 6, side + 12, side + 12); ctx.clip();
    const pr = Math.max(1.1, CR * side * 1.8);
    if (view) {
      for (const p of view.cells) {
        const px = X(p.x), py = Y(p.y);
        ctx.fillStyle = p.st === 1 ? C.forest : p.st === 2 ? C.warn : "rgba(93,93,97,.55)";
        ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
        if (p.b !== null) { ctx.beginPath(); ctx.arc(px + Math.cos(p.b) * pr * 1.2, py + Math.sin(p.b) * pr * 1.2, pr * 0.55, 0, Math.PI * 2); ctx.fill(); }
      }
    }
    ctx.restore();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.6;
    CNT.forEach(([i, j]) => ctx.strokeRect(X(i * 0.2), Y(j * 0.2), sq, sq));
    /* 오른쪽 설명 */
    const tx = gx + side + 16, tw = w - tx - 4;
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`;
    ctx.fillText("혈구 계산판 가운데 1 mm²", tx, gy + 12);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2;
    ctx.fillText("큰 칸 0.2 mm, 깊이 0.1 mm", tx, gy + 30);
    if (!view) { ctx.fillText("아직 시료를 올리지 않았습니다", tx, gy + 58); return; }
    ctx.fillStyle = C.ink; ctx.font = `11px ${F.mono}`;
    ctx.fillText(`${MED[view.m].n}, t = ${view.t} h, ×${view.d}`, tx, gy + 56);
    const lab = ["왼쪽 위", "오른쪽 위", "왼쪽 아래", "오른쪽 아래", "가운데"];
    view.per.forEach((c, k) => { ctx.fillStyle = C.ink2; ctx.fillText(lab[k], tx, gy + 78 + k * 16); ctx.fillStyle = C.ink; ctx.textAlign = "right"; ctx.fillText(String(c), Math.min(tx + 130, tx + tw), gy + 78 + k * 16); ctx.textAlign = "left"; });
    const yy = gy + 78 + 5 * 16 + 6;
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(tx, yy - 10); ctx.lineTo(Math.min(tx + 130, tx + tw), yy - 10); ctx.stroke();
    ctx.fillStyle = C.forest; ctx.font = `600 11px ${F.mono}`; ctx.fillText("합", tx, yy + 4); ctx.textAlign = "right"; ctx.fillText(String(view.sum), Math.min(tx + 130, tx + tw), yy + 4); ctx.textAlign = "left";
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2;
    ctx.fillText(`${view.sum} × 5×10⁴ × ${view.d}`, tx, yy + 26);
    ctx.fillStyle = C.ink; ctx.fillText(`= ${(view.sum * 5e4 * view.d / 1e6).toFixed(2)} ×10⁶ /mL`, tx, yy + 42);
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.forest; ctx.fillText("● 센 세포", tx, yy + 64);
    ctx.fillStyle = C.warn; ctx.fillText("● 아래·오른쪽 선에 걸침", tx, yy + 78);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 34, w: w - 58, h: h - 68 };
    const ys = tbl.rows.map((r) => r.c6).filter((v) => v > 0);
    const yr = yLog ? [Math.floor(Math.log10(Math.min(0.5, ...ys))), Math.ceil(Math.log10(Math.max(150, ...ys)) * 10) / 10] : [0, Math.max(140, ...ys) * 1.05];
    const g = L.plot(ctx, box, { pts: [], xr: [0, 50], yr, xlabel: "t (h)", ylabel: yLog ? "log₁₀ 농도 (10⁶/mL)" : "농도 (10⁶/mL)" });
    MED.forEach((M, k) => {
      const rs = tbl.rows.filter((r) => r.m === k && r.c6 > 0).sort((a, b) => a.t - b.t);
      if (!rs.length) return;
      const yv = (v) => (yLog ? Math.log10(v) : v);
      ctx.strokeStyle = M.c; ctx.fillStyle = M.c; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]);
      ctx.beginPath(); rs.forEach((r, i) => (i ? ctx.lineTo(g.X(r.t), g.Y(yv(r.c6))) : ctx.moveTo(g.X(r.t), g.Y(yv(r.c6))))); ctx.stroke(); ctx.setLineDash([]);
      rs.forEach((r) => { ctx.beginPath(); ctx.arc(g.X(r.t), g.Y(yv(r.c6)), 3.2, 0, Math.PI * 2); ctx.fill(); });
    });
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    MED.forEach((M, k) => { const lx = box.x0 + 120 + k * 78; if (lx + 70 > w) return; ctx.fillStyle = M.c; ctx.fillRect(lx, 10, 9, 9); ctx.fillStyle = C.ink2; ctx.fillText(M.n, lx + 12, 18); });
  }

  function analyse() {
    const rs = tbl.rows.filter((r) => r.m === med && r.c6 > 0);
    const set = (k, v) => { $(k).textContent = v; };
    if (rs.length < 3) { set(".n-k", "—"); set(".n-r", "—"); set(".n-g", "—"); return; }
    const mx = Math.max(...rs.map((r) => r.c6)), mn = Math.min(...rs.map((r) => r.c6));
    const plat = rs.filter((r) => r.c6 >= 0.85 * mx);
    const lastT = Math.max(...rs.map((r) => r.t));
    const K = plat.reduce((s, r) => s + r.c6, 0) / plat.length;
    set(".n-k", plat.length >= 2 && lastT >= 30 ? `${K.toFixed(0)} ×10⁶/mL` : "정체기 자료 부족");
    const ex = rs.filter((r) => r.c6 > 1.6 * mn && r.c6 < 0.4 * mx);
    const f = ex.length >= 2 ? L.linfit(ex.map((r) => r.t), ex.map((r) => Math.log(r.c6))) : null;
    if (f && f.a > 0) { set(".n-r", `${f.a.toFixed(2)} /h`); set(".n-g", `${(Math.LN2 / f.a).toFixed(1)} h`); }
    else { set(".n-r", "지수기 자료 부족"); set(".n-g", "—"); }
  }

  function msg() {
    const el = $(".cu-msg");
    if (!view) { el.textContent = ""; return; }
    const avg = view.sum / 5;
    el.className = "cu-msg";
    if (view.lam > 60) el.textContent = `큰 칸 하나에 평균 ${avg.toFixed(0)}마리 — 너무 빽빽해 겹친 세포를 놓칩니다. 희석 배수를 높여 다시 세세요.`;
    else if (view.sum < 50) el.textContent = `5칸 합 ${view.sum}마리 — 상대 오차가 약 ${(100 / Math.sqrt(Math.max(1, view.sum))).toFixed(0)}%로 큽니다. 희석을 줄이거나 칸을 더 세면 좋습니다.`;
    else { el.className = "cu-msg ok"; el.textContent = `5칸 합 ${view.sum}마리 — 세기에 알맞은 밀도입니다 (상대 오차 약 ${(100 / Math.sqrt(view.sum)).toFixed(0)}%).`; }
  }

  function measure() {
    const t = +$(".t").value;
    view = sample(med, t, dil, $(".norule").checked);
    drawHemo(); msg();
    tbl.add({ m: med, mn: MED[med].n, t, d: "×" + dil, sum: view.sum, c6: view.sum * 5e4 * dil / 1e6 });
  }

  const press = (sel, attr, b) => root.querySelectorAll(`${sel} [${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  $(".med").addEventListener("click", (e) => { const b = e.target.closest("[data-m]"); if (!b) return; med = +b.dataset.m; press(".med", "data-m", b); analyse(); });
  $(".dil").addEventListener("click", (e) => { const b = e.target.closest("[data-d]"); if (!b) return; dil = +b.dataset.d; press(".dil", "data-d", b); });
  $(".ysc").addEventListener("click", (e) => { const b = e.target.closest("[data-y]"); if (!b) return; yLog = b.dataset.y === "log"; press(".ysc", "data-y", b); drawPlot(); });
  $(".t").addEventListener("input", () => { $(".t-out").textContent = $(".t").value; });
  $(".meas").addEventListener("click", measure);
  $(".clear").addEventListener("click", () => { view = null; tbl.clear(); drawHemo(); msg(); });
  if (L.demo) {
    const auto = (m, t) => [1, 10, 100].find((d) => truth(m, t) / d * SQV <= 50) || 100;
    [[0, 4], [1, 8], [2, 8]].forEach(([m, step]) => {
      for (let t = 0; t <= 48; t += step) { med = m; dil = auto(m, t); $(".t").value = t; measure(); }
    });
    med = 0; dil = 10; $(".t").value = 20; $(".t-out").textContent = "20";
    press(".dil", "data-d", root.querySelector('[data-d="10"]'));
    view = sample(0, 20, 10, false); drawHemo(); msg();
    analyse();
  }
})();
