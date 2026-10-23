/* 카드: 500명이 함께 마구 걸으면 무리는 얼마나 빨리 퍼질까? — 마구 걷기 모의 실험 */
(() => {
  const root = document.getElementById("card-extra-walk");
  if (!root) return;
  const { C, F, fit, loop, axes, reduce } = NM;
  const $ = (s) => root.querySelector(s);
  const [cvA, cvB] = root.querySelectorAll("canvas");
  const sV = $(".v"), oV = $(".v-out"), bRun = $("[data-act=run]");
  const dN = $(".d-n"), dMsd = $(".d-msd"), dRms = $(".d-rms"), dRet = $(".d-ret");
  const N = 500, MAX = 1000;
  const x = new Int16Array(N), y = new Int16Array(N), back = new Uint8Array(N);
  let dim = 1, n = 0, acc = 0, running = !reduce, hist = [0], trail = [[0, 0]];

  function reset() {
    x.fill(0); y.fill(0); back.fill(0);
    n = 0; acc = 0; hist = [0]; trail = [[0, 0]];
  }
  function step() {
    let s = 0;
    for (let i = 0; i < N; i++) {
      const r = Math.random();
      if (dim === 1) x[i] += r < 0.5 ? 1 : -1;
      else if (r < 0.25) x[i]++; else if (r < 0.5) x[i]--; else if (r < 0.75) y[i]++; else y[i]--;
      if (x[i] === 0 && y[i] === 0) back[i] = 1;
      s += x[i] * x[i] + y[i] * y[i];
    }
    n++; hist.push(s / N); trail.push([x[0], y[0]]);
  }

  const A = fit(cvA, () => drawA());
  const B = fit(cvB, () => drawB());
  function drawA() {
    const { ctx, size: { w, h } } = A; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const range = Math.max(12, 3.2 * Math.sqrt(n));
    const rs = Math.sqrt(n);
    ctx.font = `10.5px ${F.mono}`;
    if (dim === 1) {
      // 위치의 막대그래프: 칸 너비는 짝수로 맞춰 홀짝이 한 칸에 섞이지 않게 한다
      const bw = Math.max(2, 2 * Math.round(range / 30));
      const cnt = new Map();
      for (let i = 0; i < N; i++) { const k = Math.floor((x[i] + bw / 2) / bw); cnt.set(k, (cnt.get(k) || 0) + 1); }
      const X = (v) => w / 2 + v / range * (w / 2 - 14), base = h - 30;
      const top = Math.max(...cnt.values());
      ctx.fillStyle = C.sprout;
      for (const [k, c] of cnt) {
        const x0 = X(k * bw - bw / 2), x1 = X(k * bw + bw / 2), bh = c / Math.max(top, 40) * (h - 70);
        ctx.fillRect(x0 + 0.5, base - bh, Math.max(1, x1 - x0 - 1), bh);
      }
      ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(8, base + .5); ctx.lineTo(w - 8, base + .5); ctx.stroke();
      ctx.setLineDash([4, 4]); ctx.strokeStyle = C.warn;
      for (const sg of [-1, 1]) { const xx = X(sg * rs); ctx.beginPath(); ctx.moveTo(xx, 24); ctx.lineTo(xx, base); ctx.stroke(); }
      ctx.setLineDash([]);
      ctx.fillStyle = C.ink3; ctx.textAlign = "center";
      ctx.fillText("0", X(0), base + 14);
      const tick = Math.round(range * 0.8);
      ctx.fillText(`−${tick}`, X(-tick), base + 14); ctx.fillText(`+${tick}`, X(tick), base + 14);
      ctx.textAlign = "left"; ctx.fillText("위치마다 몇 명이 있는지", 8, 14);
    } else {
      const S = (Math.min(w, h) / 2 - 12) / range, cx = w / 2, cy = h / 2;
      ctx.strokeStyle = C.rule; ctx.beginPath();
      ctx.moveTo(cx, 8); ctx.lineTo(cx, h - 8); ctx.moveTo(8, cy); ctx.lineTo(w - 8, cy); ctx.stroke();
      ctx.fillStyle = "rgba(116,171,102,.55)";
      for (let i = 0; i < N; i++) ctx.fillRect(cx + x[i] * S - 1.5, cy - y[i] * S - 1.5, 3, 3);
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.2; ctx.beginPath();
      trail.forEach(([a, b], k) => k ? ctx.lineTo(cx + a * S, cy - b * S) : ctx.moveTo(cx + a * S, cy - b * S));
      ctx.stroke(); ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]); ctx.strokeStyle = C.warn;
      ctx.beginPath(); ctx.arc(cx, cy, rs * S, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("초록 선은 한 사람이 걸은 길", 8, 14);
    }
  }
  function drawB() {
    const { ctx, size: { w, h } } = B; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const xm = Math.max(100, Math.ceil(n / 100) * 100), ym = xm * 1.3;
    const o = { x0: 40, y0: 22, w: w - 52, h: h - 56 };
    o.X = (v) => o.x0 + v / xm * o.w; o.Y = (v) => o.y0 + o.h - v / ym * o.h;
    o.xt = [0, .5, 1].map((t) => [t * xm, String(t * xm)]);
    o.yt = [0, .5, 1].map((t) => [t * xm, String(t * xm)]);
    o.xlabel = "걸음 수 n"; o.ylabel = "거리 제곱의 평균";
    axes(ctx, o);
    ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ink3;
    ctx.beginPath(); ctx.moveTo(o.X(0), o.Y(0)); ctx.lineTo(o.X(xm), o.Y(xm)); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText("y = n", o.X(xm) - 4, o.Y(xm) - 6);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath();
    const stride = Math.max(1, Math.floor(hist.length / 400));
    for (let k = 0; k < hist.length; k += stride) k ? ctx.lineTo(o.X(k), o.Y(hist[k])) : ctx.moveTo(o.X(0), o.Y(0));
    ctx.lineTo(o.X(n), o.Y(hist[n])); ctx.stroke(); ctx.lineWidth = 1;
  }
  function show() {
    const msd = hist[n];
    dN.textContent = String(n);
    dMsd.textContent = msd.toFixed(1);
    dRms.textContent = `${Math.sqrt(msd).toFixed(1)} / ${Math.sqrt(n).toFixed(1)}`;
    let r = 0; for (let i = 0; i < N; i++) r += back[i];
    dRet.textContent = `${Math.round(r / N * 100)}%`;
    drawA(); drawB();
  }
  function setRun(on) {
    running = on && n < MAX;
    bRun.textContent = running ? "멈춤" : "계속"; bRun.setAttribute("aria-pressed", String(running));
  }

  loop(root, (dt) => {
    if (!running) return;
    acc += dt * +sV.value;
    let k = 0;
    while (acc >= 1 && n < MAX) { step(); acc -= 1; k++; }
    if (n >= MAX) setRun(false);
    if (k) show();
  });
  sV.addEventListener("input", () => { oV.textContent = sV.value; });
  bRun.addEventListener("click", () => { if (n >= MAX) { reset(); } setRun(!running); show(); });
  $("[data-act=reset]").addEventListener("click", () => { reset(); setRun(true); show(); });
  root.querySelectorAll("[data-dim]").forEach((b) => b.addEventListener("click", () => {
    dim = +b.dataset.dim;
    root.querySelectorAll("[data-dim]").forEach((z) => z.setAttribute("aria-pressed", String(z === b)));
    reset(); setRun(true); show();
  }));
  reset();
  // 움직임을 줄인 설정이면 처음부터 100걸음을 걸어 둔 모습을 보여 준다
  if (reduce) for (let k = 0; k < 100; k++) step();
  setRun(running); show();
})();
