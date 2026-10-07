/* 카드: 인공위성은 얼마나 빨리 던져야 지구를 돌까? — 만유인력 아래 궤도를 수치로 풀고, 같은 시간 동안 쓴 넓이와 궤도 에너지를 보인다 */
(() => {
  const root = document.getElementById("card-adphy-orbit");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sH = $(".h"), sV = $(".v"), sG = $(".g"), oH = $(".h-out"), oV = $(".v-out"), oG = $(".g-out");
  const nVc = $(".n-vc"), nVe = $(".n-ve"), nE = $(".n-e"), nA = $(".n-a"), nT = $(".n-t"), nEcc = $(".n-ecc");
  const MU = 3.986e14, RE = 6.371e6, RGEO = 4.2164e7, THR = 1e-3 * MU / (2 * RE);
  let orbit = null, anim = 0;

  function params() {
    const h = 10 ** +sH.value * 1e3, r0 = RE + h, vc = Math.sqrt(MU / r0), v = +sV.value * vc, gam = +sG.value * Math.PI / 180;
    return { h, r0, vc, v, gam };
  }
  /* 지구 중심 원점, 위성은 (0, r0)에서 출발해 오른쪽(시계 방향)으로 */
  function compute() {
    const { r0, v, gam } = params();
    const eps = v * v / 2 - MU / r0, bound = eps < -THR, a = bound ? -MU / (2 * eps) : Infinity;
    const hh = r0 * v * Math.cos(gam), ecc = Math.sqrt(Math.max(0, 1 + 2 * eps * hh * hh / (MU * MU)));
    const T = bound ? 2 * Math.PI * Math.sqrt(a ** 3 / MU) : Infinity;
    let x = 0, y = r0, vx = v * Math.cos(gam), vy = v * Math.sin(gam), t = 0;
    const view = bound ? Math.max(a * (1 + ecc), r0) * 1.08 : Math.max(5 * r0, 3.2 * RE);
    const pts = [[x, y, 0]]; let crash = false;
    const acc = (px, py) => { const r = Math.hypot(px, py), k = -MU / (r * r * r); return [k * px, k * py]; };
    const tEnd = bound ? T : 1e9;
    for (let n = 0; n < 40000 && t < tEnd; n++) {
      const r = Math.hypot(x, y);
      let dt = 0.004 * Math.sqrt(r ** 3 / MU); if (t + dt > tEnd) dt = tEnd - t;
      /* RK4 */
      const k1 = acc(x, y), x2 = x + vx * dt / 2, y2 = y + vy * dt / 2, v2x = vx + k1[0] * dt / 2, v2y = vy + k1[1] * dt / 2;
      const k2 = acc(x2, y2), x3 = x + v2x * dt / 2, y3 = y + v2y * dt / 2, v3x = vx + k2[0] * dt / 2, v3y = vy + k2[1] * dt / 2;
      const k3 = acc(x3, y3), x4 = x + v3x * dt, y4 = y + v3y * dt, v4x = vx + k3[0] * dt, v4y = vy + k3[1] * dt;
      const k4 = acc(x4, y4);
      x += dt / 6 * (vx + 2 * v2x + 2 * v3x + v4x); y += dt / 6 * (vy + 2 * v2y + 2 * v3y + v4y);
      vx += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); vy += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      t += dt; pts.push([x, y, t]);
      if (Math.hypot(x, y) < RE) { crash = true; break; }
      if (!bound && Math.hypot(x, y) > view * 1.5) break;
    }
    return { eps, bound, a, ecc, T, pts, crash, view, tMax: t };
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w || !orbit) return;
    ctx.clearRect(0, 0, w, h);
    const O = orbit, cx = w / 2, cy = h / 2, sc = (Math.min(w, h) / 2 - 10) / O.view;
    const P = (q) => [cx + q[0] * sc, cy - q[1] * sc];
    ctx.fillStyle = "#101418"; ctx.fillRect(0, 0, w, h);
    /* 같은 시간 부채꼴 (묶인 궤도만) */
    if (O.bound && !O.crash) {
      const N = 12;
      for (let k = 0; k < N; k += 2) {
        const t0 = O.T * k / N, t1 = O.T * (k + 1) / N;
        ctx.fillStyle = "rgba(224,160,42,.18)"; ctx.beginPath(); ctx.moveTo(cx, cy);
        O.pts.forEach((q) => { if (q[2] >= t0 && q[2] <= t1) { const [px, py] = P(q); ctx.lineTo(px, py); } });
        ctx.closePath(); ctx.fill();
      }
    }
    if (RGEO < O.view * 1.3) { ctx.strokeStyle = "rgba(255,255,255,.3)"; ctx.setLineDash([3, 5]); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, RGEO * sc, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); if (RGEO * sc < w / 2 - 20) { ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("정지 궤도", cx, cy + RGEO * sc + 12); } }
    const grd = ctx.createRadialGradient(cx - RE * sc * 0.3, cy - RE * sc * 0.3, 1, cx, cy, RE * sc);
    grd.addColorStop(0, "#5d8fc7"); grd.addColorStop(1, "#24507f");
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(cx, cy, Math.max(2, RE * sc), 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#9cc3ea"; ctx.lineWidth = 1.8; ctx.beginPath();
    O.pts.forEach((q, i) => { const [px, py] = P(q); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
    if (O.bound && !O.crash) ctx.closePath();
    ctx.stroke();
    /* 발사점 */
    const [lx, ly] = P(O.pts[0]); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(lx, ly, 2.5, 0, Math.PI * 2); ctx.fill();
    /* 위성 */
    const tt = anim * O.tMax; let q = O.pts[O.pts.length - 1];
    for (let i = 1; i < O.pts.length; i++) if (O.pts[i][2] >= tt) { q = O.pts[i]; break; }
    const [sx, sy] = P(q); ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(sx, sy, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    const kind = O.crash ? "지구에 떨어짐" : O.bound ? (O.ecc < 0.005 ? "원궤도" : "타원 궤도") : Math.abs(O.eps) <= THR ? "포물선 궤도 (탈출 경계)" : "쌍곡선 궤도 (탈출)";
    ctx.fillText(kind, 10, 18);
    ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
    const bar = O.view > 3e7 ? 1e7 : O.view > 1e7 ? 5e6 : 2e6;
    ctx.fillRect(w - 10 - bar * sc, h - 14, bar * sc, 2); ctx.fillText(`${(bar / 1e3).toLocaleString()} km`, w - 10, h - 20);
  }
  const hm = (s) => { if (!isFinite(s)) return "—"; const hr = s / 3600; return hr < 48 ? `${Math.floor(hr)}시간 ${Math.round((hr % 1) * 60)}분` : `${(hr / 24).toFixed(1)}일`; };
  function update() {
    const p = params(); orbit = compute(); anim = 0;
    oH.textContent = Math.round(p.h / 1e3).toLocaleString();
    oV.textContent = `${(p.v / 1e3).toFixed(2)} km/s (원궤도의 ${(+sV.value).toFixed(2)}배)`;
    oG.textContent = sG.value;
    nVc.textContent = `${(p.vc / 1e3).toFixed(2)} km/s`;
    nVe.textContent = `${(p.vc * Math.SQRT2 / 1e3).toFixed(2)} km/s`;
    nE.textContent = `${(orbit.eps / 1e6).toFixed(1)} MJ/kg`;
    nE.classList.toggle("bad", orbit.eps >= 0);
    nA.textContent = isFinite(orbit.a) ? `${Math.round(orbit.a / 1e3).toLocaleString()} km` : "무한대 (묶이지 않음)";
    nT.textContent = isFinite(orbit.T) ? hm(orbit.T) : "—";
    nEcc.textContent = orbit.ecc.toFixed(3);
    draw();
  }
  const PRE = {
    leo: [400, 1, 0],
    geo: [35786, 1, 0],
    hoh: [300, Math.sqrt(2 * RGEO / (RE + 3e5 + RGEO)), 0],
    esc: [400, Math.SQRT2, 0],
  };
  root.querySelectorAll("[data-pre]").forEach((b) => b.addEventListener("click", () => {
    const [hk, vr, g] = PRE[b.dataset.pre]; sH.value = Math.log10(hk); sV.value = vr; sG.value = g; update();
  }));
  loop(cv, (dt) => { if (!orbit) return; anim += dt / 6; if (anim > 1) anim = 0; draw(); });
  [sH, sV, sG].forEach((el) => el.addEventListener("input", update));
  update();
})();
