/* 카드: 공간에서 두 점 사이의 거리는 피타고라스 정리를 몇 번 쓰면 될까? — 수평 직각삼각형 ACB와 수직 직각삼각형으로 AB 구하기 */
(() => {
  const root = document.getElementById("card-geo-dist3");
  if (!root) return;
  const { C, F } = NM;
  const S = NMSpace3, { sub, len, unit } = S;
  const $ = (s) => root.querySelector(s);
  const exBtns = [...root.querySelectorAll(".ex .chip")], stBtns = [...root.querySelectorAll(".st .chip")];
  const bx = $(".bx"), by = $(".by"), bz = $(".bz");
  let A = [-1, -2, 1], k = 3;
  const vw = S.view($("canvas"), () => draw(), { center: [0, 0, 0.4], span: 7.8, pitch: 0.62 });
  const fmt = (p) => `(${p.map((x) => S.n(x)).join(", ")})`;
  const MSG = {
    1: "① A와 C는 높이가 같습니다. 평면 z = (A의 z좌표) 위에서 AC² = Δx² + Δy²입니다.",
    2: "② BC는 z축에 평행해 그 평면에 수직이므로 ∠ACB = 90°이고, AB² = AC² + Δz²입니다.",
    3: "두 직각삼각형을 이으면 AB² = Δx² + Δy² + Δz²입니다.",
  };

  function draw() {
    const { ctx, size } = vw; if (!size.w) return;
    ctx.clearRect(0, 0, size.w, size.h);
    const B = [+bx.value, +by.value, +bz.value], Cc = [B[0], B[1], A[2]], D = [B[0], A[1], A[2]];
    vw.axes(3.6, 3.2);
    if (k & 1) {
      vw.poly([A, D, Cc], C.leaf, null, 0.25);
      vw.line(A, D, C.forest, 2, [5, 4]); vw.line(D, Cc, C.forest, 2, [5, 4]);
      if (len(sub(D, A)) > 1e-9 && len(sub(Cc, D)) > 1e-9) vw.right(D, unit(sub(A, D)), unit(sub(Cc, D)), 0.25, C.forest);
      vw.line(A, Cc, C.forest, 3);
    }
    if (k & 2) {
      vw.poly([A, Cc, B], C.amber, null, 0.22);
      vw.line(Cc, B, C.ink2, 2, [5, 4]);
      if (len(sub(B, Cc)) > 1e-9 && len(sub(Cc, A)) > 1e-9) vw.right(Cc, unit(sub(A, Cc)), unit(sub(B, Cc)), 0.25, C.ink2);
    }
    vw.line(A, B, C.warn, 3.5);
    vw.dot(A, C.ink, 5.5); vw.dot(B, C.ink, 5.5); vw.dot(Cc, C.ink2, 4);
    vw.label(A, `A${fmt(A)}`, C.ink, -8, -8, "right", `600 11.5px ${F.mono}`);
    vw.label(B, `B${fmt(B)}`, C.ink, 8, -8, "left", `600 11.5px ${F.mono}`);
    if (len(sub(B, Cc)) > 1e-9) vw.label(Cc, "C", C.ink2, 8, 8);
  }

  function update() {
    const B = [+bx.value, +by.value, +bz.value], d = sub(B, A);
    $(".x-out").textContent = S.n(B[0]); $(".y-out").textContent = S.n(B[1]); $(".z-out").textContent = S.n(B[2]);
    const ac2 = d[0] ** 2 + d[1] ** 2, ab2 = ac2 + d[2] ** 2, ab = Math.sqrt(ab2);
    const sq = (x) => (x < 0 ? `(${S.n(x)})²` : `${S.n(x)}²`);
    $(".n-ac").textContent = `${sq(d[0])} + ${sq(d[1])} = ${S.n(ac2)}`;
    $(".n-ab2").textContent = `${S.n(ac2)} + ${sq(d[2])} = ${S.n(ab2)}`;
    $(".n-ab").textContent = Number.isInteger(ab) ? `√${S.n(ab2)} = ${ab}` : `√${S.n(ab2)} ≈ ${S.n(ab)}`;
    $(".msg").textContent = MSG[k];
    draw();
  }
  exBtns.forEach((b) => b.addEventListener("click", () => { A = b.dataset.a.split(",").map(Number); exBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  stBtns.forEach((b) => b.addEventListener("click", () => { k = +b.dataset.k; stBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  [bx, by, bz].forEach((x) => x.addEventListener("input", update));
  update();
})();
