/* 카드: 기호 없이 그림만으로 이차방정식을 풀 수 있을까? — x² + bx = c의 정사각형 완성 (막대 넷 / 막대 둘) */
(() => {
  const root = document.getElementById("card-hist-aljabr");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sB = $(".b"), sC = $(".c"), say = $(".say");
  let ways = 4, step = 0;
  const SQ = "#cfe3c6", BAR = "#f1d9a8", CORNER = "#e8b4a0";
  const { ctx, size } = fit($("canvas"), () => draw());
  const num = (v) => String(+v.toFixed(2));

  function rect(x, y, w, h, fill, label) {
    ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w, h);
    if (label && w > 26 && h > 14) { ctx.fillStyle = C.ink; ctx.font = `11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(label, x + w / 2, y + h / 2 + 4); }
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const b = +sB.value, c = +sC.value, k = b / ways, x = Math.sqrt(c + b * b / 4) - b / 2;
    const side = x + (ways === 4 ? 2 * k : k);
    const sc = Math.min(Math.min(h * 0.78, w * 0.52) / side, step === 0 ? (w * 0.54) / (x + b) : Infinity);
    const ox = w * 0.06, oy = (h - side * sc) / 2;
    const X = x * sc, K = k * sc;
    if (ways === 4) {
      const x0 = ox + K, y0 = oy + K;
      rect(x0, y0, X, X, SQ, "x²");
      if (step >= 1) {
        rect(x0, oy, X, K, BAR, `${num(k)}x`); rect(x0, y0 + X, X, K, BAR, `${num(k)}x`);
        rect(ox, y0, K, X, BAR, ""); rect(x0 + X, y0, K, X, BAR, "");
      } else rect(x0 + X + 16, y0, b * sc, X, BAR, `${b}x`);
      if (step >= 2) [[ox, oy], [x0 + X, oy], [ox, y0 + X], [x0 + X, y0 + X]].forEach(([a, d]) => rect(a, d, K, K, CORNER, ""));
    } else {
      const x0 = ox, y0 = oy;
      rect(x0, y0, X, X, SQ, "x²");
      if (step >= 1) { rect(x0 + X, y0, K, X, BAR, `${num(k)}x`); rect(x0, y0 + X, X, K, BAR, `${num(k)}x`); }
      else rect(x0 + X + 16, y0, b * sc, X, BAR, `${b}x`);
      if (step >= 2) rect(x0 + X, y0 + X, K, K, CORNER, `${num(k * k)}`);
    }
    if (step >= 3) {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2.5; ctx.strokeRect(ox, oy, side * sc, side * sc);
      ctx.fillStyle = C.warn; ctx.font = `12px ${F.mono}`; ctx.textAlign = "left";
      ctx.fillText(`한 변 ${num(side)}`, ox + side * sc + 8, oy + 12);
    }
    /* 오른쪽: 넓이 장부 */
    const tx = w * 0.64; let ty = 34;
    ctx.textAlign = "left"; ctx.font = `12px ${F.sans}`;
    const line = (t, col) => { ctx.fillStyle = col || C.ink; ctx.fillText(t, tx, ty); ty += 22; };
    line(`제곱 + 근 ${b}개 = ${c}`, C.ink);
    line(`x² + ${b}x = ${c}`, C.ink2);
    ty += 6;
    if (step >= 1) line(`막대 ${ways}개, 각각 너비 ${num(k)}`, "#9a6a12");
    if (step >= 2) line(`모서리 ${ways === 4 ? 4 : 1}개 = ${num(ways === 4 ? 4 * k * k : k * k)}`, C.warn);
    if (step >= 2) line(`큰 정사각형 = ${c} + ${num(b * b / 4)} = ${num(c + b * b / 4)}`, C.ink);
    if (step >= 3) line(`한 변 = √${num(c + b * b / 4)} = ${num(side)}`, C.ink);
    if (step >= 3) line(`x = ${num(side)} − ${num(b / 2)} = ${num(x)}`, C.forest);
  }
  const SAY = [
    () => "<b>1단계</b> 넓이 x²인 정사각형과 넓이 bx인 막대가 있습니다. 둘을 합친 넓이가 c입니다. ‘다음 단계’를 누르세요.",
    () => ways === 4 ? "<b>2단계</b> 막대를 넷으로 나누어 정사각형의 네 변에 하나씩 붙입니다. 십자 모양이 되었고, 넓이는 여전히 c입니다." : "<b>2단계</b> 막대를 둘로 나누어 정사각형의 두 변에 붙입니다. ㄱ자를 뒤집은 모양이 되었고, 넓이는 여전히 c입니다.",
    () => "<b>3단계</b> 빈 모서리를 작은 정사각형으로 채웁니다. 이제 큰 정사각형이 되었고, 넓이는 c에 모서리 넓이를 더한 값입니다.",
    () => "<b>4단계</b> 큰 정사각형의 한 변을 구하고, 붙인 막대의 너비를 빼면 처음 정사각형의 한 변, 곧 근 x가 나옵니다.",
  ];
  function update() {
    $(".b-out").textContent = sB.value; $(".c-out").textContent = sC.value;
    const key = `${sB.value},${sC.value}`;
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === key)));
    root.querySelectorAll("[data-w]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.w === ways)));
    say.innerHTML = SAY[step]();
    $(".nx").disabled = step >= 3;
    draw();
  }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { const [bb, cc] = b.dataset.p.split(","); sB.value = bb; sC.value = cc; step = 0; update(); }));
  root.querySelectorAll("[data-w]").forEach((b) => b.addEventListener("click", () => { ways = +b.dataset.w; update(); }));
  $(".nx").addEventListener("click", () => { step = Math.min(3, step + 1); update(); });
  $(".rs").addEventListener("click", () => { step = 0; update(); });
  sB.addEventListener("input", update); sC.addEventListener("input", update);
  if (window.NMLab && NMLab.demo) step = 3;
  update();
})();
