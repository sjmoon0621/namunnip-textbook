/* 카드: 두 이동을 하나로 합치면 어떤 화살표가 될까? — 삼각형법·평행사변형법 덧셈과 뺄셈, 끝점을 끌어 비교 */
(() => {
  const root = document.getElementById("card-geo-vec-add");
  if (!root) return;
  const { C, fit, clamp } = NM;
  const V = NMGeoVec;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".presets .chip")];
  const cv = $("canvas");
  const S = [-4, -3];                     // 시점 (격자 좌표)
  let mode = "tri", a = [4, 1], b = [1, 3], view = null;
  const { ctx, size } = fit(cv, () => draw());
  const CA = C.apple, CB = C.amber, CR = C.forest;

  const tipA = () => V.add(S, a);
  const tipB = () => mode === "tri" ? V.add(tipA(), b) : V.add(S, b);
  /* 화살표 가운데 옆에 이름표 */
  function lab(p, q, s, col, side = 1) {
    const [x0, y0] = view.P(p), [x1, y1] = view.P(q), L = Math.hypot(x1 - x0, y1 - y0) || 1;
    V.vlabel(ctx, s, (x0 + x1) / 2 - (y1 - y0) / L * 15 * side, (y0 + y1) / 2 + (x1 - x0) / L * 15 * side, col);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    view = V.plane(w, h, [-6, 6], [-4, 4]);
    V.grid(ctx, view, { axes: false });
    const P = view.P, A = tipA(), B = tipB();
    if (mode === "tri") {
      const R = B;
      V.arrow(ctx, ...P(S), ...P(R), CR, 3.4);
      V.arrow(ctx, ...P(S), ...P(A), CA, 2.6);
      V.arrow(ctx, ...P(A), ...P(B), CB, 2.6);
      lab(S, A, "{a}", CA, 1); lab(A, B, "{b}", CB, 1); lab(S, R, "{a} + {b}", CR, -1);
    } else if (mode === "par") {
      const R = V.add(S, V.add(a, b));
      V.arrow(ctx, ...P(B), ...P(R), CA, 1.5, 8, [5, 4]);
      V.arrow(ctx, ...P(A), ...P(R), CB, 1.5, 8, [5, 4]);
      V.arrow(ctx, ...P(S), ...P(R), CR, 3.4);
      V.arrow(ctx, ...P(S), ...P(A), CA, 2.6);
      V.arrow(ctx, ...P(S), ...P(B), CB, 2.6);
      lab(S, A, "{a}", CA, 1); lab(S, B, "{b}", CB, -1); lab(S, R, "{a} + {b}", CR, -1);
    } else {
      const D = V.sub(a, b), R = V.add(S, D);
      V.arrow(ctx, ...P(S), ...P(R), CR, 1.5, 8, [5, 4]);
      V.arrow(ctx, ...P(S), ...P(A), CA, 2.6);
      V.arrow(ctx, ...P(S), ...P(B), CB, 2.6);
      V.arrow(ctx, ...P(B), ...P(A), CR, 3.4);
      lab(S, A, "{a}", CA, -1); lab(S, B, "{b}", CB, 1); lab(B, A, "{a} − {b}", CR, 1);
    }
    V.dot(ctx, ...P(S), C.ink, 3.5);
    V.dot(ctx, ...P(A), CA, 6, true); V.dot(ctx, ...P(B), CB, 6, true);
  }

  function update() {
    const qa = a[0] ** 2 + a[1] ** 2, qb = b[0] ** 2 + b[1] ** 2;
    const r = mode === "sub" ? V.sub(a, b) : V.add(a, b), qr = r[0] ** 2 + r[1] ** 2;
    $(".n-a").textContent = V.len(qa); $(".n-b").textContent = V.len(qb); $(".n-r").textContent = V.len(qr);
    const sum = Math.sqrt(qa) + Math.sqrt(qb), eq = Math.abs(Math.sqrt(qr) - sum) < 1e-9;
    const ns = $(".n-s"); ns.textContent = V.n(sum); ns.className = `n-s ${eq ? "good" : ""}`;
    $(".d-r").innerHTML = mode === "sub" ? '|<span class="vec"><i>a</i></span> − <span class="vec"><i>b</i></span>|' : '|<span class="vec"><i>a</i></span> + <span class="vec"><i>b</i></span>|';
    draw();
  }

  V.drag(cv, () => view ? [{ id: "A", xy: tipA() }, { id: "B", xy: tipB() }].map((p) => { const [x, y] = view.P(p.xy); return { id: p.id, x, y }; }) : [], (id, px, py) => {
    const q = [clamp(Math.round(view.ix(px)), -6, 6), clamp(Math.round(view.iy(py)), -4, 4)];
    if (id === "A") { const B = tipB(); a = V.sub(q, S); if (mode === "tri") b = V.sub(B, q); }
    else b = V.sub(q, mode === "tri" ? tipA() : S);
    update();
  });
  btns.forEach((x) => x.addEventListener("click", () => { mode = x.dataset.m; btns.forEach((y) => y.setAttribute("aria-pressed", String(y === x))); update(); }));
  update();
})();
