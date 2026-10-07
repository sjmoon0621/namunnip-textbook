/* 카드: 1919년 일식 관측 모식 재현 — 별빛 휨 δ = k/r 을 건판 측정으로 맞추기 */
(() => {
  const root = document.getElementById("card-hist-eclipse");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const K_TRUE = 1.75, K_NEWT = 0.875;
  /* 별 배치 (모식): r는 태양 반지름 단위, a는 방위각(도) */
  const STARS = [[2.0, 200], [2.3, 25], [2.7, 310], [3.1, 120], [3.6, 250], [4.2, 70], [4.8, 160], [5.5, 340], [6.3, 220]];
  const SITES = [
    { name: "소브라우", vis: [0, 1, 2, 3, 4, 5, 6, 7, 8], sd: 0.22 },
    { name: "프린시페", vis: [1, 3, 5, 6, 8], sd: 0.45 },
  ];
  const SCALE_ERR = -0.08;   // 축척 오차 (″ / 태양 반지름) — 모식
  let site = 0, plate = 0, last = null;

  const sky = fit($(".sky"), () => drawSky());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "p", label: "건판", res: 1 }, { key: "s", label: "별", res: 1 },
    { key: "r", label: "r (태양 반지름)", res: 0.1 }, { key: "d", label: "δ (″)", res: 0.01 },
  ], () => { drawPlot(); drawSky(); });

  function fitK() {
    const rows = tbl.rows; if (rows.length < 2) return null;
    if (!$(".fit2").checked) {
      const f = L.linfit(rows.map((q) => 1 / q.r), rows.map((q) => q.d), true);
      return f ? { k: f.a, se: f.sa, s: 0 } : null;
    }
    /* δ = k/r + s·r 두 변수 최소제곱 */
    let a11 = 0, a12 = 0, a22 = 0, b1 = 0, b2 = 0;
    rows.forEach((q) => { const u = 1 / q.r, v = q.r; a11 += u * u; a12 += u * v; a22 += v * v; b1 += u * q.d; b2 += v * q.d; });
    const det = a11 * a22 - a12 * a12; if (rows.length < 3 || Math.abs(det) < 1e-9) return null;
    const k = (b1 * a22 - b2 * a12) / det, s = (a11 * b2 - a12 * b1) / det;
    const sse = rows.reduce((t, q) => t + (q.d - k / q.r - s * q.r) ** 2, 0), s2 = sse / Math.max(1, rows.length - 2);
    return { k, s, se: Math.sqrt(s2 * a22 / det) };
  }

  function drawSky() {
    const { ctx } = sky, { w, h } = sky.size; if (!w) return;
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, R = Math.min(h / 15, w / 15), E = R * 600 / 960;
    const g = ctx.createRadialGradient(cx, cy, R, cx, cy, R * 3.2);
    g.addColorStop(0, "rgba(255,250,235,.55)"); g.addColorStop(1, "rgba(255,250,235,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#050505"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    const vis = SITES[site].vis;
    if (site === 1) {
      ctx.fillStyle = "rgba(180,180,190,.18)";
      [[0.18, 0.3, 90], [0.8, 0.72, 110], [0.3, 0.85, 80], [0.75, 0.2, 70]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.ellipse(w * x, h * y, r * 1.6, r * 0.6, 0, 0, Math.PI * 2); ctx.fill(); });
    }
    STARS.forEach(([r, a], i) => {
      const th = a * Math.PI / 180, ux = Math.cos(th), uy = -Math.sin(th);
      const x = cx + ux * r * R, y = cy + uy * r * R;
      if (x < 6 || x > w - 6 || y < 6 || y > h - 6) return;
      const on = vis.includes(i);
      ctx.strokeStyle = on ? "rgba(255,255,255,.75)" : "rgba(255,255,255,.2)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = on ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.2)"; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
      ctx.fillText(String(i + 1), x + 6, y - 5);
      const m = last && last.find((q) => q.s === i + 1);
      if (m) {
        const L2 = m.d * E, x2 = x + ux * L2, y2 = y + uy * L2;
        ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(x2, y2, 2.6, 0, Math.PI * 2); ctx.fill();
      }
    });
    ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(`${SITES[site].name} · 1919년 5월 29일 (모식)`, 12, 18);
    ctx.textAlign = "right"; ctx.fillText("○ 밤의 원래 자리   ● 일식 사진의 자리 (변위 ×600)", w - 12, h - 10);
    if (!last) { ctx.textAlign = "left"; ctx.fillText("‘건판 1장 재기’를 누르세요", 12, h - 10); }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pts = tbl.rows.map((q) => ({ x: 1 / q.r, y: q.d }));
    const box = { x0: 44, y0: 20, w: w - 60, h: h - 54 };
    const ax = L.plot(ctx, box, { pts, xr: [0, 0.55], yr: [-0.6, 2.6], xlabel: "1/r (1/태양 반지름)", ylabel: "δ (″)" });
    const line = (k, col, dash) => { ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(ax.X(0), ax.Y(0)); ctx.lineTo(ax.X(0.55), ax.Y(k * 0.55)); ctx.stroke(); ctx.setLineDash([]); };
    line(K_NEWT, C.ink3, [5, 4]); line(K_TRUE, C.ink2, []);
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillStyle = C.ink2; ctx.fillText("아인슈타인 1.75″", ax.X(0.55) - 4, ax.Y(K_TRUE * 0.55) + 14);
    ctx.fillStyle = C.ink3; ctx.fillText("뉴턴식 0.87″", ax.X(0.55) - 4, ax.Y(K_NEWT * 0.55) + 14);
    const f = fitK();
    if (f) {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i <= 40; i++) { const u = 0.15 + 0.4 * i / 40, r = 1 / u, y = f.k * u + f.s * r; i ? ctx.lineTo(ax.X(u), ax.Y(y)) : ctx.moveTo(ax.X(u), ax.Y(y)); }
      ctx.stroke();
      ctx.fillStyle = C.warn; ctx.textAlign = "left"; ctx.font = `11px ${F.mono}`;
      ctx.fillText(`맞춤 k = ${f.k.toFixed(2)} ± ${f.se.toFixed(2)}″`, box.x0 + 8, box.y0 + 12);
    }
    const nk = $(".n-k"), nn = $(".n-n"), ne = $(".n-e");
    if (!f) { nk.textContent = nn.textContent = ne.textContent = "—"; nn.className = ne.className = "n-n"; ne.className = "n-e"; return; }
    nk.textContent = `${f.k.toFixed(2)} ± ${f.se.toFixed(2)}″`;
    const zn = Math.abs(f.k - K_NEWT) / f.se, ze = Math.abs(f.k - K_TRUE) / f.se;
    nn.textContent = `${(f.k - K_NEWT).toFixed(2)}″ (${zn.toFixed(1)}σ)`;
    ne.textContent = `${(f.k - K_TRUE).toFixed(2)}″ (${ze.toFixed(1)}σ)`;
    nn.className = "n-n " + (zn < 2 ? "good" : "bad"); ne.className = "n-e " + (ze < 2 ? "good" : "bad");
  }

  function measure() {
    plate += 1;
    const S = SITES[site], bias = $(".bias").checked;
    last = S.vis.map((i) => {
      const r = STARS[i][0];
      return { p: plate, s: i + 1, r, d: L.measure(K_TRUE / r + (bias ? SCALE_ERR * r : 0), { sd: S.sd, res: 0.01 }) };
    });
    last.forEach((q) => tbl.add(q));
  }

  $(".site").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    site = +b.dataset.s; root.querySelectorAll(".site .chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    last = null; drawSky();
  });
  $(".meas").addEventListener("click", measure);
  $(".clear").addEventListener("click", () => { plate = 0; last = null; tbl.clear(); });
  $(".fit2").addEventListener("change", drawPlot);
  if (L.demo) { measure(); measure(); }
})();
