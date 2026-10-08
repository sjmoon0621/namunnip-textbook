/* 카드: 나누어 보지 않고 나머지를 알 수 있을까? — y = P(x)의 높이 P(a)와 x − a로 나눈 나머지 비교 */
(() => {
  const root = document.getElementById("card-cm1-remainder");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const P = NMPoly;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".presets .chip")];
  const sa = $(".a");
  let p = [6, -5, -2, 1];
  const X0 = -4, X1 = 4, Y0 = -20, Y1 = 20;
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 34, y0 = 10, gw = w - x0 - 10, gh = h - y0 - 24;
    const X = (x) => x0 + (x - X0) / (X1 - X0) * gw, Y = (y) => y0 + (Y1 - y) / (Y1 - Y0) * gh;
    const lab = (v) => String(v).replace("-", "−");
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((v) => [v, lab(v)]), yt: [-20, -10, 0, 10, 20].map((v) => [v, lab(v)]) });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x0 + gw, Y(0)); ctx.moveTo(X(0), y0); ctx.lineTo(X(0), y0 + gh); ctx.stroke();
    P.curve(ctx, (x) => P.at(p, x), X, Y, X0, X1, { x: x0, y: y0, w: gw, h: gh }, C.forest, 2.5);
    const a = +sa.value, v = P.at(p, a), zero = Math.abs(v) < 1e-9, vy = Math.max(Y0, Math.min(Y1, v));
    ctx.strokeStyle = zero ? C.forest : C.warn; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(X(a), Y(0)); ctx.lineTo(X(a), Y(vy)); ctx.stroke();
    ctx.fillStyle = zero ? C.forest : C.warn; ctx.beginPath(); ctx.arc(X(a), Y(vy), zero ? 6.5 : 5, 0, 7); ctx.fill();
    ctx.font = `600 11.5px ${F.sans}`; ctx.textBaseline = "middle";
    const lin = a === 0 ? "x" : `x ${a < 0 ? "+" : "−"} ${P.n(Math.abs(a))}`;
    const txt = zero ? `P(${P.n(a)}) = 0 → ${lin}는 인수` : `높이 P(${P.n(a)}) = ${P.n(v)}${v > Y1 || v < Y0 ? " (그림 밖)" : ""}`;
    const tw = ctx.measureText(txt).width, right = X(a) + 10 + tw < x0 + gw;
    ctx.textAlign = right ? "left" : "right";
    const ty = Math.max(y0 + 10, Math.min(y0 + gh - 10, Y(vy / 2 || 0) + (zero ? -14 : 0)));
    ctx.fillStyle = C.card; ctx.fillRect(right ? X(a) + 8 : X(a) - 10 - tw, ty - 8, tw + 4, 16);
    ctx.fillStyle = zero ? C.forest : C.warn; ctx.fillText(txt, right ? X(a) + 10 : X(a) - 8, ty);
  }

  function update() {
    const a = +sa.value; $(".a-out").textContent = P.n(a);
    const { q, r } = P.div(p, [-a, 1]), v = P.at(p, a), zero = Math.abs(v) < 1e-9;
    const lin = a === 0 ? "<i>x</i>" : `<i>x</i> ${a < 0 ? "+" : "−"} ${P.n(Math.abs(a))}`;
    $(".eq").innerHTML = `P(<i>x</i>) = ${P.fmt(p, true)}<br>= (${lin})(${P.fmt(q, true)}) ${r[0] < 0 ? "−" : "+"} ${P.n(Math.abs(r[0]))}`;
    $(".n-r").textContent = P.n(r[0]); $(".d-p").textContent = `P(${P.n(a)})`; $(".n-p").textContent = P.n(v);
    const f = $(".n-f"); f.textContent = zero ? "예 (나머지 0)" : "아니요"; f.className = `n-f ${zero ? "good" : ""}`;
    draw();
  }
  btns.forEach((b) => b.addEventListener("click", () => { p = b.dataset.p.split(",").map(Number); btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  sa.addEventListener("input", update);
  update();
})();
