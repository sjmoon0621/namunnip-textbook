/* 카드: 무엇을 고정하고 무엇을 바꿔야 할까? — H₂O₂ 분해 속도 실험 설계, 농도·온도·촉매, 아레니우스 그래프 */
(() => {
  const root = document.getElementById("card-labchem-rate-design");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  /* 1차 속도 상수(25 °C, s⁻¹)와 Ea(J/mol). 모식값: 촉매 없음 ~75, I⁻ ~56, 카탈레이스 ~23 kJ/mol (문헌 범위), MnO₂ 58은 가정 */
  const CAT = {
    none: { name: "없음", k: 2e-6, ea: 75e3, sd: 0.03 },
    mno2: { name: "MnO₂", k: 0.008, ea: 58e3, sd: 0.10 },
    ki: { name: "KI", k: 0.004, ea: 56e3, sd: 0.03 },
    yeast: { name: "효모", k: 0.010, ea: 23e3, sd: 0.06 },
  };
  const R = 8.314, VM = 24.5, COL = [C.forest, C.warn, C.amber, C.ink2];
  let cat = "ki", view = "vt", run = null;

  const tbl = L.table($(".tbl-host"), [
    { key: "c", label: "촉매" }, { key: "p", label: "H₂O₂ (%)", res: 0.1 }, { key: "T", label: "T (°C)", res: 1 },
    { key: "r", label: "초기 속도 (mL/s)", res: 0.001 }, { key: "v", label: "120 s 부피 (mL)", res: 0.5 },
  ], () => { drawPlot(); nums(); });
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function kOf(c, T) {
    const d = CAT[c], Tk = T + 273.15;
    let k = d.k * Math.exp(-d.ea / R * (1 / Tk - 1 / 298.15));
    if (c === "yeast") k /= 1 + Math.exp((T - 46) / 2.5);   // 단백질 변성
    return k * (1 + d.sd * L.gauss());
  }
  function simulate(c, p, T) {
    const n = p / 100 * 5.0 / 34.01, vmax = n / 2 * VM * 1000, k = kOf(c, T + 0.3 * L.gauss());
    const pts = [];
    for (let t = 0; t <= 120; t += 5) pts.push({ x: t, y: Math.min(100, L.measure(vmax * (1 - Math.exp(-k * t)), { sd: 0.3, res: 0.5 })) });
    const f = L.linfit(pts.slice(0, 5).map((q) => q.x), pts.slice(0, 5).map((q) => q.y));   // 처음 20 s
    return { c, p, T, pts, r: f ? Math.max(f.a, 0) : 0, vmax, k };
  }
  function record(d) {
    tbl.add({ c: CAT[d.c].name, ck: d.c, p: d.p, T: d.T, r: d.r, v: d.pts[d.pts.length - 1].y, pts: d.pts });
    design();
  }

  /* 설계 점검: 바로 앞 실행과 달라진 변인 */
  function design() {
    const el = $(".dcheck"), rows = tbl.rows, now = { ck: cat, p: +$(".c").value, T: +$(".t").value };
    el.classList.remove("bad", "good");
    if (!rows.length) { el.textContent = "설계 점검: 첫 실행입니다. 무엇을 바꿀지 먼저 정하세요."; return; }
    const prev = rows[rows.length - 1], diff = [];
    if (prev.ck !== now.ck) diff.push("촉매"); if (prev.p !== now.p) diff.push("농도"); if (prev.T !== now.T) diff.push("온도");
    if (!diff.length) { el.textContent = "설계 점검: 앞 실행과 조건이 같습니다 → 반복 측정"; el.classList.add("good"); }
    else if (diff.length === 1) { el.textContent = `설계 점검: 앞 실행과 달라진 변인은 ${diff[0]} 하나입니다`; el.classList.add("good"); }
    else { el.textContent = `설계 점검: ${diff.join("·")}이(가) 함께 바뀌었습니다 → 앞 실행과 비교하면 원인을 가릴 수 없습니다`; el.classList.add("bad"); }
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const T = +$(".t").value, el = run ? Math.min(120, run.el) : 0;
    const V = run ? run.d.vmax * (1 - Math.exp(-run.d.k * el)) : 0;
    // 항온조
    const bx = 14, by = h * 0.36, bw = Math.min(150, w * 0.34), bh = h - by - 12;
    const warm = (T - 10) / 40;
    ctx.fillStyle = `rgba(${Math.round(150 + 90 * warm)},${Math.round(200 - 40 * warm)},${Math.round(235 - 120 * warm)},.35)`; ctx.fillRect(bx, by + 14, bw, bh - 14);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`항온조 ${T} °C`, bx + 6, by + bh - 8);
    // 플라스크
    const fx = bx + bw * 0.45, ft = by - 26, fb = by + bh - 24, fw = bw * 0.55;
    ctx.fillStyle = "rgba(225,235,245,.9)"; ctx.beginPath(); ctx.moveTo(fx - fw * 0.3, fb - (fb - ft) * 0.45); ctx.lineTo(fx + fw * 0.3, fb - (fb - ft) * 0.45); ctx.lineTo(fx + fw / 2, fb); ctx.lineTo(fx - fw / 2, fb); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(fx - 7, ft); ctx.lineTo(fx - 7, ft + 22); ctx.lineTo(fx - fw / 2, fb); ctx.lineTo(fx + fw / 2, fb); ctx.lineTo(fx + 7, ft + 22); ctx.lineTo(fx + 7, ft); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.fillRect(fx - 9, ft - 6, 18, 8);
    if (run && cat !== "none") {
      const rate = run.d.vmax * run.d.k * Math.exp(-run.d.k * el);
      ctx.fillStyle = "#fff"; for (let i = 0; i < Math.min(30, rate * 15); i++) { ctx.beginPath(); ctx.arc(fx - fw * 0.3 + ((i * 37) % (fw * 0.6)), fb - 6 - ((run.el * 25 + i * 11) % ((fb - ft) * 0.42)), 1.8, 0, Math.PI * 2); ctx.fill(); }
      if (cat === "mno2") { ctx.fillStyle = "#2b2b2b"; ctx.fillRect(fx - 10, fb - 4, 20, 3); }
    }
    // 관과 기체 주사기
    const sx = bx + bw + 20, sy = h * 0.22, sw = w - sx - 14, sh = 26;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx, ft - 6); ctx.lineTo(fx, sy + sh / 2); ctx.lineTo(sx, sy + sh / 2); ctx.stroke();
    ctx.fillStyle = "rgba(240,244,248,.9)"; ctx.fillRect(sx, sy, sw, sh); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.strokeRect(sx, sy, sw, sh);
    const px = sx + sw * Math.min(1, V / 100);
    ctx.fillStyle = "rgba(160,200,240,.35)"; ctx.fillRect(sx, sy + 1, px - sx, sh - 2);
    ctx.fillStyle = C.ink2; ctx.fillRect(px, sy + 2, 4, sh - 4); ctx.fillRect(px + 4, sy + sh / 2 - 2, sx + sw + 10 - px, 4);
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "center";
    for (let m = 0; m <= 100; m += 10) { const x = sx + sw * m / 100; ctx.fillRect(x, sy + sh, 1, m % 50 ? 4 : 7); if (m % 20 === 0) ctx.fillText(m, x, sy + sh + 16); }
    ctx.fillText("mL", sx + sw - 8, sy - 6);
    // 읽기
    ctx.textAlign = "left"; ctx.font = `600 14px ${F.mono}`; ctx.fillStyle = C.ink;
    ctx.fillText(`t = ${el.toFixed(0)} s`, sx, h * 0.62);
    ctx.fillText(`V ≈ ${Math.round(V)} mL`, sx, h * 0.62 + 22);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink3;
    ctx.fillText(`${CAT[cat].name} · H₂O₂ ${(+$(".c").value).toFixed(1)}% 5.0 mL`, sx, h * 0.62 + 44);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 50, y0: 18, w: w - 64, h: h - 52 };
    ctx.font = `10.5px ${F.mono}`;
    if (view === "vt") {
      const rs = tbl.rows.slice(-4), ymax = Math.max(20, ...rs.map((r) => r.v)) * 1.1;
      const P = L.plot(ctx, box, { pts: [], xr: [0, 120], yr: [0, ymax], xlabel: "시간 t (s)", ylabel: "O₂ 부피 (mL)" });
      rs.forEach((r, i) => {
        ctx.strokeStyle = COL[i]; ctx.fillStyle = COL[i]; ctx.lineWidth = 1.4; ctx.beginPath();
        r.pts.forEach((q, j) => (j ? ctx.lineTo(P.X(q.x), P.Y(q.y)) : ctx.moveTo(P.X(q.x), P.Y(q.y)))); ctx.stroke();
        r.pts.forEach((q) => { ctx.beginPath(); ctx.arc(P.X(q.x), P.Y(q.y), 2.6, 0, Math.PI * 2); ctx.fill(); });
        ctx.textAlign = "left"; ctx.fillText(`${r.c} ${r.p}% ${r.T}°C`, box.x0 + 8, box.y0 + 14 + i * 15);
      });
      if (!rs.length) { ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("최근 네 번의 실행이 여기에 그려집니다", box.x0 + box.w / 2, box.y0 + box.h / 2); }
      return;
    }
    const T = +$(".t").value, p = +$(".c").value;
    if (view === "conc") {
      const rs = tbl.rows.filter((r) => r.ck === cat && r.T === T);
      const f = rs.length > 1 ? L.linfit(rs.map((r) => r.p), rs.map((r) => r.r), true) : null;
      L.plot(ctx, box, { pts: rs.map((r) => ({ x: r.p, y: r.r })), fit: f, xr: [0, 3.3], xlabel: "H₂O₂ 농도 (%)", ylabel: "초기 속도 (mL/s)" });
      ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText(`${CAT[cat].name}, ${T} °C 기록만`, box.x0 + box.w - 4, box.y0 + box.h - 8);
      return;
    }
    const rs = tbl.rows.filter((r) => r.ck === cat && r.p === p && r.r > 0);
    const pts = rs.map((r) => ({ x: 1000 / (r.T + 273.15), y: Math.log(r.r) }));
    const f = pts.length > 1 ? L.linfit(pts.map((q) => q.x), pts.map((q) => q.y)) : null;
    const ys = pts.map((q) => q.y), yr = ys.length ? [Math.min(...ys) - 0.3, Math.max(...ys) + 0.7] : [-3, 1];
    L.plot(ctx, box, { pts, fit: f, xr: [3.05, 3.6], yr, xlabel: "1/T (10⁻³ K⁻¹)", ylabel: "ln (초기 속도 / mL·s⁻¹)" });
    ctx.textAlign = "left"; ctx.fillStyle = C.warn;
    if (f) ctx.fillText(`기울기 ${f.a.toFixed(2)}×10³ K → Ea = ${(-f.a * R).toFixed(0)} kJ/mol`, box.x0 + 8, box.y0 + 14);
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText(`${CAT[cat].name}, ${p.toFixed(1)}% 기록만`, box.x0 + box.w - 4, box.y0 + box.h - 8);
  }

  function nums() {
    const last = tbl.rows[tbl.rows.length - 1];
    $(".n-r").textContent = last ? `${last.r.toFixed(3)} mL/s` : "—";
    const T = +$(".t").value, p = +$(".c").value;
    const rc = tbl.rows.filter((r) => r.ck === cat && r.T === T), fc = rc.length > 1 && new Set(rc.map((r) => r.p)).size > 1 ? L.linfit(rc.map((r) => r.p), rc.map((r) => r.r), true) : null;
    $(".n-o").textContent = fc ? `${fc.a.toFixed(3)} (r² ${fc.r2.toFixed(2)})` : "—";
    const ra = tbl.rows.filter((r) => r.ck === cat && r.p === p && r.r > 0), fa = ra.length > 1 && new Set(ra.map((r) => r.T)).size > 1 ? L.linfit(ra.map((r) => 1000 / (r.T + 273.15)), ra.map((r) => Math.log(r.r))) : null;
    $(".n-e").textContent = fa ? `${(-fa.a * R).toFixed(0)} kJ/mol (${CAT[cat].name})` : "—";
  }

  loop($(".cv-wide"), (dt) => {
    if (run) { run.el += dt * 12; if (run.el >= 120 && !run.saved) { record(run.d); run.saved = true; } if (run.el > 130) run = null; }   // 12배속
    drawApp();
  });
  $(".cat").addEventListener("click", (e) => { const b = e.target.closest("[data-c]"); if (!b || (run && !run.saved)) return; cat = b.dataset.c; root.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); design(); drawApp(); drawPlot(); nums(); });
  $(".view").addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (!b) return; view = b.dataset.p; root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot(); });
  const upd = () => { $(".c-out").textContent = (+$(".c").value).toFixed(1); $(".t-out").textContent = $(".t").value; design(); drawApp(); drawPlot(); nums(); };
  [$(".c"), $(".t")].forEach((el) => el.addEventListener("input", upd));
  $(".run").addEventListener("click", () => { if (!run) run = { d: simulate(cat, +$(".c").value, +$(".t").value), el: 0, saved: false }; });
  $(".clear").addEventListener("click", () => { tbl.clear(); design(); });
  upd();

  if (L.demo) {
    const go = (c, p, T) => { cat = c; $(".c").value = p; $(".t").value = T; record(simulate(c, p, T)); };
    go("none", 3, 25); go("mno2", 3, 25); go("yeast", 3, 25);
    go("ki", 3, 25); go("ki", 2, 25); go("ki", 1, 25); go("ki", 3, 25);
    go("ki", 3, 15); go("ki", 3, 35); go("ki", 3, 45);
    cat = "ki"; $(".c").value = 3; $(".t").value = 25;
    root.querySelector('[data-p="arr"]').click(); upd();
  }
})();
