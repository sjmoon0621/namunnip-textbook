/* 카드: 멈춰 있던 공기는 어떤 길을 거쳐 지균풍이 될까? — 곧은 등압선에서의 관성 진동과 마찰 */
(() => {
  const root = document.getElementById("card-adearth-adjust");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sP = $(".p"), sG = $(".g"), sK = $(".k"), sT = $(".t");
  const oP = $(".p-out"), oG = $(".g-out"), oK = $(".k-out"), oT = $(".t-out"), st = $(".ad-state");
  const nG = $(".n-g"), nV = $(".n-v"), nA = $(".n-a"), nI = $(".n-i");
  const OM = 7.292e-5, RHO = 1.2, TMAX = 72 * 3600;
  function par() {
    let phi = +sP.value; if (Math.abs(phi) < 5) phi = phi < 0 ? -5 : 5;
    const f = 2 * OM * Math.sin(phi * Math.PI / 180), G = +sG.value * 100 / 1e5 / RHO, k = +sK.value * 1e-5;
    return { phi, f, G, k };
  }
  /* 복소수 W = u + iv, dW/dt = −(k + if)W + iG, W(0) = 0 */
  function at(p, t) {
    const { f, G, k } = p, d = k * k + f * f;
    const ws = [G * f / d, G * k / d];
    const ek = Math.exp(-k * t), c = Math.cos(f * t), s = Math.sin(f * t);
    /* e^{−(k+if)t} = ek(c − i s) */
    const E = [ek * c, -ek * s];
    const W = [ws[0] * (1 - E[0]) + ws[1] * E[1], ws[1] * (1 - E[0]) - ws[0] * E[1]];
    /* Z = W* t + (0 − W*)(1 − E)/(k + if) */
    const one = [1 - E[0], -E[1]], num = [-(ws[0] * one[0] - ws[1] * one[1]), -(ws[0] * one[1] + ws[1] * one[0])];
    const q = [(num[0] * k + num[1] * f) / d, (num[1] * k - num[0] * f) / d];
    return { u: W[0], v: W[1], x: ws[0] * t + q[0], y: ws[1] * t + q[1] };
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = par(), tnow = +sT.value * 3600, N = 600, pts = [];
    for (let i = 0; i <= N; i++) pts.push(at(p, TMAX * i / N));
    let xmin = 0, xmax = 0, ymin = 0, ymax = 0; pts.forEach((q) => { xmin = Math.min(xmin, q.x); xmax = Math.max(xmax, q.x); ymin = Math.min(ymin, q.y); ymax = Math.max(ymax, q.y); });
    const xr = Math.max(xmax - xmin, 1e5), yr = Math.max(ymax - ymin, 2e4) * 1.15;
    const x0 = 44, x1 = w - 14, y0 = 24, y1 = h * 0.58;
    const X = (x) => x0 + (x - xmin) / xr * (x1 - x0), Y = (y) => y1 - 10 - (y - ymin + yr * 0.04) / yr * (y1 - y0 - 20);
    /* 등압선 */
    ctx.strokeStyle = "#b8b8bc"; ctx.lineWidth = 1; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
    for (let i = 0; i < 5; i++) { const y = y0 + (y1 - y0) * i / 4; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); }
    ctx.font = `600 11.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = "#3f6fa3"; ctx.fillText("저기압 쪽 (북)", x0 + 2, y0 - 8); ctx.fillStyle = C.warn; ctx.fillText("고기압 쪽 (남)", x0 + 2, y1 + 14);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillText(`가로 ${Math.round(xr / 1000)} km · 세로 ${Math.round(yr / 1000)} km`, x1, y1 + 14);
    /* 경로 */
    ctx.strokeStyle = "rgba(59,124,42,.3)"; ctx.lineWidth = 1.5; ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(X(q.x), Y(q.y)) : ctx.moveTo(X(q.x), Y(q.y)))); ctx.stroke();
    const kk = Math.round(tnow / TMAX * N);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.4; ctx.beginPath(); for (let i = 0; i <= kk; i++) { const q = pts[i]; i ? ctx.lineTo(X(q.x), Y(q.y)) : ctx.moveTo(X(q.x), Y(q.y)); } ctx.stroke();
    const cur = at(p, tnow), cx = X(cur.x), cy = Y(cur.y);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(0), Y(0), 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(cx, cy, 5.5, 0, Math.PI * 2); ctx.fill();
    /* 현재 속도 방향 화살표 (화면 방향, 축척 무시) */
    const sp = Math.hypot(cur.u, cur.v);
    if (sp > 0.2) { const ang = Math.atan2(-cur.v * (1 / yr) * (y1 - y0), cur.u * (1 / xr) * (x1 - x0)); const L = 26; ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * L, cy + Math.sin(ang) * L); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * (L + 6), cy + Math.sin(ang) * (L + 6)); ctx.lineTo(cx + Math.cos(ang + 2.6) * 7 + Math.cos(ang) * (L + 6), cy + Math.sin(ang + 2.6) * 7 + Math.sin(ang) * (L + 6)); ctx.lineTo(cx + Math.cos(ang - 2.6) * 7 + Math.cos(ang) * (L + 6), cy + Math.sin(ang - 2.6) * 7 + Math.sin(ang) * (L + 6)); ctx.fill(); }
    /* 아래: 풍속 */
    const gy0 = h * 0.7, gy1 = h - 30, Vg = p.G / Math.abs(p.f), VM = Math.max(2.1 * Vg, 1);
    const GX = (t) => x0 + t / TMAX * (x1 - x0), GY = (v) => gy1 - v / VM * (gy1 - gy0);
    const step = VM > 40 ? 20 : VM > 20 ? 10 : 5, yt = []; for (let v = 0; v <= VM; v += step) yt.push([v, `${v}`]);
    NM.axes(ctx, { x0, y0: gy0, w: x1 - x0, h: gy1 - gy0, X: (v) => GX(v * 3600), Y: GY, xt: [0, 12, 24, 36, 48, 60, 72].map((v) => [v, `${v}`]), yt, xlabel: "시간 (h)", ylabel: "풍속 (m/s)" });
    ctx.strokeStyle = "#8a4fb5"; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(x0, GY(Vg)); ctx.lineTo(x1, GY(Vg)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#8a4fb5"; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("지균풍", x1 - 2, GY(Vg) - 4);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath(); pts.forEach((q, i) => { const t = TMAX * i / N; const v = Math.hypot(q.u, q.v); i ? ctx.lineTo(GX(t), GY(v)) : ctx.moveTo(GX(t), GY(v)); }); ctx.stroke();
    ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(GX(tnow), GY(sp), 4, 0, Math.PI * 2); ctx.fill();
  }
  function update() {
    const p = par(); oP.textContent = p.phi >= 0 ? `${p.phi}°N` : `${-p.phi}°S`; oG.textContent = (+sG.value).toFixed(1); oK.textContent = (+sK.value).toFixed(1); oT.textContent = sT.value;
    const Vg = p.G / Math.abs(p.f), Vs = p.G / Math.hypot(p.f, p.k), a = Math.atan2(p.k, Math.abs(p.f)) * 180 / Math.PI;
    nG.textContent = `${Vg.toFixed(1)} m/s`; nV.textContent = `${Vs.toFixed(1)} m/s`; nA.textContent = `${a.toFixed(0)}°`; nI.textContent = `${(2 * Math.PI / Math.abs(p.f) / 3600).toFixed(1)} h`;
    const dir = p.f > 0 ? "동쪽(오른쪽)" : "서쪽(왼쪽)";
    const c = at(p, +sT.value * 3600), sp = Math.hypot(c.u, c.v);
    st.textContent = `지금 풍속 ${sp.toFixed(1)} m/s. 공기는 처음에 저기압 쪽으로 출발하지만 전향력에 휘어 결국 ${dir}으로 흐릅니다. ` + (p.k === 0 ? "마찰이 없으면 관성 진동이 사라지지 않아 고리가 계속 생깁니다." : `마찰 때문에 진동은 약 ${(1 / p.k / 3600).toFixed(0)}시간마다 1/e로 줄고, 바람은 등압선을 ${a.toFixed(0)}° 가로질러 저기압 쪽으로 붑니다.`);
    draw();
  }
  [sP, sG, sK, sT].forEach((x) => x.addEventListener("input", update)); update();
})();
