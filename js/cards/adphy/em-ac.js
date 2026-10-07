/* 카드: 직렬 RLC 교류 회로 — 위상자, 리액턴스와 임피던스, 공진 곡선 */
(() => {
  const root = document.getElementById("card-adphy-ac");
  if (!root) return;
  const { C: COL, F, fit, loop, reduce } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sF = $(".f"), oF = $(".f-out"), sR = $(".r"), oR = $(".r-out"), sL = $(".l"), oL = $(".l-out"), sC = $(".c"), oC = $(".c-out");
  const nXL = $(".n-xl"), nXC = $(".n-xc"), nZ = $(".n-z"), nI = $(".n-i"), nPh = $(".n-ph"), nF0 = $(".n-f0");
  const VRMS = 10, FMIN = 10, FMAX = 1e4;
  const BLUE = "#3f6fa3", VIO = "#8a4fb5";
  let wt = 0;
  const par = (fo) => {
    const f = fo ?? 10 ** +sF.value, R = +sR.value, L = +sL.value * 1e-3, C = +sC.value * 1e-6, w = 2 * Math.PI * f;
    const XL = w * L, XC = 1 / (w * C), Z = Math.hypot(R, XL - XC), I = VRMS / Z, ph = Math.atan2(XL - XC, R);
    return { f, R, L, C, XL, XC, Z, I, ph, f0: 1 / (2 * Math.PI * Math.sqrt(L * C)) };
  };
  const { ctx, size } = fit(cv, () => draw());
  function arrow(x0, y0, x1, y1, col, lw = 2.2) {
    const L = Math.hypot(x1 - x0, y1 - y0); if (L < 1) return;
    const ux = (x1 - x0) / L, uy = (y1 - y0) / L, hs = Math.min(8, L * .4);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * hs * .6, y1 - uy * hs * .6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * hs - uy * hs * .45, y1 - uy * hs + ux * hs * .45); ctx.lineTo(x1 - ux * hs + uy * hs * .45, y1 - uy * hs - ux * hs * .45); ctx.closePath(); ctx.fill();
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = par(), topH = Math.round(h * 0.5), S = Math.min(topH - 20, w * 0.48), cx = S / 2 + 4, cy = topH / 2 + 4, rad = S / 2 - 12;
    const Vm = VRMS * Math.SQRT2, Im = p.I * Math.SQRT2, VR = Im * p.R, VLm = Im * p.XL, VCm = Im * p.XC;
    const sc = rad / Math.max(Vm, Math.hypot(VR, VLm), Math.hypot(VR, VCm), VLm, VCm);
    /* 위상자 (반시계 방향 회전, 실제 값 = 수평축 투영) */
    ctx.strokeStyle = COL.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 2 * Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - rad, cy); ctx.lineTo(cx + rad, cy); ctx.moveTo(cx, cy - rad); ctx.lineTo(cx, cy + rad); ctx.stroke();
    const ti = wt - p.ph, P = (a, m) => [Math.cos(a) * m * sc, -Math.sin(a) * m * sc];
    const [ax, ay] = P(ti, VR), [bx, by] = P(ti + Math.PI / 2, VLm), [qx, qy] = P(ti - Math.PI / 2, VCm), [vx, vy] = P(wt, Vm);
    arrow(cx, cy, cx + ax, cy + ay, COL.forest);
    arrow(cx + ax, cy + ay, cx + ax + bx, cy + ay + by, VIO);
    arrow(cx + ax + bx, cy + ay + by, cx + ax + bx + qx, cy + ay + by + qy, BLUE);
    arrow(cx, cy, cx + vx, cy + vy, COL.ink, 2.6);
    const [ix, iy] = P(ti, rad * 0.35 / sc);
    ctx.setLineDash([3, 3]); arrow(cx, cy, cx + ix, cy + iy, COL.amber, 1.6); ctx.setLineDash([]);
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    [[COL.ink, "전원 V"], [COL.forest, "V_R"], [VIO, "V_L"], [BLUE, "V_C"], ["#b07a10", "전류 I 방향"]].forEach(([c, t], i) => { ctx.fillStyle = c; ctx.fillText(t, 4 + (i % 3) * 64, 12 + Math.floor(i / 3) * 13); });
    /* 시간 파형: 전원 전압과 전류(진폭을 맞춰 그림) */
    const gx0 = S + 22, gx1 = w - 8, gy = cy, gh = topH * 0.36;
    ctx.strokeStyle = COL.rule; ctx.beginPath(); ctx.moveTo(gx0, gy); ctx.lineTo(gx1, gy); ctx.stroke();
    const wave = (off, col, dash) => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash(dash || []); ctx.beginPath(); for (let i = 0; i <= 200; i++) { const a = i / 200 * 4 * Math.PI, x = gx0 + i / 200 * (gx1 - gx0), y = gy - Math.cos(wt - a - off) * gh; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.setLineDash([]); };
    wave(0, COL.ink); wave(p.ph, COL.amber, [5, 3]);
    ctx.fillStyle = COL.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText("← 최근   시간 (2주기)", gx0, gy + gh + 16);
    ctx.fillStyle = COL.ink; ctx.fillText("— 전원 전압", gx0, 14); ctx.fillStyle = "#b07a10"; ctx.fillText("- - 전류 (크기 맞춤)", gx0 + 82, 14);
    /* 아래: 공진 곡선 */
    const x0 = 46, x1 = w - 12, y1 = topH + 28, y0 = h - 34;
    ctx.strokeStyle = COL.rule; ctx.beginPath(); ctx.moveTo(0, topH + 6); ctx.lineTo(w, topH + 6); ctx.stroke();
    const Imax = VRMS / p.R, X = (f) => x0 + Math.log10(f / FMIN) / Math.log10(FMAX / FMIN) * (x1 - x0), Y = (i) => y0 - i / (Imax * 1.1) * (y0 - y1);
    const st = (() => { const v = Imax / 3, e = 10 ** Math.floor(Math.log10(v)), m = v / e; return (m < 2 ? 1 : m < 5 ? 2 : 5) * e; })();
    const yt = []; for (let i = 0; i <= Imax * 1.1; i += st) yt.push([i, String(+i.toPrecision(3))]);
    NM.axes(ctx, { x0, y0: y1, w: x1 - x0, h: y0 - y1, X, Y, xt: [[10, "10"], [100, "100"], [1000, "1k"], [10000, "10k"]], yt, xlabel: "", ylabel: "전류 실횻값 I (A)" });
    ctx.strokeStyle = COL.forest; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 300; i++) { const f = FMIN * (FMAX / FMIN) ** (i / 300), q = par(f); i ? ctx.lineTo(X(f), Y(q.I)) : ctx.moveTo(X(f), Y(q.I)); }
    ctx.stroke();
    if (p.f0 > FMIN && p.f0 < FMAX) { ctx.strokeStyle = COL.ink3; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(p.f0), y1); ctx.lineTo(X(p.f0), y0); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = COL.ink3; ctx.textAlign = "left"; ctx.fillText("f₀", X(p.f0) + 4, y1 + 10); }
    ctx.fillStyle = COL.apple; ctx.beginPath(); ctx.arc(X(p.f), Y(p.I), 5, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = COL.ink3; ctx.textAlign = "left"; ctx.fillText("진동수 f (로그 눈금)", x0, y0 + 28);
  }
  const ohm = (x) => x >= 1e3 ? `${(x / 1e3).toPrecision(3)} kΩ` : `${x.toPrecision(3)} Ω`;
  function update() {
    const p = par();
    oF.textContent = p.f >= 1e3 ? `${(p.f / 1e3).toFixed(2)} k` : p.f.toFixed(0); oR.textContent = sR.value; oL.textContent = sL.value; oC.textContent = sC.value;
    nXL.textContent = ohm(p.XL); nXC.textContent = ohm(p.XC); nZ.textContent = ohm(p.Z);
    nI.textContent = `${p.I.toPrecision(3)} A`; nPh.textContent = `${(p.ph * 180 / Math.PI).toFixed(1)}°`;
    nF0.textContent = p.f0 >= 1e3 ? `${(p.f0 / 1e3).toPrecision(3)} kHz` : `${p.f0.toPrecision(3)} Hz`;
    draw();
  }
  root.querySelector("[data-res]").addEventListener("click", () => { sF.value = Math.log10(par().f0); update(); });
  [sF, sR, sL, sC].forEach((el) => el.addEventListener("input", update));
  if (/[?&]demo\b/.test(location.search)) { sF.value = 2.5; wt = 0.9; }
  if (!reduce) loop(cv, (dt) => { wt += dt * 2 * Math.PI * 0.25; draw(); });
  update();
})();
