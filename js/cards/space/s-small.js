/* 카드: 명왕성은 왜 행성에서 빠졌을까? — IAU 2006 정의로 분류 */
(() => {
  const root = document.getElementById("card-space-smallbodies");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), n1 = $(".n-1"), n2 = $(".n-2"), n3 = $(".n-3"), nC = $(".n-c"), note = $(".n-note");
  // [이름, 지름 km, 태양 거리 AU, 공전(태양)?, 둥근?, 궤도 청소?, 모양, 설명]
  const B = {
    earth: ["지구", 12742, 1, 1, 1, 1, "round", "암석 행성. 궤도 주변에서 압도적으로 무겁습니다."],
    jup: ["목성", 139820, 5.2, 1, 1, 1, "round", "가장 큰 행성. 트로이 소행성들도 목성의 중력에 붙들려 있습니다."],
    pluto: ["명왕성", 2377, 39.5, 1, 1, 0, "round", "카이퍼 벨트의 천체 중 하나. 해왕성과 궤도가 겹치고, 비슷한 천체와 궤도를 나눕니다."],
    eris: ["에리스", 2326, 67.9, 1, 1, 0, "round", "명왕성과 크기가 비슷하고 질량은 더 큽니다. 발견(2005)이 행성 정의 논쟁을 불렀습니다."],
    ceres: ["세레스", 940, 2.77, 1, 1, 0, "round", "소행성대에서 가장 큰 천체. 1801년 발견 때는 행성, 이후 소행성, 2006년부터 왜소 행성입니다."],
    vesta: ["베스타", 525, 2.36, 1, 0, 0, "lumpy", "거의 둥글지만 남극의 큰 충돌구 때문에 정역학 평형으로 보지 않습니다. 내부가 분화된 소행성입니다."],
    ryugu: ["류구", 0.9, 1.19, 1, 0, 0, "rock", "하야부사 2가 시료를 가져온 탄소질 소행성. 팽이 모양의 잔해 더미입니다."],
    halley: ["핼리 혜성", 11, 17.8, 1, 0, 0, "comet", "약 76년 주기의 혜성. 얼음과 먼지의 핵이 태양에 가까워지면 꼬리가 생깁니다."],
    moon: ["달", 3474, 1, 0, 1, 0, "round", "둥글고 명왕성보다 크지만 태양이 아니라 지구를 공전하므로 위성입니다."],
  };
  let b = "pluto";
  const cls = ([, , , orb, rnd, clr]) => !orb ? "위성 (행성을 공전)" : rnd && clr ? "행성" : rnd ? "왜소 행성" : "태양계 소천체";
  const { ctx, size } = fit(cv, () => draw());
  function body(x, y, r, shape, col) {
    ctx.fillStyle = col; ctx.beginPath();
    if (shape === "round") ctx.arc(x, y, r, 0, Math.PI * 2);
    else { const n = 14; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, rr = r * (shape === "lumpy" ? 1 - 0.12 * Math.sin(3 * a) ** 2 : shape === "rock" ? 0.8 + 0.25 * Math.abs(Math.sin(2 * a)) : 0.7 + 0.3 * Math.abs(Math.cos(a))); i ? ctx.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)) : ctx.moveTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); } }
    ctx.fill();
    if (shape === "comet") { const g = ctx.createLinearGradient(x, y, x + r * 8, y - r * 3); g.addColorStop(0, "rgba(180,210,255,.8)"); g.addColorStop(1, "rgba(180,210,255,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r * 9, y - r * 4); ctx.lineTo(x + r * 9, y - r * 1); ctx.lineTo(x, y + r); ctx.fill(); }
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const d = B[b];
    // 위: 태양으로부터의 거리 (로그)
    const x0 = 20, x1 = w - 20, yb = 34, X = (au) => x0 + (Math.log10(au) + 0.5) / 2.5 * (x1 - x0);
    ctx.fillStyle = "rgba(141,141,146,.2)"; ctx.fillRect(X(2.1), yb - 8, X(3.3) - X(2.1), 16); ctx.fillRect(X(30), yb - 8, X(50) - X(30), 16);
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("소행성대", (X(2.1) + X(3.3)) / 2, yb + 22); ctx.fillText("카이퍼 벨트", (X(30) + X(50)) / 2, yb + 22);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, yb); ctx.lineTo(x1, yb); ctx.stroke();
    [[0.39, "수"], [0.72, "금"], [1, "지"], [1.52, "화"], [5.2, "목"], [9.5, "토"], [19.2, "천"], [30.1, "해"]].forEach(([a, t]) => { ctx.fillStyle = C.ink3; ctx.beginPath(); ctx.arc(X(a), yb, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.fillText(t, X(a), yb - 8); });
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.moveTo(X(d[2]), yb - 6); ctx.lineTo(X(d[2]) - 5, yb - 16); ctx.lineTo(X(d[2]) + 5, yb - 16); ctx.fill();
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("태양에서의 거리 (로그)", x0, 12);
    // 아래: 크기 비교 (지구 = 기준)
    const cy = h * 0.66, R0 = Math.min(58, h * 0.24), rOf = (km) => Math.max(1.5, R0 * Math.sqrt(km / 12742) * (km > 12742 ? 0.45 : 1));
    body(w * 0.2, cy, R0, "round", "#3f8fdf"); ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("지구 (크기 기준)", w * 0.2, cy + R0 + 14);
    const r = b === "jup" ? R0 * 1.8 : R0 * d[1] / 12742; body(w * 0.62, cy, Math.max(2, Math.min(R0 * 1.8, r)), d[6], d[6] === "comet" ? "#8a8a8a" : b === "jup" ? "#c9a27a" : b === "moon" ? "#bbb" : "#a0826a");
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.fillText(`${d[0]} · 지름 ${d[1] < 10 ? d[1] : d[1].toLocaleString()} km`, w * 0.62, cy + Math.min(R0 * 1.8, Math.max(r, 8)) + 16);
    if (r < 3) { ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.sans}`; ctx.fillText("(이 축척에서는 점보다 작음)", w * 0.62, cy - 10); }
  }
  function update() {
    root.querySelectorAll("[data-b]").forEach((q) => q.setAttribute("aria-pressed", String(q.dataset.b === b)));
    const d = B[b], yn = (v) => v ? "예 ✓" : "아니요 ✗"; n1.textContent = d[3] ? "예 ✓" : "아니요 ✗ (지구를 공전)"; n2.textContent = yn(d[4]); n3.textContent = d[3] ? yn(d[5]) : "—"; nC.textContent = cls(d); note.textContent = d[7];
    draw();
  }
  root.querySelectorAll("[data-b]").forEach((q) => q.addEventListener("click", () => { b = q.dataset.b; update(); }));
  update();
})();
