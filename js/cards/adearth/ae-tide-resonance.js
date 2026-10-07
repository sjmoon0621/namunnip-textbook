/* 카드: 평형 조석은 1 m도 안 되는데, 왜 어떤 만에서는 조차가 10 m를 넘을까? — 막힌 수로의 조석 공명 η = A cos(k(L−x))/cos(kL) */
(() => {
  const root = document.getElementById("card-adearth-tide-resonance");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sL = $(".sl-l"), sH = $(".sl-h");
  const G = 9.81, EPS = 0.08, A0 = 1.0;
  let Th = 12.42, t = 0;
  /* 복소수 cos(a − ib) = cos a cosh b + i sin a sinh b  (k = k0(1 − iε)) */
  const ccos = (a, b) => [Math.cos(a) * Math.cosh(b), Math.sin(a) * Math.sinh(b)];
  const cdiv = ([a, b], [c, d]) => { const q = c * c + d * d; return [(a * c + b * d) / q, (b * c - a * d) / q]; };
  const calc = () => {
    const L = +sL.value * 1000, h = +sH.value, c = Math.sqrt(G * h), T = Th * 3600, lam = c * T, k0 = 2 * Math.PI / lam;
    const den = ccos(k0 * L, k0 * EPS * L);
    const ratio = (x) => cdiv(ccos(k0 * (L - x), k0 * EPS * (L - x)), den);
    const r = ratio(L);
    return { L, h, c, T, lam, k0, ratio, head: Math.hypot(r[0], r[1]) };
  };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h: H } = size; if (!w) return;
    const s = calc();
    ctx.clearRect(0, 0, w, H);
    /* 위: 수로 단면 */
    const x0 = 44, x1 = w - 40, yM = H * 0.27, N = 160;
    let amax = 1; for (let i = 0; i <= N; i++) { const r = s.ratio(i / N * s.L); amax = Math.max(amax, Math.hypot(r[0], r[1])); }
    const sc = (H * 0.19) / amax, X = (i) => x0 + i / N * (x1 - x0), ph = 2 * Math.PI * t;
    ctx.fillStyle = "rgba(63,111,163,.15)"; ctx.beginPath(); ctx.moveTo(x0, yM + H * 0.2);
    for (let i = 0; i <= N; i++) { const r = s.ratio(i / N * s.L); ctx.lineTo(X(i), yM - A0 * (r[0] * Math.cos(ph) - r[1] * Math.sin(ph)) * sc); }
    ctx.lineTo(x1, yM + H * 0.2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= N; i++) { const r = s.ratio(i / N * s.L), y = yM - A0 * (r[0] * Math.cos(ph) - r[1] * Math.sin(ph)) * sc; i ? ctx.lineTo(X(i), y) : ctx.moveTo(X(i), y); }
    ctx.stroke();
    ctx.strokeStyle = "rgba(212,73,58,.6)"; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2;
    [1, -1].forEach((sg) => { ctx.beginPath(); for (let i = 0; i <= N; i++) { const r = s.ratio(i / N * s.L), y = yM - sg * A0 * Math.hypot(r[0], r[1]) * sc; i ? ctx.lineTo(X(i), y) : ctx.moveTo(X(i), y); } ctx.stroke(); });
    ctx.setLineDash([]);
    ctx.fillStyle = "#c9b48a"; ctx.fillRect(x1, yM - H * 0.22, 10, H * 0.42);
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("입구 (대양과 연결)", x0, yM + H * 0.2 + 14);
    ctx.textAlign = "right"; ctx.fillText("막힌 끝", x1 + 8, yM + H * 0.2 + 14);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.fillText(`점선: 각 지점의 진폭 · 세로 축척 자동 (최대 ±${amax.toFixed(1)} m)`, x0, 14);
    /* 아래: 증폭 곡선 */
    const gx0 = 44, gx1 = w - 14, gy0 = H - 30, gy1 = H * 0.60, rmax = 1.0;
    const curve = []; let cmax = 1;
    for (let i = 0; i <= 300; i++) { const rr = i / 300 * rmax, a = 2 * Math.PI * rr, b = a * EPS, d = ccos(a, b), v = 1 / Math.hypot(d[0], d[1]); curve.push(v); cmax = Math.max(cmax, v); }
    const Ymax = Math.ceil(cmax / 2) * 2, Xg = (r) => gx0 + r / rmax * (gx1 - gx0), Yg = (v) => gy0 - v / Ymax * (gy0 - gy1);
    NM.axes(ctx, { x0: gx0, y0: gy1, w: gx1 - gx0, h: gy0 - gy1, X: Xg, Y: Yg,
      xt: [[0, "0"], [0.25, "1/4"], [0.5, "1/2"], [0.75, "3/4"], [1, "1"]],
      yt: [[1, "1"], [Ymax / 2, `${Ymax / 2}`], [Ymax, `${Ymax}`]], xlabel: "만의 길이 / 조석파 파장  L/λ" });
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("끝의 진폭 ÷ 입구 진폭", gx0 + 4, gy1 + 12);
    ctx.strokeStyle = C.apple; ctx.lineWidth = 2; ctx.beginPath(); curve.forEach((v, i) => { const x = Xg(i / 300 * rmax), y = Yg(v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
    const r = s.L / s.lam;
    if (r <= rmax) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(Xg(r), Yg(s.head), 5, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.fillStyle = C.ink; ctx.textAlign = "right"; ctx.fillText("범위 밖 ▶", gx1 - 4, gy1 + 26); }
  }
  function update() {
    const s = calc();
    $(".l-out").textContent = sL.value; $(".h-out").textContent = sH.value;
    $(".n-c").textContent = `${s.c.toFixed(1)} m/s`;
    $(".n-lam").textContent = `${(s.lam / 1000).toFixed(0)} km`;
    $(".n-r").textContent = (s.L / s.lam).toFixed(2);
    $(".n-amp").textContent = `${(2 * A0 * s.head).toFixed(1)} m (×${s.head.toFixed(1)})`;
    root.querySelectorAll("[data-t]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.t === Th)));
    draw();
  }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => {
    const [L, h] = b.dataset.p.split(",").map(Number); sL.value = L; sH.value = h;
    root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update();
  }));
  root.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { Th = +b.dataset.t; update(); }));
  [sL, sH].forEach((el) => el.addEventListener("input", update));
  loop(cv, (dt) => { if (NM.reduce) return false; t += dt / 4; draw(); });
  update();
})();
