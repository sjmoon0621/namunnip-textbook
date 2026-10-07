/* 카드: 구름 물방울이 빗방울로 자라는 데는 얼마나 걸릴까? — 쾰러 곡선과 확산·병합 성장 */
(() => {
  const root = document.getElementById("card-adearth-droplet");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sR = $(".rd"), sS = $(".s"), sM = $(".m");
  const oR = $(".rd-out"), oS = $(".s-out"), oM = $(".m-out"), st = $(".dr-state"), nC = $(".n-c"), nD = $(".n-d"), nK = $(".n-k");
  const T = 283.15, SIG = 0.0742, RHOW = 1000, RV = 461.5, A = 2 * SIG / (RHOW * RV * T);
  const MW = 0.018015, MS = 0.05844, RHOS = 2165, I = 2, GD = 1.0e-10;
  const fmt = (x, d = 2) => x.toFixed(d).replace("-", "−");
  function kb() {
    const rd = 10 ** +sR.value * 1e-6, ms = 4 / 3 * Math.PI * rd ** 3 * RHOS;
    const b = 3 * I * ms * MW / (4 * Math.PI * RHOW * MS);
    return { rd, b, rc: Math.sqrt(3 * b / A), sc: Math.sqrt(4 * A ** 3 / (27 * b)) };
  }
  const seq = (r, b) => A / r - b / r ** 3;
  /* 낙하 속도 (m/s) */
  function vt(R) { if (R < 40e-6) return 1.19e8 * R * R; if (R < 0.6e-3) return 8.0e3 * R; return 220 * Math.sqrt(R); }
  function eff(R) { return R < 10e-6 ? 0 : R > 30e-6 ? 0.8 : 0.8 * (R - 10e-6) / 20e-6; }
  /* 성장 곡선: 확산만 / 확산+병합 (초 단위, 최대 tmax) */
  function grow(s, M, coll, tmax) {
    let r = 1e-6, t = 0; const out = [[0, r]], dt = 2; let t1mm = NaN, t20 = NaN;
    while (t < tmax) {
      const dr = (s > 0 ? GD * s / r : 0) + (coll ? eff(r) * M * vt(r) / (4 * RHOW) : 0);
      r += dr * dt; t += dt;
      if (isNaN(t20) && r >= 20e-6) t20 = t;
      if (isNaN(t1mm) && r >= 1e-3) { t1mm = t; out.push([t, r]); break; }
      if (t % 20 === 0) out.push([t, r]);
    }
    return { out, t1mm, t20 };
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = kb(), s = +sS.value / 100;
    /* 위: 쾰러 곡선 */
    const x0 = 46, x1 = w - 12, y0 = 20, y1 = h * 0.47, LR0 = -2, LR1 = 2, SMIN = -1, SMAX = 1;
    const X = (r) => x0 + (Math.log10(r * 1e6) - LR0) / (LR1 - LR0) * (x1 - x0), Y = (v) => y1 - (v * 100 - SMIN) / (SMAX - SMIN) * (y1 - y0);
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X: (v) => X(10 ** v * 1e-6), Y: (v) => Y(v / 100), xt: [[-2, "0.01"], [-1, "0.1"], [0, "1"], [1, "10"], [2, "100"]], yt: [-1, -0.5, 0, 0.5, 1].map((v) => [v, fmt(v, 1)]), xlabel: "물방울 반지름 (μm)", ylabel: "평형 과포화도 S − 1 (%)" });
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    const line = (fn, col, lw, dash) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); let on = false; for (let i = 0; i <= 400; i++) { const r = 10 ** (LR0 + (LR1 - LR0) * i / 400) * 1e-6, v = fn(r); if (!isFinite(v)) continue; on ? ctx.lineTo(X(r), Y(v)) : ctx.moveTo(X(r), Y(v)); on = true; } ctx.stroke(); ctx.setLineDash([]); };
    line((r) => A / r, C.ink3, 1.3, [4, 3]);
    line((r) => (r > k.rd * 1.05 ? seq(r, k.b) : NaN), "#3f6fa3", 2.4);
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x0, Y(s)); ctx.lineTo(x1, Y(s)); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("순수한 물방울 (곡률 효과만)", X(0.22e-6), Y(0.0085));
    ctx.fillStyle = C.amber; ctx.textAlign = "right"; ctx.fillText(`구름 속 ${fmt(s * 100)} %`, x1 - 4, Y(s) - 5);
    if (k.sc < SMAX / 100) { ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.arc(X(k.rc), Y(k.sc), 4, 0, Math.PI * 2); ctx.fill(); ctx.textAlign = "center"; ctx.font = `10.5px ${F.mono}`; ctx.fillText("임계점", X(k.rc), Y(k.sc) - 8); }
    /* 평형 위치(연무) 또는 활성화 */
    let req = NaN; if (s < k.sc) { let lo = k.rd * 1.0001, hi = k.rc; for (let i = 0; i < 60; i++) { const m = Math.sqrt(lo * hi); if (seq(m, k.b) < s) lo = m; else hi = m; } req = Math.sqrt(lo * hi); }
    if (isFinite(req) && Y(s) > y0 && Y(s) < y1) { ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(X(req), Y(s), 5, 0, Math.PI * 2); ctx.fill(); }
    /* 아래: 성장 곡선 */
    const gy0 = h * 0.6, gy1 = h - 32, TM = 90 * 60, LG0 = 0, LG1 = 3.5;
    const GX = (t) => x0 + t / TM * (x1 - x0), GY = (r) => gy1 - (Math.log10(r * 1e6) - LG0) / (LG1 - LG0) * (gy1 - gy0);
    NM.axes(ctx, { x0, y0: gy0, w: x1 - x0, h: gy1 - gy0, X: (v) => GX(v * 60), Y: (v) => GY(10 ** v * 1e-6), xt: [0, 15, 30, 45, 60, 75, 90].map((v) => [v, `${v}`]), yt: [[0, "1 μm"], [1, "10"], [2, "100"], [3, "1 mm"]], xlabel: "시간 (분)", ylabel: "반지름 (활성화 뒤 1 μm에서 출발)" });
    ctx.strokeStyle = "rgba(212,73,58,.35)"; ctx.setLineDash([3, 3]); [20e-6, 1e-3].forEach((r) => { ctx.beginPath(); ctx.moveTo(x0, GY(r)); ctx.lineTo(x1, GY(r)); ctx.stroke(); }); ctx.setLineDash([]);
    if (s > 0) {
      const M = +sM.value * 1e-3, gd = grow(s, M, false, TM), gk = grow(s, M, true, TM);
      [[gd.out, "#3f6fa3", "확산만"], [gk.out, C.forest, "확산 + 병합"]].forEach(([pts, col, lab]) => {
        ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); pts.forEach(([t, r], i) => (i ? ctx.lineTo(GX(t), GY(r)) : ctx.moveTo(GX(t), GY(r)))); ctx.stroke();
        const [tl, rl] = pts[pts.length - 1]; ctx.fillStyle = col; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = tl > TM * 0.8 ? "right" : "left"; ctx.fillText(lab, tl > TM * 0.8 ? GX(tl) - 4 : GX(tl) + 6, GY(rl) + (col === C.forest ? -6 : 14));
      });
    } else { ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("과포화도가 0 이하이면 물방울은 자라지 않습니다", (x0 + x1) / 2, (gy0 + gy1) / 2); }
  }
  const hm = (sec) => (isNaN(sec) ? "—" : sec < 3600 ? `${(sec / 60).toFixed(0)}분` : sec < 86400 * 2 ? `${(sec / 3600).toFixed(1)}시간` : `${(sec / 86400).toFixed(1)}일`);
  function update() {
    const k = kb(), s = +sS.value / 100, M = +sM.value * 1e-3;
    oR.textContent = (k.rd * 1e6).toPrecision(2); oS.textContent = fmt(+sS.value); oM.textContent = (+sM.value).toFixed(1);
    nC.textContent = `${(k.rc * 1e6).toPrecision(2)} μm · ${(k.sc * 100).toFixed(2)} %`;
    if (s > 0) {
      nD.textContent = hm(((1e-3) ** 2 - (1e-6) ** 2) / (2 * GD * s));
      const gk = grow(s, M, true, 86400); nK.textContent = hm(gk.t1mm);
    } else { nD.textContent = "자라지 않음"; nK.textContent = "자라지 않음"; }
    st.textContent = s >= k.sc ? `구름 속 과포화도(${fmt(s * 100)} %)가 임계 과포화도(${(k.sc * 100).toFixed(2)} %)보다 큽니다. 물방울은 고개를 넘어 활성화되고 계속 자라는 구름 물방울이 됩니다.` : s > 0 ? `과포화도가 임계값보다 작아 물방울은 곡선의 왼쪽 가지(초록 점)에서 멈춥니다. 이 입자는 구름 물방울이 아니라 연무 입자입니다.` : "상대 습도가 100 % 이하입니다. 소금 입자는 물을 머금어 연무 입자가 되지만(초록 점) 구름 물방울로 자라지 못합니다.";
    draw();
  }
  [sR, sS, sM].forEach((x) => x.addEventListener("input", update)); update();
})();
