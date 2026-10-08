/* 카드: 역함수의 그래프는 어디에 있을까? — 그래프 위의 점 P(t, f(t))를 끌어 y = x에 대칭인 Q(f(t), t)를 보고, 역함수를 구하는 단계를 넘긴다 */
(() => {
  const root = document.getElementById("card-cm2-inverse-graph");
  if (!root) return;
  const { C, clamp } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s);
  const pre = [...root.querySelectorAll(".presets.p-f .chip")];
  const X = "<i>x</i>", Y = "<i>y</i>", FI = "<i>f</i><sup>−1</sup>(<i>x</i>)";
  const D = {
    lin: { f: (x) => 2 * x - 4, inv: (x) => x / 2 + 2, min: -Infinity, t: 3, steps: [
      `${Y} = 2${X} − 4로 놓습니다.`,
      `기울기 2 ≠ 0이므로 실수 전체에서 일대일대응입니다. 역함수가 있습니다.`,
      `${X}에 대해 풉니다: ${X} = (${Y} + 4)/2 = ${Y}/2 + 2`,
      `${X}와 ${Y}를 바꿉니다: ${Y} = ${X}/2 + 2, 곧 ${FI} = ${X}/2 + 2`] },
    dec: { f: (x) => -x / 2 + 1, inv: (x) => -2 * x + 2, min: -Infinity, t: -2, steps: [
      `${Y} = −${X}/2 + 1로 놓습니다.`,
      `기울기 −1/2 ≠ 0이므로 일대일대응입니다. 역함수가 있습니다.`,
      `${X}에 대해 풉니다: ${X}/2 = 1 − ${Y}, ${X} = −2${Y} + 2`,
      `${X}와 ${Y}를 바꿉니다: ${FI} = −2${X} + 2`] },
    sqp: { f: (x) => (x < 0 ? NaN : x * x), inv: (x) => (x < 0 ? NaN : Math.sqrt(x)), min: 0, t: 1.5, steps: [
      `${Y} = ${X}<sup>2</sup> (${X} ≥ 0)로 놓습니다. 공역은 {${Y} | ${Y} ≥ 0}입니다.`,
      `${X} ≥ 0에서 ${X}가 커지면 ${Y}도 커지므로 일대일이고, 치역 {${Y} | ${Y} ≥ 0}이 공역과 같습니다.`,
      `${X}에 대해 풉니다: ${X} ≥ 0이므로 ${X} = √${Y} 하나뿐입니다.`,
      `${X}와 ${Y}를 바꿉니다: ${FI} = √${X} (${X} ≥ 0)`] },
    sq: { f: (x) => x * x, inv: null, min: -Infinity, t: 1.5, steps: [
      `${Y} = ${X}<sup>2</sup>로 놓습니다. 정의역은 실수 전체입니다.`,
      `${X} = 1과 ${X} = −1이 모두 1에 대응하므로 일대일이 아닙니다.`,
      `${X}에 대해 풀면 ${X} = ±√${Y}로 하나로 정해지지 않습니다.`,
      `역함수가 없습니다. 정의역을 ${X} ≥ 0으로 줄이면 생깁니다.`] },
    con: { f: () => 2, inv: null, min: -Infinity, t: 1, steps: [
      `${Y} = 2로 놓습니다. 상수함수입니다.`,
      `모든 ${X}가 2에 대응하므로 일대일이 아닙니다.`,
      `${Y} = 2에는 ${X}가 들어 있지 않아 ${X}에 대해 풀 수 없습니다.`,
      `역함수가 없습니다.`] },
  };
  let key = "lin", t = D.lin.t, step = 0;
  const P = K.plane($("canvas"), { cx: 1.5, cy: 1.5, span: 13 }, () => draw());

  function draw() {
    if (!P.size.w) return;
    const d = D[key], b = P.box();
    P.grid();
    P.line(1, -1, 0, C.ink3, 1.3, [5, 4]);
    P.text("y = x", [b.x1 - 1.2, b.x1 - 1.2], C.ink3, -4, 12, "right");
    P.curve(d.f, C.forest, 2.6);
    const pts = [], lo = Math.max(d.min, Math.min(b.x0, b.y0) - 1), hi = Math.max(b.x1, b.y1) + 1;
    for (let i = 0; i <= 300; i++) { const s = lo + (hi - lo) * i / 300, v = d.f(s); if (isFinite(v)) pts.push([v, s]); }
    P.path(pts, d.inv ? C.amber : C.warn, 2.6, d.inv ? null : [6, 5]);
    const p = [t, d.f(t)], q = [d.f(t), t], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    if (Math.hypot(p[0] - q[0], p[1] - q[1]) > 0.05) { P.seg(p, q, C.ink2, 1.3, [3, 3]); P.right(m, [1, 1], [p[0] - m[0], p[1] - m[1]], C.ink2, 8); }
    if (!d.inv && key === "sq" && t !== 0) { const q2 = [t * t, -t]; P.seg(q, q2, C.warn, 1.6); P.dot(q2, C.warn, 4.5); }
    P.dot(q, d.inv ? C.amber : C.warn, 5.5);
    P.knob(p, C.forest);
    P.text(`P(${K.n(p[0])}, ${K.n(p[1])})`, p, C.forest, 12, 14);
    P.text(`Q(${K.n(q[0])}, ${K.n(q[1])})`, q, d.inv ? C.amber : C.warn, 12, -14);
  }

  function update() {
    const d = D[key], ft = d.f(t);
    $(".n-p").textContent = `(${K.n(t)}, ${K.n(ft)})`;
    $(".n-q").textContent = `(${K.n(ft)}, ${K.n(t)})`;
    const v = $(".n-v");
    if (d.inv) { v.textContent = `${K.n(d.inv(ft))} = t`; v.className = "good"; } else { v.textContent = "역함수 없음"; v.className = "bad"; }
    $(".eq").innerHTML = d.steps.slice(0, step + 1).map((s, i) => `${i + 1}. ${s}`).join("<br>");
    $(".go-next").disabled = step >= d.steps.length - 1;
    draw();
  }

  pre.forEach((b) => b.addEventListener("click", () => {
    key = b.dataset.f; t = D[key].t; step = 0;
    pre.forEach((o) => o.setAttribute("aria-pressed", String(o === b))); update();
  }));
  $(".go-next").addEventListener("click", () => { step = Math.min(step + 1, D[key].steps.length - 1); update(); });
  $(".go-reset").addEventListener("click", () => { step = 0; update(); });
  P.drag([{ get: () => [t, D[key].f(t)], set: (x) => {
    const b = P.box(), s = clamp(Math.round(x * 2) / 2, Math.max(D[key].min, Math.ceil(b.x0)), Math.floor(b.x1)), v = D[key].f(s);
    if (v > b.y0 + 0.3 && v < b.y1 - 0.3 && v > b.x0 + 0.3 && v < b.x1 - 0.3) t = s;
  } }], update);
  update();
})();
