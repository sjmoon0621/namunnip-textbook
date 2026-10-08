/* 카드: 변과 마주 보는 각의 사인은 어떤 관계일까? — 꼭짓점을 끌며 a/sin A = b/sin B = c/sin C = 2R을 확인하고, 지름을 그어 이유를 본다 */
(() => {
  const root = document.getElementById("card-alg-sine-law");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s), cv = $("canvas"), proof = $(".go-proof");
  const W = 10;
  const P = { A: [3.2, 7], B: [1.8, 3], C: [7.8, 3.2] };
  let show = false, drag = null;
  const { ctx, size } = fit(cv, () => draw());
  const sc = () => size.w / W;
  const X = (x) => x * sc(), Y = (y) => size.h - y * sc();
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const ang = (p, q, r) => { const a = d(q, r), b = d(p, r), c = d(p, q); return Math.acos(clamp((b * b + c * c - a * a) / (2 * b * c), -1, 1)); };
  const n = (v, k = 2) => (Math.round(v * 10 ** k) / 10 ** k).toFixed(k);
  const deg = (r) => `${n(r * 180 / Math.PI, 1)}°`;
  const area2 = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (r[0] - p[0]) * (q[1] - p[1]);
  function center() {
    const [ax, ay] = P.A, [bx, by] = P.B, [cx, cy] = P.C, D = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / D;
    const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / D;
    return [ux, uy];
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const O = center(), R = d(O, P.A), s = sc();
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.arc(X(O[0]), Y(O[1]), R * s, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink3; ctx.beginPath(); ctx.arc(X(O[0]), Y(O[1]), 2.5, 0, 7); ctx.fill();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText("O", X(O[0]) + 4, Y(O[1]) + 2);
    if (show) {
      const D = [2 * O[0] - P.B[0], 2 * O[1] - P.B[1]];
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(X(P.B[0]), Y(P.B[1])); ctx.lineTo(X(D[0]), Y(D[1])); ctx.lineTo(X(P.C[0]), Y(P.C[1])); ctx.stroke(); ctx.setLineDash([]);
      const u = [(P.B[0] - P.C[0]) / d(P.B, P.C), (P.B[1] - P.C[1]) / d(P.B, P.C)], v = [(D[0] - P.C[0]) / d(D, P.C), (D[1] - P.C[1]) / d(D, P.C)], k = 0.3;
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(X(P.C[0] + u[0] * k), Y(P.C[1] + u[1] * k)); ctx.lineTo(X(P.C[0] + (u[0] + v[0]) * k), Y(P.C[1] + (u[1] + v[1]) * k)); ctx.lineTo(X(P.C[0] + v[0] * k), Y(P.C[1] + v[1] * k)); ctx.stroke();
      ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(D[0]), Y(D[1]), 4, 0, 7); ctx.fill();
      ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const dx = D[0] - O[0], dy = D[1] - O[1], L = Math.hypot(dx, dy) || 1;
      ctx.fillText("A′", X(D[0] + dx / L * 0.32), Y(D[1] + dy / L * 0.32));
      ctx.fillText("2R", X((P.B[0] + D[0]) / 2) + 10, Y((P.B[1] + D[1]) / 2) - 8);
    }
    ctx.globalAlpha = 0.3; ctx.fillStyle = C.sprout; ctx.beginPath();
    ["A", "B", "C"].forEach((k, i) => (i ? ctx.lineTo(X(P[k][0]), Y(P[k][1])) : ctx.moveTo(X(P[k][0]), Y(P[k][1]))));
    ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.stroke();
    const G = [(P.A[0] + P.B[0] + P.C[0]) / 3, (P.A[1] + P.B[1] + P.C[1]) / 3];
    [["a", "B", "C"], ["b", "C", "A"], ["c", "A", "B"]].forEach(([l, p, q]) => {
      const m = [(P[p][0] + P[q][0]) / 2, (P[p][1] + P[q][1]) / 2], dx = m[0] - G[0], dy = m[1] - G[1], L = Math.hypot(dx, dy) || 1;
      ctx.font = `italic 600 13px ${F.serif}`; ctx.fillStyle = C.forest; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(l, X(m[0] + dx / L * 0.32), Y(m[1] + dy / L * 0.32));
    });
    ["A", "B", "C"].forEach((k) => {
      const [x, y] = P[k], dx = x - G[0], dy = y - G[1], L = Math.hypot(dx, dy) || 1;
      ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(X(x), Y(y), 8, 0, 7); ctx.fill();
      ctx.fillStyle = C.card; ctx.beginPath(); ctx.arc(X(x), Y(y), 3, 0, 7); ctx.fill();
      ctx.font = `600 13px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(k, clamp(X(x + dx / L * 0.42), 8, w - 8), clamp(Y(y + dy / L * 0.42), 8, h - 8));
    });
  }

  function update() {
    const A = ang(P.A, P.B, P.C), B = ang(P.B, P.C, P.A), Cc = Math.PI - A - B;
    const a = d(P.B, P.C), b = d(P.C, P.A), c = d(P.A, P.B), R = d(center(), P.A);
    $(".n-a").textContent = n(a / Math.sin(A)); $(".n-b").textContent = n(b / Math.sin(B));
    $(".n-c").textContent = n(c / Math.sin(Cc)); $(".n-r").textContent = n(2 * R);
    $(".eq").textContent = `a = ${n(a)}, b = ${n(b)}, c = ${n(c)} · A = ${deg(A)}, B = ${deg(B)}, C = ${deg(Cc)}`;
    proof.setAttribute("aria-pressed", String(show));
    $(".proof-note").hidden = !show;
    $(".proof-note").textContent = A > Math.PI / 2 + 1e-9
      ? `A가 둔각입니다. A′ = 180° − A = ${deg(Math.PI - A)}이고 sin A′ = sin A이므로 a = 2R sin A가 그대로 성립합니다.`
      : `∠BCA′ = 90°(지름에 대한 원주각), ∠A′ = ∠A = ${deg(A)}(같은 호 BC에 대한 원주각). 직각삼각형 A′BC에서 a = 2R sin A입니다.`;
    draw();
  }

  const at = (e) => { const r = cv.getBoundingClientRect(), s = sc(); return [(e.clientX - r.left) / s, (size.h - (e.clientY - r.top)) / s]; };
  cv.addEventListener("pointerdown", (e) => {
    const p = at(e); let best = null, bd = 0.7;
    for (const k of ["A", "B", "C"]) { const dd = d(p, P[k]); if (dd < bd) { bd = dd; best = k; } }
    if (best) { drag = best; cv.setPointerCapture(e.pointerId); }
  });
  cv.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const p = at(e), q = [clamp(p[0], 0.4, W - 0.4), clamp(p[1], 0.4, size.h / sc() - 0.4)], old = P[drag];
    P[drag] = q;
    if (Math.abs(area2(P.A, P.B, P.C)) < 1.2 || Math.min(d(P.A, P.B), d(P.B, P.C), d(P.C, P.A)) < 1) P[drag] = old;
    update();
  });
  const end = () => { drag = null; };
  cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
  proof.addEventListener("click", () => { show = !show; update(); });
  root.querySelectorAll(".presets .chip[data-p]").forEach((b) => b.addEventListener("click", () => {
    const v = b.dataset.p.split(",").map(Number);
    P.A = [v[0], v[1]]; P.B = [v[2], v[3]]; P.C = [v[4], v[5]]; update();
  }));
  update();
})();
