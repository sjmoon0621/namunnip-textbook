/* 카드: 복소수로 나눗셈은 어떻게 할까? — z, w의 사칙연산과 z·z̄, 나눗셈은 분모의 켤레복소수를 곱해 계산 */
(() => {
  const root = document.getElementById("card-cm1-complex-arith");
  if (!root) return;
  const { C, fit } = NM;
  const E = NMEqPlot;
  const $ = (s) => root.querySelector(s), ops = [...root.querySelectorAll(".ops .chip")];
  const S = ["a", "b", "c", "d"].map((k) => $("." + k));
  let op = "add";
  const { ctx, size } = fit($("canvas"), () => draw());

  const gcd = (x, y) => { x = Math.abs(x); y = Math.abs(y); while (y) [x, y] = [y, x % y]; return x; };
  const I = "<i>i</i>";
  const par = (v) => (v < 0 ? `(${E.n(v)})` : E.n(v));
  const cxh = (re, im) => E.cx(re, im, true);
  const frac = (p, q) => { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; p /= g; q /= g; return q === 1 ? E.n(p) : `${p < 0 ? "−" : ""}${Math.abs(p)}/${q}`; };
  function cfrac(re, im, den) {
    const R = frac(re, den), M = frac(Math.abs(im), den);
    if (im === 0) return R;
    const imPart = M === "1" ? I : `(${M})${I}`;
    if (re === 0) return (im < 0 ? "−" : "") + imPart;
    return `${R} ${im < 0 ? "−" : "+"} ${imPart}`;
  }

  function calc() {
    const [a, b, c, d] = S.map((s) => +s.value);
    const z = cxh(a, b), w = cxh(c, d);
    if (op === "add") return { r: [a + c, b + d], name: "z + w", txt: `(${z}) + (${w})<br>= (${E.n(a)} + ${par(c)}) + (${E.n(b)} + ${par(d)})${I}<br>= ${cxh(a + c, b + d)}` };
    if (op === "sub") return { r: [a - c, b - d], name: "z − w", txt: `(${z}) − (${w})<br>= (${E.n(a)} − ${par(c)}) + (${E.n(b)} − ${par(d)})${I}<br>= ${cxh(a - c, b - d)}` };
    if (op === "mul") return { r: [a * c - b * d, a * d + b * c], name: "z × w", txt: `(${z})(${w})<br>= ${par(a * c)} + ${par(a * d)}${I} + ${par(b * c)}${I} + ${par(b * d)}${I}<sup>2</sup><br>= (${E.n(a * c)} − ${par(b * d)}) + (${E.n(a * d)} + ${par(b * c)})${I} = ${cxh(a * c - b * d, a * d + b * c)}` };
    if (op === "conj") return { r: [a * a + b * b, 0], name: "z × z̄", txt: `(${z})(${cxh(a, -b)})<br>= ${par(a)}<sup>2</sup> − (${E.n(b)}${I})<sup>2</sup> = ${E.n(a * a)} + ${E.n(b * b)}<br>= ${E.n(a * a + b * b)} <span class="good">(허수부분 0: 실수)</span>` };
    const den = c * c + d * d;
    if (!den) return { r: null, name: "z ÷ w", txt: `w = 0이면 나눌 수 없습니다.<br>분모의 켤레를 곱해도 분모가 0 × 0 = 0이 됩니다.` };
    const re = a * c + b * d, im = b * c - a * d;
    return { r: [re / den, im / den], name: "z ÷ w", txt: `(${z}) / (${w})<br>= (${z})(${cxh(c, -d)}) / {(${w})(${cxh(c, -d)})}<br>= (${cxh(re, im)}) / ${den} = ${cfrac(re, im, den)}` };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const [a, b, c, d] = S.map((s) => +s.value), res = calc();
    const all = [a, b, c, d, 3].concat(res.r || []).map(Math.abs), R = Math.max(...all) + 0.8;
    const fr = E.frame(ctx, { x: 30, y: 8, w: w - 40, h: h - 30 }, { X0: -R, X1: R, Y0: -R, Y1: R }, { eq: true, xname: "실수축", yname: "허수축" });
    const { X, Y } = fr;
    const ray = (p, col, wd, dash) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = wd; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(p[0]), Y(p[1])); ctx.stroke(); ctx.restore(); };
    ray([a, -b], C.ink3, 1, [3, 3]); E.dot(ctx, X(a), Y(-b), C.ink3, 4, true);
    ray([a, b], C.ink2, 1.5); ray([c, d], C.warn, 1.5);
    E.dot(ctx, X(a), Y(b), C.ink2, 5); E.dot(ctx, X(c), Y(d), C.warn, 5);
    E.tag(ctx, "z", X(a) + 8, Y(b) - 10, C.ink2, "left", fr.box);
    E.tag(ctx, "w", X(c) + 8, Y(d) + 10, C.warn, "left", fr.box);
    if (b) E.tag(ctx, "z̄", X(a) + 8, Y(-b) + 10, C.ink3, "left", fr.box);
    if (res.r) {
      ray(res.r, C.forest, 2.5); E.dot(ctx, X(res.r[0]), Y(res.r[1]), C.forest, 6.5);
      E.tag(ctx, `${res.name} = ${E.cx(E.r3(res.r[0]), E.r3(res.r[1]))}`, X(res.r[0]) - 8, Y(res.r[1]) - 13, C.forest, "right", fr.box);
    }
  }

  function update() {
    S.forEach((s, k) => { $(`.${"abcd"[k]}-out`).textContent = E.n(+s.value); });
    const [a, b, c, d] = S.map((s) => +s.value), res = calc();
    $(".eq").innerHTML = res.txt;
    $(".n-z").innerHTML = cxh(a, b); $(".n-w").innerHTML = cxh(c, d);
    $(".d-res").textContent = res.name;
    $(".n-res").innerHTML = res.r ? (op === "div" ? cfrac(a * c + b * d, b * c - a * d, c * c + d * d) : cxh(res.r[0], res.r[1])) : "나눌 수 없음";
    $(".n-res").className = `n-res ${res.r ? "good" : "bad"}`;
    draw();
  }
  ops.forEach((bt) => bt.addEventListener("click", () => { op = bt.dataset.op; ops.forEach((x) => x.setAttribute("aria-pressed", String(x === bt))); update(); }));
  S.forEach((s) => s.addEventListener("input", update));
  update();
})();
