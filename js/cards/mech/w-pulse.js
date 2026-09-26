/* 카드: 줄의 끝에 닿은 파동은 어떻게 되돌아올까? — 가우스 펄스의 반사·투과 (고정단, 자유단, 무거운 줄, 가벼운 줄) */
(() => {
  const root = document.getElementById("card-mech-pulse");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), nR = $(".n-r"), nT = $(".n-t"), nV = $(".n-v"), again = $(".again"), pause = $(".pause");
  // 줄 1 (왼쪽)의 속력 v1 = 1 (화면 폭/2.2초), 경계는 x = 0.6
  const B = { fixed: { r: -1, t: 0, v2: 0 }, free: { r: 1, t: 0, v2: 0 } };
  const junction = (mu) => { const z1 = 1, z2 = Math.sqrt(mu); return { r: (z1 - z2) / (z1 + z2), t: 2 * z1 / (z1 + z2), v2: 1 / Math.sqrt(mu) }; };
  B.heavy = junction(4); B.light = junction(0.25);
  let b = "fixed", t = 0, running = true;
  const XB = 0.6, W = 0.05, v1 = 0.35;   // 경계 위치, 펄스 폭, 속력(폭/초)
  const g = (u) => Math.exp(-(u * u) / (2 * W * W));
  function y(x) {
    const s = B[b], x0 = 0.05 + v1 * t;   // 입사 펄스 중심 (반사 없을 때)
    if (x <= XB) return g(x - x0) + s.r * g(x - (2 * XB - x0));   // 입사파 + 경계에 비친 거울상(반사파)
    if (!s.v2) return 0;
    // 투과: 경계를 지난 시간 × v2, 폭도 v2/v1배
    const xt = XB + (x0 - XB) * s.v2;
    return s.t * Math.exp(-((x - xt) ** 2) / (2 * (W * s.v2) ** 2));
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = B[b], mid = h * 0.55, amp = h * 0.28, X = (x) => 20 + x * (w - 40);
    // 줄
    const heavy = b === "heavy", light = b === "light";
    ctx.lineCap = "round";
    const drawSeg = (xa, xb, lw, col) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); for (let i = 0; i <= 300; i++) { const x = xa + (xb - xa) * i / 300; const yy = mid - y(x) * amp; i ? ctx.lineTo(X(x), yy) : ctx.moveTo(X(x), yy); } ctx.stroke(); };
    drawSeg(0, XB, 2.4, C.ink);
    if (s.v2) drawSeg(XB, 1, heavy ? 5 : 1.2, heavy ? "#5d5d61" : "#8d8d92");
    // 경계 표시
    if (b === "fixed") { ctx.fillStyle = "#8d8d92"; ctx.fillRect(X(XB), mid - amp - 20, 10, amp * 2 + 40); }
    if (b === "free") { ctx.strokeStyle = "#8d8d92"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(XB) + 6, mid - amp - 20); ctx.lineTo(X(XB) + 6, mid + amp + 20); ctx.stroke(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(XB) + 6, mid - y(XB - 1e-6) * amp, 6, 0, Math.PI * 2); ctx.stroke(); }
    if (s.v2) { ctx.setLineDash([3, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(XB), mid - amp - 16); ctx.lineTo(X(XB), mid + amp + 16); ctx.stroke(); ctx.setLineDash([]); }
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("줄 1", X(XB / 2), h - 10);
    if (s.v2) ctx.fillText(heavy ? "줄 2 (4배 무거움)" : "줄 2 (1/4배 가벼움)", X((1 + XB) / 2), h - 10);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(X(0), mid); ctx.lineTo(X(1), mid); ctx.stroke(); ctx.setLineDash([]);
  }
  function update() {
    const s = B[b];
    nR.textContent = `${s.r >= 0 ? "+" : "−"}${Math.abs(s.r).toFixed(2)} ${s.r < 0 ? "(뒤집힘)" : "(그대로)"}`;
    nT.textContent = s.v2 ? `+${s.t.toFixed(2)}` : "없음";
    nV.textContent = s.v2 ? `줄 1의 ${s.v2.toFixed(1)}배` : "—";
    root.querySelectorAll("[data-b]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.b === b)));
    draw();
  }
  root.querySelectorAll("[data-b]").forEach((x) => x.addEventListener("click", () => { b = x.dataset.b; t = 0; update(); }));
  again.addEventListener("click", () => { t = 0; draw(); });
  pause.addEventListener("click", () => { running = !running; pause.textContent = running ? "멈춤" : "다시 움직이기"; });
  loop(cv, (dt) => { if (running) { t += dt; if (0.05 + v1 * t > 2 * XB + 0.3) t = 0; } draw(); });
  t = 1.2; update();
})();
