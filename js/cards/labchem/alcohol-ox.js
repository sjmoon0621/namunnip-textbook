/* 카드: 알코올의 산화 — 1·2·3차 알코올 + 산성 K₂Cr₂O₇, 증류/환류, 생성물 확인 시험(톨렌스, 2,4-DNP, pH, NaHCO₃) */
(() => {
  const root = document.getElementById("card-labchem-alcohol-ox");
  if (!root || !window.NMOrg) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab, O = NMOrg;
  const $ = (s) => root.querySelector(s);
  /* t90: 초록색이 될 때까지 걸리는 시간(s, 60 °C, 예시값). null이면 산화되지 않음 */
  const A = {
    et: { name: "에탄올", cls: "1차", t90: 42 },
    ip: { name: "2-프로판올", cls: "2차", t90: 63 },
    tb: { name: "2-메틸-2-프로판올", cls: "3차", t90: null },
  };
  const pool = ["et", "ip", "tb"], pick = () => pool[Math.floor(Math.random() * 3)];
  const UNK = L.demo ? { X: "ip", Y: "et" } : { X: pick(), Y: pick() };
  /* 생성물: ald(알데하이드), acid(카복실산), ket(케톤), none(알코올 그대로) */
  const prod = (k, m) => (k === "et" ? (m === "dist" ? "ald" : "acid") : k === "ip" ? "ket" : "none");
  const PNAME = { ald: "아세트알데하이드 (알데하이드)", acid: "아세트산 (카복실산)", ket: "아세톤 (케톤)", none: "산화되지 않음 (알코올 그대로)" };
  const PH = { ald: 5.0, acid: 2.9, ket: 6.0, none: 6.3 };
  const ORANGE = "#e07b1a", GREEN = "#4f8f5c";
  let sel = "et", mode = "dist", run = null, lastTest = null, t = 0;
  const real = () => (A[sel] ? sel : UNK[sel]);
  const label = () => (A[sel] ? A[sel].name : `미지 시료 ${sel}`);
  const obs = $(".ao-obs");
  const tbl = L.table($(".tbl-host"), [{ key: "a", label: "알코올" }, { key: "m", label: "장치" }, { key: "tg", label: "초록까지(s)", res: 1 }, { key: "tol", label: "톨렌스" }, { key: "dnp", label: "2,4-DNP" }, { key: "ph", label: "pH", res: 1 }, { key: "hco", label: "NaHCO₃" }], () => drawPlot());

  const app = fit($(".cv-wide"), () => draw());
  const pl = fit($(".ao-plot"), () => drawPlot());
  function draw() {
    const { ctx, size } = app, { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const bx = w * 0.06, bw = w * 0.36, by = h * 0.5, bh = h * 0.42, fx = bx + bw / 2, fy = by + bh * 0.42, R = Math.min(bw * 0.28, h * 0.17);
    // 물중탕
    ctx.fillStyle = "rgba(160,200,230,.35)"; ctx.fillRect(bx, by + bh * 0.12, bw, bh * 0.88);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
    const p = run ? run.p : 0;
    const fl = O.flask(ctx, fx, fy, R, O.mix(ORANGE, GREEN, p), 0.5, C.ink2);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("60 °C 물중탕", bx + 4, by + bh - 6);
    if (mode === "reflux") {
      // 세운 냉각기
      const cw = fl.nw * 2 + 8, ct = 14;
      ctx.fillStyle = "rgba(160,200,230,.35)"; ctx.fillRect(fx - cw / 2, ct, cw, fl.neckTop - ct);
      ctx.strokeStyle = C.ink2; ctx.strokeRect(fx - cw / 2, ct, cw, fl.neckTop - ct);
      ctx.beginPath(); ctx.moveTo(fx - fl.nw, ct - 6); ctx.lineTo(fx - fl.nw, fl.neckTop); ctx.moveTo(fx + fl.nw, ct - 6); ctx.lineTo(fx + fl.nw, fl.neckTop); ctx.stroke();
      if (run && run.p > 0.05 && run.p < 0.98) { ctx.fillStyle = "rgba(90,140,200,.8)"; for (let i = 0; i < 3; i++) { const yy = ct + ((t * 50 + i * 30) % (fl.neckTop - ct)); ctx.beginPath(); ctx.arc(fx, yy, 2, 0, Math.PI * 2); ctx.fill(); } }
      ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("환류 냉각기", fx + cw / 2 + 4, ct + 14);
    } else {
      // 옆으로 뻗은 냉각기와 얼음물 속 받개
      const y0 = fl.neckTop + 6, x1 = w * 0.6, y1 = h * 0.42;
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(fx, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.strokeStyle = "rgba(160,200,230,.9)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(fx, y0); ctx.lineTo(x1, y1); ctx.stroke();
      const rx = x1, rt = y1 - 4, rb = h - 16;
      ctx.fillStyle = "rgba(200,225,245,.55)"; ctx.fillRect(rx - 22, rt + (rb - rt) * 0.45, 44, (rb - rt) * 0.55);
      O.tube(ctx, rx, rt, rb, 18, [{ f: run ? 0.25 * run.p : 0, col: "#eef3f6" }], { ink: C.ink2 });
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("얼음물 받개", rx, rb + 12);
    }
    // 정보
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`; ctx.fillText(label(), 12, 20);
    if (run) { ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.fillText(`경과 ${Math.min(run.tEnd, run.tt).toFixed(0)} s`, 12, 37); }
    // 생성물 시험관
    const tx = w * 0.86, top = 22, bot = h - 26, tw = Math.min(30, w * 0.07);
    let layers = [{ f: 0.3, col: "#eef3f6" }], o = { t };
    if (lastTest && run) {
      const pr = run.prod;
      if (lastTest === "tol") { layers = [{ f: 0.35, col: pr === "ald" ? "#c9cdd2" : "#eef3f6" }]; if (pr === "ald") o.mirror = true; }
      else if (lastTest === "dnp") { layers = [{ f: 0.35, col: "#f4c34a" }]; if (pr === "ald" || pr === "ket") { o.ppt = "#e8901f"; o.pptH = 14; } }
      else if (lastTest === "hco") { if (pr === "acid") o.bubbles = 12; o.ppt = "#ffffff"; o.pptH = 4; }
      else if (lastTest === "ph") { const ph = run.ph ?? 7; ctx.fillStyle = ph < 4 ? "#e0573a" : ph < 6 ? "#f0a63a" : "#e8c64a"; ctx.fillRect(tx - 26, top + 10, 12, 50); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(tx - 26, top + 10, 12, 50); }
    }
    O.tube(ctx, tx, top, bot, tw, layers, o);
    if (lastTest) { ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText({ tol: "톨렌스", dnp: "2,4-DNP", ph: "pH 시험지", hco: "NaHCO₃" }[lastTest], tx, bot + 14); }
  }
  function drawPlot() {
    const { ctx, size } = pl, { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const groups = ["et", "ip", "tb", "X", "Y"].map((k) => ({ k, name: A[k] ? A[k].name : `미지 ${k}`, xs: tbl.rows.filter((r) => r.key === k && typeof r.tg === "number").map((r) => r.tg), none: tbl.rows.some((r) => r.key === k && r.tg === "변화 없음") }));
    const x0 = 44, y0 = 16, gw = w - 58, gh = h - 46, ymax = 100, n = groups.length;
    const X = (i) => x0 + (i + 0.5) / n * gw, Y = (v) => y0 + gh - v / ymax * gh;
    NM.axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [], yt: L.ticks(0, ymax, 4).map((v) => [v, String(v)]), ylabel: "초록색까지 걸린 시간 (s)" });
    ctx.textAlign = "center"; ctx.font = `10.5px ${F.sans}`;
    groups.forEach((g, i) => {
      ctx.fillStyle = C.ink2; ctx.fillText(g.name, X(i), y0 + gh + 14);
      const s = L.stats(g.xs);
      if (s.n) {
        const bw = gw / n * 0.42;
        ctx.fillStyle = "rgba(79,143,92,.55)"; ctx.fillRect(X(i) - bw / 2, Y(s.mean), bw, Y(0) - Y(s.mean));
        if (s.n > 1) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X(i), Y(s.mean - s.sd)); ctx.lineTo(X(i), Y(s.mean + s.sd)); ctx.moveTo(X(i) - 4, Y(s.mean + s.sd)); ctx.lineTo(X(i) + 4, Y(s.mean + s.sd)); ctx.moveTo(X(i) - 4, Y(s.mean - s.sd)); ctx.lineTo(X(i) + 4, Y(s.mean - s.sd)); ctx.stroke(); }
        ctx.fillStyle = C.ink; ctx.font = `10px ${F.mono}`; ctx.fillText(`${s.mean.toFixed(0)} s (n=${s.n})`, X(i), Y(Math.min(ymax, s.mean + (s.sd || 0))) - 6); ctx.font = `10.5px ${F.sans}`;
      } else if (g.none) { ctx.fillStyle = C.warn; ctx.fillText("변화 없음", X(i), Y(0) - 8); }
    });
  }
  function start() {
    const k = real(), a = A[k], tg = a.t90 ? L.measure(a.t90, { rel: 0.12, res: 1 }) : null;
    run = { key: sel, k, mode, tt: 0, tEnd: tg ? (mode === "reflux" ? Math.max(tg * 1.6, 90) : tg * 1.6) : 300, tg, p: 0, prod: prod(k, mode), ph: null, row: null, done: false };
    run.row = { key: sel, a: label(), m: mode === "dist" ? "바로 증류" : "환류 후 증류", tg: "…", tol: "—", dnp: "—", ph: "—", hco: "—" };
    tbl.add(run.row); lastTest = null;
    obs.innerHTML = `<b>${label()}</b>: 가열 중입니다.`;
  }
  function step(dt) {
    if (!run || run.done) return;
    run.tt += dt;
    run.p = run.tg ? 1 - Math.exp(-run.tt / (run.tg / Math.log(10))) : 0;
    if (run.tt >= run.tEnd) {
      run.done = true; run.p = run.tg ? 1 : 0;
      run.row.tg = run.tg ?? "변화 없음"; tbl.add(tbl.rows.splice(tbl.rows.indexOf(run.row), 1)[0]);
      obs.innerHTML = run.tg ? `<b>${label()}</b>: 주황색이 ${run.tg} s 만에 초록색으로 바뀌었습니다. 받은 액체를 시험하세요.` : `<b>${label()}</b>: 5분이 지나도 주황색 그대로입니다.`;
    }
  }
  function test(kind) {
    if (!run || !run.done) { obs.textContent = "먼저 산화를 끝내고 받은 액체로 시험하세요."; return; }
    lastTest = kind; t = 0; const pr = run.prod, r = run.row;
    if (kind === "tol") { r.tol = pr === "ald" ? "은거울" : "없음"; obs.innerHTML = pr === "ald" ? "<b>톨렌스</b>: 물중탕에서 데우자 시험관 벽에 은이 거울처럼 입혀졌습니다." : "<b>톨렌스</b>: 투명한 그대로입니다."; }
    if (kind === "dnp") { r.dnp = pr === "ald" || pr === "ket" ? "주황 침전" : "없음"; obs.innerHTML = r.dnp === "주황 침전" ? "<b>2,4-DNP</b>: 노란~주황색 침전이 생겼습니다." : "<b>2,4-DNP</b>: 노란 용액 그대로, 침전이 없습니다."; }
    if (kind === "ph") { run.ph = L.measure(PH[pr], { sd: 0.4, res: 1 }); r.ph = run.ph; obs.innerHTML = `<b>pH 시험지</b>: 약 ${run.ph}`; }
    if (kind === "hco") { r.hco = pr === "acid" ? "기포" : "없음"; obs.innerHTML = pr === "acid" ? "<b>NaHCO₃</b>: 가루 둘레에서 기포(CO₂)가 계속 올라옵니다." : "<b>NaHCO₃</b>: 기포가 생기지 않습니다."; }
    tbl.add(tbl.rows.splice(tbl.rows.indexOf(r), 1)[0]);
    draw();
  }
  const press = (sel0, attr, v) => root.querySelectorAll(`[${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x.getAttribute(attr) === v)));
  $(".alc").addEventListener("click", (e) => { const b = e.target.closest("[data-a]"); if (!b) return; sel = b.dataset.a; press(0, "data-a", sel); run = null; lastTest = null; obs.textContent = "산화를 시작하세요."; draw(); });
  $(".mode").addEventListener("click", (e) => { const b = e.target.closest("[data-m]"); if (!b) return; mode = b.dataset.m; press(0, "data-m", mode); run = null; lastTest = null; draw(); });
  $(".ox").addEventListener("click", start);
  ["tol", "dnp", "ph", "hco"].forEach((k) => $(".t-" + k).addEventListener("click", () => test(k)));
  $(".clear").addEventListener("click", () => { tbl.clear(); run = null; lastTest = null; draw(); });
  loop($(".cv-wide"), (dt) => { t += dt; step(dt * 10); draw(); });
  if (L.demo) {
    const go = (a, m, tests) => { sel = a; mode = m; start(); while (!run.done) step(1); tests.forEach(test); };
    go("et", "dist", ["tol", "dnp", "ph"]); go("et", "dist", []); go("et", "reflux", ["tol", "ph", "hco"]);
    go("ip", "dist", ["tol", "dnp", "ph"]); go("ip", "dist", []); go("tb", "dist", ["tol", "dnp", "ph"]);
    go("X", "dist", ["dnp", "tol"]);
    root.querySelector('[data-a="et"]').click(); go("et", "dist", ["tol"]);
  }
  draw();
})();
