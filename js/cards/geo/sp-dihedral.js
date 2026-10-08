/* 카드: 두 평면이 벌어진 정도는 어떤 각으로 재야 할까? — 반평면 α, β 위의 두 반직선 사이 각과 이면각, 삼수선으로 찾은 ∠PHO */
(() => {
  const root = document.getElementById("card-geo-dihedral");
  if (!root) return;
  const { C, F } = NM;
  const S = NMSpace3, { add, sub, mul, rad } = S;
  const $ = (s) => root.querySelector(s);
  const stt = $(".t"), sp = $(".p"), sy = $(".y"), tp = $(".go-tp");
  let showTP = false;
  const R = 3, Y = 2.2;               // 반평면 조각의 너비, 변 방향 반길이
  const vw = S.view($("canvas"), () => draw(), { center: [0.6, 0, 1.1], span: 5.8, yaw: -1.2, pitch: 0.32 });
  const geo = () => {
    const t = rad(+stt.value), p = rad(+sp.value), y0 = +sy.value;
    const n = [Math.cos(t), 0, Math.sin(t)];                       // β 안에서 변에 수직인 방향
    const a = [Math.sin(p), Math.cos(p), 0], b = [Math.sin(p) * n[0], Math.cos(p), Math.sin(p) * n[2]];
    const X = [0, y0, 0], P = add(X, mul(n, 2)), O = [P[0], y0, 0];
    return { t, n, a, b, X, P, O };
  };

  function draw() {
    const { ctx, size } = vw; if (!size.w) return;
    ctx.clearRect(0, 0, size.w, size.h);
    const { n, a, b, X, P, O } = geo();
    vw.poly([[0, -Y, 0], [R, -Y, 0], [R, Y, 0], [0, Y, 0]], C.leaf, C.ink3, 0.16);
    vw.poly([[0, -Y, 0], add(mul(n, R), [0, -Y, 0]), add(mul(n, R), [0, Y, 0]), [0, Y, 0]], C.amber, C.ink3, 0.16);
    vw.line([0, -Y - 0.4, 0], [0, Y + 0.4, 0], C.ink, 2.2);
    vw.label([0, Y + 0.4, 0], "l (변)", C.ink, 6, -6);
    vw.label([R, -Y, 0], "α", C.ink2, 4, 12, "left", `italic 600 14px ${F.serif}`);
    vw.label(add(mul(n, R), [0, -Y, 0]), "β", C.ink2, 6, -8, "left", `italic 600 14px ${F.serif}`);
    // 변에 수직인 기준선(옅게)과 학생이 고른 두 반직선
    vw.line(X, add(X, [2.4, 0, 0]), C.ink3, 1, [3, 3]); vw.line(X, add(X, mul(n, 2.4)), C.ink3, 1, [3, 3]);
    vw.line(X, add(X, mul(a, 2.4)), C.forest, 3); vw.line(X, add(X, mul(b, 2.4)), C.warn, 3);
    vw.label(add(X, mul(a, 2.4)), "A", C.forest, 6, 8); vw.label(add(X, mul(b, 2.4)), "B", C.warn, 6, -6);
    if (showTP) {
      if (O[0] < 0) vw.poly([[O[0] - 0.3, -Y, 0], [0, -Y, 0], [0, Y, 0], [O[0] - 0.3, Y, 0]], C.leaf, C.ink3, 0.06);
      vw.line(P, O, C.ink, 1.6, [5, 4]); vw.line(O, X, C.ink, 1.6, [5, 4]); vw.line(P, X, C.ink, 1.6);
      if (Math.abs(O[0]) > 1e-6) vw.right(O, [O[0] > 0 ? -1 : 1, 0, 0], [0, 0, 1], 0.22);
      vw.dot(P, C.ink, 4.5); vw.dot(O, C.ink, 4.5);
      vw.label(P, "P", C.ink, 8, -4); vw.label(O, "O", C.ink, 6, 12);
    }
    vw.dot(X, C.ink, 5); vw.label(X, showTP ? "X = H" : "X", C.ink, -8, 12, "right");
  }

  function update() {
    $(".t-out").textContent = `${stt.value}°`; $(".p-out").textContent = `${sp.value}°`; $(".y-out").textContent = S.n(+sy.value);
    const { a, b, X, P, O } = geo();
    const ang = S.vecAngle(a, b), r = $(".n-r");
    r.textContent = `${S.n(ang, 1)}°`; r.className = `n-r ${Math.abs(ang - +stt.value) < 1e-6 ? "good" : ""}`;
    $(".n-t").textContent = `${stt.value}°`;
    $(".n-p").textContent = Math.abs(O[0]) < 1e-6 ? "O = H" : `${S.n(S.vecAngle(sub(P, X), sub(O, X)), 1)}°`;
    draw();
  }
  tp.addEventListener("click", () => { showTP = !showTP; tp.setAttribute("aria-pressed", String(showTP)); draw(); });
  [stt, sp, sy].forEach((x) => x.addEventListener("input", update));
  update();
})();
