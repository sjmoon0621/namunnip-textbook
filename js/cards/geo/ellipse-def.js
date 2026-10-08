/* 카드: 두 핀과 끈으로 그린 곡선은 무엇일까? — 끈 길이 2a, 초점 거리 c를 정하고 연필 P를 끌어 PF + PF' = 2a인 자취(타원)를 그린다 */
(() => {
  const root = document.getElementById("card-geo-ellipse-def");
  if (!root) return;
  const { C } = NM, K = NMCoord, Q = NMConic;
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  const sa = $(".s-a"), sc = $(".s-c");
  const NB = 120, seen = new Array(NB).fill(false);
  let ax = "x", a = 4, c = 2.5, th = 0.9, show = false;
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 14 }, () => draw());
  const X = "<i>x</i>", Y = "<i>y</i>";

  const b = () => Math.sqrt(a * a - c * c);
  const semi = () => (ax === "x" ? [a, b()] : [b(), a]);
  const at = (t) => { const [h, k] = semi(); return [h * Math.cos(t), k * Math.sin(t)]; };
  const foci = () => (ax === "x" ? [[c, 0], [-c, 0]] : [[0, c], [0, -c]]);
  const bin = (t) => ((Math.floor((t / (2 * Math.PI)) * NB) % NB) + NB) % NB;

  function draw() {
    if (!P.size.w) return;
    P.grid();
    const [F1, F2] = foci(), T = at(th), [h, k] = semi();
    if (show) P.path(Q.ellipse(0, 0, h, k), C.forest, 2.5);
    for (let i = 0; i < NB; i++) if (seen[i]) {
      const pts = []; for (let j = 0; j <= 4; j++) pts.push(at(2 * Math.PI * (i + j / 4) / NB));
      P.path(pts, C.forest, 3.5);
    }
    const B = ax === "x" ? [0, k] : [h, 0];
    P.seg([0, 0], B, C.ink3, 1.2, [3, 3]); P.seg(F1, B, C.ink3, 1.2, [3, 3]); P.seg([0, 0], F1, C.ink3, 1.2, [3, 3]);
    P.text("a", [(F1[0] + B[0]) / 2, (F1[1] + B[1]) / 2], C.ink3, 6, -6, "left", `italic 13px ${NM.F.serif}`);
    P.text("b", [B[0] / 2, B[1] / 2], C.ink3, ax === "x" ? -12 : 0, ax === "x" ? 0 : 12, "left", `italic 13px ${NM.F.serif}`);
    P.text("c", [F1[0] / 2, F1[1] / 2], C.ink3, ax === "x" ? 0 : 6, ax === "x" ? 12 : 0, "left", `italic 13px ${NM.F.serif}`);
    P.seg(F1, T, C.amber, 2.2); P.seg(F2, T, C.amber, 2.2);
    P.dot(F1, C.ink, 5); P.dot(F2, C.ink, 5);
    P.text("F", F1, C.ink, ax === "x" ? 4 : 8, ax === "x" ? 14 : 0, "left");
    P.text("F'", F2, C.ink, ax === "x" ? -4 : 8, ax === "x" ? 14 : 0, ax === "x" ? "right" : "left");
    P.knob(T, C.warn);
    P.text("P", T, C.warn, T[0] >= 0 ? 12 : -12, T[1] >= 0 ? -10 : 10, T[0] >= 0 ? "left" : "right");
  }

  function update() {
    const [F1, F2] = foci(), T = at(th), d1 = Math.hypot(T[0] - F1[0], T[1] - F1[1]), d2 = Math.hypot(T[0] - F2[0], T[1] - F2[1]);
    seen[bin(th)] = true;
    $(".a-out").textContent = K.n(2 * a); $(".c-out").textContent = K.n(c);
    $(".n-1").textContent = K.n(d1); $(".n-2").textContent = K.n(d2); $(".n-s").textContent = K.n(d1 + d2); $(".n-b").textContent = K.n(b());
    const done = seen.filter(Boolean).length;
    $(".n-p").textContent = `${Math.round(done / NB * 100)}%`;
    const bb = a * a - c * c;
    $(".eq").innerHTML = `F(${ax === "x" ? `${K.n(c)}, 0` : `0, ${K.n(c)}`}), F'(${ax === "x" ? `${K.n(-c)}, 0` : `0, ${K.n(-c)}`}), <i>b</i><sup>2</sup> = <i>a</i><sup>2</sup> − <i>c</i><sup>2</sup> = ${K.n(a * a)} − ${K.n(c * c)} = ${K.n(bb)}<br>` +
      (show ? `자취: ${X}<sup>2</sup>/${K.n(ax === "x" ? a * a : bb)} + ${Y}<sup>2</sup>/${K.n(ax === "x" ? bb : a * a)} = 1` : "연필을 한 바퀴 돌린 뒤 '곡선 보기'를 누르세요.");
    draw();
  }
  const clear = () => seen.fill(false);
  sa.addEventListener("input", () => { a = +sa.value; if (c >= a) { c = a - 0.5; sc.value = c; } clear(); update(); });
  sc.addEventListener("input", () => { c = +sc.value; if (c >= a) { c = a - 0.5; sc.value = c; } clear(); update(); });
  $$(".c-ax").forEach((btn) => btn.addEventListener("click", () => {
    ax = btn.dataset.ax; $$(".c-ax").forEach((x) => x.setAttribute("aria-pressed", String(x === btn))); clear(); update();
  }));
  $(".go-show").addEventListener("click", (e) => { show = !show; e.currentTarget.setAttribute("aria-pressed", String(show)); update(); });
  $(".go-clear").addEventListener("click", () => { clear(); update(); });
  P.drag([{ get: () => at(th), set: (x, y) => {
    const [h, k] = semi(), t0 = th; th = Math.atan2(y / k, x / h);
    let d = th - t0; d -= 2 * Math.PI * Math.round(d / (2 * Math.PI));
    const n = Math.ceil(Math.abs(d) / (Math.PI / NB)) + 1;
    for (let i = 0; i <= n; i++) seen[bin(t0 + d * i / n)] = true;
  } }], update);
  update();
})();
