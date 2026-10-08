/* 카드: 두 변수의 조건은 반례를 어디에서 찾을까? — 좌표평면에 P, Q 영역을 칠하고 끄는 점으로 반례를 찾은 뒤 판정 */
(() => {
  const root = document.getElementById("card-cm2-cond-plane");
  if (!root) return;
  const { C, F, fit, axes, clamp } = NM;
  const $ = (s) => root.querySelector(s), cv = $("canvas");
  const ex = [...root.querySelectorAll(".ex .chip")];
  /* 판정은 식으로 증명한 결과를 적어 둔다(그림 범위 밖까지 포함) */
  const EX = [
    { p: (x, y) => x > 0 && y > 0, q: (x, y) => x + y > 0, j: "<b>충분조건.</b> 두 양수의 합은 양수이므로 p ⇒ q입니다. q ⇒ p는 반례 (2, −1)이 있습니다." },
    { p: (x, y) => x > 0 && y > 0, q: (x, y) => x * y > 0, j: "<b>충분조건.</b> 두 양수의 곱은 양수이므로 p ⇒ q입니다. q ⇒ p는 반례 (−1, −1)이 있습니다." },
    { p: (x, y) => x * y > 0 && x + y > 0, q: (x, y) => x > 0 && y > 0, j: "<b>필요충분조건.</b> xy > 0이면 x, y의 부호가 같고, 거기에 x + y > 0이면 둘 다 양수입니다. 거꾸로도 성립하므로 p ⇔ q입니다." },
    { p: (x, y) => x * x + y * y <= 1, q: (x, y) => Math.abs(x) <= 1 && Math.abs(y) <= 1, j: "<b>충분조건.</b> 원 안의 점은 x² ≤ 1, y² ≤ 1이므로 정사각형 안에 있습니다. q ⇒ p는 반례 (0.9, 0.9)가 있습니다(0.81 + 0.81 = 1.62 > 1)." },
    { p: (x, y) => x + y > 2, q: (x, y) => x > 1 || y > 1, j: "<b>충분조건.</b> 대우 'x ≤ 1 그리고 y ≤ 1이면 x + y ≤ 2'가 참이므로 p ⇒ q입니다. q ⇒ p는 반례 (2, −3)이 있습니다." },
    { p: (x) => x >= 0, q: (x, y) => x + y >= 0, j: "<b>어느 쪽도 아닙니다.</b> p ⇒ q의 반례 (1, −2), q ⇒ p의 반례 (−1, 2)가 있습니다." },
  ];
  let k = 0, pt = { x: 1.5, y: -0.5 }, shown = false, drag = false, map = null;
  const { ctx, size } = fit(cv, () => draw());
  const fmt = (v) => (v < 0 ? "−" : "") + Math.abs(v).toFixed(1);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 30, y0 = 8, gw = w - x0 - 10, gh = h - y0 - 24, L = 3;
    const X = (x) => x0 + (x + L) / (2 * L) * gw, Y = (y) => y0 + (L - y) / (2 * L) * gh;
    map = { x0, y0, gw, gh, L };
    const e = EX[k], s = 3;
    for (let py = y0; py < y0 + gh; py += s) for (let px = x0; px < x0 + gw; px += s) {
      const x = ((px + s / 2 - x0) / gw) * 2 * L - L, y = L - ((py + s / 2 - y0) / gh) * 2 * L, P = e.p(x, y), Q = e.q(x, y);
      if (P) { ctx.fillStyle = C.sprout; ctx.fillRect(px, py, s, s); }
      if (Q) { ctx.fillStyle = C.amber; ctx.globalAlpha = 0.32; ctx.fillRect(px, py, s, s); ctx.globalAlpha = 1; }
    }
    const t = [-3, -2, -1, 0, 1, 2, 3].map((v) => [v, v < 0 ? "−" + -v : String(v)]);
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: t, yt: t });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x0 + gw, Y(0)); ctx.moveTo(X(0), y0); ctx.lineTo(X(0), y0 + gh); ctx.stroke();
    const P = e.p(pt.x, pt.y), Q = e.q(pt.x, pt.y), bad = P !== Q;
    ctx.beginPath(); ctx.arc(X(pt.x), Y(pt.y), 7, 0, Math.PI * 2); ctx.fillStyle = bad ? C.warn : C.ink; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = C.card; ctx.stroke();
    ctx.font = `600 11px ${F.sans}`; ctx.textBaseline = "middle";
    const lg = [["P", C.sprout, 1], ["Q", C.amber, 0.32]];
    lg.forEach(([tx, col, al], i) => { const lx = x0 + 8 + i * 44; ctx.globalAlpha = al; ctx.fillStyle = col; ctx.fillRect(lx, y0 + 6, 14, 12); ctx.globalAlpha = 1; ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.fillText(tx, lx + 18, y0 + 12); });
  }
  function update() {
    const e = EX[k], P = e.p(pt.x, pt.y), Q = e.q(pt.x, pt.y);
    $(".n-pt").textContent = `(${fmt(pt.x)}, ${fmt(pt.y)})`;
    $(".n-pq").textContent = `${P ? "참" : "거짓"}, ${Q ? "참" : "거짓"}`;
    const kd = $(".n-kind");
    kd.textContent = P && !Q ? "p ⇒ q의 반례" : Q && !P ? "q ⇒ p의 반례" : "반례 아님"; kd.className = `n-kind ${P !== Q ? "bad" : ""}`;
    $(".msg").innerHTML = shown ? e.j : "반례를 먼저 찾아본 뒤 '판정 보기'를 누르세요.";
    draw();
  }
  const setPt = (ev) => {
    if (!map) return;
    const r = cv.getBoundingClientRect(), { x0, y0, gw, gh, L } = map;
    pt = { x: clamp(Math.round((((ev.clientX - r.left - x0) / gw) * 2 * L - L) * 10) / 10, -L, L), y: clamp(Math.round((L - ((ev.clientY - r.top - y0) / gh) * 2 * L) * 10) / 10, -L, L) };
    update();
  };
  cv.addEventListener("pointerdown", (ev) => { drag = true; cv.setPointerCapture(ev.pointerId); setPt(ev); });
  cv.addEventListener("pointermove", (ev) => { if (drag) setPt(ev); });
  cv.addEventListener("pointerup", () => { drag = false; });
  cv.addEventListener("pointercancel", () => { drag = false; });
  ex.forEach((b) => b.addEventListener("click", () => { k = +b.dataset.k; shown = false; ex.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  $(".go-judge").addEventListener("click", () => { shown = true; update(); });
  update();
})();
