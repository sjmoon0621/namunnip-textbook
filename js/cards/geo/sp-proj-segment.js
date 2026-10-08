/* 카드: 막대를 기울이면 그림자 길이는 어떤 규칙으로 줄어들까? — 선분 AB와 정사영 A′B′, A′B′ = AB cos θ */
(() => {
  const root = document.getElementById("card-geo-proj-segment");
  if (!root) return;
  const { C, F } = NM;
  const S = NMSpace3, { add, sub, mul, len, rad } = S;
  const $ = (s) => root.querySelector(s);
  const stt = $(".t"), sl = $(".l"), sh = $(".h");
  const vw = S.view($("canvas"), () => draw(), { center: [0, 0.4, 1.3], span: 7.8, yaw: -0.45, pitch: 0.3 });
  const geo = () => {
    const t = rad(+stt.value), L = +sl.value, h = +sh.value, u = [Math.cos(t), 0, Math.sin(t)];
    const M = [0, 0.4, h], A = add(M, mul(u, -L / 2)), B = add(M, mul(u, L / 2));
    const A1 = [A[0], A[1], 0], B1 = [B[0], B[1], 0], Cc = [B[0], B[1], A[2]];
    return { t, L, A, B, A1, B1, Cc };
  };

  function draw() {
    const { ctx, size } = vw; if (!size.w) return;
    ctx.clearRect(0, 0, size.w, size.h);
    const { A, B, A1, B1, Cc } = geo();
    vw.poly([[-3.2, -1.8, 0], [3.2, -1.8, 0], [3.2, 2.6, 0], [-3.2, 2.6, 0]], C.leaf, C.ink3, 0.16);
    vw.label([3.2, -1.8, 0], "α", C.ink2, -8, 10, "right", `italic 600 14px ${F.serif}`);
    vw.line(A, A1, C.ink3, 1.2, [4, 4]); vw.line(B, B1, C.ink3, 1.2, [4, 4]);
    if (len(sub(B1, A1)) > 1e-6) {
      vw.line(A, Cc, C.forest, 1.6, [6, 4]);
      if (len(sub(B, Cc)) > 1e-6) vw.right(Cc, [-1, 0, 0], [0, 0, Math.sign(B[2] - Cc[2]) || 1], 0.22, C.forest);
    }
    vw.line(A1, B1, C.forest, 4);
    vw.line(A, B, C.warn, 3.5);
    [A, B].forEach((p) => vw.dot(p, C.warn, 4.5)); [A1, B1].forEach((p) => vw.dot(p, C.forest, 4.5));
    vw.label(A, "A", C.warn, -8, -4, "right"); vw.label(B, "B", C.warn, 8, -4);
    vw.label(A1, "A′", C.forest, -8, 10, "right"); vw.label(B1, "B′", C.forest, 8, 10);
    if (len(sub(B1, A1)) > 1e-6 && len(sub(B, Cc)) > 1e-6) vw.label(Cc, "C", C.forest, 8, 6);
  }

  function update() {
    $(".t-out").textContent = `${stt.value}°`; $(".l-out").textContent = S.n(+sl.value); $(".h-out").textContent = S.n(+sh.value);
    const { t, A, B, A1, B1 } = geo(), ab = len(sub(B, A)), p = len(sub(B1, A1));
    $(".n-l").textContent = S.n(ab); $(".n-p").textContent = S.n(p);
    $(".n-r").textContent = S.n(p / ab, 3); $(".n-c").textContent = S.n(Math.cos(t), 3);
    draw();
  }
  [stt, sl, sh].forEach((x) => x.addEventListener("input", update));
  update();
})();
