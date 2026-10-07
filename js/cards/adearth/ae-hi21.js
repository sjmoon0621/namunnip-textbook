/* 카드: 21 cm 전파 한 줄로 우리은하의 나선팔과 회전 곡선을 그릴 수 있을까? — 모식 은하의 HI 스펙트럼, 거리 모호성, 접선점 방법 */
(() => {
  const root = document.getElementById("card-adearth-hi21");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sL = $(".l"), oL = $(".l-out"), nV = $(".n-v"), nD = $(".n-d"), nT = $(".n-t"), nR = $(".n-r");
  const R0 = 8.2, V0 = 223, K = Math.tan(12 * Math.PI / 180), RA = 4.0, SIGV = 8, VMIN = -220, VMAX = 220, EXT = 17;
  const Vrot = (R) => V0 * (1 - Math.exp(-R / 0.55)) * (1 + 0.04 * Math.exp(-(((R - 5.5) / 2.5) ** 2)));
  const ARM0 = [0.3, 0.3 + Math.PI / 2, 0.3 + Math.PI, 0.3 + 1.5 * Math.PI];
  /* 은하 중심 원점, 북은하극에서 내려다봄, 태양은 (0, −R0), l = 0은 +y, l = 90°는 왼쪽(−x) */
  function dens(x, y) {
    const R = Math.hypot(x, y); if (R < 0.2) return 0;
    const phi = Math.atan2(y, x);
    const disk = 1 / (1 + Math.exp(-(R - 3.3) / 0.35)) * Math.exp(-Math.max(0, R - 13) / 3);
    let arm = 0;
    for (const a0 of ARM0) {
      const t = Math.log(R / RA) / K - (phi - a0);
      const m = Math.round(t / (2 * Math.PI));
      for (let j = m - 1; j <= m + 1; j++) { const Rm = RA * Math.exp(K * (phi - a0 + 2 * Math.PI * j)); arm += Math.exp(-0.5 * ((R - Rm) / 0.38) ** 2); }
    }
    return disk * (0.22 + 1.1 * Math.min(arm, 1.3));
  }
  const dir = (l) => { const L = l * Math.PI / 180; return [-Math.sin(L), Math.cos(L)]; };
  function vr(l, d) {
    const [sx, sy] = dir(l), x = d * sx, y = -R0 + d * sy, R = Math.hypot(x, y), V = Vrot(R);
    const gx = V / R * y, gy = -V / R * x;
    return (gx + V0) * sx + gy * sy;
  }
  /* 지도 밑그림 (한 번만) */
  const NG = 220, bg = document.createElement("canvas"); bg.width = bg.height = NG;
  (() => {
    const g = bg.getContext("2d"), im = g.createImageData(NG, NG);
    for (let j = 0; j < NG; j++) for (let i = 0; i < NG; i++) {
      const x = (i + 0.5) / NG * 2 * EXT - EXT, y = EXT - (j + 0.5) / NG * 2 * EXT, v = Math.min(1, dens(x, y) / 1.2), k = 4 * (j * NG + i);
      im.data[k] = 20 + 150 * v; im.data[k + 1] = 24 + 190 * v; im.data[k + 2] = 30 + 225 * v; im.data[k + 3] = 255;
    }
    g.putImageData(im, 0, 0);
  })();

  let prof = [], vline = [], sel = null, term = null, recs = [];
  function compute() {
    const l = +sL.value, NB = VMAX - VMIN + 1, raw = new Float64Array(NB);
    vline = [];
    const [sx, sy] = dir(l);
    for (let d = 0.01; d < 30; d += 0.02) {
      const v = vr(l, d); vline.push([d, v]);
      const x = d * sx, y = -R0 + d * sy; if (Math.hypot(x, y) > 22) break;
      const b = Math.round(v - VMIN); if (b >= 0 && b < NB) raw[b] += dens(x, y) * 0.02;
    }
    prof = new Float64Array(NB);
    const ker = []; for (let k = -30; k <= 30; k++) ker.push(Math.exp(-0.5 * (k / SIGV) ** 2) / (SIGV * Math.sqrt(2 * Math.PI)));
    for (let i = 0; i < NB; i++) if (raw[i]) for (let k = -30; k <= 30; k++) { const j = i + k; if (j >= 0 && j < NB) prof[j] += raw[i] * ker[k + 30]; }
    /* 끝 속도: 접선점이 있는 방향에서, 높은 속도 쪽 가장자리에서 최대값의 30 %를 처음 넘는 속도 */
    term = null;
    const s = Math.sin(l * Math.PI / 180), inner = Math.cos(l * Math.PI / 180) > 0.02;
    if (inner && Math.abs(s) > 0.05) {
      const mx = Math.max(...prof);
      if (s > 0) { for (let i = NB - 1; i >= 0; i--) if (prof[i] > 0.3 * mx) { term = i + VMIN; break; } }
      else { for (let i = 0; i < NB; i++) if (prof[i] > 0.3 * mx) { term = i + VMIN; break; } }
    }
  }
  function distancesFor(v) {
    const out = [];
    for (let i = 1; i < vline.length; i++) {
      const [d1, v1] = vline[i - 1], [d2, v2] = vline[i];
      if ((v1 - v) * (v2 - v) <= 0 && v1 !== v2) out.push(d1 + (v - v1) / (v2 - v1) * (d2 - d1));
    }
    const m = []; for (const d of out) if (!m.length || d - m[m.length - 1] > 0.3) m.push(d);
    return m;
  }

  const MAP = fit($(".cv-map"), () => drawMap());
  const PRO = fit($(".cv-pro"), () => drawPro());
  const ROT = fit($(".cv-rot"), () => drawRot());
  function drawMap() {
    const { ctx, size: { w, h } } = MAP; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const S = Math.min(w, h), sc = S / (2 * EXT), cx = S / 2, cy = S / 2, P = (x, y) => [cx + x * sc, cy - y * sc];
    ctx.imageSmoothingEnabled = true; ctx.drawImage(bg, 0, 0, S, S);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, S, S); ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.setLineDash([3, 4]); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R0 * sc, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    const l = +sL.value, [sx, sy] = dir(l), [px, py] = P(0, -R0);
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + sx * 40 * sc, py - sy * 40 * sc); ctx.stroke();
    const s = Math.sin(l * Math.PI / 180), c = Math.cos(l * Math.PI / 180);
    if (c > 0.02) { const dt = R0 * c; const [tx, ty] = P(dt * sx, -R0 + dt * sy); ctx.fillStyle = C.amber; ctx.fillRect(tx - 3.5, ty - 3.5, 7, 7); }
    if (sel !== null) for (const d of distancesFor(sel)) { const [qx, qy] = P(d * sx, -R0 + d * sy); ctx.strokeStyle = "#ff5a4a"; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(qx, qy, 6, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx - 5, cy); ctx.lineTo(cx + 5, cy); ctx.moveTo(cx, cy - 5); ctx.lineTo(cx, cy + 5); ctx.stroke();
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = "#fff"; ctx.textAlign = "left";
    ctx.fillText("은하 중심", cx + 7, cy - 6); ctx.fillText("태양", px + 7, py + 12);
    ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.fillText("l = 90° ←", 6, S - 22); ctx.fillText("■ 접선점  ○ 선택한 속도의 위치", 6, S - 8);
    ctx.textAlign = "right"; ctx.fillText("모형 HI 분포 (모식)", S - 6, 14);
    ctx.fillText(`${EXT * 2} kpc × ${EXT * 2} kpc`, S - 6, 28);
  }
  function drawPro() {
    const { ctx, size: { w, h } } = PRO; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 38, y0 = 18, gw = w - x0 - 12, gh = h - y0 - 32, mx = Math.max(...prof) * 1.12 || 1;
    const X = (v) => x0 + (v - VMIN) / (VMAX - VMIN) * gw, Y = (t) => y0 + gh - t / mx * gh;
    NM.axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [-200, -150, -100, -50, 0, 50, 100, 150, 200].map((v) => [v, String(v)]), yt: [], xlabel: "시선 속도 (km/s)", ylabel: "21 cm 선의 세기 (상대값)" });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0 + gh + .5); ctx.lineTo(x0 + gw, y0 + gh + .5); ctx.stroke();
    ctx.fillStyle = "rgba(63,111,163,.22)"; ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(X(VMIN), Y(0));
    for (let i = 0; i < prof.length; i++) ctx.lineTo(X(i + VMIN), Y(prof[i]));
    ctx.lineTo(X(VMAX), Y(0)); ctx.fill(); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`;
    if (term !== null) { ctx.strokeStyle = C.amber; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(term), y0); ctx.lineTo(X(term), y0 + gh); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = "#b07a10"; ctx.textAlign = term > 0 ? "right" : "left"; ctx.fillText(`끝 속도 ${term}`, X(term) + (term > 0 ? -4 : 4), y0 + 10); }
    if (sel !== null) { ctx.strokeStyle = "#d7263d"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(sel), y0); ctx.lineTo(X(sel), y0 + gh); ctx.stroke(); }
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`l = ${sL.value}° 방향`, x0 + 4, y0 + 10);
    PRO.X = X; PRO.x0 = x0; PRO.gw = gw;
  }
  function drawRot() {
    const { ctx, size: { w, h } } = ROT; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 40, y0 = 18, gw = w - x0 - 10, gh = h - y0 - 32;
    const X = (r) => x0 + r / 10 * gw, Y = (v) => y0 + gh - v / 300 * gh;
    NM.axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [0, 2, 4, 6, 8, 10].map((v) => [v, String(v)]), yt: [0, 100, 200, 300].map((v) => [v, String(v)]), xlabel: "R (kpc)", ylabel: "회전 속도 (km/s)" });
    ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath();
    for (let i = 1; i <= 100; i++) { const r = i / 10; i > 1 ? ctx.lineTo(X(r), Y(Vrot(r))) : ctx.moveTo(X(r), Y(Vrot(r))); }
    ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.forest; for (const [r, v] of recs) { ctx.beginPath(); ctx.arc(X(r), Y(v), 3.6, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("점선: 모형 회전 곡선", x0 + 4, y0 + gh - 8);
    ctx.fillStyle = C.forest; ctx.fillText(`기록 ${recs.length}개`, x0 + 4, y0 + gh - 22);
  }
  function readouts() {
    const l = +sL.value, s = Math.sin(l * Math.PI / 180), c = Math.cos(l * Math.PI / 180);
    oL.textContent = l;
    root.querySelectorAll("[data-l]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.l === l)));
    nV.textContent = sel === null ? "클릭해 선택" : `${sel} km/s`;
    if (sel === null) nD.textContent = "—";
    else { const ds = distancesFor(sel); nD.textContent = ds.length ? ds.map((d) => d.toFixed(1)).join(", ") + " kpc" : "없음"; }
    nT.textContent = term === null ? "없음" : `${term} km/s`;
    nR.textContent = c > 0.02 ? `${(R0 * Math.abs(s)).toFixed(2)} kpc` : "접선점 없음";
  }
  function update(keepSel) {
    if (!keepSel) sel = null;
    compute(); readouts(); drawMap(); drawPro(); drawRot();
  }
  $(".cv-pro").addEventListener("click", (e) => {
    if (!PRO.X) return;
    const rect = e.currentTarget.getBoundingClientRect(), x = e.clientX - rect.left;
    sel = Math.round(VMIN + (x - PRO.x0) / PRO.gw * (VMAX - VMIN)); sel = Math.max(VMIN, Math.min(VMAX, sel));
    readouts(); drawMap(); drawPro();
  });
  $(".rec").addEventListener("click", () => {
    const l = +sL.value; if (term === null) return;
    const s = Math.abs(Math.sin(l * Math.PI / 180));
    recs = recs.filter(([r]) => Math.abs(r - R0 * s) > 0.05);
    recs.push([R0 * s, Math.abs(term) + V0 * s]); drawRot();
  });
  $(".clr").addEventListener("click", () => { recs = []; drawRot(); });
  root.querySelectorAll("[data-l]").forEach((b) => b.addEventListener("click", () => { sL.value = b.dataset.l; update(); }));
  sL.addEventListener("input", () => update());
  if (/[?&]demo/.test(location.search)) {
    for (const l of [12, 20, 28, 36, 44, 52, 60, 68, 76]) { sL.value = l; compute(); const s = Math.sin(l * Math.PI / 180); if (term !== null) recs.push([R0 * s, Math.abs(term) + V0 * s]); }
    sL.value = 30; compute(); sel = Math.round(term * 0.6);
    update(true);
  } else update();
})();
