/* 카드: 인공지능은 어떻게 ‘학습’할까? — 점을 찍어 분류기(로지스틱 회귀)를 직접 학습시키기. 가상 자료 */
(() => {
  const root = document.getElementById("card-is2-learn");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const bLabel = root.querySelectorAll("[data-label]"), bSet = root.querySelectorAll("[data-preset]");
  const bRun = $(".train"), bStep = $(".step1"), bReset = $(".reset-w"), cTest = $(".show-test");
  const [dSteps, dLoss, dTrain, dTest] = root.querySelectorAll(".nums dd");
  const msg = $(".ln-msg");

  const CAT = C.amber, DOG = "#4f7cae";
  let seed = 3;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const gauss = () => { let u = 0; while (!u) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };
  // 가상 분포: x = 주둥이 길이, y = 귀 끝 뾰족함 (둘 다 0~1 상대값). 1 = 고양이, 0 = 개
  const draw1 = (c) => c ? [0.32 + 0.11 * gauss(), 0.66 + 0.11 * gauss(), 1] : [0.64 + 0.12 * gauss(), 0.38 + 0.13 * gauss(), 0];
  const inBox = ([x, y, c]) => [clamp(x, 0.02, 0.98), clamp(y, 0.02, 0.98), c];
  const TEST = Array.from({ length: 80 }, (_, i) => inBox(draw1(i % 2)));
  const PRESETS = {
    even: [[.2, .7, 1], [.3, .55, 1], [.38, .8, 1], [.25, .85, 1], [.42, .62, 1], [.15, .6, 1],
      [.7, .3, 0], [.6, .45, 0], [.8, .42, 0], [.55, .25, 0], [.72, .55, 0], [.85, .2, 0]],
    biased: [[.2, .9, 1], [.35, .93, 1], [.5, .88, 1], [.62, .92, 1], [.28, .86, 1], [.45, .95, 1],
      [.3, .45, 0], [.45, .5, 0], [.6, .42, 0], [.75, .52, 0], [.4, .38, 0], [.68, .47, 0]],
    none: [],
  };

  let pts = [], w = [0, 0, 0], steps = 0, hist = [], running = false, label = 1;
  const u = (x) => (x - 0.5) * 4;
  const prob = (x, y) => 1 / (1 + Math.exp(-(w[0] * u(x) + w[1] * u(y) + w[2])));
  const loss = (set) => set.length ? -set.reduce((s, [x, y, c]) => { const p = clamp(prob(x, y), 1e-9, 1 - 1e-9); return s + (c ? Math.log(p) : Math.log(1 - p)); }, 0) / set.length : 0;
  const acc = (set) => set.length ? set.filter(([x, y, c]) => (prob(x, y) >= 0.5 ? 1 : 0) === c).length / set.length : 0;

  function step() {
    if (!pts.length) return;
    // 경사 하강법 한 걸음: 오차를 줄이는 방향으로 가중치를 조금 고친다 (약한 규제 0.01 포함)
    const g = [0, 0, 0], LR = 0.5, L2 = 0.01;
    for (const [x, y, c] of pts) { const e = prob(x, y) - c; g[0] += e * u(x); g[1] += e * u(y); g[2] += e; }
    w = w.map((wi, i) => wi - LR * (g[i] / pts.length + (i < 2 ? L2 * wi : 0)));
    steps++; hist.push([loss(pts), loss(TEST)]); if (hist.length > 400) hist.shift();
  }
  function resetW() { w = [0, 0, 0]; steps = 0; hist = [[loss(pts), loss(TEST)]]; running = false; }

  const { ctx, size } = fit(cv, () => draw());
  let plot = null;

  function marker(x, y, c, r, hollow) {
    ctx.beginPath();
    if (c) ctx.arc(x, y, r, 0, Math.PI * 2); else ctx.rect(x - r * .9, y - r * .9, r * 1.8, r * 1.8);
    if (hollow) { ctx.strokeStyle = c ? CAT : DOG; ctx.lineWidth = 1.5; ctx.stroke(); }
    else { ctx.fillStyle = c ? CAT : DOG; ctx.fill(); ctx.strokeStyle = C.card; ctx.lineWidth = 1; ctx.stroke(); }
  }

  function draw() {
    const { w: W, h: H } = size;
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    const side = Math.min(H - 52, W * 0.58), x0 = 30, y0 = 18;
    const X = (v) => x0 + v * side, Y = (v) => y0 + (1 - v) * side;
    plot = { x0, y0, side };
    // 확률 음영
    const n = 36, cs = side / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const p = prob((i + .5) / n, 1 - (j + .5) / n), a = Math.abs(p - .5) * 0.55;
      ctx.fillStyle = p >= .5 ? `rgba(224,160,42,${a})` : `rgba(79,124,174,${a})`;
      ctx.fillRect(x0 + i * cs, y0 + j * cs, cs + .5, cs + .5);
    }
    NM.axes(ctx, { x0, y0, w: side, h: side, X, Y, xt: [[0, "0"], [.5, ".5"], [1, "1"]], yt: [[0, "0"], [.5, ".5"], [1, "1"]], xlabel: "주둥이 길이 →", ylabel: "귀 끝 뾰족함 ↑" });
    // 경계선 p = 0.5
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, side, side); ctx.clip();
    if (Math.abs(w[0]) + Math.abs(w[1]) > 1e-6) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath();
      if (Math.abs(w[1]) > Math.abs(w[0])) {
        const yAt = (x) => 0.5 - (w[0] * u(x) + w[2]) / (4 * w[1]);
        ctx.moveTo(X(0), Y(yAt(0))); ctx.lineTo(X(1), Y(yAt(1)));
      } else {
        const xAt = (y) => 0.5 - (w[1] * u(y) + w[2]) / (4 * w[0]);
        ctx.moveTo(X(xAt(0)), Y(0)); ctx.lineTo(X(xAt(1)), Y(1));
      }
      ctx.stroke();
    }
    if (cTest.checked) for (const [x, y, c] of TEST) marker(X(x), Y(y), c, 3.2, true);
    for (const [x, y, c] of pts) marker(X(x), Y(y), c, 5.5, false);
    ctx.restore();

    // 오른쪽: 오차(손실) 그래프
    const gx = x0 + side + 44, gw = W - gx - 10, gy = y0, gh = side;
    if (gw > 60) {
      const top = 1.0, n2 = Math.max(hist.length - 1, 1);
      const GX = (i) => gx + i / n2 * gw, GY = (v) => gy + (1 - Math.min(v, top) / top) * gh;
      const first = Math.max(0, steps - hist.length + 1);
      NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X: GX, Y: GY, xt: [[0, String(first)], [n2, String(first + n2)]], yt: [[0, "0"], [0.5, ".5"], [1, "1"]], xlabel: "학습 횟수", ylabel: "오차" });
      const line = (k, col, dash) => {
        ctx.beginPath(); hist.forEach((hv, i) => { i ? ctx.lineTo(GX(i), GY(hv[k])) : ctx.moveTo(GX(i), GY(hv[k])); });
        ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
      };
      line(0, C.ink);
      if (cTest.checked) line(1, C.warn, [5, 3]);
      ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right";
      ctx.fillStyle = C.ink; ctx.fillText("학습 자료", gx + gw, gy + 12);
      if (cTest.checked) { ctx.fillStyle = C.warn; ctx.fillText("시험 자료", gx + gw, gy + 26); }
    }
    ctx.textAlign = "left";
  }

  const pc = (x) => `${Math.round(x * 100)}%`;
  function update() {
    dSteps.textContent = String(steps);
    dLoss.textContent = pts.length ? loss(pts).toFixed(2) : "—";
    dTrain.textContent = pts.length ? pc(acc(pts)) : "—";
    dTest.textContent = cTest.checked ? pc(acc(TEST)) : "숨김";
    bRun.textContent = running ? "학습 멈추기" : "학습 시키기";
    bLabel.forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.label === label)));
    const cats = pts.filter((p) => p[2]).length;
    msg.textContent = !pts.length ? "그림을 눌러 고양이와 개 자료를 찍어 주세요."
      : !cats || cats === pts.length ? "한 종류만 있으면 무엇과 구별해야 할지 배울 수 없습니다. 다른 종류도 찍어 주세요."
      : steps === 0 ? "아직 학습 전이라 모든 곳에서 50 : 50입니다. ‘학습 시키기’를 눌러 보세요."
      : "음영이 진할수록 모델이 확신하는 곳입니다. 검은 선이 판정이 바뀌는 경계입니다.";
    draw();
  }

  cv.addEventListener("click", (e) => {
    if (!plot) return;
    const rect = cv.getBoundingClientRect(), px = e.clientX - rect.left, py = e.clientY - rect.top;
    const x = (px - plot.x0) / plot.side, y = 1 - (py - plot.y0) / plot.side;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    const near = pts.findIndex(([a, b]) => Math.hypot((a - x) * plot.side, (b - y) * plot.side) < 9);
    if (near >= 0) pts.splice(near, 1); else pts.push([x, y, label]);
    hist.push([loss(pts), loss(TEST)]);
    update();
  });
  bLabel.forEach((b) => b.addEventListener("click", () => { label = +b.dataset.label; update(); }));
  bSet.forEach((b) => b.addEventListener("click", () => { pts = PRESETS[b.dataset.preset].map((p) => p.slice()); resetW(); update(); }));
  bRun.addEventListener("click", () => { running = !running; update(); });
  bStep.addEventListener("click", () => { running = false; step(); update(); });
  bReset.addEventListener("click", () => { resetW(); update(); });
  cTest.addEventListener("input", update);

  let acc0 = 0;
  loop(cv, (dt) => {
    if (!running) return;
    acc0 += dt;
    while (acc0 > 1 / 30) { acc0 -= 1 / 30; step(); }
    if (steps >= 3000) running = false;
    update();
  });
  pts = PRESETS.even.map((p) => p.slice()); resetW(); update();
})();
