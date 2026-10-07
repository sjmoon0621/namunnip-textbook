/* 카드: 3점법으로 지층면의 자세를 구하고 지질도·단면도 그리기. 가상 지형, 참 지층면은 이 파일 안에만. */
(() => {
  const root = document.getElementById("card-adearth-threepoint");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sS = $(".s"), sD = $(".d"), sA = $(".a"), oS = $(".s-out"), oD = $(".d-out"), oA = $(".a-out");
  const nSD = $(".n-sd"), nRes = $(".n-res"), nAp = $(".n-ap"), bCon = $(".tp-con");
  const D2R = Math.PI / 180, L = 2000;
  const topo = (x, y) => {
    const vx = 1000 + 160 * Math.sin(y / 380);
    return 300 + 0.05 * (y - 1000)
      + 120 * Math.exp(-((x - 450) ** 2 + (y - 1450) ** 2) / (2 * 480 ** 2))
      + 95 * Math.exp(-((x - 1550) ** 2 + (y - 650) ** 2) / (2 * 430 ** 2))
      - 75 * Math.exp(-((x - vx) ** 2) / (2 * 130 ** 2));
  };
  /* 평면: (1000,1000)에서 높이 z0, 주향 s(오른손 규칙), 경사 d */
  const plane = (s, d, z0) => (x, y) => { const az = (s + 90) * D2R; return z0 - Math.tan(d * D2R) * ((x - 1000) * Math.sin(az) + (y - 1000) * Math.cos(az)); };
  const TRUE = plane(38, 12, 280);
  const H = [["A", 600, 1420], ["B", 1560, 1640], ["C", 980, 380]].map(([n, x, y]) => ({ n, x, y, zt: topo(x, y), zc: TRUE(x, y) }));
  /* 노두에서 확인된 경계점: 참 경계선 위의 몇 점 */
  const OUT = [];
  (() => {
    const cand = [[300, 600], [1000, 1000], [1700, 1500], [600, 300], [1300, 1900]];
    cand.forEach(([x, y]) => {
      /* 같은 y에서 x를 움직여 topo = TRUE 인 점 찾기 */
      let best = null;
      for (let xx = 40; xx < 1960; xx += 4) { const f = topo(xx, y) - TRUE(xx, y), g = topo(xx + 4, y) - TRUE(xx + 4, y); if (f * g <= 0 && (!best || Math.abs(xx - x) < Math.abs(best - x))) best = xx; }
      if (best != null) OUT.push([best + 2, y]);
    });
  })();
  /* 학생의 평면: A를 지나도록 */
  function userPlane() {
    const s = +sS.value, d = +sD.value, A = H[0];
    const base = plane(s, d, 0), z0 = A.zc - base(A.x, A.y);
    return plane(s, d, z0);
  }
  const strikeTxt = (s) => { const a = ((s % 180) + 180) % 180; return a === 0 ? "N0°E" : a <= 90 ? `N${a}°E` : `N${180 - a}°W`; };
  const quad = (az) => ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round((((az % 360) + 360) % 360) / 45) % 8];

  const N = 100;
  const TG = []; for (let j = 0; j <= N; j++) { TG.push([]); for (let i = 0; i <= N; i++) TG[j].push(topo(i / N * L, j / N * L)); }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = 26, mw = w - 2 * m - 0, mx0 = m, my0 = 22, ms = Math.min(mw, h * 0.66);
    const MX = (x) => mx0 + x / L * ms, MY = (y) => my0 + ms - y / L * ms;
    const P = userPlane(), cs = ms / N;
    /* 지층 칠하기 */
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = (i + .5) / N * L, y = (j + .5) / N * L, up = topo(x, y) > P(x, y);
      ctx.fillStyle = up ? "#efdca8" : "#c9d3c0";
      ctx.fillRect(MX(i / N * L), MY((j + 1) / N * L), cs + .6, cs + .6);
    }
    /* 등고선 */
    ctx.fillStyle = "rgba(93,93,97,.55)";
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const b = Math.floor(TG[j][i] / 20);
      if (b !== Math.floor(TG[j][i + 1] / 20) || b !== Math.floor(TG[j + 1][i] / 20)) {
        const major = (Math.floor(Math.max(TG[j][i], TG[j][i + 1], TG[j + 1][i]) / 20) * 20) % 100 === 0;
        ctx.fillStyle = major ? "rgba(93,93,97,.8)" : "rgba(93,93,97,.4)";
        ctx.fillRect(MX(i / N * L) + cs / 2 - .6, MY(j / N * L) - cs / 2 - .6, 1.4, 1.4);
      }
    }
    /* 예측 경계선 */
    ctx.fillStyle = C.ink;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = i / N * L, y = j / N * L, a = TG[j][i] - P(x, y), b = TG[j][i + 1] - P(x + L / N, y), c = TG[j + 1][i] - P(x, y + L / N);
      if (a * b <= 0 || a * c <= 0) ctx.fillRect(MX(x) + cs / 2 - 1.2, MY(y) - cs / 2 - 1.2, 2.4, 2.4);
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(mx0 + .5, my0 + .5, ms, ms);
    /* 등고선 숫자 몇 개 */
    ctx.font = `9.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    /* 단면선 */
    const az = +sA.value * D2R, ux = Math.sin(az), uy = Math.cos(az);
    let t0 = -1e9, t1 = 1e9;
    [[ux, 1000, 0, L], [uy, 1000, 0, L]].forEach(([u, c, lo, hi]) => { if (Math.abs(u) < 1e-9) return; const a = (lo - c) / u, b = (hi - c) / u; t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b)); });
    ctx.strokeStyle = C.warn; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(MX(1000 + ux * t0), MY(1000 + uy * t0)); ctx.lineTo(MX(1000 + ux * t1), MY(1000 + uy * t1)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.font = `600 11px ${F.sans}`;
    const lp = (t, s) => { const x = MX(1000 + ux * t), y = MY(1000 + uy * t); ctx.fillText(s, x + (ux * t > 0 ? 8 : -8) * Math.sign(ux || 1), y - 5); };
    lp(t0 * 0.97, "X"); lp(t1 * 0.97, "X′");
    /* 노두 */
    OUT.forEach(([x, y]) => { ctx.fillStyle = "#fff"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(MX(x), MY(y) - 5); ctx.lineTo(MX(x) + 5, MY(y)); ctx.lineTo(MX(x), MY(y) + 5); ctx.lineTo(MX(x) - 5, MY(y)); ctx.closePath(); ctx.fill(); ctx.stroke(); });
    /* 3점법 작도 */
    if (bCon.getAttribute("aria-pressed") === "true") {
      ctx.save(); ctx.beginPath(); ctx.rect(mx0, my0, ms, ms); ctx.clip();
      const s = [...H].sort((a, b) => b.zc - a.zc), hi = s[0], mid = s[1], lo = s[2];
      const f = (hi.zc - mid.zc) / (hi.zc - lo.zc), px = hi.x + f * (lo.x - hi.x), py = hi.y + f * (lo.y - hi.y);
      ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(MX(hi.x), MY(hi.y)); ctx.lineTo(MX(lo.x), MY(lo.y)); ctx.stroke();
      const dx = mid.x - px, dy = mid.y - py, k = 3;
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(MX(px - dx * k), MY(py - dy * k)); ctx.lineTo(MX(mid.x + dx * k), MY(mid.y + dy * k)); ctx.stroke();
      ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.arc(MX(px), MY(py), 4, 0, 7); ctx.fill();
      ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`${Math.round(mid.zc)} m 지점`, MX(px) + 6, MY(py) + 12);
      /* 낮은 점에서 주향선까지 수직선 */
      const len = Math.hypot(dx, dy), ex = dx / len, ey = dy / len, t = (lo.x - px) * ex + (lo.y - py) * ey, fx = px + ex * t, fy = py + ey * t;
      ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(MX(lo.x), MY(lo.y)); ctx.lineTo(MX(fx), MY(fy)); ctx.stroke(); ctx.setLineDash([]);
      const d = Math.hypot(lo.x - fx, lo.y - fy);
      ctx.fillText(`d = ${Math.round(d)} m, Δz = ${Math.round(mid.zc - lo.zc)} m`, Math.min(MX((lo.x + fx) / 2) + 6, mx0 + ms - 150), MY((lo.y + fy) / 2) - 8);
      ctx.restore();
    }
    /* 시추공 */
    H.forEach((p) => {
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(MX(p.x), MY(p.y), 4.5, 0, 7); ctx.fill();
      ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink;
      const tx = MX(p.x) + 7 > mx0 + ms - 120 ? MX(p.x) - 128 : MX(p.x) + 7;
      ctx.fillStyle = "rgba(251,251,248,.85)"; ctx.fillRect(tx - 2, MY(p.y) - 13, 122, 28);
      ctx.fillStyle = C.ink; ctx.fillText(`${p.n}  지표 ${Math.round(p.zt)} m`, tx, MY(p.y) - 1);
      ctx.font = `10.5px ${F.sans}`; ctx.fillText(`경계 높이 ${Math.round(p.zc)} m`, tx + 14, MY(p.y) + 12);
    });
    /* 방위표와 축척 */
    const nx = mx0 + ms - 16, ny = my0 + 26;
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(nx, ny - 16); ctx.lineTo(nx - 5, ny - 4); ctx.lineTo(nx + 5, ny - 4); ctx.fill();
    ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("N", nx, ny + 8);
    const sx = mx0 + 10, sy = my0 + ms - 10; ctx.fillRect(sx, sy, ms / 4, 3); ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("500 m", sx, sy - 4);
    /* 범례 */
    const ly = my0 - 8; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = "#efdca8"; ctx.fillRect(mx0, ly - 8, 10, 9); ctx.fillStyle = C.ink2; ctx.fillText("사암층(위)", mx0 + 14, ly);
    ctx.fillStyle = "#c9d3c0"; ctx.fillRect(mx0 + 86, ly - 8, 10, 9); ctx.fillStyle = C.ink2; ctx.fillText("셰일층(아래)", mx0 + 100, ly);
    ctx.fillStyle = C.ink; ctx.fillRect(mx0 + 184, ly - 4, 12, 2.4); ctx.fillStyle = C.ink2; ctx.fillText("예측 경계", mx0 + 200, ly);
    ctx.fillText("◆ 노두", mx0 + 262, ly);

    /* 단면도 */
    const sy0 = my0 + ms + 30, sh = h - sy0 - 22, sw = ms;
    const len = t1 - t0, hs = sw / len, vs = hs * 2, zb = 0, zt = sh / vs;
    const SX = (t) => mx0 + (t - t0) * hs, SY = (z) => sy0 + sh - (z - zb) * vs;
    ctx.save(); ctx.beginPath(); ctx.rect(mx0, sy0, sw, sh); ctx.clip();
    for (let k = 0; k < sw; k += 2) {
      const t = t0 + k / hs, x = 1000 + ux * t, y = 1000 + uy * t, zt2 = topo(x, y), zp = P(x, y);
      ctx.fillStyle = "#c9d3c0"; ctx.fillRect(mx0 + k, SY(Math.min(zt2, zp)), 2.4, SY(zb) - SY(Math.min(zt2, zp)));
      if (zt2 > zp) { ctx.fillStyle = "#efdca8"; ctx.fillRect(mx0 + k, SY(zt2), 2.4, SY(zp) - SY(zt2)); }
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let k = 0; k <= sw; k += 2) { const t = t0 + k / hs, z = topo(1000 + ux * t, 1000 + uy * t); k ? ctx.lineTo(mx0 + k, SY(z)) : ctx.moveTo(mx0 + k, SY(z)); } ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.setLineDash([4, 3]); ctx.beginPath();
    for (let k = 0; k <= sw; k += 4) { const t = t0 + k / hs, z = P(1000 + ux * t, 1000 + uy * t); k ? ctx.lineTo(mx0 + k, SY(z)) : ctx.moveTo(mx0 + k, SY(z)); } ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.strokeRect(mx0 + .5, sy0 + .5, sw, sh);
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.warn; ctx.textAlign = "left"; ctx.fillText("X", mx0, sy0 - 6); ctx.textAlign = "right"; ctx.fillText("X′", mx0 + sw, sy0 - 6);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("지질 단면도 (수직 과장 2배)", mx0 + sw / 2, sy0 - 6);
    for (let z = 100; z < zt; z += 100) { ctx.textAlign = "right"; ctx.fillText(z, mx0 - 3, SY(z) + 3); }
    ctx.textAlign = "left"; ctx.fillText("m", 2, sy0 + 10);
  }
  function update() {
    const s = +sS.value, d = +sD.value, a = +sA.value;
    oS.textContent = String(s).padStart(3, "0"); oD.textContent = d; oA.textContent = String(a).padStart(3, "0");
    nSD.textContent = `${strikeTxt(s)} / ${d}°${d > 0 ? quad(s + 90) : ""}`;
    const P = userPlane();
    const r = H.slice(1).map((p) => P(p.x, p.y) - p.zc);
    nRes.textContent = r.map((v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(0)}`).join(" · ");
    nRes.className = r.every((v) => Math.abs(v) <= 5) ? "n-res good" : "n-res";
    let beta = Math.abs(((a - s) % 180 + 180) % 180); const sb = Math.abs(Math.sin(beta * D2R));
    const ap = Math.atan(Math.tan(d * D2R) * sb) / D2R;
    nAp.textContent = `${ap.toFixed(1)}° (β = ${Math.round(beta > 90 ? 180 - beta : beta)}°)`;
    draw();
  }
  [sS, sD, sA].forEach((e) => e.addEventListener("input", update));
  bCon.addEventListener("click", () => { bCon.setAttribute("aria-pressed", String(bCon.getAttribute("aria-pressed") !== "true")); update(); });
  $(".tp-perp").addEventListener("click", () => { sA.value = ((+sS.value + 90) % 180); update(); });
  if (/[?&]demo/.test(location.search)) { sS.value = 38; sD.value = 12; sA.value = 128; bCon.setAttribute("aria-pressed", "true"); }
  update();
})();
