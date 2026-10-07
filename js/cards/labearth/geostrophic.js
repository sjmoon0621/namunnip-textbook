/* 카드: 바닷물의 온도 단면만으로 구로시오의 속도를 잴 수 있을까? — WOA23 단면, 역학적 높이, 지형류 계산 */
(() => {
  const root = document.getElementById("card-labearth-geostrophic");
  if (!root || !window.NMKuroshio) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const K = window.NMKuroshio;
  const $ = (s) => root.querySelector(s);
  const sA = $(".la"), sB = $(".lb");
  const G = 9.8, OM = 7.292e-5, NLAT = K.lat.length, ZMAX = 1000;
  const lat0 = K.lat[0] - 0.125, lat1 = K.lat[NLAT - 1] + 0.125;
  let xKey = "v";

  const cv = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "la", label: "A (°N)", res: 0.001 }, { key: "lb", label: "B (°N)", res: 0.001 }, { key: "dx", label: "Δx (km)", res: 1 },
    { key: "deta", label: "Δη (cm)", res: 0.1 }, { key: "dz", label: "Δz₁₅ (m)", res: 1 }, { key: "v", label: "v (m/s)", res: 0.01 },
  ], () => drawPlot());

  /* 수온 → 색 (2 °C 파랑 … 28 °C 주황) */
  const stops = [[2, [44, 78, 138]], [8, [111, 160, 196]], [14, [214, 229, 222]], [20, [238, 205, 140]], [28, [196, 88, 56]]];
  function tcol(t) {
    for (let i = 1; i < stops.length; i++) if (t <= stops[i][0] || i === stops.length - 1) {
      const [a, ca] = stops[i - 1], [b, cb] = stops[i], u = Math.max(0, Math.min(1, (t - a) / (b - a)));
      return `rgb(${ca.map((c, k) => Math.round(c + (cb[k] - c) * u)).join(",")})`;
    }
  }
  /* 등온선 깊이(첫 교차점, 선형 보간) */
  function isoZ(j, t0) {
    const T = K.T[j], z = K.z;
    for (let k = 0; k < z.length - 1; k++) if (T[k] >= t0 && T[k + 1] < t0) return z[k] + (T[k] - t0) / (T[k] - T[k + 1]) * (z[k + 1] - z[k]);
    return null;
  }
  const fCor = (la) => 2 * OM * Math.sin(la * Math.PI / 180);
  const dist = (a, b) => Math.abs(K.lat[b] - K.lat[a]) * 111.2;

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 46, x1 = w - 12;
    const X = (la) => x0 + (la - lat0) / (lat1 - lat0) * (x1 - x0);
    /* 위: 해수면(역학적 높이) */
    const ey0 = 20, ey1 = h * 0.30;
    const dmin = Math.min(...K.D), dmax = Math.max(...K.D);
    const E = (d) => ey1 - (d - (dmin - 0.05)) / (dmax - dmin + 0.1) * (ey1 - ey0);
    ctx.fillStyle = "rgba(111,160,196,.18)";
    ctx.beginPath(); ctx.moveTo(X(K.lat[0]), ey1); K.lat.forEach((la, j) => ctx.lineTo(X(la), E(K.D[j]))); ctx.lineTo(X(K.lat[NLAT - 1]), ey1); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#2c4e8a"; ctx.lineWidth = 2; ctx.beginPath();
    K.lat.forEach((la, j) => (j ? ctx.lineTo(X(la), E(K.D[j])) : ctx.moveTo(X(la), E(K.D[j])))); ctx.stroke();
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("해수면 높이 η (1000 m 기준 역학적 높이)", x0, 12);
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.font = `10px ${F.mono}`;
    [1.8, 2.1, 2.4].forEach((d) => { if (d >= dmin - 0.05 && d <= dmax + 0.05) ctx.fillText(d.toFixed(1) + " m", x0 - 4, E(d) + 3); });
    /* 아래: 수온 단면 */
    const sy0 = h * 0.36, sy1 = h - 22;
    const Z = (z) => sy0 + z / ZMAX * (sy1 - sy0);
    for (let j = 0; j < NLAT; j++) {
      const xa = X(K.lat[j] - 0.125), xb = X(K.lat[j] + 0.125);
      for (let k = 0; k < K.z.length - 1; k++) {
        const t = K.T[j][k]; if (t == null) continue;
        ctx.fillStyle = tcol((t + K.T[j][k + 1]) / 2);
        ctx.fillRect(xa, Z(K.z[k]), xb - xa + 0.6, Z(K.z[k + 1]) - Z(K.z[k]) + 0.6);
      }
    }
    [[25, 1], [20, 1], [15, 2.4], [10, 1]].forEach(([t0, lw]) => {
      ctx.strokeStyle = t0 === 15 ? C.ink : "rgba(35,35,38,.55)"; ctx.lineWidth = lw; ctx.beginPath();
      let on = false;
      K.lat.forEach((la, j) => { const z = isoZ(j, t0); if (z == null) { on = false; return; } on ? ctx.lineTo(X(la), Z(z)) : ctx.moveTo(X(la), Z(z)); on = true; });
      ctx.stroke();
      const zl = isoZ(1, t0);
      if (zl != null) { ctx.fillStyle = C.ink; ctx.font = `${t0 === 15 ? 600 : 400} 10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(t0 + "°C", X(K.lat[1]) + 2, Z(zl) - 3); }
    });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(x0 + .5, sy0 + .5, x1 - x0 - 1, sy1 - sy0);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
    [0, 250, 500, 750, 1000].forEach((z) => ctx.fillText(z + (z === 1000 ? " m" : ""), x0 - 4, Z(z) + (z === 0 ? 8 : z === 1000 ? 0 : 3)));
    ctx.textAlign = "center";
    [27.5, 28.5, 29.5, 30.5, 31.5].forEach((la) => ctx.fillText(la + "°N", X(la), sy1 + 13));
    ctx.textAlign = "right"; ctx.fillText("시코쿠 →", x1, sy1 + 13);
    /* 흐름 기호: 지면에서 나옴(동쪽) */
    const xf = X(32.05), yf = sy0 + 70;
    ctx.fillStyle = "rgba(251,251,248,.85)"; ctx.beginPath(); ctx.arc(xf, yf, 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(xf, yf, 9, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(xf, yf, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; const tw = ctx.measureText("구로시오: 동쪽으로(지면 밖)").width;
    ctx.fillStyle = "rgba(251,251,248,.9)"; ctx.fillRect(xf - 15 - tw, yf - 8, tw + 4, 15); ctx.fillStyle = C.warn; ctx.fillText("구로시오: 동쪽으로(지면 밖)", xf - 13, yf + 4);
    /* 관측점 A, B */
    [[+sA.value, "A"], [+sB.value, "B"]].forEach(([j, t]) => {
      const xx = X(K.lat[j]);
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.3; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(xx, ey0 - 2); ctx.lineTo(xx, sy1); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(xx, E(K.D[j]), 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillStyle = C.card; ctx.fillRect(xx - 7, sy0 - 14, 14, 13); ctx.fillStyle = C.forest; ctx.fillText(t, xx, sy0 - 3);
    });
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 50, y0: 20, w: w - 64, h: h - 54 };
    if (xKey === "v") {
      const pts = tbl.rows.map((r) => ({ x: (r.la + r.lb) / 2, y: r.v, ex: Math.abs(r.lb - r.la) / 2 }));
      L.plot(ctx, box, { pts, xr: [27, 32.5], yr: [-0.1, 0.7], xlabel: "두 관측점의 가운데 위도 (°N)", ylabel: "지형류 v (m/s, + 동쪽)" });
    } else {
      const pts = tbl.rows.map((r) => ({ x: r.deta, y: r.dz }));
      const f = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y), true) : null;
      const P = L.plot(ctx, box, { pts, fit: f, xlabel: "Δη = η_B − η_A (cm)", ylabel: "Δz₁₅ 위로 올라온 높이 (m, + 얕아짐)" });
      if (f) {
        ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
        ctx.fillText(`기울기 ${(f.a * 100).toFixed(0)} m/m → 수온 약층 경사 ≈ 해수면 경사 × ${Math.abs(f.a * 100).toFixed(0)}`, box.x0 + 6, box.y0 + box.h - 8);
      }
      void P;
    }
  }

  function upd() {
    const a = +sA.value, b = +sB.value, la = (K.lat[a] + K.lat[b]) / 2;
    $(".a-out").textContent = K.lat[a].toFixed(3); $(".b-out").textContent = K.lat[b].toFixed(3);
    $(".dx").textContent = a === b ? "—" : dist(a, b).toFixed(0) + " km";
    $(".ff").textContent = (fCor(la) * 1e5).toFixed(2) + "×10⁻⁵ s⁻¹";
    $(".gf").textContent = (G / fCor(la) / 1e3).toFixed(0) + "×10³ m/s";
    draw();
  }
  function measure() {
    let a = +sA.value, b = +sB.value;
    if (a === b) return null;
    if (a > b) [a, b] = [b, a];
    const ea = L.measure(K.D[a], { sd: 0.005, res: 0.001 }), eb = L.measure(K.D[b], { sd: 0.005, res: 0.001 });
    const za = L.measure(K.z15[a], { sd: 4, res: 1 }), zb = L.measure(K.z15[b], { sd: 4, res: 1 });
    const dx = dist(a, b) * 1e3, la = (K.lat[a] + K.lat[b]) / 2;
    const deta = eb - ea, v = -G / fCor(la) * deta / dx;
    return { la: K.lat[a], lb: K.lat[b], dx: dx / 1e3, deta: deta * 100, dz: za - zb, v };
  }

  [sA, sB].forEach((el) => el.addEventListener("input", upd));
  $(".meas").addEventListener("click", () => { const r = measure(); if (r) tbl.add(r); });
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".xsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-x]"); if (!b) return;
    xKey = b.dataset.x; root.querySelectorAll("[data-x]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  upd();
  if (L.demo) {
    [[1, 3], [5, 7], [9, 11], [11, 13], [13, 15], [15, 17], [16, 18], [17, 19], [19, 21], [11, 21]].forEach(([a, b]) => { sA.value = a; sB.value = b; tbl.add(measure()); });
    sA.value = 17; sB.value = 21; upd();
  }
})();
