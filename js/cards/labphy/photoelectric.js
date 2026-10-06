/* 카드: 정지 전압과 진동수의 그래프에서 플랑크 상수를 읽을 수 있을까? — 광전관 I–V 곡선, 정지 전압, h와 일함수 */
(() => {
  const root = document.getElementById("card-labphy-photoelectric");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sLine = $(".line"), sI = $(".inten"), sV = $(".volt"), cRev = $(".rev");
  const W = 1.95;   // 음극 일함수 (eV) — 모식값, 화면에 보이지 않음
  const HC = 1239.84;   // hc (eV·nm)
  // 수은등 선: 파장, 그리는 색, 상대 광전류(램프 선 세기 × 음극 감도, 상대값)
  const LINES = {
    365: { lam: 365.0, col: "#7a4cc2", q: 0.85 },
    405: { lam: 404.7, col: "#5b3fd0", q: 0.8 },
    436: { lam: 435.8, col: "#2f62c9", q: 1.0 },
    546: { lam: 546.1, col: "#3b8f2a", q: 0.55 },
    577: { lam: 577.0, col: "#c8961a", q: 0.25 },
  };
  let mode = "iv", reading = 0, tick = 0;
  const parts = [];

  const Kmax = (k) => HC / LINES[k].lam - W;
  const fOf = (k) => 2.99792458e8 / (LINES[k].lam * 1e-9) / 1e14;
  // 참 전류 (nA): 포화 전류 × 수집 비율 − 양극 역전류
  function cur(k, inten, V, rev) {
    const K = Kmax(k), Is = 30 * inten / 100 * LINES[k].q;
    let g = 0;
    if (K > 0) g = V >= 0 ? 1 - 0.35 * Math.exp(-V / 0.6) : 0.65 * Math.max(0, 1 + V / K) ** 2;
    let I = Is * g;
    if (rev && V < 0) I -= 0.03 * Is * (1 - Math.exp(V / 0.25));
    return I;
  }
  const read = (k, inten, V, rev) => L.measure(cur(k, inten, V, rev), { sd: 0.02, rel: 0.015, res: 0.01 });

  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tIV = L.table($(".tbl-iv"), [
    { key: "lam", label: "λ (nm)", res: 0.1 }, { key: "inten", label: "세기 (%)", res: 1 },
    { key: "V", label: "V (V)", res: 0.01 }, { key: "I", label: "I (nA)", res: 0.01 },
  ], () => drawPlot());
  const tV0 = L.table($(".tbl-v0"), [
    { key: "lam", label: "λ (nm)", res: 0.1 }, { key: "f", label: "f (10¹⁴ Hz)", res: 0.001 }, { key: "V0", label: "V₀ (V)", res: 0.01 },
  ], () => drawPlot());

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = sLine.value, ln = LINES[k], V = +sV.value, inten = +sI.value;
    const tx = w * 0.56, ty = h * 0.36, rx = Math.min(92, w * 0.2), ry = h * 0.25;
    const cathX = tx + rx * 0.55, anX = tx - rx * 0.45;
    // 수은등과 필터
    ctx.fillStyle = C.ink; ctx.fillRect(12, ty - 22, 40, 44);
    ctx.fillStyle = "#e9ecff"; ctx.beginPath(); ctx.arc(32, ty, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("수은등", 32, ty + 38);
    const fx = w * 0.2;
    ctx.fillStyle = ln.col; ctx.globalAlpha = 0.85; ctx.fillRect(fx - 4, ty - 20, 8, 40); ctx.globalAlpha = 1;
    ctx.fillStyle = C.ink2; ctx.fillText("필터", fx, ty + 38);
    // 빛줄기 (조리개에 따라 굵기)
    const bw = 4 + 10 * inten / 100;
    ctx.fillStyle = "rgba(230,232,255,0.6)"; ctx.fillRect(52, ty - bw / 2, fx - 56, bw);
    ctx.fillStyle = ln.col; ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.moveTo(fx + 4, ty - bw / 2); ctx.lineTo(cathX - 6, ty - ry * 0.55); ctx.lineTo(cathX - 6, ty + ry * 0.55); ctx.lineTo(fx + 4, ty + bw / 2); ctx.fill();
    if (cRev.checked) { ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(anX, ty, 9, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
    if (k === "365") { ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.fillText("(눈에 보이지 않음)", (fx + cathX) / 2, ty - ry * 0.7); }
    // 유리관
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(tx, ty, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
    // 음극 (반원통)과 양극 (막대)
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cathX - ry * 0.55, ty, ry * 0.7, -0.75, 0.75); ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(anX, ty - ry * 0.6); ctx.lineTo(anX, ty + ry * 0.6); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("양극 A", anX, ty - ry - 6); ctx.fillText("음극 K", cathX + 10, ty - ry - 6);
    // 전자
    ctx.fillStyle = C.warn;
    for (const p of parts) { const x = cathX - 6 + (anX - cathX + 6) * p.s; ctx.beginPath(); ctx.arc(x, ty + p.y * ry * 0.5, 2.2, 0, Math.PI * 2); ctx.fill(); }
    // 회로: 음극 → 전류계 → 전원 → 양극 (직렬)
    const by = h * 0.88, ax = Math.min(w - 50, Math.max(w * 0.86, tx + rx + 52)), ay = ty + ry * 0.35;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.beginPath();
    ctx.moveTo(cathX + 2, ty); ctx.lineTo(ax, ty); ctx.lineTo(ax, by); ctx.lineTo(anX, by); ctx.lineTo(anX, ty + ry * 0.6); ctx.stroke();
    const box = (x, y, label, val, col) => {
      ctx.fillStyle = C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
      ctx.fillRect(x - 46, y - 16, 92, 32); ctx.strokeRect(x - 46, y - 16, 92, 32);
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(label, x, y - 4);
      ctx.fillStyle = col; ctx.font = `600 12px ${F.mono}`; ctx.fillText(val, x, y + 11);
    };
    box(ax, ay, "전류계", reading.toFixed(2) + " nA", C.forest);
    box((anX + ax) / 2, by, "전원 (양극 − 음극)", (V >= 0 ? "+" : "") + V.toFixed(2) + " V", C.ink);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 18, w: w - 58, h: h - 52 };
    $(".n-h").textContent = "—"; $(".n-w").textContent = "—";
    if (mode === "iv") {
      const rows = tIV.rows, ymax = Math.max(5, ...rows.map((r) => r.I)) * 1.1;
      const groups = {};
      rows.forEach((r) => { const g = r.k + "_" + r.inten; (groups[g] = groups[g] || { k: r.k, pts: [] }).pts.push({ x: r.V, y: r.I }); });
      const gs = Object.values(groups);
      if (!gs.length) L.plot(ctx, box, { pts: [], xr: [-2, 3], yr: [-1, ymax], xlabel: "V (V)", ylabel: "I (nA)" });
      gs.forEach((g) => L.plot(ctx, box, { pts: g.pts, xr: [-2, 3], yr: [-1, ymax], xlabel: "V (V)", ylabel: "I (nA)", color: LINES[g.k].col }));
    } else {
      const pts = tV0.rows.map((r) => ({ x: r.f, y: r.V0 }));
      const f = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)) : null;
      const pr = L.plot(ctx, box, { pts, fit: f, xr: [0, 9], yr: [-2.5, 2], xlabel: "f (10¹⁴ Hz)", ylabel: "V₀ (V)" });
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(box.x0, pr.Y(0)); ctx.lineTo(box.x0 + box.w, pr.Y(0)); ctx.stroke();
      if (f) {
        const hh = f.a * 1e-14 * 1.602177e-19, sh = f.sa * 1e-14 * 1.602177e-19;
        $(".n-h").textContent = `${(hh / 1e-34).toFixed(2)}${Number.isFinite(sh) ? " ± " + (sh / 1e-34).toFixed(2) : ""}`;
        $(".n-w").textContent = `${(-f.b).toFixed(2)} eV`;
        ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
        ctx.fillText(`기울기 ${f.a.toFixed(3)} V/(10¹⁴ Hz), 절편 ${f.b.toFixed(2)} V`, box.x0 + 8, box.y0 + 14);
        ctx.fillText(`문턱 진동수 f₀ = ${(-f.b / f.a).toFixed(2)} ×10¹⁴ Hz`, box.x0 + 8, box.y0 + 30);
      }
    }
  }

  const refresh = () => { reading = read(sLine.value, +sI.value, +sV.value, cRev.checked); $(".n-i").textContent = reading.toFixed(2) + " nA"; };
  loop($(".cv-wide"), (dt) => {
    tick += dt;
    if (tick > 0.5) { tick = 0; refresh(); }
    const k = sLine.value, K = Kmax(k), V = +sV.value;
    if (K > 0 && Math.random() < dt * 40 * (+sI.value / 100) * LINES[k].q) parts.push({ s: 0, y: Math.random() * 2 - 1, K: K * Math.sqrt(Math.random()), dir: 1 });
    for (const p of parts) {
      const ke = p.K + V * p.s;
      if (ke <= 0 && p.dir > 0) p.dir = -1;
      p.s += p.dir * (0.15 + Math.sqrt(Math.max(ke, 0)) * 0.9) * dt;
    }
    for (let i = parts.length - 1; i >= 0; i--) if (parts[i].s >= 1 || parts[i].s < 0) parts.splice(i, 1);
    drawApp();
  });

  const upd = () => { const V = +sV.value; $(".v-out").textContent = (V >= 0 ? "+" : "") + V.toFixed(2); $(".i-out").textContent = sI.value; refresh(); drawApp(); };
  [sLine, sI, sV, cRev].forEach((el) => el.addEventListener("input", upd));
  sLine.addEventListener("change", upd);
  const nudge = (d) => { sV.value = (Math.round((+sV.value + d) * 100) / 100).toFixed(2); upd(); };
  $(".vm").addEventListener("click", () => nudge(-0.01));
  $(".vp").addEventListener("click", () => nudge(0.01));
  const k0 = () => sLine.value;
  $(".meas").addEventListener("click", () => { refresh(); tIV.add({ k: k0(), lam: LINES[k0()].lam, inten: +sI.value, V: +sV.value, I: reading }); });
  $(".stop").addEventListener("click", () => {
    tV0.add({ k: k0(), lam: LINES[k0()].lam, f: fOf(k0()), V0: -(+sV.value) });
    if (mode !== "vf") root.querySelector('[data-p="vf"]').click();
  });
  $(".clear").addEventListener("click", () => { tIV.clear(); tV0.clear(); });
  $(".psel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-p]"); if (!b) return;
    mode = b.dataset.p; root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  upd();
  if (L.demo) {
    [100, 50].forEach((inten) => [-1.2, -0.9, -0.8, -0.6, -0.4, -0.2, 0, 0.5, 1, 2, 3].forEach((V) =>
      tIV.add({ k: "436", lam: 435.8, inten, V, I: read("436", inten, V, false) })));
    [-1.6, -1.4, -1.0, -0.6, -0.2, 0, 1, 2].forEach((V) => tIV.add({ k: "365", lam: 365.0, inten: 100, V, I: read("365", 100, V, false) }));
    Object.keys(LINES).forEach((k) => tV0.add({ k, lam: LINES[k].lam, f: fOf(k), V0: L.snap(Kmax(k) - 0.03 + 0.02 * L.gauss(), 0.01) }));
    root.querySelector('[data-p="vf"]').click();
  }
})();
