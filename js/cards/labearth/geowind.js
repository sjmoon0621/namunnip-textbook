/* 카드: 일기도의 등고선 간격만으로 바람의 세기를 잴 수 있을까? — 모식 500 hPa·지상 일기도에서 지균풍, 경도풍, 지상풍 비교 */
(() => {
  const root = document.getElementById("card-labearth-geowind");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const G = 9.81, OM = 7.2921e-5, RHO = 1.2;
  const XR = [-2000, 2000], YR = [-1800, 2200];   // km
  const gs = (dx, dy, sx, sy) => Math.exp(-(dx * dx) / (sx * sx) - (dy * dy) / (sy * sy));
  /* 모식 기압장. up: 500 hPa 지오퍼텐셜 고도(m), sfc: 해면 기압(hPa) */
  const MAPS = {
    up: { f: (x, y) => 5700 - 0.13 * y - 230 * gs(x - 700, y - 700, 520, 480) + 170 * gs(x + 1100, y + 700, 650, 600),
      ci: 60, unit: "m", name: "상층" },
    sfc: { f: (x, y) => 1012 - 24 * gs(x - 300, y - 300, 480, 420) + 10 * gs(x + 1200, y + 700, 900, 800) - 0.002 * y,
      ci: 4, unit: "hPa", name: "지상" },
  };
  let mk = "up", sel = null, shown = null;

  const lat = (y) => 35 + y / 111.2;
  const fcor = (y) => 2 * OM * Math.sin(lat(y) * Math.PI / 180);
  function grad(m, x, y) {
    const h = 5, f = MAPS[m].f;
    return [(f(x + h, y) - f(x - h, y)) / (2 * h), (f(x, y + h) - f(x, y - h)) / (2 * h)];   // 단위/km
  }
  /* 등고선 곡률 (1/km). 양수 = 진행 방향 왼쪽으로 휨 = 저기압성(북반구) */
  function curv(m, x, y) {
    const ang = (px, py) => { const g = grad(m, px, py); return Math.atan2(g[0], -g[1]); };   // 접선 (−Zy, Zx)
    const g = grad(m, x, y), n = Math.hypot(g[0], g[1]), t = [-g[1] / n, g[0] / n], ds = 25;
    let d = ang(x + t[0] * ds, y + t[1] * ds) - ang(x - t[0] * ds, y - t[1] * ds);
    while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    return d / (2 * ds);
  }
  /* 지균풍 (m/s): Δn (km)에서 */
  const vg = (m, dn, y) => (m === "up" ? G * MAPS.up.ci / (dn * 1000) / fcor(y) : MAPS.sfc.ci * 100 / (RHO * fcor(y) * dn * 1000));
  /* 경도풍: Rs는 부호 있는 반지름(km, 양수 저기압성) */
  function vgr(Vg, Rs, y) {
    const f = fcor(y);
    if (!Number.isFinite(Rs) || Math.abs(Rs) > 20000) return Vg;
    const R = Math.abs(Rs) * 1000;
    if (Rs > 0) return -f * R / 2 + Math.sqrt(f * f * R * R / 4 + f * R * Vg);
    const disc = f * f * R * R / 4 - f * R * Vg;
    return disc < 0 ? NaN : f * R / 2 - Math.sqrt(disc);
  }

  const mp = fit($(".gw-map"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "map", label: "지도" }, { key: "phi", label: "위도 (°)", res: 0.1 }, { key: "dn", label: "Δn (km)", res: 10 },
    { key: "vg", label: "Vg (m/s)", res: 0.1 }, { key: "R", label: "R (km)", res: 50 }, { key: "kind", label: "곡률" },
    { key: "vgr", label: "Vgr (m/s)", res: 0.1 }, { key: "vo", label: "관측 (m/s)", res: 1 },
  ], () => { drawPlot(); draw(); });

  let B = null;
  const PX = (x) => B.x0 + (x - XR[0]) / (XR[1] - XR[0]) * B.w;
  const PY = (y) => B.y0 + B.h - (y - YR[0]) / (YR[1] - YR[0]) * B.h;

  /* 마칭 스퀘어로 등치선 */
  function contours(ctx, m) {
    const N = 90, f = MAPS[m].f, ci = MAPS[m].ci, dx = (XR[1] - XR[0]) / N, dy = (YR[1] - YR[0]) / N;
    const v = []; let lo = Infinity, hi = -Infinity;
    for (let j = 0; j <= N; j++) { v.push([]); for (let i = 0; i <= N; i++) { const z = f(XR[0] + i * dx, YR[0] + j * dy); v[j].push(z); lo = Math.min(lo, z); hi = Math.max(hi, z); } }
    const labels = [];
    for (let c = Math.ceil(lo / ci) * ci; c <= hi; c += ci) {
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.1; ctx.beginPath();
      let lab = null;
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const a = v[j][i], b = v[j][i + 1], cc = v[j + 1][i + 1], d = v[j + 1][i];
        const e = [];
        const cut = (p, q, x1, y1, x2, y2) => { if ((p - c) * (q - c) < 0) { const t = (c - p) / (q - p); e.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]); } };
        const X0 = XR[0] + i * dx, Y0 = YR[0] + j * dy;
        cut(a, b, X0, Y0, X0 + dx, Y0); cut(b, cc, X0 + dx, Y0, X0 + dx, Y0 + dy); cut(cc, d, X0 + dx, Y0 + dy, X0, Y0 + dy); cut(d, a, X0, Y0 + dy, X0, Y0);
        for (let k = 0; k + 1 < e.length; k += 2) {
          ctx.moveTo(PX(e[k][0]), PY(e[k][1])); ctx.lineTo(PX(e[k + 1][0]), PY(e[k + 1][1]));
          if (!lab && i > N * 0.06 && i < N * 0.2) lab = e[k];
        }
      }
      ctx.stroke();
      if (lab) labels.push([lab, c]);
    }
    ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "center";
    labels.forEach(([p, c]) => {
      const t = String(Math.round(c)), x = PX(p[0]), y = PY(p[1]), tw = ctx.measureText(t).width + 4;
      ctx.fillStyle = C.card; ctx.fillRect(x - tw / 2, y - 6, tw, 12); ctx.fillStyle = C.ink2; ctx.fillText(t, x, y + 3);
    });
  }

  function draw() {
    const { ctx } = mp, { w, h } = mp.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    B = { x0: 30, y0: 8, w: w - 38, h: h - 30 };
    ctx.fillStyle = "#f4f6f1"; ctx.fillRect(B.x0, B.y0, B.w, B.h);
    ctx.save(); ctx.beginPath(); ctx.rect(B.x0, B.y0, B.w, B.h); ctx.clip();
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    for (let x = XR[0]; x <= XR[1]; x += 500) { ctx.beginPath(); ctx.moveTo(PX(x), B.y0); ctx.lineTo(PX(x), B.y0 + B.h); ctx.stroke(); }
    for (let y = YR[0]; y <= YR[1]; y += 500) { ctx.beginPath(); ctx.moveTo(B.x0, PY(y)); ctx.lineTo(B.x0 + B.w, PY(y)); ctx.stroke(); }
    contours(ctx, mk);
    /* 저·고 표시 */
    ctx.font = `700 18px ${F.sans}`; ctx.textAlign = "center";
    const HL = mk === "up" ? [["저", 700, 700, C.apple], ["고", -1100, -700, "#3460aa"]] : [["저", 300, 300, C.apple], ["고", -1200, -700, "#3460aa"]];
    HL.forEach(([t, x, y, c]) => { ctx.fillStyle = c; ctx.fillText(t, PX(x), PY(y) + 6); });
    /* 기록한 점 */
    tbl.rows.filter((r) => r.map === MAPS[mk].name).forEach((r) => { ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(PX(r.x), PY(r.y), 3, 0, Math.PI * 2); ctx.fill(); });
    /* 고른 점: 법선(Δn)과 곡률원 */
    if (sel) {
      const g = grad(mk, sel.x, sel.y), n = Math.hypot(g[0], g[1]), dn = MAPS[mk].ci / n, u = [-g[0] / n, -g[1] / n];
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(PX(sel.x - u[0] * dn / 2), PY(sel.y - u[1] * dn / 2)); ctx.lineTo(PX(sel.x + u[0] * dn / 2), PY(sel.y + u[1] * dn / 2)); ctx.stroke();
      if (shown && Number.isFinite(shown.R) && Math.abs(shown.R) < 4000) {
        const k = shown.R > 0 ? 1 : -1, t = [-g[1] / n, g[0] / n], nl = [-t[1] * k, t[0] * k];   // 왼쪽(저기압성) 또는 오른쪽
        const cx = sel.x + nl[0] * Math.abs(shown.R), cy = sel.y + nl[1] * Math.abs(shown.R), rpx = Math.abs(shown.R) / (XR[1] - XR[0]) * B.w;
        ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(PX(cx), PY(cy), rpx, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      }
      /* 바람 화살표 (등고선을 따라, 저기압이 왼쪽) */
      const t = [-g[1] / n, g[0] / n], ax = PX(sel.x), ay = PY(sel.y), Lp = 26;
      let tx = t[0], ty = t[1];
      if (mk === "sfc") { const a = 25 * Math.PI / 180; [tx, ty] = [t[0] * Math.cos(a) - t[1] * Math.sin(a), t[0] * Math.sin(a) + t[1] * Math.cos(a)]; }   // 마찰: 저기압 쪽으로 약 25° 꺾임
      ctx.strokeStyle = C.forest; ctx.fillStyle = C.forest; ctx.lineWidth = 2;
      const ex = ax + tx * Lp, ey = ay - ty * Lp;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke();
      const an = Math.atan2(ey - ay, ex - ax);
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 7 * Math.cos(an - 0.4), ey - 7 * Math.sin(an - 0.4)); ctx.lineTo(ex - 7 * Math.cos(an + 0.4), ey - 7 * Math.sin(an + 0.4)); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(ax, ay, 3.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (const la of [25, 30, 35, 40, 45, 50, 55]) { const y = (la - 35) * 111.2; if (y < YR[0] || y > YR[1]) continue; ctx.fillText(la + "°", B.x0 - 3, PY(y) + 3); }
    ctx.textAlign = "left";
    ctx.fillText(`${mk === "up" ? "500 hPa" : "지상"} · 등${mk === "up" ? "고" : "압"}선 ${MAPS[mk].ci} ${MAPS[mk].unit} 간격 · 격자 500 km`, B.x0, h - 6);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows, all = rows.flatMap((r) => [r.vg, r.vgr, r.vo]).filter(Number.isFinite);
    const mx = Math.max(20, ...all) * 1.1, box = { x0: 44, y0: 22, w: w - 58, h: h - 56 }, o = { xr: [0, mx], yr: [0, mx], xlabel: "지균풍 Vg (m/s)", ylabel: "풍속 (m/s)" };
    L.plot(ctx, box, { ...o, pts: rows.map((r) => ({ x: r.vg, y: r.vgr })), model: (x) => x, color: C.forest });
    L.plot(ctx, box, { ...o, pts: rows.map((r) => ({ x: r.vg, y: r.vo })), color: C.warn });
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = C.forest; ctx.fillText("● 경도풍 (계산)", 52, 36);
    ctx.fillStyle = C.warn; ctx.fillText("● 관측 풍속 (모식)", 150, 36);
    ctx.fillStyle = C.ink3; ctx.fillText("점선: V = Vg", 270, 36);
  }

  function info() {
    if (!sel) { $(".gw-read").textContent = "지도에서 바람을 잴 점을 누르세요."; return; }
    const v = MAPS[mk].f(sel.x, sel.y);
    $(".gw-read").textContent = `고른 점  위도 ${lat(sel.y).toFixed(1)}° · ${mk === "up" ? "고도" : "기압"} ${v.toFixed(mk === "up" ? 0 : 1)} ${MAPS[mk].unit} · f = ${(fcor(sel.y) * 1e4).toFixed(3)}×10⁻⁴ /s` + (shown ? (Number.isFinite(shown.vgr) ? "" : " · 이 곡률에서는 경도풍 해가 없습니다 (고기압 중심 부근)") : "");
  }

  function measure() {
    if (!sel) return;
    const { x, y } = sel, g = grad(mk, x, y), n = Math.hypot(g[0], g[1]);
    const dn = Math.max(10, L.measure(MAPS[mk].ci / n, { rel: 0.05, res: 10 }));
    const k = curv(mk, x, y), Rt = 1 / k;
    const R = Math.abs(Rt) > 20000 ? Infinity : Math.sign(Rt) * Math.max(50, L.measure(Math.abs(Rt), { rel: 0.1, res: 50 }));
    const V = vg(mk, dn, y), Vr = vgr(V, R, y);
    const trueV = vgr(vg(mk, MAPS[mk].ci / n, y), Rt, y);
    const vo = Number.isFinite(trueV) ? Math.max(0, L.measure(trueV * (mk === "sfc" ? 0.6 : 1), { sd: mk === "sfc" ? 1 : 1.5, res: 1 })) : NaN;
    const kind = !Number.isFinite(R) ? "직선" : R > 0 ? "저기압성" : "고기압성";
    shown = { R, vgr: Vr };
    tbl.add({ map: MAPS[mk].name, x, y, phi: lat(y), dn, vg: V, R: Number.isFinite(R) ? Math.abs(R) : NaN, kind, vgr: Vr, vo });
    info();
  }

  $(".gw-map").addEventListener("pointerdown", (e) => {
    const r = $(".gw-map").getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (!B || px < B.x0 || px > B.x0 + B.w || py < B.y0 || py > B.y0 + B.h) return;
    sel = { x: XR[0] + (px - B.x0) / B.w * (XR[1] - XR[0]), y: YR[0] + (B.y0 + B.h - py) / B.h * (YR[1] - YR[0]) };
    shown = null; info(); draw();
  });
  $(".meas").addEventListener("click", measure);
  $(".clear").addEventListener("click", () => { tbl.clear(); shown = null; info(); });
  $(".maps").addEventListener("click", (e) => {
    const b = e.target.closest("[data-m]"); if (!b) return;
    mk = b.dataset.m; root.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    sel = null; shown = null; info(); draw();
  });
  if (L.demo) {
    [[300, -1500], [-300, 1700], [700, 1300], [1250, 700], [700, 150], [-1100, -100], [-1700, -700], [-500, -700]].forEach(([x, y]) => { sel = { x, y }; measure(); });
    mk = "sfc";
    [[300, 900], [900, 300], [-300, -300], [-1200, 0]].forEach(([x, y]) => { sel = { x, y }; measure(); });
    mk = "up"; sel = { x: 700, y: 1300 }; shown = null; info(); draw();
  }
})();
