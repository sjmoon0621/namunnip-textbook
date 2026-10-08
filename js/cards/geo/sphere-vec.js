/* 카드: 중심에서 거리가 같은 점을 벡터로 쓰면? — |p − c| = r, 표준형·일반형, xy평면으로 자른 단면 원 */
(() => {
  const root = document.getElementById("card-geo-sphere-vec");
  if (!root) return;
  const { C, fit } = NM;
  const V = NMGeoVec;
  const $ = (s) => root.querySelector(s), cv = $("canvas"), sr = $(".r");
  const sl = [$(".s1"), $(".s2"), $(".s3")];
  const X = ["x", "y", "z"];
  const view = V.view3({ pitch: 0.32 });
  const { ctx, size } = fit(cv, () => draw());
  const getC = () => sl.map((s) => +s.value);
  const sup = (v) => `<i>${v}</i><sup>2</sup>`;
  const DIR = [0.48, 0.6, 0.64];   // 구 위의 점 P를 고르는 방향 (단위벡터)

  function circle3(c, e1, e2, rad, col, lw, dash, fill) {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    for (let i = 0; i <= 72; i++) {
      const f = i / 72 * 2 * Math.PI, q = view.P(V.add(c, V.add(V.mul(rad * Math.cos(f), e1), V.mul(rad * Math.sin(f), e2))));
      i ? ctx.lineTo(...q) : ctx.moveTo(...q);
    }
    if (fill) { ctx.globalAlpha = .18; ctx.fillStyle = fill; ctx.fill(); ctx.globalAlpha = 1; }
    ctx.stroke(); ctx.restore();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    view.s = Math.min((h - 24) / 8.4, w / 9); view.cx = w / 2; view.cy = h / 2 + 0.2 * view.s;
    V.axes3(ctx, view, 4, { grid: 3 });
    const c = getC(), r = +sr.value, [cx, cy] = view.P(c);
    // 외곽선 (평행투영이라 원)
    ctx.save(); ctx.fillStyle = C.sprout; ctx.globalAlpha = .22; ctx.beginPath(); ctx.arc(cx, cy, view.s * r, 0, 7); ctx.fill(); ctx.restore();
    ctx.save(); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cx, cy, view.s * r, 0, 7); ctx.stroke(); ctx.restore();
    circle3(c, [1, 0, 0], [0, 1, 0], r, C.ink3, 1, [3, 3]);
    circle3(c, [1, 0, 0], [0, 0, 1], r, C.ink3, 1, [3, 3]);
    // xy평면 단면
    const q = r * r - c[2] * c[2];
    if (q > 1e-9) circle3([c[0], c[1], 0], [1, 0, 0], [0, 1, 0], Math.sqrt(q), C.forest, 2.6, null, C.forest);
    else if (Math.abs(q) < 1e-9) { const [x, y] = view.P([c[0], c[1], 0]); V.dot(ctx, x, y, C.forest, 5, true); }
    const P = V.add(c, V.mul(r, DIR));
    V.arrow3(ctx, view, c, P, C.apple, 2.6, 10);
    V.dot(ctx, cx, cy, C.ink, 4.5);
    const [px, py] = view.P(P);
    V.dot(ctx, px, py, C.apple, 5);
    V.text(ctx, "C", cx - 11, cy + 9, C.ink); V.text(ctx, "P", px + 11, py - 9, C.apple);
  }

  function update() {
    const c = getC(), r = +sr.value, q = r * r - c[2] * c[2];
    c.forEach((v, i) => { root.querySelector(`.o${i + 1}`).textContent = V.n(v); });
    $(".r-out").textContent = V.n(r);
    $(".n-cp").textContent = `${V.n(r)} (= r)`;
    $(".n-s").textContent = q > 1e-9 ? "원" : Math.abs(q) < 1e-9 ? "한 점 (접함)" : "만나지 않음";
    $(".n-rr").textContent = q > 1e-9 ? `√${V.n(q)} ≈ ${V.n(Math.sqrt(q))}` : q < -1e-9 ? "—" : "0";
    const std = X.map((v, i) => `${V.shift(v, c[i])}<sup>2</sup>`).join(" + ");
    const k = c.reduce((s, v) => s + v * v, 0) - r * r, L = V.lin(c.map((v) => -2 * v), X, k);
    const gen = `${sup("x")} + ${sup("y")} + ${sup("z")}${L === "0" ? "" : L[0] === "−" ? ` − ${L.slice(1)}` : ` + ${L}`} = 0`;
    $(".eq").innerHTML = `|<span class="vec"><i>p</i></span> − <span class="vec"><i>c</i></span>| = ${V.n(r)}<br>${std} = ${V.n(r * r)}<br>${gen}`;
    draw();
  }
  V.orbit(cv, view, draw);
  sl.forEach((s) => s.addEventListener("input", update)); sr.addEventListener("input", update);
  update();
})();
