/* 카드: 합성함수의 그래프는 어떻게 얻을까? — f(x) = ax + b, g(x) = x² + c를 직선 y = x로 이어 (g∘f)(x₀), (f∘g)(x₀)를 찾는다 */
(() => {
  const root = document.getElementById("card-cm2-compose-machine");
  if (!root) return;
  const { C } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s);
  const sa = $(".a"), sb = $(".b"), sc = $(".c"), ords = [...root.querySelectorAll(".presets .chip")];
  let x0 = 2, order = "gf";
  const P = K.plane($("canvas"), { cx: 0, cy: 2, span: 13 }, () => draw());
  const f = (x) => +sa.value * x + +sb.value, g = (x) => x * x + +sc.value;
  const comp = (x) => (order === "gf" ? g(f(x)) : f(g(x)));
  const X = "<i>x</i>", X2 = "<i>x</i><sup>2</sup>";

  function draw() {
    if (!P.size.w) return;
    P.grid();
    P.line(1, -1, 0, C.ink3, 1.2, [4, 4]);
    P.curve(f, C.forest, 2); P.curve(g, C.amber, 2); P.curve(comp, C.warn, 2.8);
    const first = order === "gf" ? f : g, second = order === "gf" ? g : f;
    const u = first(x0), v = second(u);
    const pa = [x0, 0], pb = [x0, u], pc = [u, u], pd = [u, v], pe = [x0, v];
    P.arrow(pa, pb, C.ink2, 1.5, [5, 4]); P.arrow(pb, pc, C.ink2, 1.5, [5, 4]); P.arrow(pc, pd, C.ink2, 1.5, [5, 4]);
    P.seg(pd, pe, C.warn, 1.3, [2, 3]);
    P.dot(pb, order === "gf" ? C.forest : C.amber, 4); P.dot(pd, order === "gf" ? C.amber : C.forest, 4); P.dot(pe, C.warn, 5);
    P.knob(pa, C.ink);
    P.text("y = x", [5.2, 5.2], C.ink3, 6, 10);
    P.text(`x₀ = ${K.n(x0)}`, pa, C.ink, 0, 16, "center");
  }

  function update() {
    const a = +sa.value, b = +sb.value, c = +sc.value;
    $(".a-out").textContent = K.n(a); $(".b-out").textContent = K.n(b); $(".c-out").textContent = K.n(c);
    const gf = K.lin([[a * a, X2], [2 * a * b, X], [b * b + c, ""]]), fg = K.lin([[a, X2], [a * c + b, ""]]);
    const fs = K.lin([[a, X], [b, ""]]), gs = K.lin([[1, X2], [c, ""]]);
    const first = order === "gf" ? "f" : "g", second = order === "gf" ? "g" : "f", u = (order === "gf" ? f : g)(x0), v = comp(x0);
    $(".eq").innerHTML = `<i>f</i>(${X}) = ${fs}, <i>g</i>(${X}) = ${gs}<br>(<i>g</i>∘<i>f</i>)(${X}) = ${gf}<br>(<i>f</i>∘<i>g</i>)(${X}) = ${fg}`;
    $(".n-u").textContent = K.n(u); $(".d-u").innerHTML = `<i>${first}</i>(${K.n(x0)})`;
    $(".n-v").textContent = K.n(v); $(".d-v").innerHTML = `<i>${second}</i>(<i>${first}</i>(${K.n(x0)}))`;
    const other = order === "gf" ? f(g(x0)) : g(f(x0));
    $(".n-o").textContent = K.n(other); $(".d-o").innerHTML = order === "gf" ? `(<i>f</i>∘<i>g</i>)(${K.n(x0)})` : `(<i>g</i>∘<i>f</i>)(${K.n(x0)})`;
    draw();
  }

  [sa, sb, sc].forEach((s) => s.addEventListener("input", update));
  ords.forEach((b) => b.addEventListener("click", () => { order = b.dataset.o; ords.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  P.drag([{ get: () => [x0, 0], set: (x) => { x0 = NM.clamp(Math.round(x * 2) / 2, -5, 5); } }], update);
  update();
})();
