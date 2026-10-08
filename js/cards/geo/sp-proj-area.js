/* 카드: 기울어진 판의 그림자 넓이는 어떻게 구할까? — 평면 β 위 도형과 α 위 정사영의 넓이 비 = cos θ */
(() => {
  const root = document.getElementById("card-geo-proj-area");
  if (!root) return;
  const { C, F } = NM;
  const S = NMSpace3, { rad } = S;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".presets .chip")];
  const stt = $(".t"), sr = $(".r");
  const Z0 = 1.2, U0 = 1.5;          // β의 경첩선 높이, 도형 중심의 경첩선으로부터 거리
  // β 안의 좌표 (u: 경첩선에 수직, v: 경첩선 방향), 도형 중심 기준
  const SHAPES = {
    sq: [[-1, -1], [1, -1], [1, 1], [-1, 1]],
    tri: [[-1.1, -1], [1.2, -0.4], [-0.2, 1.2]],
    cir: Array.from({ length: 360 }, (_, i) => [1.2 * Math.cos(i * Math.PI / 180), 1.2 * Math.sin(i * Math.PI / 180)]),
  };
  let shape = "sq";
  const vw = S.view($("canvas"), () => draw(), { center: [1.2, 0, 1.5], span: 6.4, yaw: -1.05, pitch: 0.6 });
  const area = (pts) => Math.abs(pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
  const geo = () => {
    const t = rad(+stt.value), r = rad(+sr.value), c = Math.cos(t), s = Math.sin(t);
    const loc = SHAPES[shape].map(([u, v]) => [U0 + u * Math.cos(r) - v * Math.sin(r), u * Math.sin(r) + v * Math.cos(r)]);
    return { t, loc, P3: loc.map(([u, v]) => [u * c, v, Z0 + u * s]), Q3: loc.map(([u, v]) => [u * c, v, 0]), proj2: loc.map(([u, v]) => [u * c, v]) };
  };

  function draw() {
    const { ctx, size } = vw; if (!size.w) return;
    ctx.clearRect(0, 0, size.w, size.h);
    const { t, P3, Q3 } = geo(), c = Math.cos(t), s = Math.sin(t), W = 3.1, Y = 1.9;
    vw.poly([[-0.6, -Y, 0], [W, -Y, 0], [W, Y, 0], [-0.6, Y, 0]], C.leaf, C.ink3, 0.14);
    vw.label([W, -Y, 0], "α", C.ink2, -8, 10, "right", `italic 600 14px ${F.serif}`);
    vw.poly([[0, -Y, Z0], [W * c, -Y, Z0 + W * s], [W * c, Y, Z0 + W * s], [0, Y, Z0]], C.amber, C.ink3, 0.12);
    vw.label([W * c, Y, Z0 + W * s], "β", C.ink2, 8, -4, "left", `italic 600 14px ${F.serif}`);
    vw.line([0, -Y, Z0], [0, Y, Z0], C.ink2, 2, [6, 4]); vw.line([0, -Y, 0], [0, Y, 0], C.ink2, 2, [6, 4]);
    const k = shape === "cir" ? 30 : 1;
    P3.forEach((p, i) => { if (i % k === 0) vw.line(p, Q3[i], C.ink3, 1, [3, 3]); });
    vw.poly(Q3, C.forest, C.forest, 0.35, 2);
    vw.poly(P3, C.warn, C.warn, 0.3, 2);
  }

  function update() {
    $(".t-out").textContent = `${stt.value}°`; $(".r-out").textContent = `${sr.value}°`;
    const { t, loc, proj2 } = geo(), A = area(loc), B = area(proj2);
    $(".n-s").textContent = S.n(A); $(".n-p").textContent = S.n(B);
    $(".n-r").textContent = S.n(B / A, 3); $(".n-c").textContent = S.n(Math.cos(t), 3);
    draw();
  }
  btns.forEach((b) => b.addEventListener("click", () => { shape = b.dataset.s; btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  [stt, sr].forEach((x) => x.addEventListener("input", update));
  update();
})();
