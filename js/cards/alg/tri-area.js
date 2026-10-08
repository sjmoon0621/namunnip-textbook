/* 카드: 높이를 재지 않고 삼각형의 넓이를 구할 수 있을까? — 꼭짓점 C를 끌며 ½bc sin A, 헤론 공식, abc/4R을 비교한다 */
(() => {
  const root = document.getElementById("card-alg-tri-area");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s), cv = $("canvas");
  const W = 10;
  const A = [1.5, 1.2], B = [8.5, 1.2];
  let P = [3.5, 4.6], drag = false;
  const { ctx, size } = fit(cv, () => draw());
  const sc = () => size.w / W, X = (x) => x * sc(), Y = (y) => size.h - y * sc();
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const n = (v, k = 2) => (Math.round(v * 10 ** k) / 10 ** k).toFixed(k);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = sc();
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath();
    for (let x = 0; x <= W; x++) { ctx.moveTo(X(x), 0); ctx.lineTo(X(x), h); }
    for (let y = 0; y * s <= h; y++) { ctx.moveTo(0, Y(y)); ctx.lineTo(w, Y(y)); }
    ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(0, Y(P[1])); ctx.lineTo(w, Y(P[1])); ctx.stroke();
    ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(P[0]), Y(P[1])); ctx.lineTo(X(P[0]), Y(A[1])); ctx.stroke(); ctx.setLineDash([]);
    if (P[0] < A[0] || P[0] > B[0]) { ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(Math.min(A[0], P[0])), Y(A[1])); ctx.lineTo(X(Math.max(B[0], P[0])), Y(A[1])); ctx.stroke(); ctx.setLineDash([]); }
    ctx.globalAlpha = 0.35; ctx.fillStyle = C.sprout; ctx.beginPath(); ctx.moveTo(X(A[0]), Y(A[1])); ctx.lineTo(X(B[0]), Y(B[1])); ctx.lineTo(X(P[0]), Y(P[1])); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.stroke();
    const angA = Math.atan2(P[1] - A[1], P[0] - A[0]);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(A[0]), Y(A[1]), 24, -angA, 0); ctx.stroke();
    ctx.font = `600 13px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("A", X(A[0]) - 12, Y(A[1]) + 6); ctx.fillText("B", X(B[0]) + 12, Y(B[1]) + 6);
    ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(X(P[0]), Y(P[1]), 8, 0, 7); ctx.fill();
    ctx.fillStyle = C.card; ctx.beginPath(); ctx.arc(X(P[0]), Y(P[1]), 3, 0, 7); ctx.fill();
    ctx.fillStyle = C.ink; ctx.fillText("C", X(P[0]), Y(P[1]) - 16);
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.amber; ctx.textAlign = "left";
    ctx.fillText(`h = b sin A = ${n(P[1] - A[1])}`, clamp(X(P[0]) + 6, 2, w - 130), Y((P[1] + A[1]) / 2));
  }

  function update() {
    const a = d(B, P), b = d(A, P), c = d(A, B), h = P[1] - A[1];
    const cosA = ((P[0] - A[0]) * (B[0] - A[0])) / (b * c), sinA = h / b;
    const S1 = 0.5 * b * c * sinA, s = (a + b + c) / 2, S2 = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)));
    const angA = Math.acos(clamp(cosA, -1, 1)), R = a / (2 * Math.sin(angA));
    $(".eq").textContent = `a = ${n(a)}, b = ${n(b)}, c = ${n(c)}, A = ${n(angA * 180 / Math.PI, 1)}°, R = a/(2 sin A) = ${n(R)}`;
    $(".n-1").textContent = n(S1); $(".n-2").textContent = n(S2); $(".n-3").textContent = n(a * b * c / (4 * R));
    draw();
  }

  const at = (e) => { const r = cv.getBoundingClientRect(), s = sc(); return [(e.clientX - r.left) / s, (size.h - (e.clientY - r.top)) / s]; };
  const move = (e) => { const p = at(e); P = [clamp(Math.round(p[0] * 10) / 10, 0.3, W - 0.3), clamp(Math.round(p[1] * 10) / 10, A[1] + 0.8, size.h / sc() - 0.4)]; update(); };
  cv.addEventListener("pointerdown", (e) => { if (d(at(e), P) < 0.8) { drag = true; cv.setPointerCapture(e.pointerId); } });
  cv.addEventListener("pointermove", (e) => { if (drag) move(e); });
  cv.addEventListener("pointerup", () => { drag = false; }); cv.addEventListener("pointercancel", () => { drag = false; });
  update();
})();
