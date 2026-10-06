/* 카드: 밖으로 나가던 빛은 언제 사라질까? — 반원 블록, 스넬 법칙, sin–sin 직선, 임계각과 전반사 */
(() => {
  const root = document.getElementById("card-labphy-refraction");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sI = $(".i");
  const MAT = { acr: { n: 1.49, name: "아크릴", col: "rgba(150,200,230,.35)" }, gls: { n: 1.52, name: "유리", col: "rgba(160,215,200,.35)" }, wat: { n: 1.333, name: "물", col: "rgba(110,164,230,.28)" } };
  let dir = "in", mat = "acr";
  const D = Math.PI / 180;
  const tbl = L.table($(".tbl-host"), [{ key: "dn", label: "방향" }, { key: "mn", label: "재질" }, { key: "i", label: "i (°)", res: 1 }, { key: "r", label: "굴절각 (°)", res: 0.5 }, { key: "sb", label: "sin(블록 쪽)", res: 0.001 }, { key: "sa", label: "sin(공기 쪽)", res: 0.001 }], () => drawPlot());
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());

  /* 굴절각(rad)과 반사율. 전반사면 r = null */
  function optics(iDeg) {
    const n = MAT[mat].n, i = iDeg * D, n1 = dir === "in" ? 1 : n, n2 = dir === "in" ? n : 1, s = n1 * Math.sin(i) / n2;
    if (s >= 1) return { r: null, R: 1 };
    const r = Math.asin(s), ci = Math.cos(i), cr = Math.cos(r);
    const rs = (n1 * ci - n2 * cr) / (n1 * ci + n2 * cr), rp = (n2 * ci - n1 * cr) / (n2 * ci + n1 * cr);
    return { r, R: (rs * rs + rp * rp) / 2 };
  }

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const cx = w * 0.42, cy = h * 0.5, R = h * 0.42, Rb = R * 0.8, iDeg = +sI.value, i = iDeg * D, o = optics(iDeg);
    // 블록 (아래 반원)
    ctx.fillStyle = MAT[mat].col; ctx.strokeStyle = "rgba(63,111,163,.6)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(cx - Rb, cy); ctx.arc(cx, cy, Rb, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
    // 각도기
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `9px ${F.mono}`; ctx.textAlign = "center";
    for (let a = 0; a < 360; a += 5) {
      const t = a * D, len = a % 10 ? 4 : 8, sx = Math.sin(t), cyy = -Math.cos(t);
      ctx.beginPath(); ctx.moveTo(cx + R * sx, cy + R * cyy); ctx.lineTo(cx + (R - len) * sx, cy + (R - len) * cyy); ctx.stroke();
      const rel = a % 180 > 90 ? 180 - (a % 180) : a % 180;
      if (a % 30 === 0) ctx.fillText(rel, cx + (R - 17) * sx, cy + (R - 17) * cyy + 3);
    }
    ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.ink2; ctx.beginPath(); ctx.moveTo(cx - R - 6, cy); ctx.lineTo(cx + R + 6, cy); ctx.stroke();
    // 광선: 들어오는 쪽 부호 sg (−1: 위, +1: 아래)
    const sg = dir === "in" ? -1 : 1, beam = (x1, y1, x2, y2, al, wd) => { ctx.strokeStyle = `rgba(220,40,30,${al})`; ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
    const lx = cx - (R + 14) * Math.sin(i), ly = cy + sg * (R + 14) * Math.cos(i);
    beam(lx, ly, cx, cy, 0.95, 2.2);
    beam(cx, cy, cx + R * Math.sin(i), cy + sg * R * Math.cos(i), Math.max(0.12, Math.min(1, o.R * 1.6)), 1.6);
    if (o.r !== null) {
      const ex = cx + R * Math.sin(o.r), ey = cy - sg * R * Math.cos(o.r), T = 1 - o.R;
      beam(cx, cy, ex, ey, Math.max(0.15, T * 0.95), 2);
      ctx.fillStyle = `rgba(220,40,30,${Math.max(0.2, T)})`; ctx.beginPath(); ctx.arc(ex, ey, 3.5, 0, Math.PI * 2); ctx.fill();
    }
    // 레이저 몸통
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(Math.atan2(cy - ly, cx - lx)); ctx.fillStyle = C.ink; ctx.fillRect(-26, -5, 26, 10); ctx.restore();
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillText("공기", w - 12, 18); ctx.fillText(`${MAT[mat].name} (반원 블록)`, w - 12, h - 10);
    $(".n-s").textContent = o.r === null ? "없음 (전반사)" : `있음 · 세기 ${Math.round((1 - o.R) * 100)}%`;
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows.filter((r) => r.m === mat && typeof r.sa === "number"), pts = rows.map((r) => ({ x: r.sb, y: r.sa }));
    const ft = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y), true) : null;
    L.plot(ctx, { x0: 44, y0: 18, w: w - 58, h: h - 52 }, { pts, fit: ft, xr: [0, 0.8], yr: [0, 1.05], xlabel: "sin(블록 쪽 각)", ylabel: `sin(공기 쪽 각) · ${MAT[mat].name} 기록만` });
    $(".n-n").textContent = ft ? `${ft.a.toFixed(3)} ± ${ft.sa.toFixed(3)}` : "점 2개 이상";
    $(".n-c").textContent = ft && ft.a > 1 ? `${(Math.asin(1 / ft.a) / D).toFixed(1)}°` : "—";
  }

  function record() {
    const iDeg = +sI.value, o = optics(iDeg), base = { m: mat, mn: MAT[mat].name, dn: dir === "in" ? "공기→블록" : "블록→공기", i: iDeg };
    if (o.r === null) { tbl.add({ ...base, r: "전반사", sb: "—", sa: "—" }); return; }
    const r = Math.min(90, Math.max(0, L.measure(o.r / D, { sd: 0.35, res: 0.5 })));
    const sAir = Math.sin((dir === "in" ? iDeg : r) * D), sBlk = Math.sin((dir === "in" ? r : iDeg) * D);
    tbl.add({ ...base, r, sb: sBlk, sa: sAir });
  }
  const pick = (sel, attr, set) => $(sel).addEventListener("click", (e) => {
    const b = e.target.closest(`[data-${attr}]`); if (!b) return;
    set(b.dataset[attr]); root.querySelectorAll(`[data-${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); drawPlot();
  });
  pick(".dsel", "d", (v) => { dir = v; }); pick(".nsel", "n", (v) => { mat = v; });
  const upd = () => { $(".i-out").textContent = sI.value; draw(); };
  sI.addEventListener("input", upd);
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => tbl.clear());
  upd();
  if (L.demo) {
    [10, 20, 30, 40, 50, 60, 70, 80].forEach((a) => { sI.value = a; record(); });
    dir = "out"; [10, 20, 30, 38, 45].forEach((a) => { sI.value = a; record(); });
    root.querySelector('[data-d="out"]').click(); sI.value = 41; upd();
  }
})();
