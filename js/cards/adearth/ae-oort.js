/* 카드: 태양 근처 별들의 움직임만으로 우리은하의 회전 속도를 알 수 있을까? — 차등 회전 모의 표본과 오르트 상수 맞추기 */
(() => {
  const root = document.getElementById("card-adearth-oort");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sD = $(".d"), oD = $(".d-out"), sS = $(".s"), oS = $(".s-out");
  const nA = $(".n-a"), nB = $(".n-b"), nO = $(".n-o"), nV = $(".n-v");
  const R0 = 8.2, V0 = 223, DVDR = -3.4, N = 300;
  const Vrot = (R) => V0 + DVDR * (R - R0);
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const gauss = () => { let u = 0, v = 0; while (u === 0) u = rnd(); v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  let base = [], stars = [], fitAB = { A: 0, B: 0 };

  /* 은하 중심 방향 +x, 태양은 (0,0)에서 +y로 V0만큼 움직임 */
  function makeBase() { base = []; for (let i = 0; i < N; i++) base.push({ l: rnd() * 360, f: 0.85 + 0.3 * rnd(), g1: gauss(), g2: gauss() }); }
  function compute() {
    const d0 = +sD.value, sig = +sS.value;
    stars = base.map(({ l, f, g1, g2 }) => {
      const d = d0 * f, L = l * Math.PI / 180, sx = d * Math.cos(L), sy = d * Math.sin(L);
      const px = sx - R0, py = sy, R = Math.hypot(px, py), V = Vrot(R);
      const vx = V / R * py, vy = -V / R * px, dvx = vx, dvy = vy - V0;
      const vr = dvx * Math.cos(L) + dvy * Math.sin(L) + sig * g1;
      const vt = -dvx * Math.sin(L) + dvy * Math.cos(L) + sig * g2;
      return { l, d, vr, vt };
    });
    let sxy = 0, sxx = 0;
    for (const s of stars) { const x = s.d * Math.sin(2 * s.l * Math.PI / 180); sxy += s.vr * x; sxx += x * x; }
    const A = sxy / sxx;
    let sb = 0, sw = 0;
    for (const s of stars) { sb += (s.vt - A * s.d * Math.cos(2 * s.l * Math.PI / 180)) * s.d; sw += s.d * s.d; }
    fitAB = { A, B: sb / sw };
  }
  function panel(ctx, size, kind) {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 46, y0 = 18, gw = w - x0 - 12, gh = h - y0 - 30, d0 = +sD.value;
    const vals = stars.map((s) => kind === "r" ? s.vr : s.vt / s.d);
    let lim = kind === "r" ? Math.max(20, 1.15 * Math.max(...vals.map(Math.abs))) : Math.max(40, 1.15 * Math.max(...vals.map(Math.abs)));
    const step = lim > 400 ? 200 : lim > 150 ? 50 : lim > 60 ? 25 : 10;
    lim = Math.ceil(lim / step) * step;
    const X = (l) => x0 + l / 360 * gw, Y = (v) => y0 + gh / 2 - v / lim * gh / 2;
    const yt = []; for (let v = -lim; v <= lim + 1e-9; v += step) yt.push([v, String(v)]);
    NM.axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [[0, "0°"], [90, "90°"], [180, "180°"], [270, "270°"], [360, "360°"]], yt,
      xlabel: "은하 경도 l", ylabel: kind === "r" ? "시선 속도 v_r (km/s)" : "접선 속도 ÷ 거리, v_t/d (km/s/kpc)" });
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(0) + .5); ctx.lineTo(x0 + gw, Y(0) + .5); ctx.stroke();
    ctx.fillStyle = "rgba(35,35,38,.55)";
    stars.forEach((s, i) => { ctx.beginPath(); ctx.arc(X(s.l), Y(vals[i]), 2.1, 0, Math.PI * 2); ctx.fill(); });
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let i = 0; i <= 360; i += 2) { const L = i * Math.PI / 180; const v = kind === "r" ? fitAB.A * d0 * Math.sin(2 * L) : fitAB.A * Math.cos(2 * L) + fitAB.B; i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)); }
    ctx.stroke();
    ctx.fillStyle = C.forest; ctx.font = `11px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillText(kind === "r" ? `v_r = A·d·sin2l` : `v_t/d = A·cos2l + B`, x0 + gw - 4, y0 + 12);
  }
  const R = fit($(".cv-r"), () => panel(R.ctx, R.size, "r"));
  const T = fit($(".cv-t"), () => panel(T.ctx, T.size, "t"));
  function update() {
    oD.textContent = (+sD.value).toFixed(2); oS.textContent = sS.value;
    compute();
    const { A, B } = fitAB, O = A - B;
    nA.textContent = A.toFixed(1); nB.textContent = B.toFixed(1); nO.textContent = `${O.toFixed(1)}`; nV.textContent = `${Math.round(O * R0)} km/s`;
    panel(R.ctx, R.size, "r"); panel(T.ctx, T.size, "t");
  }
  $(".again").addEventListener("click", () => { makeBase(); update(); });
  sD.addEventListener("input", update); sS.addEventListener("input", update);
  makeBase(); update();
})();
