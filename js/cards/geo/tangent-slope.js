/* 카드: 기울기가 정해진 접선은 어떻게 찾을까? — 직선 y = mx + k를 이차곡선에 대입한 이차방정식의 판별식 D로 교점 수를 보고, D = 0이 되는 k를 찾는다 */
(() => {
  const root = document.getElementById("card-geo-tangent-slope");
  if (!root) return;
  const { C } = NM, K = NMCoord, Q = NMConic;
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  const sm = $(".s-m"), sk = $(".s-k");
  /* 곡선: 포물선 y² = 8x (p = 2), 타원 x²/9 + y²/4 = 1, 쌍곡선 x²/4 − y² = 1 */
  const CUR = {
    par: { p: 2 },
    ell: { a2: 9, b2: 4 },
    hyp: { a2: 4, b2: 1 },
  };
  let cur = "ell", m = 1, k = 1, all = false;
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 14 }, () => draw());
  const X = "<i>x</i>";

  /* y = mx + k를 대입한 Ax² + Bx + C = 0의 계수 */
  function coef(kk = k) {
    if (cur === "par") { const { p } = CUR.par; return [m * m, 2 * m * kk - 4 * p, kk * kk]; }
    if (cur === "ell") { const { a2, b2 } = CUR.ell; return [b2 + a2 * m * m, 2 * a2 * m * kk, a2 * (kk * kk - b2)]; }
    const { a2, b2 } = CUR.hyp; return [b2 - a2 * m * m, -2 * a2 * m * kk, -a2 * (kk * kk + b2)];
  }
  /* D = 0이 되는 k 목록 */
  function tanK() {
    if (cur === "par") return m === 0 ? [] : [CUR.par.p / m];
    if (cur === "ell") { const r = Math.sqrt(CUR.ell.a2 * m * m + CUR.ell.b2); return [r, -r]; }
    const v = CUR.hyp.a2 * m * m - CUR.hyp.b2; if (v <= 0) return []; const r = Math.sqrt(v); return [r, -r];
  }
  const curve = () => {
    if (cur === "par") return [Q.parab("x", 0, 0, CUR.par.p)];
    if (cur === "ell") return [Q.ellipse(0, 0, 3, 2)];
    return Q.hyper("x", 0, 0, 2, 1);
  };
  /* 판별식이 0인가 (부동소수 오차를 계수 크기에 비례해 허용) */
  const zero = (A, B, Cc) => Math.abs(B * B - 4 * A * Cc) <= 1e-9 * (B * B + Math.abs(4 * A * Cc)) + 1e-12;
  function roots() {
    const [A, B, Cc] = coef();
    if (Math.abs(A) < 1e-12) return Math.abs(B) < 1e-12 ? [] : [-Cc / B];
    const D = B * B - 4 * A * Cc;
    if (zero(A, B, Cc)) return [-B / (2 * A)];
    if (D < 0) return [];
    return [(-B + Math.sqrt(D)) / (2 * A), (-B - Math.sqrt(D)) / (2 * A)];
  }

  function draw() {
    if (!P.size.w) return;
    P.grid();
    curve().forEach((pts) => P.path(pts, C.forest, 2.5));
    if (all) tanK().forEach((t) => P.line(m, -1, t, C.amber, 1.5, [6, 4]));
    const [A, B, Cc] = coef(), D = B * B - 4 * A * Cc, lin = Math.abs(A) < 1e-12;
    const col = !lin && zero(A, B, Cc) ? C.forest : C.warn;
    P.line(m, -1, k, col, 2.2);
    roots().forEach((x) => P.dot([x, m * x + k], col, 5.5));
  }

  function update() {
    const [A, B, Cc] = coef(), D = B * B - 4 * A * Cc, lin = Math.abs(A) < 1e-12, tk = tanK();
    $(".m-out").textContent = K.n(m); $(".k-out").textContent = K.n(k);
    $(".eq").innerHTML = `직선 <i>y</i> = ${K.lin([[m, X], [k, ""]])}을 대입하면<br>${K.lin([[A, `${X}<sup>2</sup>`], [B, X], [Cc, ""]])} = 0`;
    $(".n-d").textContent = lin ? "이차식 아님" : zero(A, B, Cc) ? "0" : K.n(D);
    const e = $(".n-r"), n = roots().length;
    const tangent = !lin && zero(A, B, Cc);
    e.textContent = tangent ? "접한다 (1개)" : lin ? (n ? "1개 (접선 아님)" : "0개") : `${n}개`;
    e.className = `n-r ${tangent ? "good" : ""}`;
    $(".n-k").textContent = tk.length ? tk.map((t) => K.n(t)).join(", ") : "없음";
    draw();
  }
  $$(".c-cur").forEach((btn) => btn.addEventListener("click", () => {
    cur = btn.dataset.c; $$(".c-cur").forEach((x) => x.setAttribute("aria-pressed", String(x === btn))); update();
  }));
  sm.addEventListener("input", () => { m = +sm.value; update(); });
  sk.addEventListener("input", () => { k = +sk.value; update(); });
  $(".go-fit").addEventListener("click", () => {
    const tk = tanK(); if (!tk.length) { update(); return; }
    k = tk.reduce((best, t) => (Math.abs(t - k) < Math.abs(best - k) ? t : best), tk[0]); sk.value = k; update();
  });
  $(".go-all").addEventListener("click", (e) => { all = !all; e.currentTarget.setAttribute("aria-pressed", String(all)); update(); });
  update();
})();
