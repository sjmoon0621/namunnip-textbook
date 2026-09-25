/* 카드: 터치스크린은 손가락을 어떻게 알아챌까? — 전극 격자 교차점의 전기 용량 변화 (모식) */
(() => {
  const root = document.getElementById("card-phy-touch");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), hIn = $(".hover"), hOut = $(".hover-out");
  const nS = $(".n-s"), nD = $(".n-d"), nErr = $(".n-err");

  const WX = 64, WY = 36, PITCH = 5;              // 화면 크기 (mm), 전극 간격 5 mm
  const NX = Math.round(WX / PITCH), NY = Math.round(WY / PITCH);
  const OX = (WX - NX * PITCH) / 2, OY = (WY - NY * PITCH) / 2;
  const GLASS = 0.55 / 7;                          // 덮개 유리 0.55 mm, 유전율 7 → 유효 간격 (mm)
  const THRESH = 25;
  // 도구: 접촉 반지름(mm), 사이에 끼는 층(두께 mm, 유전율), 도체인가
  const TOOLS = {
    finger: { r: 4, t: 0, er: 1, cond: true },
    thin: { r: 4, t: 0.3, er: 2, cond: true },
    thick: { r: 4.5, t: 2, er: 1.5, cond: true },
    cpen: { r: 3, t: 0, er: 1, cond: true },
    ppen: { r: 3, t: 0, er: 1, cond: false },
  };
  let tool = "finger", fx = 27.3, fy = 16.1;

  // 한 교차점의 신호: 손가락 접촉면과 교차점 감지 영역(가우스 가중)의 겹침 × 결합 세기 (평행판 어림)
  const SIG = 2.2; // 감지 영역 폭 (mm)
  function overlap(nx, ny, r) {
    let s = 0; const n = 14;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const x = fx - r + 2 * r * (i + 0.5) / n, y = fy - r + 2 * r * (j + 0.5) / n;
      if ((x - fx) ** 2 + (y - fy) ** 2 > r * r) continue;
      s += Math.exp(-((x - nx) ** 2 + (y - ny) ** 2) / (2 * SIG * SIG));
    }
    return s * (2 * r / n) ** 2;
  }
  let NORM = 1;
  function signals() {
    const T = TOOLS[tool];
    const deff = GLASS + T.t / T.er + +hIn.value;       // 직렬로 쌓인 층의 유효 간격
    const k = T.cond ? GLASS / deff : 0;
    const S = [];
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const nx = OX + (i + 0.5) * PITCH, ny = OY + (j + 0.5) * PITCH;
      S.push({ i, j, nx, ny, v: 100 * k * overlap(nx, ny, T.r) / NORM });
    }
    return S;
  }
  { // 정규화: 맨손이 교차점 한가운데를 누를 때 = 100
    const sx = fx, sy = fy; fx = OX + PITCH / 2; fy = OY + PITCH / 2; NORM = overlap(fx, fy, 4); fx = sx; fy = sy;
  }
  function locate(S) {
    const m = S.reduce((a, b) => (b.v > a.v ? b : a));
    if (m.v < THRESH) return null;
    let sw = 0, sx = 0, sy = 0;
    for (const s of S) if (Math.abs(s.i - m.i) <= 1 && Math.abs(s.j - m.j) <= 1) { sw += s.v; sx += s.v * s.nx; sy += s.v * s.ny; }
    return { x: sx / sw, y: sy / sw, max: m.v };
  }

  const P = fit(cv, () => draw());
  function draw() {
    const { ctx, size: { w, h } } = P;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = Math.min(w / WX, h / WY), X = (x) => x * s + (w - WX * s) / 2, Y = (y) => y * s + (h - WY * s) / 2;
    const S = signals(), L = locate(S);
    ctx.fillStyle = "#eef0ea"; ctx.fillRect(X(0), Y(0), WX * s, WY * s);
    // 전극: 가로줄(구동), 세로줄(감지)
    ctx.lineWidth = Math.max(2, s * 1.1);
    ctx.strokeStyle = "rgba(47,111,163,.16)";
    for (let j = 0; j < NY; j++) { const y = Y(OY + (j + 0.5) * PITCH); ctx.beginPath(); ctx.moveTo(X(0), y); ctx.lineTo(X(WX), y); ctx.stroke(); }
    ctx.strokeStyle = "rgba(181,83,47,.14)";
    for (let i = 0; i < NX; i++) { const x = X(OX + (i + 0.5) * PITCH); ctx.beginPath(); ctx.moveTo(x, Y(0)); ctx.lineTo(x, Y(WY)); ctx.stroke(); }
    // 교차점 신호
    for (const q of S) {
      const a = clamp(q.v / 100, 0, 1), r = s * 2.1;
      ctx.fillStyle = q.v >= THRESH ? `rgba(59,124,42,${0.15 + 0.85 * a})` : `rgba(93,93,97,${0.08 + 0.9 * a})`;
      ctx.fillRect(X(q.nx) - r, Y(q.ny) - r, 2 * r, 2 * r);
      if (q.v >= 3 && s > 5) {
        ctx.fillStyle = a > 0.55 ? "#fff" : C.ink2; ctx.font = `${Math.min(10.5, Math.max(8.5, s * 1.4))}px ${F.mono}`; ctx.textAlign = "center";
        ctx.fillText(Math.round(q.v), X(q.nx), Y(q.ny) + 3.5);
      }
    }
    // 손가락 또는 펜
    const T = TOOLS[tool], fxp = X(fx), fyp = Y(fy);
    ctx.beginPath(); ctx.arc(fxp, fyp, T.r * s, 0, Math.PI * 2);
    ctx.fillStyle = T.cond ? "rgba(212,140,110,.22)" : "rgba(140,140,150,.22)"; ctx.fill();
    ctx.setLineDash(+hIn.value > 0 ? [4, 3] : []); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(fxp, fyp, 2.5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    // 계산한 위치
    if (L) {
      const lx = X(L.x), ly = Y(L.y);
      ctx.strokeStyle = C.forest; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(lx - 10, ly); ctx.lineTo(lx + 10, ly); ctx.moveTo(lx, ly - 10); ctx.lineTo(lx, ly + 10); ctx.stroke();
    }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText(`전극 간격 ${PITCH} mm`, X(0) + 4, Y(0) + 12);
    ctx.textAlign = "right";
    ctx.fillText(L ? "초록 십자: 계산한 위치" : `신호가 문턱값 ${THRESH}보다 작음`, X(WX) - 4, Y(0) + 12);
    ctx.textAlign = "left";
  }

  function update() {
    hOut.textContent = (+hIn.value).toFixed(1);
    const S = signals(), L = locate(S), m = Math.max(...S.map((q) => q.v));
    nS.textContent = m.toFixed(0);
    nD.textContent = L ? "터치" : "없음";
    nD.className = L ? "n-d good" : "n-d bad";
    nErr.textContent = L ? `${Math.hypot(L.x - fx, L.y - fy).toFixed(2)} mm` : "—";
    root.querySelectorAll("[data-tool]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tool === tool)));
    draw();
  }

  let drag = false;
  const toMm = (e) => {
    const r = cv.getBoundingClientRect(), s = Math.min(r.width / WX, r.height / WY);
    return { x: (e.clientX - r.left - (r.width - WX * s) / 2) / s, y: (e.clientY - r.top - (r.height - WY * s) / 2) / s };
  };
  const move = (e) => { const p = toMm(e); fx = clamp(p.x, 2, WX - 2); fy = clamp(p.y, 2, WY - 2); update(); };
  cv.addEventListener("pointerdown", (e) => { drag = true; cv.setPointerCapture(e.pointerId); move(e); });
  cv.addEventListener("pointermove", (e) => { if (drag) move(e); });
  const up = () => { drag = false; };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  hIn.addEventListener("input", update);
  root.querySelectorAll("[data-tool]").forEach((b) => b.addEventListener("click", () => { tool = b.dataset.tool; update(); }));
  update();
})();
