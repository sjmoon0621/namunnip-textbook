/* 카드: 공간의 점 하나를 수 몇 개로 나타낼 수 있을까? — P(a, b, c)와 직육면체, 좌표평면 위로의 정사영, 대칭점 */
(() => {
  const root = document.getElementById("card-geo-coord-point");
  if (!root) return;
  const { C, F } = NM;
  const S = NMSpace3;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".presets .chip")];
  const sa = $(".a"), sb = $(".b"), sc = $(".c");
  let mode = "none";
  const MIR = { xy: [1, 1, -1], zx: [1, -1, 1], z: [-1, -1, 1], o: [-1, -1, -1] };
  const NAME = { xy: "xy평면", zx: "zx평면", z: "z축", o: "원점" };
  const vw = S.view($("canvas"), () => draw(), { center: [0, 0, 0.3], span: 7.6, pitch: 0.42 });
  const fmt = (p) => `(${p.map((x) => S.n(x)).join(", ")})`;

  function box(p, col, w) {
    const [a, b, c] = p;
    const V = [0, 1].flatMap((i) => [0, 1].flatMap((j) => [0, 1].map((k) => [i * a, j * b, k * c])));
    for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
      const d = [0, 1, 2].filter((m) => V[i][m] !== V[j][m]).length;
      if (d === 1) vw.line(V[i], V[j], col, w, [4, 4]);
    }
  }

  function draw() {
    const { ctx, size } = vw; if (!size.w) return;
    ctx.clearRect(0, 0, size.w, size.h);
    const P = [+sa.value, +sb.value, +sc.value];
    vw.axes(3.7, 3.3);
    box(P, C.ink3, 1.1);
    const feet = [[P[0], P[1], 0], [0, P[1], P[2]], [P[0], 0, P[2]]];
    feet.forEach((f) => vw.dot(f, C.forest, 4));
    vw.label(feet[0], fmt(feet[0]), C.forest, 6, 12, "left", `500 11px ${F.mono}`);
    [[P[0], 0, 0], [0, P[1], 0], [0, 0, P[2]]].forEach((f, i) => { if (f[i] !== 0) { vw.dot(f, C.ink2, 3); vw.label(f, S.n(f[i]), C.ink2, -6, 10, "right", `500 11px ${F.mono}`); } });
    if (mode !== "none") {
      const Q = P.map((x, i) => x * MIR[mode][i]);
      box(Q, C.amber, 1);
      vw.line(P, Q, C.warn, 1.2, [2, 3]);
      vw.dot(Q, C.warn, 5.5); vw.label(Q, `Q${fmt(Q)}`, C.warn, 8, -6, "left", `600 11.5px ${F.mono}`);
    }
    vw.dot(P, C.ink, 6); vw.label(P, `P${fmt(P)}`, C.ink, 8, -8, "left", `600 11.5px ${F.mono}`);
  }

  function update() {
    const P = [+sa.value, +sb.value, +sc.value];
    $(".a-out").textContent = S.n(P[0]); $(".b-out").textContent = S.n(P[1]); $(".c-out").textContent = S.n(P[2]);
    $(".n-p").textContent = fmt(P); $(".n-f").textContent = fmt([P[0], P[1], 0]);
    $(".n-q").textContent = mode === "none" ? "—" : `${NAME[mode]} ${fmt(P.map((x, i) => x * MIR[mode][i]))}`;
    draw();
  }
  btns.forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  [sa, sb, sc].forEach((x) => x.addEventListener("input", update));
  update();
})();
