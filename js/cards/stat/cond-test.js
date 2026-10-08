/* 카드: 검사에서 양성이 나오면 정말 병에 걸린 것일까? — 유병률·민감도·특이도에 따른 1000명 점그림과 P(D|T) */
(() => {
  const root = document.getElementById("card-stat-cond-test");
  if (!root) return;
  const { C, fit } = NM;
  const $ = (s) => root.querySelector(s), sp = $(".p"), sse = $(".se"), ssp = $(".sp"), go = $(".go-pos");
  const PREV = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2];
  const COLS = 40, ROWS = 25, POP = COLS * ROWS;
  let onlyPos = false;
  const { ctx, size } = fit($("canvas"), () => draw());
  const vals = () => ({ p: PREV[+sp.value], se: +sse.value / 100, spec: +ssp.value / 100 });

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { p, se, spec } = vals();
    const sick = Math.round(POP * p), tp = Math.round(sick * se), fn = sick - tp, fp = Math.round((POP - sick) * (1 - spec));
    const c = Math.min((w - 8) / COLS, (h - 8) / ROWS), x0 = (w - c * COLS) / 2, y0 = (h - c * ROWS) / 2, rad = c * 0.36;
    for (let i = 0; i < POP; i++) {
      const x = x0 + (i % COLS + 0.5) * c, y = y0 + (Math.floor(i / COLS) + 0.5) * c;
      const kind = i < tp ? 0 : i < tp + fn ? 1 : i < tp + fn + fp ? 2 : 3;
      ctx.globalAlpha = onlyPos && (kind === 1 || kind === 3) ? 0.12 : 1;
      ctx.beginPath(); ctx.arc(x, y, kind === 3 ? rad * 0.7 : rad, 0, 7);
      if (kind === 0) { ctx.fillStyle = C.forest; ctx.fill(); }
      if (kind === 1) { ctx.strokeStyle = C.forest; ctx.lineWidth = 1.4; ctx.stroke(); }
      if (kind === 2) { ctx.fillStyle = C.amber; ctx.fill(); }
      if (kind === 3) { ctx.fillStyle = C.rule; ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }

  const num = (x) => String(+x.toPrecision(4));
  function update() {
    const { p, se, spec } = vals(), a = p * se, b = (1 - p) * (1 - spec), pt = a + b, ppv = a / pt;
    $(".p-out").textContent = num(p * 100);
    $(".se-out").textContent = sse.value;
    $(".sp-out").textContent = (+ssp.value).toFixed(1);
    $(".eq").textContent = `P(D|T) = P(D∩T)/P(T) = ${num(a)} / (${num(a)} + ${num(b)}) = ${ppv.toFixed(3)}`;
    $(".n-t").textContent = (POP * pt).toFixed(1);
    $(".n-dt").textContent = (POP * a).toFixed(1);
    $(".n-ppv").textContent = `${(ppv * 100).toFixed(1)}%`;
    $(".n-se").textContent = `${sse.value}%`;
    draw();
  }
  [sp, sse, ssp].forEach((s) => s.addEventListener("input", update));
  go.addEventListener("click", () => { onlyPos = !onlyPos; go.setAttribute("aria-pressed", String(onlyPos)); draw(); });
  update();
})();
