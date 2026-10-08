/* 카드: 두 실근이 허근으로 바뀌는 순간 무슨 일이 생길까? — x² + bx + c = 0의 두 근을 c에 따라 평면 위에서 따라가기 */
(() => {
  const root = document.getElementById("card-cm1-root-path");
  if (!root) return;
  const { C, F, fit } = NM;
  const E = NMEqPlot;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".ex .chip")];
  const sc = $(".c"), CMIN = -4, CMAX = 6;
  let b = -2;
  const { ctx, size } = fit($("canvas"), () => draw());
  const I = "<i>i</i>";

  const rootsOf = (c) => E.roots(1, b, c);
  const pts = (c) => { const r = rootsOf(c); return r.kind > 0 ? r.xs.map((x) => [x, 0]) : r.kind === 0 ? [[r.xs[0], 0], [r.xs[0], 0]] : [[r.p, r.q], [r.p, -r.q]]; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = +sc.value, gap = 14, pw = (w - 30 - gap - 30 - 10) / 2;
    ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    const L = E.frame(ctx, { x: 30, y: 22, w: pw, h: h - 44 }, { X0: -4.5, X1: 4.5, Y0: -8, Y1: 12 }, { xs: 2, ys: 4, xname: "x" });
    ctx.fillStyle = C.ink2; ctx.fillText("그래프 y = x² + bx + c", 30, 13);
    E.curve(ctx, L, (x) => x * x + b * x + c, C.forest, 2.2);
    const R = E.frame(ctx, { x: 30 + pw + gap + 30, y: 22, w: pw, h: h - 44 }, { X0: -4.5, X1: 4.5, Y0: -2.8, Y1: 2.8 }, { eq: true, xs: 2, ys: 1, xname: "실수", yname: "허수" });
    ctx.fillStyle = C.ink2; ctx.fillText("두 근의 자리", R.box.x, 13);
    ctx.save(); ctx.strokeStyle = C.rule; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath();
    const cTop = b * b / 4, r0 = rootsOf(CMIN);
    if (cTop >= CMIN) { ctx.moveTo(R.X(r0.xs[0]), R.Y(0)); ctx.lineTo(R.X(r0.xs[1]), R.Y(0)); }
    const q1 = Math.sqrt(Math.max(0, CMAX - cTop));
    ctx.moveTo(R.X(-b / 2), R.Y(q1)); ctx.lineTo(R.X(-b / 2), R.Y(-q1));
    ctx.stroke(); ctx.restore();
    const r = rootsOf(c), P = pts(c), col = r.kind > 0 ? C.forest : r.kind === 0 ? C.amber : C.warn;
    if (r.kind >= 0) r.xs.forEach((x) => E.dot(ctx, L.X(x), L.Y(0), col, 5.5));
    P.forEach((p, k) => {
      E.dot(ctx, R.X(p[0]), R.Y(p[1]), col, k ? 5.5 : 6.5, k === 1);
    });
    const lab = r.kind > 0 ? "서로 다른 두 실근" : r.kind === 0 ? "중근: 두 근이 만남" : "켤레인 두 허근";
    E.tag(ctx, lab, R.box.x + 4, R.box.y + R.box.h - 10, col, "left", R.box);
    if (r.kind < 0) {
      E.tag(ctx, E.cx(r.p, E.r3(r.q)), R.X(r.p) + 9, R.Y(r.q), col, "left", R.box);
      E.tag(ctx, E.cx(r.p, -E.r3(r.q)), R.X(r.p) + 9, R.Y(-r.q), col, "left", R.box);
      E.tag(ctx, "x축과 만나지 않음", L.box.x + 4, L.box.y + 10, C.warn, "left", L.box);
    }
  }

  function update() {
    const c = +sc.value, r = rootsOf(c), D = b * b - 4 * c;
    $(".c-out").textContent = E.n(c);
    const nd = $(".n-d"); nd.textContent = E.n(D); nd.className = `n-d ${D < 0 ? "bad" : "good"}`;
    const ex = (v) => (Math.abs(v - E.r3(v)) < 1e-9 ? "" : "≈ ") + E.n(v);
    $(".n-r").innerHTML = r.kind > 0 ? `${ex(r.xs[0])}, ${ex(r.xs[1])}` : r.kind === 0 ? `${ex(r.xs[0])} (중근)` : `${E.n(r.p) === "0" ? "" : E.n(r.p) + " "}± ${ex(r.q)}${I}`;
    $(".n-s").textContent = `합 ${E.n(-b)} · 곱 ${E.n(c)}`;
    draw();
  }
  chips.forEach((bt) => bt.addEventListener("click", () => { b = +bt.dataset.b; chips.forEach((x) => x.setAttribute("aria-pressed", String(x === bt))); update(); }));
  sc.addEventListener("input", update);
  update();
})();
