/* 카드: 전압을 올리는데 왜 전류가 4.9 V마다 줄어들까? — 프랑크–헤르츠 실험 (수은관) */
(() => {
  const root = document.getElementById("card-labphy-franck-hertz");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sU = $(".u"), sT = $(".t"), sR = $(".r");
  const EX = 4.886;      // 수은 6¹S₀ → 6³P₁ 들뜸 에너지 (eV), 253.7 nm
  const UC = 2.0;        // 접촉 전위 (V), 관마다 다름 (예시값)
  const GX = 0.86;       // 음극–그리드 구간이 차지하는 비율 (그림)
  const COLS = [C.forest, C.warn, "#4a78b5", C.amber, "#7d4f8f", C.ink2];

  /* 같은 난수 묶음을 계속 써서 (공통 난수) 곡선이 매끄럽게 나오게 한다 */
  const M = 700, NJ = 8, EPS = [], TH = [];
  for (let k = 0; k < M; k++) {
    TH.push(0.4 * L.gauss());
    const row = []; for (let j = 0; j < NJ; j++) row.push(-Math.log(1 - Math.random())); EPS.push(row);
  }
  const kappa = (T) => 3 * Math.exp((T - 180) / 12);   // 들뜸 문턱을 넘은 뒤 1 eV당 충돌 확률 (증기 압력 따라)

  /* 양극 전류의 참값 (nA, 예시 크기) */
  function current(U, T, U3) {
    const g = U - UC; if (g <= 0) return 0;
    const ka = kappa(T); let n = 0;
    for (let k = 0; k < M; k++) {
      let s = g + TH[k];
      for (let j = 0; j < NJ; j++) { if (s < EX || EPS[k][j] / ka >= s - EX) break; s -= EX; }
      if (s > U3) n++;
    }
    return 0.03 * g ** 1.5 * Math.exp(-(T - 180) / 35) * n / M;
  }

  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "U", label: "U (V)", res: 0.1 }, { key: "I", label: "I (nA)", res: 0.01 }, { key: "T", label: "T (°C)", res: 1 }, { key: "U3", label: "U₃ (V)", res: 0.1 },
  ], () => drawPlot());

  /* 모식도: 전자들의 위치와 에너지 */
  let els = [], spawn = 0, hits = [], recent = [];
  const atoms = Array.from({ length: 46 }, () => [Math.random() * GX, Math.random()]);
  function step(dt) {
    const U = +sU.value, U3 = +sR.value, ka = kappa(+sT.value), g = Math.max(0, U - UC);
    spawn += dt * 5;
    while (spawn > 1) { spawn--; els.push({ x: 0, E: Math.max(0, 0.15 + 0.1 * L.gauss()), dir: 1, life: 1 }); }
    const dx = dt * 0.28;
    els.forEach((e) => {
      if (e.dir < 0) { e.life -= dt * 1.6; e.x -= dx * 0.5; return; }
      const nx = e.x + dx;
      if (nx <= GX) {
        const dE = g * dx / GX; e.E += dE;
        if (e.E >= EX && Math.random() < 1 - Math.exp(-ka * dE)) { e.E -= EX; hits.push({ x: nx, E: e.E + EX, life: 1 }); }
      } else {
        e.E -= U3 * dx / (1 - GX);
        if (e.E < 0) { e.E = 0; e.dir = -1; recent.push(0); }
      }
      e.x = nx;
      if (e.x >= 1) { e.life = 0; recent.push(1); }
    });
    els = els.filter((e) => e.life > 0);
    hits.forEach((h) => (h.life -= dt * 2.5)); hits = hits.filter((h) => h.life > 0);
    if (recent.length > 60) recent = recent.slice(-60);
  }
  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const U = +sU.value, U3 = +sR.value, g = Math.max(0, U - UC);
    const x0 = 46, x1 = w - 16, y0 = 24, y1 = h - 30, Em = Math.max(7, g + 1);
    const X = (p) => x0 + p * (x1 - x0), Y = (E) => y1 - E / Em * (y1 - y0);
    ctx.fillStyle = "#f1eee4"; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.fillStyle = "rgba(125,79,143,.22)";
    atoms.forEach(([a, b]) => { ctx.beginPath(); ctx.arc(X(a), y0 + b * (y1 - y0), 2.2, 0, Math.PI * 2); ctx.fill(); });
    // 전극
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(X(0), y0); ctx.lineTo(X(0), y1); ctx.stroke();
    ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(GX), y0); ctx.lineTo(X(GX), y1); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(X(1), y0); ctx.lineTo(X(1), y1); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("음극 K", X(0) + 4, y1 + 15); ctx.fillText("그리드 G", X(GX), y1 + 15); ctx.fillText("양극 A", X(1) - 8, y1 + 15);
    // 에너지 축
    ctx.textAlign = "right"; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
    for (let E = 0; E <= Em; E += Em > 16 ? 5 : 2) ctx.fillText(String(E), x0 - 5, Y(E) + 3);
    ctx.textAlign = "left"; ctx.fillText("전자 에너지 (eV)", 4, 12);
    // 4.9 eV 선과 충돌 없이 갈 때의 에너지
    ctx.strokeStyle = "#7d4f8f"; ctx.setLineDash([5, 4]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, Y(EX)); ctx.lineTo(x1, Y(EX)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#7d4f8f"; ctx.font = `10.5px ${F.sans}`; ctx.fillText("수은 들뜸 에너지 4.9 eV", x0 + 6, Y(EX) - 5);
    ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(GX), Y(g)); ctx.lineTo(X(1), Y(g - U3)); ctx.stroke(); ctx.setLineDash([]);
    // 충돌 섬광과 전자
    hits.forEach((hh) => {
      ctx.strokeStyle = `rgba(125,79,143,${hh.life})`; ctx.lineWidth = 1.4; const r = 4 + (1 - hh.life) * 8;
      ctx.beginPath(); ctx.arc(X(hh.x), Y(hh.E), r, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(hh.x), Y(hh.E)); ctx.lineTo(X(hh.x), Y(hh.E - EX)); ctx.stroke();
    });
    els.forEach((e) => {
      ctx.fillStyle = e.dir < 0 ? `rgba(181,83,47,${Math.max(0, e.life)})` : "#2d6fb3";
      ctx.beginPath(); ctx.arc(X(e.x), Y(e.E), 3, 0, Math.PI * 2); ctx.fill();
    });
    const pass = recent.length ? Math.round(100 * recent.reduce((a, b) => a + b, 0) / recent.length) : 0;
    ctx.fillStyle = C.ink; ctx.font = `600 11.5px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillText(`양극 도달 ${recent.length > 10 ? pass + " %" : "—"}`, x1 - 6, y0 + 14);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const groups = new Map();
    tbl.rows.forEach((r) => { const k = `${r.T}|${r.U3.toFixed(1)}`; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); });
    const ym = Math.max(1, ...tbl.rows.map((r) => r.I)) * 1.12;
    const box = { x0: 44, y0: 18, w: w - 58, h: h - 52 };
    const { X, Y } = L.plot(ctx, box, { pts: [], xr: [0, 30], yr: [0, ym], xlabel: "U (V)", ylabel: "I (nA)" });
    let gi = 0;
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    groups.forEach((rs, key) => {
      const col = COLS[gi % COLS.length], s = rs.slice().sort((a, b) => a.U - b.U);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.3;
      ctx.beginPath(); s.forEach((r, i) => (i ? ctx.lineTo(X(r.U), Y(r.I)) : ctx.moveTo(X(r.U), Y(r.I)))); ctx.stroke();
      s.forEach((r) => { ctx.beginPath(); ctx.arc(X(r.U), Y(r.I), 2.2, 0, Math.PI * 2); ctx.fill(); });
      const [T, U3] = key.split("|");
      ctx.fillText(`${T} °C · U₃ ${U3} V`, box.x0 + 8, box.y0 + 12 + gi * 14);
      gi++;
    });
    const lastKey = tbl.rows.length ? `${tbl.rows[tbl.rows.length - 1].T}|${tbl.rows[tbl.rows.length - 1].U3.toFixed(1)}` : null;
    const pk = lastKey ? peaks(groups.get(lastKey)) : [];
    ctx.fillStyle = C.ink;
    pk.forEach((p, i) => {
      const px = X(p.U), py = Y(p.I) - 6;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 4, py - 7); ctx.lineTo(px + 4, py - 7); ctx.closePath(); ctx.fill();
      ctx.textAlign = "center"; ctx.fillText(String(i + 1), px, py - 10);
    });
    $(".n-k").textContent = lastKey ? String(pk.length) : "—";
    if (pk.length >= 2) {
      const f = L.linfit(pk.map((_, i) => i + 1), pk.map((p) => p.U));
      $(".n-du").textContent = `${f.a.toFixed(2)}${pk.length > 2 ? " ± " + f.sa.toFixed(2) : ""} V`;
      $(".n-lam").textContent = `${(1239.84 / f.a).toFixed(0)} nm`;
    } else { $(".n-du").textContent = "—"; $(".n-lam").textContent = "—"; }
  }
  /* 봉우리: 앞뒤 1.2 V 안에서 가장 크고, 주변 2.5 V 안의 골보다 뚜렷이 높은 점 */
  function peaks(rows) {
    const s = rows.slice().sort((a, b) => a.U - b.U), out = [];
    s.forEach((r) => {
      if (r.U < UC + 3) return;
      const near = s.filter((q) => Math.abs(q.U - r.U) <= 1.2), wide = s.filter((q) => Math.abs(q.U - r.U) <= 2.6);
      const after = s.filter((q) => q.U > r.U && q.U - r.U <= 2.6);
      if (near.length < 3 || !after.length) return;
      if (near.some((q) => q.I > r.I) || near.some((q) => q !== r && q.I === r.I && q.U < r.U)) return;
      const lo = Math.min(...after.map((q) => q.I));
      if (r.I - lo > 0.06 * r.I + 0.02 && wide.length > 3) out.push(r);
    });
    return out;
  }

  const rec = (U) => {
    const T = +sT.value, U3 = +sR.value;
    tbl.add({ U, I: Math.max(0, L.measure(current(U, T, U3), { sd: 0.01, rel: 0.01, res: 0.01 })), T, U3 });
  };
  loop($(".cv-wide"), (dt) => { step(dt); drawApp(); });
  const upd = () => {
    $(".u-out").textContent = (+sU.value).toFixed(1); $(".t-out").textContent = sT.value; $(".r-out").textContent = (+sR.value).toFixed(1);
    recent = []; drawApp();
  };
  [sU, sT, sR].forEach((el) => el.addEventListener("input", upd));
  $(".meas").addEventListener("click", () => rec(+sU.value));
  $(".scan").addEventListener("click", () => { for (let i = 0; i <= 60; i++) rec(i * 0.5); });
  $(".clear").addEventListener("click", () => tbl.clear());
  upd();
  if (L.demo) {
    sT.value = 150; for (let i = 0; i <= 60; i++) rec(i * 0.5);
    sT.value = 180; for (let i = 0; i <= 60; i++) rec(i * 0.5);
    upd();
  }
})();
