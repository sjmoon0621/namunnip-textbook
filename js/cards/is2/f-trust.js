/* 카드: AI가 ‘99% 확실하다’고 하면 믿어도 될까? — 학습 범위 밖의 입력과 확신도. 가상 자료 */
(() => {
  const root = document.getElementById("card-is2-trust");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sShift = $(".shift"), oShift = $(".shift-out"), bProbe = root.querySelectorAll("[data-probe]"), msg = $(".tr-msg");
  const [dCls, dConf, dAcc, dMean] = root.querySelectorAll(".nums dd");

  const CAT = C.amber, DOG = "#4f7cae", XMAX = 2;
  let seed = 41;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const gauss = () => { let u = 0; while (!u) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };
  // 앞 카드와 같은 가상 분포: x = 주둥이 길이, y = 귀 끝 뾰족함, 1 = 고양이
  const sample = (c) => c ? [0.32 + 0.11 * gauss(), 0.66 + 0.11 * gauss(), 1] : [0.64 + 0.12 * gauss(), 0.38 + 0.13 * gauss(), 0];
  const TRAIN = Array.from({ length: 40 }, (_, i) => sample(i % 2));
  const TEST = Array.from({ length: 200 }, (_, i) => sample(i % 2));

  // 학습: 로지스틱 회귀, 경사 하강 600번 (규제 없음)
  const u = (x) => (x - 0.5) * 4;
  let w = [0, 0, 0];
  const prob = (x, y) => 1 / (1 + Math.exp(-(w[0] * u(x) + w[1] * u(y) + w[2])));
  for (let s = 0; s < 600; s++) {
    const g = [0, 0, 0];
    for (const [x, y, c] of TRAIN) { const e = prob(x, y) - c; g[0] += e * u(x); g[1] += e * u(y); g[2] += e; }
    w = w.map((wi, i) => wi - 0.5 * g[i] / TRAIN.length);
  }
  // 학습 자료가 있던 범위 (가장 가까운 학습 자료까지의 거리로 판단)
  const nearest = (x, y) => Math.min(...TRAIN.map(([a, b]) => Math.hypot(a - x, b - y)));

  let probe = [0.3, 0.7];
  const { ctx, size } = fit(cv, () => draw());
  let plot = null;

  function shifted() { const s = +sShift.value; return TEST.map(([x, y, c]) => [c ? x + s : x, y, c]); }

  function draw() {
    const { w: W, h: H } = size;
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    const x0 = 30, y0 = 18, pw = W - x0 - 12, ph = H - y0 - 36;
    const X = (v) => x0 + v / XMAX * pw, Y = (v) => y0 + (1 - v) * ph;
    plot = { x0, y0, pw, ph };
    const nx = 60, ny = 24;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const p = prob((i + .5) / nx * XMAX, 1 - (j + .5) / ny), a = Math.abs(p - .5) * 0.55;
      ctx.fillStyle = p >= .5 ? `rgba(224,160,42,${a})` : `rgba(79,124,174,${a})`;
      ctx.fillRect(x0 + i * pw / nx, y0 + j * ph / ny, pw / nx + .5, ph / ny + .5);
    }
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [0, .5, 1, 1.5, 2].map((v) => [v, String(v)]), yt: [[0, "0"], [.5, ".5"], [1, "1"]], xlabel: "주둥이 길이 →", ylabel: "귀 끝 뾰족함 ↑" });
    // 학습 자료가 있던 곳
    ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1;
    ctx.strokeRect(X(0.02), Y(1), X(1.0) - X(0.02), Y(0.02) - Y(1)); ctx.setLineDash([]);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("학습 자료가 있던 범위", X(0.03), Y(1) + 12);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, pw, ph); ctx.clip();
    // 판정 경계
    const yAt = (x) => 0.5 - (w[0] * u(x) + w[2]) / (4 * w[1]);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(X(0), Y(yAt(0))); ctx.lineTo(X(XMAX), Y(yAt(XMAX))); ctx.stroke();
    const mk = (x, y, c, r, hollow) => {
      ctx.beginPath();
      if (c) ctx.arc(X(x), Y(y), r, 0, Math.PI * 2); else ctx.rect(X(x) - r * .9, Y(y) - r * .9, r * 1.8, r * 1.8);
      if (hollow) { ctx.strokeStyle = c ? CAT : DOG; ctx.lineWidth = 1.3; ctx.stroke(); } else { ctx.fillStyle = c ? CAT : DOG; ctx.fill(); }
    };
    if (+sShift.value > 0) for (const [x, y, c] of shifted()) if (c) mk(x, y, c, 2.6, true);
    for (const [x, y, c] of TRAIN) mk(x, y, c, 3.6, false);
    ctx.restore();
    // 탐침(새 사진)
    const [px, py] = probe;
    ctx.beginPath(); ctx.arc(X(px), Y(py), 9, 0, Math.PI * 2); ctx.fillStyle = C.card; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(px) - 4, Y(py)); ctx.lineTo(X(px) + 4, Y(py)); ctx.moveTo(X(px), Y(py) - 4); ctx.lineTo(X(px), Y(py) + 4); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `500 11px ${F.mono}`; ctx.textAlign = px > 1.6 ? "right" : "left";
    ctx.fillText("새 사진", X(px) + (px > 1.6 ? -13 : 13), Y(py) - 8);
    ctx.textAlign = "left";
  }

  const pc = (p) => (p > 0.999 ? "99.9% 이상" : `${(p * 100).toFixed(1)}%`);
  function update() {
    const [x, y] = probe, p = prob(x, y), conf = Math.max(p, 1 - p), far = nearest(x, y) > 0.2;
    dCls.textContent = p >= 0.5 ? "고양이" : "개";
    dConf.textContent = pc(conf);
    dConf.classList.toggle("bad", far && conf > 0.9);
    const T = shifted(), s = +sShift.value;
    const acc = T.filter(([a, b, c]) => (prob(a, b) >= .5 ? 1 : 0) === c).length / T.length;
    const mean = T.reduce((m, [a, b]) => { const q = prob(a, b); return m + Math.max(q, 1 - q); }, 0) / T.length;
    oShift.textContent = s.toFixed(2);
    dAcc.textContent = `${Math.round(acc * 100)}%`;
    dMean.textContent = `${Math.round(mean * 100)}%`;
    dAcc.classList.toggle("bad", acc < mean - 0.1);
    msg.textContent = far
      ? "학습 자료가 하나도 없던 곳입니다. 그런데도 모델은 경계에서 멀다는 이유만으로 높은 확신도를 내놓습니다."
      : conf < 0.7 ? "경계 가까이에 있어 모델도 확신하지 못합니다. 이런 답은 사람이 다시 확인해야 합니다."
      : "학습 자료가 많던 곳이라 판정과 확신도를 어느 정도 믿을 수 있습니다.";
    draw();
  }

  // 끌어서 옮기기
  let drag = false;
  const toWorld = (e) => {
    const r = cv.getBoundingClientRect();
    return [clamp((e.clientX - r.left - plot.x0) / plot.pw * XMAX, 0, XMAX), clamp(1 - (e.clientY - r.top - plot.y0) / plot.ph, 0, 1)];
  };
  cv.addEventListener("pointerdown", (e) => { if (!plot) return; drag = true; cv.setPointerCapture(e.pointerId); probe = toWorld(e); update(); });
  cv.addEventListener("pointermove", (e) => { if (drag) { probe = toWorld(e); update(); } });
  cv.addEventListener("pointerup", () => { drag = false; });
  cv.style.touchAction = "none"; cv.style.cursor = "crosshair";
  bProbe.forEach((b) => b.addEventListener("click", () => { probe = b.dataset.probe.split(",").map(Number); update(); }));
  sShift.addEventListener("input", update);
  update();
})();
