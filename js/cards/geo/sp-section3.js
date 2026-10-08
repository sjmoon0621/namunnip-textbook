/* 카드: 공간의 선분을 m : n으로 나누는 점은 좌표마다 따로 구해도 될까? — 내분점 P와 xy평면 위로의 정사영 */
(() => {
  const root = document.getElementById("card-geo-section3");
  if (!root) return;
  const { C, F } = NM;
  const S = NMSpace3, { sub, len } = S;
  const $ = (s) => root.querySelector(s), exBtns = [...root.querySelectorAll(".ex .chip")];
  const sm = $(".m"), sn = $(".n");
  let A = [-2, 2, 3], B = [3, -2, -1];
  const vw = S.view($("canvas"), () => draw(), { center: [0, 0, 0.4], span: 8, pitch: 0.5 });
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  // 정수 분자 p, 양의 분모 q를 기약분수 문자열로
  const frac = (p, q) => { const g = gcd(p, q) || 1, a = p / g, b = q / g, s = a < 0 ? "−" : ""; return b === 1 ? `${s}${Math.abs(a)}` : `${s}${Math.abs(a)}/${b}`; };
  const fmt = (p) => `(${p.map((x) => S.n(x)).join(", ")})`;
  const point = () => { const m = +sm.value, n = +sn.value; return { m, n, P: A.map((a, i) => (m * B[i] + n * a) / (m + n)) }; };

  function draw() {
    const { ctx, size } = vw; if (!size.w) return;
    ctx.clearRect(0, 0, size.w, size.h);
    const { P } = point(), fl = (p) => [p[0], p[1], 0];
    vw.axes(3.6, 3.2);
    [A, P, B].forEach((p) => vw.line(p, fl(p), C.ink3, 1.1, [4, 4]));
    vw.line(fl(A), fl(B), C.forest, 2.5);
    vw.line(A, B, C.ink, 3);
    vw.line(A, P, C.warn, 4);
    [fl(A), fl(B)].forEach((p) => vw.dot(p, C.forest, 3.5)); vw.dot(fl(P), C.forest, 5);
    vw.label(fl(A), "A′", C.forest, -6, 12, "right"); vw.label(fl(B), "B′", C.forest, 6, 12); vw.label(fl(P), "P′", C.forest, 8, 10);
    vw.dot(A, C.ink, 5); vw.dot(B, C.ink, 5); vw.dot(P, C.warn, 6.5);
    vw.label(A, `A${fmt(A)}`, C.ink, -8, -8, "right", `600 11.5px ${F.mono}`);
    vw.label(B, `B${fmt(B)}`, C.ink, 0, 16, "left", `600 11.5px ${F.mono}`);
    vw.label(P, "P", C.warn, 10, -6);
  }

  function update() {
    const { m, n, P } = point();
    $(".m-out").textContent = m; $(".n-out").textContent = n;
    $(".n-p").textContent = `(${A.map((a, i) => frac(m * B[i] + n * a, m + n)).join(", ")})`;
    const ap = len(sub(P, A)), pb = len(sub(B, P));
    $(".n-d").textContent = `${S.n(ap)}, ${S.n(pb)}`;
    $(".n-r").textContent = `${S.n(ap / pb, 3)} · ${S.n(m / n, 3)}`;
    draw();
  }
  exBtns.forEach((b) => b.addEventListener("click", () => { const v = b.dataset.ab.split(",").map(Number); A = v.slice(0, 3); B = v.slice(3); exBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  [sm, sn].forEach((x) => x.addEventListener("input", update));
  update();
})();
