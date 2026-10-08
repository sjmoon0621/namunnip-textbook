/* 카드: P(k)에서 P(k + 1)로 어떻게 건너갈까? — 1 + 3 + … + (2k − 1) = k²에 2k + 1을 ㄱ자로 붙여 (k + 1)² */
(() => {
  const root = document.getElementById("card-alg-induct-proof");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSeq;
  const $ = (s) => root.querySelector(s), sk = $(".k");
  let step = 0;
  const { ctx, size } = fit($("canvas"), () => draw());
  const MSG = (k) => [
    `① <i>n</i> = 1: 왼쪽 1, 오른쪽 1<sup>2</sup> = 1. 첫 도미노가 쓰러집니다.`,
    `② <i>n</i> = <i>k</i>일 때 성립한다고 가정합니다: 1 + 3 + … + (2<i>k</i> − 1) = <i>k</i><sup>2</sup>. 지금 <i>k</i> = ${k}이면 ${Array.from({ length: k }, (_, i) => 2 * i + 1).join(" + ")} = ${k * k}.`,
    `양변에 다음 홀수 2<i>k</i> + 1 = ${2 * k + 1}을 더합니다: <i>k</i><sup>2</sup> + 2<i>k</i> + 1. 그림에서는 ㄱ자 조각입니다.`,
    `<i>k</i><sup>2</sup> + 2<i>k</i> + 1 = (<i>k</i> + 1)<sup>2</sup>이므로 <i>n</i> = <i>k</i> + 1일 때도 성립합니다. ①, ②에서 모든 자연수 <i>n</i>에서 성립합니다.`,
  ][step];

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const K = +sk.value, k = step === 0 ? 1 : K, side = step >= 2 ? k + 1 : k, pad = 24, cell = Math.min((h - 2 * pad) / (K + 1), (w * 0.5) / (K + 1));
    const ox = w * 0.06, oy = (h - cell * side) / 2;
    const sq = (i, j, fill, line) => { ctx.fillStyle = fill; ctx.fillRect(ox + i * cell + 1, oy + j * cell + 1, cell - 2, cell - 2); ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.strokeRect(ox + i * cell + 1.5, oy + j * cell + 1.5, cell - 3, cell - 3); };
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) sq(i, j, "rgba(116,171,102,.5)", C.forest);
    if (step >= 2) for (let t = 0; t <= k; t++) { sq(k, t, "rgba(181,83,47,.4)", C.warn); if (t < k) sq(t, k, "rgba(181,83,47,.4)", C.warn); }
    if (step >= 3) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(ox, oy, side * cell, side * cell); }
    const tx = ox + (K + 1) * cell + 16;
    S.tag(ctx, step === 0 ? "P(1): 1 = 1^2" : `가정 P(k): k^2 = ${k * k}`, tx, h * 0.3, C.forest, "left", 12);
    if (step >= 2) S.tag(ctx, `+ (2k + 1) = ${2 * k + 1}`, tx, h * 0.45, C.warn, "left", 12);
    if (step >= 3) S.tag(ctx, `= (k + 1)^2 = ${(k + 1) ** 2}`, tx, h * 0.6, C.ink, "left", 12);
  }

  function update() {
    const k = +sk.value;
    $(".k-out").textContent = k; $(".msg").innerHTML = MSG(k);
    $(".v-l").textContent = k * k; $(".v-a").textContent = 2 * k + 1; $(".v-r").textContent = (k + 1) ** 2;
    $(".go-step").disabled = step >= 3;
    draw();
  }
  $(".go-step").addEventListener("click", () => { step = Math.min(3, step + 1); update(); });
  $(".go-reset").addEventListener("click", () => { step = 0; update(); });
  sk.addEventListener("input", update);
  update();
})();
