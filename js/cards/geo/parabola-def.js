/* 카드: 초점과 준선에서 거리가 같은 점은 어떤 곡선을 이룰까? — 점 P를 끌어 PF = PH인 곳을 표시하고 포물선 y² = 4px, x² = 4py를 확인 */
(() => {
  const root = document.getElementById("card-geo-parabola-def");
  if (!root) return;
  const { C, clamp } = NM, K = NMCoord, Q = NMConic;
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  const sp = $(".s-p");
  let ax = "x", p = 1, mode = "free", show = false, prevP = 1;
  const T = [3, 2], marks = [];
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 16 }, () => draw());
  const X = "<i>x</i>", Y = "<i>y</i>";

  const F = () => (ax === "x" ? [p, 0] : [0, p]);
  const H = () => (ax === "x" ? [-p, T[1]] : [T[0], -p]);
  const dF = () => Math.hypot(T[0] - F()[0], T[1] - F()[1]);
  const dH = () => Math.abs(ax === "x" ? T[0] + p : T[1] + p);
  const same = () => Math.abs(dF() - dH()) < 0.06;

  function draw() {
    if (!P.size.w) return;
    P.grid();
    const f = F(), h = H(), ok = same(), col = ok ? C.forest : C.warn;
    if (ax === "x") P.line(1, 0, p, C.ink2, 2, [6, 4]); else P.line(0, 1, p, C.ink2, 2, [6, 4]);
    P.text(ax === "x" ? `준선 x = ${K.n(-p)}` : `준선 y = ${K.n(-p)}`, ax === "x" ? [-p, P.box().y1] : [P.box().x0, -p], C.ink2, ax === "x" ? (p > 0 ? -6 : 6) : 4, ax === "x" ? 14 : (p > 0 ? 12 : -12), ax === "x" ? (p > 0 ? "right" : "left") : "left");
    if (show) P.path(Q.parab(ax, 0, 0, p), C.forest, 2.5);
    marks.forEach((m) => P.dot(m, C.forest, 3.2));
    P.seg(T, f, col, 2);
    P.seg(T, h, col, 2, [3, 3]);
    P.right(h, ax === "x" ? [1, 0] : [0, 1], ax === "x" ? [0, -1] : [1, 0], C.ink3, 7);
    P.dot(h, C.ink2, 3.5);
    P.dot(f, C.amber, 6);
    P.text("F", f, C.ink, 8, 12, "left");
    P.text("H", h, C.ink2, ax === "x" ? (p > 0 ? -8 : 8) : 8, ax === "x" ? 0 : (p > 0 ? 12 : -12), ax === "x" ? (p > 0 ? "right" : "left") : "left");
    P.knob(T, col);
    P.text(`P(${K.n(T[0], 1)}, ${K.n(T[1], 1)})`, T, col, 12, -12, "left");
  }

  function update() {
    if (mode === "snap") {
      if (ax === "x") { const L = Math.min(4.3, Math.sqrt(30 * Math.abs(p))); T[1] = clamp(T[1], -L, L); T[0] = T[1] * T[1] / (4 * p); }
      else { const L = Math.min(7.5, Math.sqrt(17.2 * Math.abs(p))); T[0] = clamp(T[0], -L, L); T[1] = T[0] * T[0] / (4 * p); }
    }
    const ok = same();
    if (ok && mode === "free" && !marks.some((m) => Math.hypot(m[0] - T[0], m[1] - T[1]) < 0.25)) marks.push([T[0], T[1]]);
    $(".p-out").textContent = K.n(p);
    $(".n-f").textContent = K.n(dF());
    $(".n-h").textContent = K.n(dH());
    const e = $(".n-s"); e.textContent = ok ? "PF = PH" : dF() < dH() ? "PF < PH" : "PF > PH"; e.className = `n-s ${ok ? "good" : ""}`;
    $(".n-m").textContent = String(marks.length);
    const f = F();
    $(".eq").innerHTML = `초점 F(${K.n(f[0])}, ${K.n(f[1])}), 준선 ${ax === "x" ? X : Y} = ${K.n(-p)}<br>` +
      (show ? `자취: ${ax === "x" ? Y : X}<sup>2</sup> = ${K.n(4 * p)}${ax === "x" ? X : Y}  (4<i>p</i> = ${K.n(4 * p)})` : "PF = PH인 점을 여러 개 찾은 뒤 '곡선 보기'를 누르세요.");
    draw();
  }

  $$(".c-ax").forEach((b) => b.addEventListener("click", () => {
    ax = b.dataset.ax; $$(".c-ax").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    marks.length = 0; if (ax === "x") { T[0] = 3; T[1] = 2; } else { T[0] = 2; T[1] = 3; } update();
  }));
  $$(".c-mode").forEach((b) => b.addEventListener("click", () => {
    mode = b.dataset.mode; $$(".c-mode").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update();
  }));
  $(".go-show").addEventListener("click", (e) => { show = !show; e.currentTarget.setAttribute("aria-pressed", String(show)); update(); });
  $(".go-clear").addEventListener("click", () => { marks.length = 0; update(); });
  sp.addEventListener("input", () => {
    let v = +sp.value;
    if (v === 0) { v = prevP > 0 ? -0.5 : 0.5; sp.value = v; }
    p = prevP = v; marks.length = 0; update();
  });
  P.drag([{ get: () => T, set: (x, y) => { T[0] = Math.round(x * 10) / 10; T[1] = Math.round(y * 10) / 10; } }], update);
  update();
})();
