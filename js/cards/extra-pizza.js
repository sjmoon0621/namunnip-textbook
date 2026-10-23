/* 카드: 칼선이 어떻게 만나야 조각이 가장 많아질까? — 피자 자르기와 교점 세기 */
(() => {
  const root = document.getElementById("card-extra-pizza");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = root.querySelector("canvas");
  const sN = $(".n"), oN = $(".n-out");
  const dPieces = $(".pieces"), dCross = $(".cross"), dMax = $(".max");
  let mode = "spread", lines = [];

  // 단위원 안의 칼선: 점 p와 방향 u로 둔 직선
  function makeLines(n) {
    const out = [];
    for (let k = 0; k < 10; k++) {
      if (mode === "center") {
        const a = Math.PI * k / n;
        out.push({ p: [0, 0], u: [Math.cos(a), Math.sin(a)] });
      } else if (mode === "spread") {
        // 기울기를 고르게 벌리고 중심에서 조금씩만 비키면 모든 교점이 피자 안에 생긴다
        const a = Math.PI * (k + 0.35 + 0.3 * Math.random()) / 10;
        const d = (Math.random() - 0.5) * 0.2;
        out.push({ p: [-d * Math.sin(a), d * Math.cos(a)], u: [Math.cos(a), Math.sin(a)] });
      } else {
        const t1 = Math.random() * Math.PI * 2, t2 = t1 + 0.6 + Math.random() * (Math.PI * 2 - 1.2);
        const A = [Math.cos(t1), Math.sin(t1)], B = [Math.cos(t2), Math.sin(t2)];
        const L = Math.hypot(B[0] - A[0], B[1] - A[1]);
        out.push({ p: A, u: [(B[0] - A[0]) / L, (B[1] - A[1]) / L] });
      }
    }
    return out;
  }
  // 직선과 단위원의 두 끝점
  function chord(l) {
    const b = l.p[0] * l.u[0] + l.p[1] * l.u[1], c = l.p[0] ** 2 + l.p[1] ** 2 - 1;
    const s = Math.sqrt(Math.max(0, b * b - c));
    return [[l.p[0] + (-b - s) * l.u[0], l.p[1] + (-b - s) * l.u[1]], [l.p[0] + (-b + s) * l.u[0], l.p[1] + (-b + s) * l.u[1]]];
  }
  function meet(a, b) {
    const det = a.u[0] * -b.u[1] - a.u[1] * -b.u[0];
    if (Math.abs(det) < 1e-9) return null;
    const dx = b.p[0] - a.p[0], dy = b.p[1] - a.p[1];
    const t = (dx * -b.u[1] - dy * -b.u[0]) / det;
    const x = a.p[0] + t * a.u[0], y = a.p[1] + t * a.u[1];
    return x * x + y * y < 0.999 ? [x, y] : null;
  }
  // 칼선을 하나씩 더하며 조각 수를 센다: 새 칼선 위 서로 다른 교점 수 + 1
  function count(n) {
    let pieces = 1; const pts = [];
    for (let k = 0; k < n; k++) {
      const here = [];
      for (let j = 0; j < k; j++) {
        const q = meet(lines[k], lines[j]);
        if (q && !here.some((h) => Math.hypot(h[0] - q[0], h[1] - q[1]) < 1e-6)) here.push(q);
      }
      pieces += here.length + 1;
      for (const q of here) if (!pts.some((h) => Math.hypot(h[0] - q[0], h[1] - q[1]) < 1e-6)) pts.push(q);
    }
    return { pieces, pts };
  }

  const V = fit(cv, () => draw());
  function draw() {
    const { ctx, size: { w, h } } = V; if (!w) return;
    const n = +sN.value, R = Math.min(w, h) / 2 - 12, cx = w / 2, cy = h / 2;
    const X = (p) => cx + p[0] * R, Y = (p) => cy - p[1] * R;
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(224,160,42,.28)"; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = "rgba(181,83,47,.55)"; ctx.stroke();
    ctx.lineWidth = 1.6; ctx.strokeStyle = C.ink;
    for (let k = 0; k < n; k++) {
      const [A, B] = chord(lines[k]);
      ctx.beginPath(); ctx.moveTo(X(A), Y(A)); ctx.lineTo(X(B), Y(B)); ctx.stroke();
    }
    const { pts } = count(n);
    ctx.fillStyle = C.warn;
    for (const q of pts) { ctx.beginPath(); ctx.arc(X(q), Y(q), 3.5, 0, Math.PI * 2); ctx.fill(); }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("빨간 점은 피자 안의 교점", 6, h - 6);
  }
  function update() {
    const n = +sN.value; oN.textContent = n;
    const { pieces, pts } = count(n);
    const max = (n * n + n + 2) / 2;
    dPieces.textContent = `${pieces}조각`;
    dPieces.classList.toggle("good", pieces === max);
    dCross.textContent = `${pts.length}개`;
    dMax.textContent = `${max}조각`;
    draw();
  }
  function reset() { lines = makeLines(+sN.value); update(); }
  sN.addEventListener("input", () => { if (mode === "center") lines = makeLines(+sN.value); update(); });
  root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => {
    mode = b.dataset.mode;
    root.querySelectorAll("[data-mode]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    reset();
  }));
  $("[data-act=shuffle]").addEventListener("click", reset);
  reset();
})();
