/* 카드: 물을 저어서 데울 수 있을까? — 줄의 실험 (모식 장치). ΔT = n·m·g·h / (M·c) */
(() => {
  const root = document.getElementById("card-phy-joule");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sM = $(".jm"), sH = $(".jh"), sW = $(".jw");
  const oM = $(".jm-out"), oH = $(".jh-out"), oW = $(".jw-out");
  const nN = $(".j-n"), nWk = $(".j-work"), nT = $(".j-dt");

  const g = 9.81, CW = 4186; // 물의 비열 J/(kg·K)
  let n = 0, queue = 0, phase = 0, pts = [[0, 0]], ang = 0; // phase: 0~1 떨어지는 중

  const per = () => +sM.value * g * +sH.value;        // 한 번 떨어질 때 추가 하는 일
  const dTof = (W) => W / (+sW.value * CW);

  function numbers() {
    const W = n * per();
    oM.textContent = sM.value; oH.textContent = (+sH.value).toFixed(1); oW.textContent = (+sW.value).toFixed(1);
    nN.textContent = `${n}번`; nWk.textContent = `${W.toFixed(0)} J`; nT.textContent = `+${dTof(W).toFixed(3)} °C`;
  }
  function reset() { n = 0; queue = 0; phase = 0; pts = [[0, 0]]; numbers(); draw(); }

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const W = (n + phase) * per(), dT = dTof(W);
    // ── 왼쪽: 장치
    const lw = w * 0.5, cx = lw * 0.5, top = 30, tank = { x: cx - lw * 0.2, y: h * 0.42, w: lw * 0.4, h: h * 0.42 };
    ctx.fillStyle = "rgba(53,105,168,.15)"; ctx.fillRect(tank.x, tank.y + 8, tank.w, tank.h - 8);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.strokeRect(tank.x, tank.y, tank.w, tank.h);
    // 축과 날개 (돌아감)
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, top + 6); ctx.lineTo(cx, tank.y + tank.h - 10); ctx.stroke();
    for (let k = 0; k < 3; k++) {
      const yy = tank.y + tank.h * (0.3 + 0.22 * k), a = ang + k * 0.8;
      const half = tank.w * 0.38 * Math.cos(a);
      ctx.lineWidth = 5; ctx.strokeStyle = C.ink3;
      ctx.beginPath(); ctx.moveTo(cx - half, yy); ctx.lineTo(cx + half, yy); ctx.stroke();
    }
    // 도르래와 추 (양쪽)
    const drop = +sH.value, yTop = top + 20, span = h * 0.5;
    const wy = yTop + 26 + phase * span * (drop / 2);
    [-1, 1].forEach((sgn) => {
      const px = cx + sgn * lw * 0.42;
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, top + 10); ctx.lineTo(px, top + 10); ctx.lineTo(px, wy); ctx.stroke();
      ctx.beginPath(); ctx.arc(px, top + 10, 5, 0, Math.PI * 2); ctx.stroke();
      const bs = 10 + 10 * Math.cbrt(+sM.value / 20);
      ctx.fillStyle = C.ink; ctx.fillRect(px - bs / 2, wy, bs, bs * 1.1);
    });
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(`추 ${sM.value} kg가 ${(+sH.value).toFixed(1)} m 내려감`, cx, h - 8);
    // 온도계
    const tx = tank.x + tank.w + 18, ty0 = tank.y - 20, ty1 = tank.y + tank.h, th = ty1 - ty0;
    const scale = Math.max(0.5, Math.ceil(dTof(20 * per()) * 2) / 2); // 20번 떨어뜨렸을 때가 들어가게
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.strokeRect(tx - 4, ty0, 8, th);
    const fillH = clamp(dT / scale, 0, 1) * th;
    ctx.fillStyle = C.apple; ctx.fillRect(tx - 3, ty1 - fillH, 6, fillH);
    ctx.beginPath(); ctx.arc(tx, ty1 + 6, 7, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = "right"; ctx.fillStyle = C.ink3;
    ctx.fillText(`+${scale}°`, tx - 7, ty0 + 8); ctx.fillText("+0°", tx - 9, ty1 + 16);
    // ── 오른쪽: ΔT–W 그래프
    const gx0 = lw + 34, gy0 = 28, gw = w - gx0 - 12, gh = h - gy0 - 34;
    const Wmax = 20 * per(), X = (x) => gx0 + x / Wmax * gw, Y = (y) => gy0 + (1 - y / scale) * gh;
    const nice = (m) => { const s = m / 4, p = 10 ** Math.floor(Math.log10(s)); return [1, 2, 5, 10].map((k) => k * p).find((k) => k >= s); };
    const xs = nice(Wmax), xt = []; for (let x = 0; x <= Wmax; x += xs) xt.push([x, `${x}`]);
    const ys = nice(scale), yt = []; for (let y = 0; y <= scale + 1e-9; y += ys) yt.push([y, y < 1 ? y.toFixed(ys < 0.1 ? 2 : 1) : `${y}`]);
    NM.axes(ctx, { x0: gx0, y0: gy0, w: gw, h: gh, X, Y, xt, yt, ylabel: "온도 상승 (°C)", xlabel: "추가 한 일 (J)" });
    ctx.setLineDash([4, 3]); ctx.strokeStyle = C.forest; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(Wmax), Y(dTof(Wmax))); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink;
    pts.forEach(([x, y]) => { if (x <= Wmax) { ctx.beginPath(); ctx.arc(X(x), Y(Math.min(y, scale)), 3, 0, Math.PI * 2); ctx.fill(); } });
    ctx.fillStyle = C.forest; ctx.textAlign = "left";
    ctx.fillText(`기울기 1/(Mc) = ${(1 / (+sW.value * CW) * 1000).toFixed(3)} °C/kJ`, gx0 + 6, gy0 + 12);
  }

  [sM, sH, sW].forEach((el) => el.addEventListener("input", reset));
  $(".j-one").addEventListener("click", () => { queue += 1; });
  $(".j-many").addEventListener("click", () => { queue += 20; });
  $(".j-reset").addEventListener("click", reset);
  reset();
  loop(cv, (dt) => {
    if (queue <= 0 && phase === 0) return;
    const dur = queue > 3 ? 0.3 : 1.2;
    phase += dt / dur; ang += dt * (queue > 3 ? 30 : 9);
    if (phase >= 1) { phase = 0; n += 1; queue -= 1; pts.push([n * per(), dTof(n * per())]); numbers(); }
    draw();
  });
})();
