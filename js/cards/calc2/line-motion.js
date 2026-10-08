/* 카드: 흔들리는 물체는 어디에서 가장 빠르고, 어디에서 가속도가 가장 클까? — v = x′, a = v′, 단진동 a = −x, 감쇠 진동 */
(() => {
  const root = document.getElementById("card-calc2-line-motion");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const st = $(".st"), play = $(".go-play");
  const sin = Math.sin, cos = Math.cos, E = Math.exp;
  /* 감쇠 진동 x = A e^(−bt) cos ωt: v = A e^(−bt)(−b cos ωt − ω sin ωt), a = A e^(−bt)((b² − ω²) cos ωt + 2bω sin ωt) */
  const A = 2, B = 0.3, W = 2;
  const P = {
    shm: { x: (t) => 2 * sin(t), v: (t) => 2 * cos(t), a: (t) => -2 * sin(t), T: 4 * Math.PI, xr: [-2.5, 2.5], t0: 0.6 },
    damp: { x: (t) => A * E(-B * t) * cos(W * t), v: (t) => A * E(-B * t) * (-B * cos(W * t) - W * sin(W * t)),
      a: (t) => A * E(-B * t) * ((B * B - W * W) * cos(W * t) + 2 * B * W * sin(W * t)), T: 4 * Math.PI, xr: [-2.5, 2.5], t0: 0.6 },
    log: { x: (t) => t - 2 * Math.log(t + 1), v: (t) => 1 - 2 / (t + 1), a: (t) => 2 / (t + 1) ** 2, T: 8, xr: [-0.6, 4], t0: 0.4 },
  };
  let key = "shm";
  const cv = $("canvas");
  const { ctx, size } = fit(cv, () => draw());

  function arrow(x1, y, x2, col) {
    const L = x2 - x1; if (Math.abs(L) < 2) return;
    const s = Math.sign(L), k = Math.min(8, Math.abs(L) * 0.6);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2 - s * k * 0.6, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y); ctx.lineTo(x2 - s * k, y - k * 0.5); ctx.lineTo(x2 - s * k, y + k * 0.5); ctx.closePath(); ctx.fill();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[key], t = +st.value, x = p.x(t), v = p.v(t), a = p.a(t);
    const top = Math.round(h * 0.3);
    const L = 34, Wd = w - 44, X = (u) => L + (u - p.xr[0]) / (p.xr[1] - p.xr[0]) * Wd, yl = top * 0.68;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(L, yl); ctx.lineTo(L + Wd, yl); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${NM.F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
    for (let u = Math.ceil(p.xr[0]); u <= p.xr[1]; u++) { ctx.fillRect(X(u) - 0.5, yl - 4, 1, 8); ctx.fillText(n(u), X(u), yl + 7); }
    const S = Wd / (p.xr[1] - p.xr[0]) * 0.35;
    const yv = yl - 14, ya = yl - 28;
    arrow(X(x), yv, X(x) + v * S, C.warn);
    arrow(X(x), ya, X(x) + a * S, K.BLUE);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(x), yl, 6, 0, 7); ctx.fill();
    ctx.font = `600 11px ${NM.F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillStyle = C.warn; ctx.fillText("v", 12, yv); ctx.fillStyle = K.BLUE; ctx.fillText("a", 12, ya);

    const g = K.frame(ctx, w, h, { xr: [0, p.T], yr: p.xr, xs: key === "log" ? 1 : Math.PI, ys: 1, T: top + 8, B: 22,
      xf: key === "log" ? undefined : (u) => { const k = Math.round(u / Math.PI); return k === 0 ? "0" : k === 1 ? "π" : `${k}π`; } });
    K.curve(ctx, g, p.x, C.forest);
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, g.h); ctx.clip();
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]); ctx.beginPath();
    ctx.moveTo(g.X(t - 1.2), g.Y(x - 1.2 * v)); ctx.lineTo(g.X(t + 1.2), g.Y(x + 1.2 * v)); ctx.stroke(); ctx.restore();
    K.dot(ctx, g, t, x, C.ink, false, 4.5);
    K.tag(ctx, g, "x(t), 점선 기울기 = v", g.x0 + 4, g.y0 + 10, C.forest);
  }

  function update() {
    const p = P[key], t = +st.value, v = p.v(t), a = p.a(t);
    $(".t-out").textContent = n(t, 2);
    $(".n-x").textContent = n(p.x(t), 3); $(".n-v").textContent = n(v, 3); $(".n-a").textContent = n(a, 3);
    const s = $(".n-s"), zv = Math.abs(v) < 5e-3, za = Math.abs(a) < 5e-3;
    s.textContent = `${n(Math.abs(v), 3)} ${zv ? "(순간 정지)" : za ? "(최대·최소 근처)" : v * a > 0 ? "증가 중" : "감소 중"}`;
    s.className = `n-s ${!zv && !za ? (v * a > 0 ? "good" : "bad") : ""}`;
    draw();
  }

  let playing = false;
  NM.loop(cv, (dt) => {
    if (!playing) return;
    let t = +st.value + dt * 0.8; if (t > +st.max) t = 0;
    st.value = t; update();
  });
  play.addEventListener("click", () => { playing = !playing; play.setAttribute("aria-pressed", String(playing)); play.textContent = playing ? "멈춤" : "재생"; });
  K.chips(root, ".presets .chip:not(.go-play)", (b) => { key = b.dataset.k; const p = P[key]; st.max = p.T; st.value = p.t0; update(); });
  st.addEventListener("input", update);
  update();
})();
