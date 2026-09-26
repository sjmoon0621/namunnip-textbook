/* 카드: 지진파가 닿지 않는 곳이 왜 생길까? — 층별 선형 속도 모델에서 파선을 수치로 추적, 암영대 */
(() => {
  const root = document.getElementById("card-esys-seismic");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA = $(".a"), oA = $(".a-out"), bP = $(".w-p"), bS = $(".w-s"), nD = $(".n-d"), nZ = $(".n-z"), nL = $(".n-l");
  const R = 6371, RC = 3480, RI = 1221;
  function vel(r, S) {
    const d = R - r;
    if (r >= RC) return S ? (d < 660 ? 4.5 + 1.5 * d / 660 : 6.0 + 1.3 * (d - 660) / 2231) : (d < 660 ? 8.0 + 2.8 * d / 660 : 10.8 + 2.9 * (d - 660) / 2231);
    if (S) return null;                          // S파는 액체 외핵을 지나지 못함
    if (r >= RI) return 8.0 + 2.3 * (RC - r) / (RC - RI);
    return 11.0 + 0.3 * (RI - r) / RI;
  }
  // 구면 스넬 법칙: r·sin(i)/v = p 가 파선을 따라 일정
  function trace(deg, S) {
    const p = R * Math.sin(deg * Math.PI / 180) / vel(R, S);
    let r = R - 0.01, th = 0, down = true, deep = R; const pts = [[r, 0]];
    for (let n = 0; n < 20000; n++) {
      const v = vel(r, S);
      if (v === null) return { pts, d: null, deep, stop: true };
      let s = p * v / r; if (s >= 1) { down = false; s = 0.9999999; }
      const ds = Math.min(12, 2 + r * 0.004), rn = r + (down ? -1 : 1) * Math.sqrt(1 - s * s) * ds, vn = vel(rn, S);
      if (down && vn !== null && p * vn / rn >= 1) { down = false; continue; }
      th += s * ds / r; r = rn; deep = Math.min(deep, r);
      if (n % 3 === 0) pts.push([r, th]);
      if (r >= R) { pts.push([R, th]); return { pts, d: th * 180 / Math.PI, deep }; }
    }
    return { pts, d: null, deep };
  }
  const FAN = {}; const fan = (S) => FAN[S] || (FAN[S] = Array.from({ length: 44 }, (_, k) => trace(1 + k * 2, S)));
  let S = false;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, k = Math.min(w, h) * 0.44 / R;
    // 진원은 위쪽, 각거리는 시계 방향
    const P = (r, th) => [cx + r * k * Math.sin(th), cy - r * k * Math.cos(th)];
    const disc = (r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx, cy, r * k, 0, Math.PI * 2); ctx.fill(); };
    disc(R, "#c9a98a"); disc(RC, "#e0a02a"); disc(RI, "#f2d27a");
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
    ctx.fillText("맨틀 (고체)", cx - R * k * 0.62, cy + R * k * 0.1); ctx.fillText("외핵 (액체)", cx - RC * k * 0.62, cy + RC * k * 0.3); ctx.fillText("내핵", cx, cy + 4);
    // 암영대 (양쪽 대칭)
    const f = fan(S).filter((t) => t.d), mantle = f.filter((t) => t.deep >= RC).map((t) => t.d), core = f.filter((t) => t.deep < RC && t.deep > RI + 1).map((t) => t.d);
    const a0 = Math.max(...mantle), a1 = S ? 180 : Math.min(...core);
    ctx.lineWidth = 9; ctx.strokeStyle = "rgba(60,60,60,.55)";
    [1, -1].forEach((sg) => { ctx.beginPath(); for (let a = a0; a <= a1; a += 1) { const [x, y] = P(R + 180, sg * a * Math.PI / 180); a === a0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); });
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`;
    const [lx, ly] = P(R + 700, (a0 + a1) / 2 * Math.PI / 180); ctx.fillText(`${S ? "S" : "P"}파 암영대`, Math.min(w - 40, lx), ly); ctx.font = `10px ${F.mono}`; ctx.fillText(`${Math.round(a0)}°~${Math.round(a1)}°`, Math.min(w - 40, lx), ly + 13);
    // 파선 다발 (양쪽)
    const drawRay = (t, sg, col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); t.pts.forEach(([r, th], i) => { const [x, y] = P(r, sg * th); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); };
    fan(S).forEach((t) => [1, -1].forEach((sg) => drawRay(t, sg, t.deep >= RC ? "rgba(63,111,163,.55)" : "rgba(181,83,47,.55)", 1)));
    const cur = trace(+sA.value, S); drawRay(cur, 1, "#1d1d1f", 2.4);
    if (cur.d) { const [x, y] = P(R, cur.d * Math.PI / 180); ctx.fillStyle = "#1d1d1f"; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); }
    const [ex, ey] = P(R, 0); ctx.fillStyle = "#d7263d"; ctx.beginPath(); ctx.arc(ex, ey, 6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.ink; ctx.font = `10.5px ${F.sans}`; ctx.fillText("진원", ex, ey - 10);
    ctx.textAlign = "left"; ctx.font = `10px ${F.sans}`; ctx.fillStyle = "#3f6fa3"; ctx.fillText("— 맨틀만 지난 파선", 8, h - 22); ctx.fillStyle = "#b5532f"; ctx.fillText(S ? "— 외핵에서 멈춘 파선" : "— 핵을 지난 파선", 8, h - 8);
  }
  function update() {
    oA.textContent = sA.value;
    const t = trace(+sA.value, S);
    nD.textContent = t.d ? `${t.d.toFixed(1)}°` : "도착하지 못함 (외핵에서 소멸)";
    nZ.textContent = `깊이 약 ${Math.round(R - t.deep)} km`;
    nL.textContent = t.deep >= RC ? "맨틀" : t.deep >= RI ? (S ? "맨틀 → 외핵 경계에서 멈춤" : "맨틀 → 외핵 → 맨틀") : "맨틀 → 외핵 → 내핵 → 외핵 → 맨틀";
    draw();
  }
  const setW = (s) => { S = s; bP.setAttribute("aria-pressed", String(!s)); bS.setAttribute("aria-pressed", String(s)); update(); };
  bP.addEventListener("click", () => setW(false)); bS.addEventListener("click", () => setW(true));
  sA.addEventListener("input", update); update();
})();
