/* 카드: 섞는 양을 바꿔도 변하지 않는 값이 정말 있을까? — FeSCN²⁺ 흡광도로 평형 상수 구하기 */
(() => {
  const root = document.getElementById("card-labchem-fescn");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  /* 참값: K(25 °C) ≈ 138 (이온 세기 0.5 M 근처 문헌값), ε(447 nm) ≈ 4.7×10³ M⁻¹cm⁻¹.
     ΔH = −20 kJ/mol은 온도 효과를 보이기 위한 모식값 */
  const K25 = 138, DH = -20e3, R = 8.314, EPS = 4700;
  const Kof = (T) => K25 * Math.exp(-DH / R * (1 / (T + 273.15) - 1 / 298.15));
  const eqx = (a, b, K) => { const p = K * (a + b) + 1; return (p - Math.sqrt(p * p - 4 * K * K * a * b)) / (2 * K); };
  let mode = "cal", view = "cal", lastA = null, lastSol = null;

  const tbl = L.table($(".tbl-host"), [
    { key: "kind", label: "용액" }, { key: "T", label: "T (°C)", res: 1 },
    { key: "fe", label: "[Fe³⁺]₀ (mM)", res: 0.001 }, { key: "scn", label: "[SCN⁻]₀ (mM)", res: 0.001 }, { key: "A", label: "A", res: 0.001 },
  ], () => { drawPlot(); nums(); drawApp(); });
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  const recipe = () => {
    const V = +$(".v").value;
    return mode === "cal" ? { kind: "검량선", fe: 0.200, scn: 2.00e-4 * V / 10 } : { kind: "혼합물", fe: 1.00e-3, scn: 2.00e-3 * V / 10 };
  };
  function measure(sol) {
    const T = +$(".t").value;
    const fe = sol.fe * (1 + 0.004 * L.gauss()), scn = sol.scn * (1 + 0.015 * L.gauss());   // 피펫·뷰렛 부피 오차
    const x = eqx(fe, scn, Kof(T));
    const A = L.measure(EPS * 1.00 * x, { sd: 0.003, rel: 0.01, res: 0.001 });   // 큐벳 위치·기포
    lastA = A; lastSol = sol;
    tbl.add({ kind: sol.kind, T, fe: sol.fe * 1000, scn: sol.scn * 1000, A, feM: sol.fe, scnM: sol.scn });
    drawApp();
  }

  const slope = () => {
    const c = tbl.rows.filter((r) => r.kind === "검량선");
    return c.length >= 2 ? L.linfit(c.map((r) => r.scnM), c.map((r) => r.A), true) : null;
  };
  const kRows = () => {
    const s = slope(); if (!s) return [];
    return tbl.rows.filter((r) => r.kind !== "검량선").map((r) => {
      const x = r.A / s.a, fe = r.feM - x, scn = r.scnM - x;
      return { ...r, x, K: fe > 0 && scn > 0 ? x / (fe * scn) : NaN };
    });
  };

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const sol = lastSol || recipe(), A = lastA;
    const y = h * 0.34;
    // 광원
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(30, y, 13, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.stroke();
    // 필터
    const fx = w * 0.2; ctx.fillStyle = "#4a6fd1"; ctx.fillRect(fx - 7, y - 24, 14, 48);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("447 nm", fx, y + 40);
    // 빛줄기
    const T = A != null ? Math.pow(10, -A) : 1;
    ctx.fillStyle = "rgba(240,190,60,.35)"; ctx.fillRect(43, y - 7, fx - 50, 14);
    ctx.fillStyle = "rgba(90,130,230,.4)"; ctx.fillRect(fx + 7, y - 6, w * 0.42 - fx - 7, 12);
    const cx = w * 0.48, cw = 30;
    ctx.fillStyle = `rgba(90,130,230,${0.08 + 0.35 * T})`; ctx.fillRect(cx + cw / 2, y - 6 * T - 1, w * 0.68 - cx - cw / 2, 12 * T + 2);
    // 큐벳
    const conc = A != null ? Math.min(1, A / 0.9) : 0;
    ctx.fillStyle = `rgba(${200 - 40 * conc},${70 - 40 * conc},${40 - 20 * conc},${0.08 + 0.75 * conc})`;
    ctx.fillRect(cx - cw / 2, y - 34, cw, 70);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.4; ctx.strokeRect(cx - cw / 2, y - 48, cw, 84);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.fillText("b = 1.00 cm", cx, y + 52);
    // 검출기와 표시창
    const dx = w * 0.7; ctx.fillStyle = C.ink2; ctx.fillRect(dx, y - 18, 12, 36);
    ctx.fillStyle = C.night; ctx.fillRect(dx + 22, y - 24, w - dx - 30, 48);
    ctx.fillStyle = "#9fe08a"; ctx.font = `600 17px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillText(A != null ? `A ${A.toFixed(3)}` : "A -.---", w - 14, y + 2);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = "#c9d9c3";
    ctx.fillText(A != null ? `T ${(100 * T).toFixed(1)}%` : "T ---%", w - 14, y + 17);
    // 기록한 용액 시험관 (최근 8개, 색 진하기 = 흡광도)
    const rec = tbl.rows.slice(-8);
    rec.forEach((r, i) => {
      const tx = 22 + i * 30, ty = y + 66, c = Math.min(1, r.A / 0.9);
      ctx.fillStyle = `rgba(${200 - 40 * c},${70 - 40 * c},${40 - 20 * c},${0.08 + 0.75 * c})`; ctx.fillRect(tx, ty + 14, 14, h - 52 - ty - 14);
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(tx, ty, 14, h - 52 - ty);
    });
    if (rec.length) { ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("기록한 용액 (최근 8개)", 22 + rec.length * 30, y + 80); }
    // 아래 설명
    ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.font = `12px ${F.mono}`;
    ctx.fillText(`${sol.kind}: [Fe³⁺]₀ ${(sol.fe * 1000).toFixed(sol.fe > 0.01 ? 0 : 2)} mM, [SCN⁻]₀ ${(sol.scn * 1000).toFixed(3)} mM`, 14, h - 30);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`;
    ctx.fillText(`${$(".t").value} °C 항온 · 측정 전 0.5 M HNO₃로 영점(A = 0) 맞춤`, 14, h - 12);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 50, y0: 18, w: w - 64, h: h - 52 };
    if (view === "cal") {
      const c = tbl.rows.filter((r) => r.kind === "검량선"), s = slope();
      L.plot(ctx, box, { pts: c.map((r) => ({ x: r.scn, y: r.A })), fit: s ? { a: s.a / 1000, b: 0 } : null, xr: [0, 0.11], yr: [0, 0.55], xlabel: "[FeSCN²⁺] = [SCN⁻]₀ (mM)", ylabel: "흡광도 A" });
      if (s) { ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`A = ${Math.round(s.a)} × c   (r² = ${s.r2.toFixed(4)})`, box.x0 + 8, box.y0 + 14); }
    } else {
      const k = kRows().filter((r) => Number.isFinite(r.K));
      const at25 = k.filter((r) => r.T === 25), oth = k.filter((r) => r.T !== 25);
      const P = L.plot(ctx, box, { pts: at25.map((r) => ({ x: r.scn, y: r.K })), xr: [0, 1.1], yr: [0, 300], xlabel: "[SCN⁻]₀ (mM)", ylabel: "K" });
      const m = L.stats(at25.map((r) => r.K)).mean;
      if (Number.isFinite(m)) { ctx.strokeStyle = C.forest; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(box.x0, P.Y(m)); ctx.lineTo(box.x0 + box.w, P.Y(m)); ctx.stroke(); ctx.setLineDash([]); }
      ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
      oth.forEach((r, i) => { const px = P.X(r.scn) + 4 * (i % 3), py = P.Y(Math.min(295, r.K)); ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(px, py, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.fillText(`${r.T}°C`, px + 5, py - 4); });
      if (!k.length) { ctx.fillStyle = C.ink3; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("검량선(2개 이상)과 혼합물을 재면 K가 계산됩니다", box.x0 + box.w / 2, box.y0 + box.h / 2); }
      else { ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("초록: 25 °C · 주황: 다른 온도", box.x0 + box.w, box.y0 + 12); }
    }
  }

  function nums() {
    const s = slope(), k = kRows();
    $(".n-s").textContent = s ? `${Math.round(s.a)} M⁻¹` : "—";
    const lx = k.length ? k[k.length - 1] : null;
    $(".n-x").textContent = lx ? `${(lx.x * 1e6).toFixed(1)} μM` : "—";
    const st = L.stats(k.filter((r) => r.T === 25).map((r) => r.K));
    $(".n-k").textContent = st.n ? `${st.mean.toFixed(0)}${st.n > 1 ? " ± " + st.sd.toFixed(0) : ""} (n=${st.n})` : "—";
  }

  const setMode = (m) => { mode = m; root.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.m === m))); lastA = null; lastSol = null; drawApp(); };
  const setView = (v) => { view = v; root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.p === v))); drawPlot(); };
  $(".mode").addEventListener("click", (e) => { const b = e.target.closest("[data-m]"); if (b) { setMode(b.dataset.m); setView(b.dataset.m === "cal" ? "cal" : "k"); } });
  $(".view").addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (b) setView(b.dataset.p); });
  const upd = () => { $(".v-out").textContent = (+$(".v").value).toFixed(1); $(".t-out").textContent = $(".t").value; lastA = null; lastSol = null; drawApp(); };
  [$(".v"), $(".t")].forEach((el) => el.addEventListener("input", upd));
  $(".meas").addEventListener("click", () => measure(recipe()));
  $(".addfe").addEventListener("click", () => {
    if (mode !== "mix") setMode("mix");
    const s = recipe();   // 0.200 M Fe³⁺ 한 방울(0.05 mL)을 10 mL에: +1.0 mM, 부피 변화는 0.5%라 무시
    measure({ kind: "혼합+Fe", fe: s.fe + 1.00e-3, scn: s.scn });
    setView("k");
  });
  $(".clear").addEventListener("click", () => { tbl.clear(); lastA = null; lastSol = null; drawApp(); });
  upd(); nums();
  if (L.demo) {
    [1, 2, 3, 4, 5].forEach((v) => { $(".v").value = v; measure(recipe()); });
    setMode("mix");
    [1, 2, 3, 4, 5].forEach((v) => { $(".v").value = v; measure(recipe()); });
    $(".v").value = 3; measure({ kind: "혼합+Fe", fe: 2.00e-3, scn: 6.00e-4 });
    $(".t").value = 40; measure(recipe());
    $(".v-out").textContent = "3.0"; $(".t-out").textContent = "40";
    setView("k"); drawApp();
  }
})();
