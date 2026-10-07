/* 카드: 중력이 쉬지 않고 당기는데 태양은 왜 무너지지 않을까? — 레인–엠든 폴리트로프, 정역학 평형, 복사와 대류 */
(() => {
  const root = document.getElementById("card-adearth-hydrostatic");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sN = $(".n"), sX = $(".x"), sM = $(".m"), sR = $(".r");
  const G = 6.674e-11, MSUN = 1.989e30, RSUN = 6.957e8, kB = 1.380649e-23, mH = 1.6726e-27, MU = 0.61;
  let sol = null, solN = -1;
  /* 레인–엠든: θ'' + (2/ξ)θ' + θⁿ = 0 */
  function lane(n) {
    const f = (x, y, z) => [z, -(Math.max(y, 0) ** n) - 2 * z / x];
    let x = 1e-4, y = 1 - x * x / 6, z = -x / 3; const hS = 2e-3, out = [[0, 1, 0]];
    while (y > 0 && x < 60) {
      const k1 = f(x, y, z), k2 = f(x + hS / 2, y + hS / 2 * k1[0], z + hS / 2 * k1[1]), k3 = f(x + hS / 2, y + hS / 2 * k2[0], z + hS / 2 * k2[1]), k4 = f(x + hS, y + hS * k3[0], z + hS * k3[1]);
      const yn = y + hS / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), zn = z + hS / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      if (yn <= 0) { const fr = y / (y - yn); x += hS * fr; z += (zn - z) * fr; y = 0; out.push([x, 0, z]); break; }
      x += hS; y = yn; z = zn; out.push([x, y, z]);
    }
    const x1 = x, mu1 = -x1 * x1 * z;
    return { n, x1, mu1, pts: out, conc: x1 / (3 * -z) };
  }
  function model() {
    const n = +sN.value;
    if (n !== solN) { sol = lane(n); solN = n; }
    const M = 10 ** +sM.value * MSUN, R = 10 ** +sR.value * RSUN;
    const rhoBar = M / (4 / 3 * Math.PI * R ** 3), rhoC = rhoBar * sol.conc, a = R / sol.x1;
    const Pc = 4 * Math.PI * G * a * a * rhoC * rhoC / (n + 1), Tc = Pc * MU * mH / (rhoC * kB);
    return { n, M, R, rhoBar, rhoC, a, Pc, Tc };
  }
  /* r/R에서의 값 (선형 보간) */
  function at(q) {
    const xi = q * sol.x1, p = sol.pts; let lo = 0, hi = p.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (p[m][0] < xi) lo = m; else hi = m; }
    const f = (xi - p[lo][0]) / (p[hi][0] - p[lo][0] || 1);
    const th = p[lo][1] + f * (p[hi][1] - p[lo][1]), dth = p[lo][2] + f * (p[hi][2] - p[lo][2]);
    return { xi, th: Math.max(th, 0), dth };
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const md = model(), n = md.n, q = +sX.value, conv = 1 / (n + 1) > 0.4 - 1e-9;
    /* 왼쪽: 단면 */
    const cx = w * 0.24, cy = h * 0.50, Rp = Math.min(w * 0.21, h * 0.40);
    for (let i = 60; i >= 1; i--) {
      const qq = i / 60, t = at(qq).th; /* T/Tc = θ */
      const r = Math.round(255 * Math.min(1, 0.35 + t)), g = Math.round(255 * Math.min(1, 0.15 + 0.85 * t * t)), b = Math.round(255 * Math.max(0, t ** 3 * 0.9));
      ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.beginPath(); ctx.arc(cx, cy, Rp * qq, 0, 2 * Math.PI); ctx.fill();
    }
    /* 에너지 전달 표시 */
    ctx.strokeStyle = "rgba(35,35,38,.55)"; ctx.lineWidth = 1.1;
    if (conv) {
      for (let k = 0; k < 6; k++) { const ang = k * Math.PI / 3 + 0.3, rr = Rp * 0.62; const ex = cx + rr * Math.cos(ang), ey = cy + rr * Math.sin(ang); ctx.beginPath(); ctx.ellipse(ex, ey, Rp * 0.2, Rp * 0.11, ang, 0, 1.7 * Math.PI); ctx.stroke(); }
    } else {
      ctx.beginPath(); let px = cx, py = cy; ctx.moveTo(px, py); let s = 7;
      for (let i = 0; i < 260; i++) { s = (s * 16807) % 2147483647; const ang = s / 2147483647 * 2 * Math.PI; px += 6 * Math.cos(ang) + 0.5; py += 6 * Math.sin(ang) + 0.45; if (Math.hypot(px - cx, py - cy) > Rp * 0.95) break; ctx.lineTo(px, py); }
      ctx.stroke();
    }
    /* 고른 껍질과 힘 화살표 */
    const rs = Rp * q;
    ctx.strokeStyle = C.forest; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, rs, -Math.PI * 0.42, -Math.PI * 0.58, true); ctx.stroke();
    ctx.lineWidth = 1; ctx.beginPath(); ctx.setLineDash([2, 3]); ctx.arc(cx, cy, rs, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
    const arrow = (x, y1, y2, col) => { ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke(); const d = Math.sign(y2 - y1); ctx.beginPath(); ctx.moveTo(x, y2); ctx.lineTo(x - 4, y2 - 6 * d); ctx.lineTo(x + 4, y2 - 6 * d); ctx.fill(); };
    const ys = cy - rs;
    arrow(cx - 7, ys + 3, ys - 24, "#3f6fa3");
    arrow(cx + 7, ys - 3, ys + 24, C.apple);
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillStyle = C.ink2;
    ctx.fillText(conv ? "대류로 전달" : "복사로 전달", cx, cy + Rp + 16);
    ctx.fillStyle = "#3f6fa3"; ctx.textAlign = "left"; ctx.fillText("압력 차이 −dP/dr", 8, h - 28);
    ctx.fillStyle = C.apple; ctx.fillText("중력 Gmρ/r²", 8, h - 12);
    /* 오른쪽: 분포 */
    const gx0 = w * 0.52, gx1 = w - 10, gy0 = 26, gy1 = h - 34;
    const X = (v) => gx0 + v * (gx1 - gx0), Y = (v) => gy1 - v * (gy1 - gy0);
    NM.axes(ctx, { x0: gx0, y0: gy0, w: gx1 - gx0, h: gy1 - gy0, X, Y, xt: [[0, "0"], [0.5, "0.5"], [1, "1"]], yt: [[0, "0"], [0.5, "0.5"], [1, "1"]], xlabel: "r / R", ylabel: "중심값(또는 M)에 대한 비" });
    const series = [["ρ/ρc", "#7a5aa6", (t) => t.th ** n], ["P/Pc", "#3f6fa3", (t) => t.th ** (n + 1)], ["T/Tc", C.apple, (t) => t.th], ["m/M", C.forest, (t) => -t.xi * t.xi * t.dth / sol.mu1]];
    series.forEach(([lab, col, f], j) => {
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i <= 200; i++) { const v = i / 200, t = i === 0 ? { xi: 0, th: 1, dth: 0 } : at(v); const y = Y(Math.max(0, Math.min(1, f(t)))); i === 0 ? ctx.moveTo(X(v), y) : ctx.lineTo(X(v), y); }
      ctx.stroke();
      ctx.fillStyle = col; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(lab, gx1 - 4, gy0 + 14 + j * 14);
    });
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(q), gy0); ctx.lineTo(X(q), gy1); ctx.stroke(); ctx.setLineDash([]);
  }
  const sci = (v, d = 2) => { const e = Math.floor(Math.log10(v)); const sup = String(e).replace(/[-0-9]/g, (ch) => "⁻⁰¹²³⁴⁵⁶⁷⁸⁹"["-0123456789".indexOf(ch)]); return `${(v / 10 ** e).toFixed(d)}×10${sup}`; };
  function update() {
    const md = model(), q = +sX.value;
    $(".n-out").textContent = md.n.toFixed(2); $(".x-out").textContent = q.toFixed(2);
    $(".m-out").textContent = (10 ** +sM.value).toFixed(2); $(".r-out").textContent = (10 ** +sR.value).toFixed(2);
    $(".n-rho").textContent = `${(md.rhoC / 1000).toPrecision(3)} g/cm³ (평균의 ${sol.conc.toFixed(1)}배)`;
    $(".n-p").textContent = `${sci(md.Pc)} Pa`;
    const nt = $(".n-t"); nt.textContent = `${sci(md.Tc)} K`; nt.classList.toggle("good", md.Tc > 1e7);
    const g = 1 / (md.n + 1);
    $(".n-g").textContent = `${g.toFixed(3)} ${g > 0.4 + 1e-9 ? "> 0.4 대류" : g > 0.4 - 1e-9 ? "= 0.4 경계" : "< 0.4 복사"}`;
    /* 껍질에 작용하는 두 힘 (단위 부피당, N/m³) */
    const t = at(q), r = q * md.R, rho = md.rhoC * t.th ** md.n, m = md.M * (-t.xi * t.xi * t.dth) / sol.mu1;
    const grav = G * m * rho / (r * r);
    const dPdr = (md.Pc * (md.n + 1) * t.th ** md.n * -t.dth) / md.a;
    const lbl = root.querySelector(".ae-hs-f");
    if (lbl) lbl.textContent = `r/R = ${q.toFixed(2)}에서 −dP/dr = ${sci(dPdr)} N/m³, Gmρ/r² = ${sci(grav)} N/m³`;
    draw();
  }
  [sN, sX, sM, sR].forEach((s) => s.addEventListener("input", update));
  update();
})();
