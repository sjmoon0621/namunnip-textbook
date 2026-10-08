/* 카드: 여러 항의 합은 항마다 따로 적분해도 될까? — 항을 하나씩 적분해 쌓고, 쌓은 것을 미분해 확인 */
(() => {
  const root = document.getElementById("card-calc1-linear-int");
  if (!root) return;
  const { C, fit } = NM, K = NMCalc, I = NMInt;
  const $ = (s) => root.querySelector(s);
  const ss = [0, 1, 2, 3].map((k) => $(`.a${k}`));
  let step = 0;
  const { ctx, size } = fit($("canvas"), () => draw());
  const coef = () => ss.map((s) => +s.value);
  const order = () => [3, 2, 1, 0].filter((k) => coef()[k] !== 0);
  const partF = () => { const p = coef(), F = [0, 0, 0, 0, 0]; order().slice(0, step).forEach((k) => (F[k + 1] = p[k] / (k + 1))); return F; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const g = K.frame(ctx, w, h, { xr: [-2, 3], yr: [-10, 10], ys: 5 });
    const f = coef(), F = partF(), dF = I.der(F);
    K.curve(ctx, g, (x) => I.at(f, x), K.BLUE, { width: 2.6 });
    if (step) K.curve(ctx, g, (x) => I.at(dF, x), C.warn, { width: 2, dash: [6, 4] });
    K.curve(ctx, g, (x) => I.at(F, x), C.forest, { width: 2.2 });
  }

  function update() {
    const p = coef(), ord = order();
    ss.forEach((s, k) => ($(`.a${k}-out`).textContent = K.n(+s.value)));
    step = Math.min(step, ord.length);
    $(".f-eq").innerHTML = `<i>f</i>(<i>x</i>) = ${I.fmt(p)}`;
    const lines = ord.slice(0, step).map((k) => { const t = Array(k + 1).fill(0); t[k] = p[k]; const T = Array(k + 2).fill(0); T[k + 1] = p[k] / (k + 1); return `∫(${I.fmt(t)})<i>dx</i> = ${I.fmt(T)}`; });
    $(".msg").innerHTML = step ? lines.join("<br>") : "‘다음 항’을 눌러 최고차항부터 하나씩 적분하세요.";
    const F = partF(), done = step === ord.length;
    $(".n-F").innerHTML = `${I.fmt(F)}${done ? " + <i>C</i>" : " …"}`;
    $(".n-k").textContent = `${step} / ${ord.length}`;
    const ok = $(".n-ok"); ok.textContent = done ? "예, f(x)와 같음" : "아직 일부"; ok.className = `n-ok ${done ? "good" : ""}`;
    draw();
  }
  $(".go-next").addEventListener("click", () => { step = Math.min(step + 1, order().length); update(); });
  $(".go-all").addEventListener("click", () => { step = order().length; update(); });
  $(".go-reset").addEventListener("click", () => { step = 0; update(); });
  ss.forEach((s) => s.addEventListener("input", () => { step = 0; update(); }));
  update();
})();
