/* 카드: 어느 후보가 eˣ, sin x의 진짜 원시함수일까? — 후보 F의 F(b) − F(a)를 넓이와 비교 */
(() => {
  const root = document.getElementById("card-calc2-antideriv-check");
  if (!root) return;
  const { C } = NM;
  const K = NMCalc, I = NMInteg, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sa = $(".sa"), sb = $(".sb"), box = $(".cands");
  const sec2 = (x) => 1 / Math.cos(x) ** 2;
  const P = {
    exp: { f: Math.exp, lab: "y = e^x", xr: [-2, 2], yr: [-1, 8], ys: 2, c: [
      { h: "<i>e</i><sup><i>x</i>+1</sup>/(<i>x</i> + 1)", lab: "e^(x+1)/(x+1)", F: (x) => Math.exp(x + 1) / (x + 1) },
      { h: "<i>e</i><sup><i>x</i></sup>", lab: "e^x", F: Math.exp }] },
    pow2: { f: (x) => 2 ** x, lab: "y = 2^x", xr: [-2, 3], yr: [-1, 9], ys: 2, c: [
      { h: "2<sup><i>x</i></sup>", lab: "2^x", F: (x) => 2 ** x },
      { h: "2<sup><i>x</i></sup>/ln 2", lab: "2^x / ln 2", F: (x) => 2 ** x / Math.LN2 }] },
    sin: { f: Math.sin, lab: "y = sin x", xr: [-3.2, 3.2], yr: [-1.5, 1.5], ys: 0.5, c: [
      { h: "cos <i>x</i>", lab: "cos x", F: Math.cos },
      { h: "−cos <i>x</i>", lab: "−cos x", F: (x) => -Math.cos(x) }] },
    cos: { f: Math.cos, lab: "y = cos x", xr: [-3.2, 3.2], yr: [-1.5, 1.5], ys: 0.5, c: [
      { h: "sin <i>x</i>", lab: "sin x", F: Math.sin },
      { h: "−sin <i>x</i>", lab: "−sin x", F: (x) => -Math.sin(x) }] },
    sec: { f: sec2, lab: "y = sec² x", xr: [-1.3, 1.3], yr: [-2, 14], ys: 4, c: [
      { h: "sec<sup>3</sup> <i>x</i>/3", lab: "sec³x / 3", F: (x) => sec2(x) ** 1.5 / 3 },
      { h: "tan <i>x</i>", lab: "tan x", F: Math.tan }] },
  };
  let key = "exp", ci = 0;
  const { ctx, size } = NM.fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[key], a = +sa.value, b = +sb.value, cand = p.c[ci];
    const g = K.frame(ctx, w, h, { xr: p.xr, yr: p.yr, xs: key === "sec" ? 0.5 : 1, ys: p.ys });
    I.shade(ctx, g, p.f, a, b);
    K.curve(ctx, g, cand.F, K.BLUE, { width: 1.6, dash: [6, 4] });
    K.curve(ctx, g, p.f, C.forest);
    I.vline(ctx, g, a, C.ink3); I.vline(ctx, g, b, C.ink3);
    K.tag(ctx, g, p.lab, g.x0 + 4, g.y0 + 10, C.forest);
    K.tag(ctx, g, `후보 F = ${cand.lab}`, g.x0 + 4, g.y0 + 28, K.BLUE);
  }

  function update() {
    const p = P[key], a = +sa.value, b = +sb.value, F = p.c[ci].F;
    $(".a-out").textContent = n(a, 2); $(".b-out").textContent = n(b, 2);
    const area = I.simp(p.f, a, b, 2000), d = F(b) - F(a);
    $(".n-i").textContent = n(area, 4); $(".n-f").textContent = n(d, 4);
    const ok = Math.abs(area - d) < 1e-6 * Math.max(1, Math.abs(area)), el = $(".n-ok");
    el.textContent = ok ? "같습니다" : `다릅니다 (차이 ${n(d - area, 4)})`;
    el.className = `n-ok ${ok ? "good" : ""}`;
    draw();
  }

  function setFn() {
    const p = P[key];
    [sa, sb].forEach((s) => { s.min = p.xr[0]; s.max = p.xr[1]; });
    sa.value = 0; sb.value = 1; ci = 0;
    box.innerHTML = p.c.map((c, i) => `<button class="chip" type="button" data-i="${i}" aria-pressed="${i === 0}">F = ${c.h}</button>`).join("");
    K.chips(root, ".cands .chip", (bt) => { ci = +bt.dataset.i; update(); });
    update();
  }

  K.chips(root, ".fn .chip", (bt) => { key = bt.dataset.k; setFn(); });
  sa.addEventListener("input", update); sb.addEventListener("input", update);
  setFn();
})();
