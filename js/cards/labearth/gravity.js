/* 카드: 중력 측정값에서 땅속 덩어리를 찾으려면 무엇을 빼야 할까? — 위도·프리에어·부게 보정과 부게 이상 */
(() => {
  const root = document.getElementById("card-labearth-gravity");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const G = 6.674e-11, SI2MGAL = 1e5;

  /* 정규 중력 (1967 국제 정규 중력식, mGal) */
  const gNormal = (phi) => { const s = Math.sin(phi * Math.PI / 180), s2 = Math.sin(2 * phi * Math.PI / 180); return 978032.7 * (1 + 0.0053024 * s * s - 0.0000058 * s2 * s2); };

  /* 두 가지 모식 지역 */
  const SC = {
    ore: {
      len: 10, phi0: 36.0, unit: "km",
      topo: (x) => 60 + 90 * Math.exp(-(((x - 6.5) / 1.4) ** 2)),
      body: { x: 4.0, z: 650, r: 350, drho: 2000 },   // 자철석 광체: 중심 깊이 650 m, 반지름 350 m, 밀도 차 +2.0 g/cm³
    },
    root: {
      len: 200, phi0: 35.5, unit: "km",
      topo: (x) => 200 + 1800 * Math.exp(-(((x - 100) / 30) ** 2)),
      moho: 33, rhoC: 2670, rhoM: 3270,
    },
  };
  /* 산맥 뿌리(에어리 모형)의 중력 효과: 2차원 세로 띠를 더한다 */
  const rootTab = (() => {
    const s = SC.root, out = [], drho = s.rhoC - s.rhoM, k = s.rhoC / (s.rhoM - s.rhoC);
    for (let xs = 0; xs <= 200; xs += 1) {
      let g = 0;
      for (let xp = -150; xp <= 350; xp += 0.5) {
        const t = k * (s.topo(xp) - 200); if (t < 1) continue;
        const d = (xs - xp) * 1000, z1 = s.moho * 1000, z2 = z1 + t;
        g += G * drho * 500 * Math.log((d * d + z2 * z2) / (d * d + z1 * z1));
      }
      out.push(g * SI2MGAL);
    }
    return out;
  })();
  function anomaly(key, x, h) {
    if (key === "ore") {
      const b = SC.ore.body, dx = (x - b.x) * 1000, dz = b.z + h, m = 4 / 3 * Math.PI * b.r ** 3 * b.drho;
      return G * m * dz / Math.pow(dx * dx + dz * dz, 1.5) * SI2MGAL;
    }
    const i = Math.min(199, Math.floor(x)), f = x - i;
    return rootTab[i] * (1 - f) + rootTab[i + 1] * f;
  }
  const INST = { grav: { sd: 0.02, res: 0.01, name: "상대 중력계" }, pend: { sd: 30, res: 1, name: "정밀 진자" } };

  let sc = "ore", inst = "grav", xPos = 2;
  const sX = $(".x"), sR = $(".rho");
  const sec = fit($(".cv-wide"), () => drawSec());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "x", label: "x (km)", res: 0.1 }, { key: "h", label: "고도 h (m)", res: 0.1 }, { key: "g", label: "관측 g (mGal)", res: 0.01 },
    { key: "fa", label: "프리에어 이상", res: 0.01 }, { key: "ba", label: "부게 이상", res: 0.01 },
  ], () => drawPlot());
  const rho = () => +sR.value;
  const phiAt = (x) => SC[sc].phi0 + x / 111.0;
  /* 보정: 위도 → 정규 중력, 프리에어 +0.3086h, 부게 −0.0419ρh */
  const reduce = (r) => { r.fa = r.g - gNormal(phiAt(r.x)) + 0.3086 * r.h; r.ba = r.fa - 0.0419 * rho() * r.h; return r; };

  function drawSec() {
    const { ctx } = sec, { w, h } = sec.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = SC[sc], bx = { x0: 14, y0: 16, w: w - 28, h: h - 46 };
    const X = (x) => bx.x0 + x / s.len * bx.w;
    let Y, zMax, topoEx;
    if (sc === "ore") { zMax = 1200; Y = (z) => bx.y0 + (z + 300) / (zMax + 300) * bx.h; topoEx = 1; }
    else { zMax = 50000; topoEx = 6; Y = (z) => bx.y0 + 40 + z / zMax * (bx.h - 40); }
    const surf = (x) => Y(-s.topo(x) * topoEx);
    ctx.fillStyle = "#e6f0f6"; ctx.fillRect(bx.x0, bx.y0, bx.w, bx.h);
    ctx.fillStyle = "#efe6d3"; ctx.beginPath(); ctx.moveTo(X(0), Y(zMax));
    for (let i = 0; i <= 200; i++) { const x = s.len * i / 200; ctx.lineTo(X(x), surf(x)); }
    ctx.lineTo(X(s.len), Y(zMax)); ctx.closePath(); ctx.fill();
    if (sc === "ore") {
      const b = s.body, sx = bx.w / (s.len * 1000), sy = (Y(1000) - Y(0)) / 1000;
      ctx.fillStyle = "#5b5b66"; ctx.beginPath(); ctx.ellipse(X(b.x), Y(b.z), b.r * sx, b.r * sy, 0, 0, Math.PI * 2); ctx.fill();
      ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
      ctx.fillText("밀도가 큰 광체 (위치는 숨겨진 참값)", X(b.x) + b.r * sx + 6, Y(b.z) + 4);
      ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(bx.x0, Y(0)); ctx.lineTo(bx.x0 + bx.w, Y(0)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink3; ctx.fillText("해수면 (지오이드)", bx.x0 + 4, Y(0) + 13);
      ctx.textAlign = "right"; ctx.fillText(`깊이 방향 약 ${(sy / sx).toFixed(1)}배 과장`, bx.x0 + bx.w - 4, Y(1150));
    } else {
      const k = s.rhoC / (s.rhoM - s.rhoC);
      ctx.fillStyle = "#e3d3c4"; ctx.beginPath(); ctx.moveTo(X(0), Y(zMax));
      for (let i = 0; i <= 200; i++) { const x = s.len * i / 200; ctx.lineTo(X(x), Y(s.moho * 1000 + k * (s.topo(x) - 200))); }
      ctx.lineTo(X(s.len), Y(zMax)); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath();
      for (let i = 0; i <= 200; i++) { const x = s.len * i / 200, yy = Y(s.moho * 1000 + k * (s.topo(x) - 200)); i ? ctx.lineTo(X(x), yy) : ctx.moveTo(X(x), yy); }
      ctx.stroke();
      ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
      ctx.fillText("지각 2.67 g/cm³", X(4), Y(15000)); ctx.fillText("맨틀 3.27 g/cm³", X(4), Y(45000));
      ctx.textAlign = "center"; ctx.fillText("산맥의 뿌리", X(100), Y(36000));
      ctx.textAlign = "right"; ctx.fillStyle = C.ink3; ctx.fillText("지형 높이 6배 과장", bx.x0 + bx.w - 4, bx.y0 + 13);
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let i = 0; i <= 200; i++) { const x = s.len * i / 200; i ? ctx.lineTo(X(x), surf(x)) : ctx.moveTo(X(x), surf(x)); }
    ctx.stroke();
    tbl.rows.forEach((r) => { ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(X(r.x), surf(r.x) - 3, 2.6, 0, Math.PI * 2); ctx.fill(); });
    const gx = X(xPos), gy = surf(xPos);
    ctx.fillStyle = C.warn; ctx.fillRect(gx - 6, gy - 16, 12, 11); ctx.strokeStyle = C.ink; ctx.strokeRect(gx - 6, gy - 16, 12, 11);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    [0, 0.25, 0.5, 0.75, 1].forEach((f) => ctx.fillText(`${+(s.len * f).toFixed(1)}`, X(s.len * f), bx.y0 + bx.h + 13));
    ctx.textAlign = "right"; ctx.fillText(`남 ${s.phi0.toFixed(1)}°N → 북 (km)`, bx.x0 + bx.w, bx.y0 + bx.h + 26);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    tbl.rows.forEach(reduce);
    const bx = { x0: 52, y0: 22, w: w - 66, h: h - 58 };
    const ba = tbl.rows.map((r) => ({ x: r.x, y: r.ba })), fa = tbl.rows.map((r) => ({ x: r.x, y: r.fa }));
    const raw = tbl.rows.length ? tbl.rows.map((r) => r.g - gNormal(SC[sc].phi0)) : [];
    const show = $(".show-raw").getAttribute("aria-pressed") === "true";
    const all = [...ba.map((p) => p.y), ...fa.map((p) => p.y), ...(show ? raw : [])];
    let lo = all.length ? Math.min(...all) : -5, hi = all.length ? Math.max(...all) : 5;
    const pad = (hi - lo || 2) * 0.1; lo -= pad; hi += pad;
    const res = L.plot(ctx, bx, { pts: ba, xr: [0, SC[sc].len], yr: [lo, hi], xlabel: "x (km)", ylabel: "중력 이상 (mGal)", color: C.forest });
    const dots = (pts, col) => { ctx.fillStyle = col; pts.forEach((p) => { ctx.beginPath(); ctx.arc(res.X(p.x), res.Y(p.y), 3, 0, Math.PI * 2); ctx.fill(); }); };
    dots(fa, C.amber);
    if (show) dots(tbl.rows.map((r, i) => ({ x: r.x, y: raw[i] })), C.ink3);
    const st = L.stats(ba.map((p) => p.y));
    $(".n-1").textContent = ba.length ? (Math.max(...ba.map((p) => p.y)) - Math.min(...ba.map((p) => p.y))).toFixed(2) + " mGal" : "—";
    $(".n-2").textContent = st.n ? st.mean.toFixed(2) + " mGal" : "—";
    const r = tbl.rows.filter((q) => q.h > 0);
    let cor = NaN;
    if (r.length > 2) { const mh = L.stats(r.map((q) => q.h)).mean, mb = L.stats(r.map((q) => q.ba)).mean; let sxy = 0, sxx = 0, syy = 0; r.forEach((q) => { sxy += (q.h - mh) * (q.ba - mb); sxx += (q.h - mh) ** 2; syy += (q.ba - mb) ** 2; }); cor = sxy / Math.sqrt(sxx * syy); }
    $(".n-3").textContent = Number.isFinite(cor) ? cor.toFixed(2) : "—";
  }

  function measure(x) {
    const s = SC[sc], h = s.topo(x), phi = phiAt(x);
    const truth = gNormal(phi) - 0.3086 * h + 0.0419 * 2.67 * h + anomaly(sc, x, h);
    const r = { x: L.snap(x, 0.1), h: L.measure(h, { sd: 0.1, res: 0.1 }), g: L.measure(truth, INST[inst]) };
    tbl.rows.push(reduce(r));
    tbl.rows.sort((a, b) => a.x - b.x); tbl.add(tbl.rows.pop());
    drawSec();
  }
  function setSc(k) {
    sc = k; root.querySelectorAll("[data-sc]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.sc === k)));
    sX.max = SC[k].len; sX.step = SC[k].len / 100; xPos = Math.min(xPos, SC[k].len); sX.value = xPos;
    tbl.clear(); upd();
  }
  const upd = () => {
    xPos = +sX.value;
    $(".x-out").textContent = xPos.toFixed(1);
    $(".rho-out").textContent = rho().toFixed(2);
    $(".h-out").textContent = SC[sc].topo(xPos).toFixed(0);
    drawSec(); drawPlot();
  };
  sX.addEventListener("input", upd);
  sR.addEventListener("input", () => { upd(); if (tbl.rows.length) tbl.add(tbl.rows.pop()); });
  $(".meas").addEventListener("click", () => measure(xPos));
  $(".clear").addEventListener("click", () => { tbl.clear(); drawSec(); });
  $(".show-raw").addEventListener("click", (e) => { const b = e.currentTarget; b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")); drawPlot(); });
  $(".scs").addEventListener("click", (e) => { const b = e.target.closest("[data-sc]"); if (b) setSc(b.dataset.sc); });
  $(".insts").addEventListener("click", (e) => {
    const b = e.target.closest("[data-inst]"); if (!b) return;
    inst = b.dataset.inst; root.querySelectorAll("[data-inst]").forEach((q) => q.setAttribute("aria-pressed", String(q === b)));
  });
  upd();
  if (L.demo) { for (let x = 0; x <= 10; x += 0.5) measure(x); xPos = 4; sX.value = 4; upd(); }
})();
