/* 카드: 자석을 코일에 넣으면 전류는 어느 쪽으로 흐를까? — 패러데이 법칙과 렌츠 법칙
   자석은 자기 쌍극자(m = 1 A·m², 1 cm³ 네오디뮴 자석 정도)로 본 모식.
   코일: 200회, 반지름 1.5 cm, 길이 2 cm, 저항 5 Ω. 축 위 쌍극자가 고리 하나를 지나는 선속: Φ = μ₀ m a² / 2(a² + z²)^{3/2} */
(() => {
  const root = document.getElementById("card-phy-lenz");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const nPhi = $(".n-phi"), nE = $(".n-emf"), nI = $(".n-i");
  const BLUE = "#2f6fa3";

  const MU0 = 4e-7 * Math.PI, M = 1, NT = 200, A = 0.015, LEN = 0.02, RES = 5, SUB = 20;
  const WX = 0.24;                          // 보이는 축 길이 (m), 코일 중심 = 0
  let pol = 1;                              // +1: 자석의 N극이 오른쪽(코일 쪽)
  let xm = -0.08, xPrev = xm, emfS = 0, auto = false, autoV = 0;
  const hist = [];                          // [t, Φ, ε]
  let tNow = 0;

  // 코일 전체의 선속 (Wb·회), +x 방향을 양으로
  function flux(x) {
    let s = 0;
    for (let k = 0; k < SUB; k++) {
      const zc = -LEN / 2 + LEN * (k + 0.5) / SUB, z = x - zc;
      s += MU0 * M * A * A / (2 * Math.pow(A * A + z * z, 1.5));
    }
    return pol * s * NT / SUB;
  }

  const P = fit(cv, () => draw());
  function draw() {
    const { ctx, size: { w, h } } = P;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const sh = h * 0.56, s = w / WX, X = (x) => w / 2 + x * s, cy = sh * 0.52;
    const I = emfS / RES;                       // 유도 전류 (A), + 이면 코일 속 자기장이 +x
    // 코일: 고리들 (뒤쪽 반은 흐리게)
    const ca = A * s, n = 12;
    for (let k = 0; k < n; k++) {
      const x = X(-LEN / 2 + LEN * (k + 0.5) / n);
      ctx.strokeStyle = "rgba(184,115,51,.35)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(x, cy, ca * 0.28, ca, 0, -Math.PI / 2, Math.PI / 2, true); ctx.stroke();
    }
    // 자석
    const mw = 0.04 * s, mh = Math.max(14, 0.012 * s), mx = X(xm);
    const leftC = pol > 0 ? BLUE : C.warn, rightC = pol > 0 ? C.warn : BLUE;
    ctx.fillStyle = leftC; ctx.fillRect(mx - mw / 2, cy - mh / 2, mw / 2, mh);
    ctx.fillStyle = rightC; ctx.fillRect(mx, cy - mh / 2, mw / 2, mh);
    ctx.fillStyle = "#fff"; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(pol > 0 ? "S" : "N", mx - mw / 4, cy + 4); ctx.fillText(pol > 0 ? "N" : "S", mx + mw / 4, cy + 4);
    // 코일 앞면
    for (let k = 0; k < n; k++) {
      const x = X(-LEN / 2 + LEN * (k + 0.5) / n);
      ctx.strokeStyle = "#b87333"; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.ellipse(x, cy, ca * 0.28, ca, 0, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    }
    // 유도 전류 방향 (앞면에서 I>0 이면 아래로) 과 코일 양 끝의 극
    if (Math.abs(I) > 2e-4) {
      const d = I > 0 ? 1 : -1, x = X(LEN / 2) + ca * 0.28 + 12;
      ctx.strokeStyle = C.forest; ctx.fillStyle = C.forest; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, cy - d * 14); ctx.lineTo(x, cy + d * 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, cy + d * 17); ctx.lineTo(x - 5, cy + d * 8); ctx.lineTo(x + 5, cy + d * 8); ctx.fill();
      ctx.font = `600 12px ${F.mono}`;
      const pl = I > 0 ? "S" : "N", pr = I > 0 ? "N" : "S";
      ctx.fillStyle = pl === "N" ? C.warn : BLUE; ctx.fillText(pl, X(-LEN / 2) - 10, cy - ca - 6);
      ctx.fillStyle = pr === "N" ? C.warn : BLUE; ctx.fillText(pr, X(LEN / 2) + 10, cy - ca - 6);
      ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.fillText("유도 전류가 만든 극", X(0), cy - ca - 20);
    }
    // 검류계
    const gx = w - 44, gy = 34, gr = 26;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(gx, gy + 8, gr, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    const needle = -Math.PI / 2 + clamp(I / 0.02, -1, 1) * 0.7;
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx, gy + 8); ctx.lineTo(gx + gr * Math.cos(needle), gy + 8 + gr * Math.sin(needle)); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.fillText("검류계", gx, gy + 24);
    ctx.textAlign = "left";
    ctx.fillText("자석을 좌우로 끌어 보세요", 8, 14);

    // 그래프: 최근 4초의 선속과 기전력
    const gy0 = sh + 10, gh = h - gy0 - 22, gx0 = 40, gw = w - gx0 - 10, span = 4;
    const Tx = (t) => gx0 + (t - (tNow - span)) / span * gw;
    const phiMax = flux(0) * pol || 1, eMax = 0.2;
    const Yp = (v) => gy0 + gh / 2 - v / Math.abs(phiMax) * gh / 2 * 0.9, Ye = (v) => gy0 + gh / 2 - clamp(v / eMax, -1.1, 1.1) * gh / 2 * 0.9;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(gx0 + .5, gy0 + .5, gw, gh);
    ctx.beginPath(); ctx.moveTo(gx0, gy0 + gh / 2 + .5); ctx.lineTo(gx0 + gw, gy0 + gh / 2 + .5); ctx.stroke();
    const trace = (idx, Y, col) => {
      ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.beginPath();
      hist.forEach((p, i) => (i ? ctx.lineTo(Tx(p[0]), Y(p[idx])) : ctx.moveTo(Tx(p[0]), Y(p[idx]))));
      ctx.stroke();
    };
    trace(1, Yp, C.ink3); trace(2, Ye, C.forest);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.fillText("선속 Φ", gx0 + 4, gy0 + 12);
    ctx.fillStyle = C.forest; ctx.fillText("기전력 ε (±0.2 V)", gx0 + 60, gy0 + 12);
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("최근 4초", gx0 + gw, gy0 + gh + 14);
    ctx.textAlign = "left";
  }

  function tick(dt) {
    if (auto) {
      xm += autoV * dt;
      if (xm > WX / 2 - 0.03) { xm = WX / 2 - 0.03; auto = false; }
    }
    // 기전력 = −dΦ/dt (보여 주는 값은 짧게 평활)
    if (auto) emfS = -(flux(xm + 1e-5) - flux(xm - 1e-5)) / 2e-5 * autoV;   // 일정한 속력: 정확한 미분
    else { const e = dt > 0 ? -(flux(xm) - flux(xPrev)) / dt : 0; emfS += (e - emfS) * Math.min(1, dt * 30); }
    xPrev = xm; tNow += dt;
    hist.push([tNow, flux(xm), emfS]);
    while (hist.length && hist[0][0] < tNow - 4) hist.shift();
    const ph = flux(xm);
    nPhi.textContent = `${(ph * 1000).toFixed(2)} mWb`;
    nE.textContent = `${emfS >= 0 ? "+" : "−"}${Math.abs(emfS).toFixed(3)} V`;
    nI.textContent = `${emfS / RES >= 0 ? "+" : "−"}${Math.abs(emfS / RES * 1000).toFixed(1)} mA`;
    draw();
  }

  let drag = false, dx = 0;
  const toX = (e) => { const r = cv.getBoundingClientRect(); return (e.clientX - r.left - r.width / 2) / (r.width / WX); };
  cv.addEventListener("pointerdown", (e) => {
    const x = toX(e);
    if (Math.abs(x - xm) < 0.035) { drag = true; auto = false; dx = x - xm; cv.setPointerCapture(e.pointerId); }
  });
  cv.addEventListener("pointermove", (e) => { if (drag) xm = clamp(toX(e) - dx, -WX / 2 + 0.03, WX / 2 - 0.03); });
  const up = () => { drag = false; };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  root.querySelectorAll("[data-pass]").forEach((b) => b.addEventListener("click", () => {
    xm = xPrev = -0.095; auto = true; autoV = +b.dataset.pass;
  }));
  $(".flip").addEventListener("click", () => { pol = -pol; xPrev = xm; hist.length = 0; });
  loop(cv, (dt) => tick(dt));
  tick(0);
})();
