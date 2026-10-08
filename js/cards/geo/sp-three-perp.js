/* 카드: 평면 위에 그은 수선 하나로 공중의 수선을 찾을 수 있을까? — PO ⊥ α에서 OX, PX와 직선 l의 각 비교 */
(() => {
  const root = document.getElementById("card-geo-three-perp");
  if (!root) return;
  const { C, F } = NM;
  const S = NMSpace3, { sub, unit, len } = S;
  const $ = (s) => root.querySelector(s);
  const sh = $(".h"), sd = $(".d"), ss = $(".s");
  const U = [1, 0, 0];                // 직선 l의 방향
  const vw = S.view($("canvas"), () => draw(), { center: [0, 0.9, 1.4], span: 7.2, yaw: -0.5, pitch: 0.42 });
  const pts = () => { const h = +sh.value, d = +sd.value, s = +ss.value; return { h, d, s, P: [0, 0, h], O: [0, 0, 0], X: [s, d, 0], H: [0, d, 0] }; };

  function draw() {
    const { ctx, size } = vw; if (!size.w) return;
    ctx.clearRect(0, 0, size.w, size.h);
    const { d, s, P, O, X, H } = pts();
    vw.poly([[-3.4, -1.4, 0], [3.4, -1.4, 0], [3.4, 3.6, 0], [-3.4, 3.6, 0]], C.leaf, C.ink3, 0.14);
    vw.label([3.4, -1.4, 0], "α", C.ink2, -8, 10, "right", `italic 600 14px ${F.serif}`);
    vw.line([-3.4, d, 0], [3.4, d, 0], C.ink, 2);
    vw.label([3.4, d, 0], "l", C.ink, 8, 0, "left", `italic 600 14px ${F.serif}`);
    vw.right(O, [0, 1, 0], [0, 0, 1], 0.3);
    if (Math.abs(s) > 1e-9) { vw.line(O, H, C.ink3, 1.2, [4, 4]); vw.right(H, [0, -1, 0], [1, 0, 0], 0.25, C.ink3); vw.dot(H, C.ink3, 3); vw.label(H, "H", C.ink3, 6, 12); }
    vw.line(P, O, C.ink2, 2);
    vw.line(O, X, C.forest, 3);
    vw.line(P, X, C.warn, 3);
    if (Math.abs(s) < 1e-9) { vw.right(X, [-1, 0, 0], unit(sub(O, X)), 0.3, C.forest); vw.right(X, [1, 0, 0], unit(sub(P, X)), 0.3, C.warn); }
    vw.dot(P, C.ink, 5); vw.dot(O, C.ink, 4); vw.dot(X, C.ink, 5);
    vw.label(P, "P", C.ink, 8, -4); vw.label(O, "O", C.ink, -8, 10, "right"); vw.label(X, Math.abs(s) < 1e-9 ? "X = H" : "X", C.ink, 6, 12);
  }

  function update() {
    const { h, d, s, P, O, X } = pts();
    $(".h-out").textContent = S.n(h); $(".d-out").textContent = S.n(d); $(".s-out").textContent = S.n(s);
    const ao = S.lineAngle(sub(O, X), U), ap = S.lineAngle(sub(P, X), U);
    [["n-o", ao], ["n-p", ap]].forEach(([c, a]) => { const el = $("." + c); el.textContent = `${S.n(a, 1)}°`; el.className = `${c} ${Math.abs(a - 90) < 1e-6 ? "good" : ""}`; });
    $(".n-px").textContent = S.n(len(sub(P, X)));
    $(".n-py").textContent = S.n(Math.hypot(h, len(sub(X, O))));
    draw();
  }
  [sh, sd, ss].forEach((x) => x.addEventListener("input", update));
  update();
})();
