/* 카드: 방정식만 보고 타원의 초점과 장축을 찾을 수 있을까? — 가로·세로 반지름과 중심을 바꾸며 표준형·전개형, 초점, 장축·단축 비교 */
(() => {
  const root = document.getElementById("card-geo-ellipse-eq");
  if (!root) return;
  const { C } = NM, K = NMCoord, Q = NMConic;
  const $ = (s) => root.querySelector(s);
  const sh = $(".s-h"), sk = $(".s-k");
  let h = 3, k = 2;
  const O = [0, 0];
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 14 }, () => draw());
  const X = "<i>x</i>", Y = "<i>y</i>";
  const c2 = () => Math.abs(h * h - k * k);
  const wide = () => h >= k;   // 장축이 가로(x축에 평행)인가
  const foci = () => { const c = Math.sqrt(c2()); return wide() ? [[O[0] + c, O[1]], [O[0] - c, O[1]]] : [[O[0], O[1] + c], [O[0], O[1] - c]]; };
  const pm = (v, s) => (s === "0" ? K.n(v) : `${v ? K.n(v) + " " : ""}± ${s}`);

  function draw() {
    if (!P.size.w) return;
    P.grid();
    const [m, n] = O, [F1, F2] = foci();
    const L = wide() ? [[m - h, n], [m + h, n]] : [[m, n - k], [m, n + k]];
    const S = wide() ? [[m, n - k], [m, n + k]] : [[m - h, n], [m + h, n]];
    P.seg(L[0], L[1], C.amber, 3); P.seg(S[0], S[1], C.ink2, 2, [5, 4]);
    P.path(Q.ellipse(m, n, h, k), C.forest, 2.5);
    [...L, ...S].forEach((q) => P.dot(q, C.forest, 4));
    if (h !== k) { P.dot(F1, C.ink, 5); P.dot(F2, C.ink, 5); P.text("F", F1, C.ink, 6, 12, "left"); P.text("F'", F2, C.ink, 6, 12, "left"); }
    P.text("장축", [(L[0][0] + L[1][0]) / 2 + (wide() ? h / 2 : 0), (L[0][1] + L[1][1]) / 2 + (wide() ? 0 : k / 2)], C.amber, wide() ? 0 : 8, wide() ? -11 : 0, wide() ? "center" : "left");
    P.knob(O, C.forest);
    P.text(`중심(${K.n(m)}, ${K.n(n)})`, O, C.forest, -8, wide() ? -13 : 13, "right");
  }

  function update() {
    const [m, n] = O, s = K.surd(c2());
    $(".h-out").textContent = String(h); $(".k-out").textContent = String(k);
    const A = k * k, B = h * h;
    const gen = K.lin([[A, `${X}<sup>2</sup>`], [B, `${Y}<sup>2</sup>`], [-2 * m * A, X], [-2 * n * B, Y], [A * m * m + B * n * n - A * B, ""]]);
    $(".eq").innerHTML = `표준형: ${Q.sq(X, m)}/${h * h} + ${Q.sq(Y, n)}/${k * k} = 1<br>전개하면: ${gen} = 0`;
    $(".n-o").textContent = `(${K.n(m)}, ${K.n(n)})`;
    $(".n-f").textContent = h === k ? "중심 하나 (원)" : wide() ? `(${pm(m, s)}, ${K.n(n)})` : `(${K.n(m)}, ${pm(n, s)})`;
    $(".n-l").textContent = h === k ? `지름 ${2 * h}` : `${2 * Math.max(h, k)} (${wide() ? "가로" : "세로"})`;
    $(".n-s").textContent = h === k ? "—" : String(2 * Math.min(h, k));
    draw();
  }
  sh.addEventListener("input", () => { h = +sh.value; update(); });
  sk.addEventListener("input", () => { k = +sk.value; update(); });
  P.drag([{ get: () => O, set: (x, y) => { O[0] = Math.round(x); O[1] = Math.round(y); } }], update);
  update();
})();
