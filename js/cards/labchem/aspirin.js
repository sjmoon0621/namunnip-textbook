/* 카드: 아스피린 합성 — 살리실산 + 아세트산 무수물(산 촉매), 가열 시간·촉매·냉각·재결정·건조에 따른 수득률과 순도(FeCl₃, 녹는점) */
(() => {
  const root = document.getElementById("card-labchem-aspirin");
  if (!root || !window.NMOrg) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab, O = NMOrg;
  const $ = (s) => root.querySelector(s);
  const MSA = 138.12, MASA = 180.16, NAA = 5.0 * 1.08 / 102.09;   // 아세트산 무수물 mol
  const K = { h3po4: 0.45, h2so4: 0.55, none: 0.04 };              // 80 °C에서의 1차 속도 상수 (1/분, 모식)
  const CN = { h3po4: "H₃PO₄", h2so4: "H₂SO₄", none: "없음" };
  const CCOL = { h3po4: C.forest, h2so4: C.amber, none: C.ink3 };
  let cat = "h3po4", last = null, shown = false, t = 0;
  const obs = $(".as-obs");
  const tbl = L.table($(".tbl-host"), [{ key: "sa", label: "살리실산 (g)", res: 0.01 }, { key: "c", label: "촉매" }, { key: "tm", label: "가열 (분)" }, { key: "x", label: "처리" }, { key: "m", label: "생성물 (g)", res: 0.01 }, { key: "y", label: "수득률 (%)", res: 1 }, { key: "mp", label: "녹는점 (°C)" }, { key: "fe", label: "FeCl₃" }], () => drawPlot());

  function calc() {
    const sa = +$(".sa").value, n = sa / MSA, lim = Math.min(n, NAA);
    $(".n-sa").textContent = shown ? `${(n * 1000).toFixed(1)} mmol` : "? mmol";
    $(".n-aa").textContent = shown ? `${(NAA * 1000).toFixed(1)} mmol` : "? mmol";
    $(".n-th").textContent = shown ? `${(lim * MASA).toFixed(2)} g` : "? g";
    root.querySelectorAll(".nums dd").forEach((d) => d.classList.toggle("hid", !shown));
    return lim * MASA;
  }
  function run() {
    const sa = +$(".sa").value, tm = +$(".tm").value, ice = $(".ice").checked, recr = $(".recr").checked, dry = $(".dry").checked;
    const theo = calc(), X = 1 - Math.exp(-K[cat] * tm);
    let asp = X * theo * (ice ? 0.9 : 0.8), saLeft = (1 - X) * sa * 0.8;
    if (recr) { asp *= 0.8; saLeft *= 0.15; }
    const imp = saLeft / (asp + saLeft) * 100;
    const m = L.measure((asp + saLeft) * (dry ? 1 : 1.18), { sd: 0.02, res: 0.01 });
    const ic = Math.min(imp, 30), wetDrop = dry ? 0 : 6;
    const on = L.snap(L.measure(135 - 0.9 * ic - wetDrop, { sd: 0.5 }), 0.5), wd = L.snap(1 + 0.4 * ic + (dry ? 0 : 3), 0.5);
    const fe = imp < 0.5 ? "노란색" : imp < 3 ? "연보라" : "진보라";
    const x = [ice ? "얼음" : "실온", recr ? "재결정" : "", dry ? "" : "덜 마름"].filter(Boolean).join("·");
    tbl.add({ sa, c: CN[cat], cat, tm, x, recr, m, y: m / theo * 100, mp: imp > 40 ? "넓게 녹음" : `${on.toFixed(1)}–${(on + wd).toFixed(1)}`, fe });
    last = { X, m, theo, imp, fe, t0: 0 };
    obs.innerHTML = `<b>${sa.toFixed(2)} g, ${CN[cat]}, ${tm}분</b>: 흰 결정 ${m.toFixed(2)} g을 얻었습니다. FeCl₃ 시험은 ${fe === "노란색" ? "노란색 그대로(살리실산 거의 없음)" : fe === "연보라" ? "연한 보라색(살리실산이 조금 남음)" : "진한 보라색(살리실산이 많이 남음)"}입니다.`;
    t = 0; draw();
  }

  const app = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  /* 벤젠 고리 + 위(−COOH)와 오른쪽 위(−OH 또는 −OCOCH₃) 치환기 */
  function ringMol(ctx, cx, cy, r, sub2, hl) {
    const P = (k) => [cx + r * Math.cos((-90 + 60 * k) * Math.PI / 180), cy + r * Math.sin((-90 + 60 * k) * Math.PI / 180)];
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.beginPath(); for (let k = 0; k <= 6; k++) { const [x, y] = P(k % 6); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2); ctx.stroke();
    const [x0, y0] = P(0), [x1, y1] = P(1);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 - 12); ctx.moveTo(x1, y1); ctx.lineTo(x1 + 11, y1 - 6); ctx.stroke();
    ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillStyle = "#c0392b"; ctx.fillText("COOH", x0, y0 - 16);
    ctx.textAlign = "left";
    if (hl) { const tw = ctx.measureText(sub2).width; ctx.fillStyle = "rgba(224,160,42,.3)"; ctx.fillRect(x1 + 11, y1 - 17, tw + 4, 16); }
    ctx.fillStyle = "#c0392b"; ctx.fillText(sub2, x1 + 13, y1 - 5);
  }
  function draw() {
    const { ctx, size } = app, { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    // 반응식
    const ey = h * 0.25, r = Math.min(22, h * 0.07);
    ringMol(ctx, w * 0.1, ey, r, "OH", true);
    ctx.fillStyle = C.ink; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("+ (CH₃CO)₂O", w * 0.3, ey + 4);
    ctx.fillText("→", w * 0.43, ey + 4); ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.fillText("H⁺, 80 °C", w * 0.43, ey - 10);
    ringMol(ctx, w * 0.54, ey, r, "OCOCH₃", true);
    ctx.fillStyle = C.ink; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("+ CH₃COOH", w * 0.86, ey + 4);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`;
    ctx.fillText("살리실산", w * 0.1, ey + r + 16); ctx.fillText("아스피린 (아세틸살리실산)", w * 0.56, ey + r + 16); ctx.fillText("아세트산", w * 0.86, ey + 20);
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(10, h * 0.47); ctx.lineTo(w - 10, h * 0.47); ctx.stroke();
    // ① 가열
    const by = h * 0.56, bb = h - 24, s1 = w * 0.17;
    ctx.fillStyle = "rgba(160,200,230,.35)"; ctx.fillRect(s1 - 50, by + 30, 100, bb - by - 30);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(s1 - 50, by + 10); ctx.lineTo(s1 - 50, bb); ctx.lineTo(s1 + 50, bb); ctx.lineTo(s1 + 50, by + 10); ctx.stroke();
    const fb = bb - 6, ft = by + 8, fw = 34;
    ctx.fillStyle = "rgba(238,243,246,.95)"; ctx.beginPath(); ctx.moveTo(s1 - fw + 6, fb - 26); ctx.lineTo(s1 - fw, fb); ctx.lineTo(s1 + fw, fb); ctx.lineTo(s1 + fw - 6, fb - 26); ctx.fill();
    if (last) { ctx.fillStyle = "rgba(255,255,255,.95)"; for (let i = 0; i < 6; i++) ctx.fillRect(s1 - 20 + i * 7, fb - 4 - (i % 2) * 3, 4, 3); }
    ctx.strokeStyle = C.ink2; ctx.beginPath(); ctx.moveTo(s1 - 6, ft); ctx.lineTo(s1 - 6, fb - 44); ctx.lineTo(s1 - fw, fb); ctx.lineTo(s1 + fw, fb); ctx.lineTo(s1 + 6, fb - 44); ctx.lineTo(s1 + 6, ft); ctx.stroke();
    // ② 감압 여과
    const s2 = w * 0.5, fy = by + 14, fr = 42;
    ctx.strokeStyle = C.ink2; ctx.beginPath(); ctx.moveTo(s2 - fr, fy); ctx.lineTo(s2 - fr + 6, fy + 34); ctx.lineTo(s2 + fr - 6, fy + 34); ctx.lineTo(s2 + fr, fy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s2 - 6, fy + 34); ctx.lineTo(s2 - 4, fy + 56); ctx.moveTo(s2 + 6, fy + 34); ctx.lineTo(s2 + 4, fy + 56); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s2 - 30, fy + 56); ctx.lineTo(s2 - 34, bb); ctx.lineTo(s2 + 34, bb); ctx.lineTo(s2 + 30, fy + 56); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s2 + 30, fy + 66); ctx.lineTo(s2 + 50, fy + 66); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("진공", s2 + 53, fy + 69);
    if (last) {
      const hh = Math.min(26, 26 * last.m / 2.6);
      ctx.fillStyle = last.imp > 3 ? "#f3f0e4" : "#ffffff"; ctx.fillRect(s2 - fr + 8, fy + 32 - hh, 2 * fr - 16, hh);
      ctx.strokeStyle = "rgba(141,141,146,.6)"; ctx.lineWidth = 1; ctx.strokeRect(s2 - fr + 8.5, fy + 32.5 - hh, 2 * fr - 17, hh);
      ctx.fillStyle = "rgba(255,255,255,.9)"; for (let i = 0; i < 4; i++) { const yy = fy + 60 + ((t * 20 + i * 12) % Math.max(4, bb - fy - 64)); ctx.fillRect(s2 - 2, yy, 3, 4); }
    }
    // ③ FeCl₃ 시험
    const s3 = w * 0.83, col = !last ? "#ecd57a" : last.fe === "노란색" ? "#ecd57a" : last.fe === "연보라" ? "#b48ab8" : "#6b2d8a";
    O.tube(ctx, s3, by - 4, bb - 4, 24, [{ f: 0.45, col }]);
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("① 80 °C 물중탕 가열", s1, h - 8); ctx.fillText("② 얼음물 석출 · 감압 여과", s2, h - 8); ctx.fillText("③ FeCl₃ 시험", s3, h - 8);
  }
  function drawPlot() {
    const { ctx, size } = pl, { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = L.plot(ctx, { x0: 44, y0: 18, w: w - 60, h: h - 52 }, { pts: [], model: (x) => 100 * 0.9 * (1 - Math.exp(-K.h3po4 * x)), xr: [0, 20], yr: [0, 120], xlabel: "가열 시간 (분)", ylabel: "수득률 (%)" });
    tbl.rows.forEach((row) => {
      ctx.fillStyle = CCOL[row.cat]; ctx.strokeStyle = CCOL[row.cat]; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(r.X(row.tm), r.Y(Math.min(row.y, 120)), 3.6, 0, Math.PI * 2); row.recr ? ctx.stroke() : ctx.fill();
    });
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("점선: H₃PO₄·얼음물·건조 조건의 예상 곡선", r.X(20) - 2, r.Y(8));
  }
  $(".cat").addEventListener("click", (e) => { const b = e.target.closest("[data-c]"); if (!b) return; cat = b.dataset.c; root.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); });
  $(".sa").addEventListener("input", () => { $(".sa-out").textContent = (+$(".sa").value).toFixed(2); calc(); });
  $(".tm").addEventListener("input", () => { $(".tm-out").textContent = $(".tm").value; });
  $(".run").addEventListener("click", run);
  $(".calc").addEventListener("click", () => { shown = !shown; $(".calc").textContent = shown ? "계산 숨기기" : "계산 보기"; calc(); });
  $(".clear").addEventListener("click", () => tbl.clear());
  loop($(".cv-wide"), (dt) => { if (!last) return; t += dt; draw(); });
  if (L.demo) {
    const set = (tm, c, o = {}) => { $(".tm").value = tm; $(".tm").dispatchEvent(new Event("input")); cat = c; $(".ice").checked = o.ice ?? true; $(".recr").checked = !!o.recr; $(".dry").checked = o.dry ?? true; run(); };
    [2, 5, 10, 15].forEach((tm) => set(tm, "h3po4"));
    set(10, "h2so4"); set(10, "none"); set(20, "none"); set(10, "h3po4", { dry: false }); set(10, "h3po4", { ice: false }); set(15, "h3po4", { recr: true });
    shown = true; $(".calc").textContent = "계산 숨기기"; calc();
    $(".recr").checked = false; set(10, "h3po4");
  }
  calc(); draw();
})();
