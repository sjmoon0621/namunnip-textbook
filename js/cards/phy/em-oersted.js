/* 카드: 전류가 흐르면 왜 나침반이 돌까? — 직선 전류의 자기장 + 지구 자기장 수평 성분의 벡터 합 */
(() => {
  const root = document.getElementById("card-phy-oersted");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), iIn = $(".cur"), iOut = $(".cur-out"), earthT = $(".earth");
  const nR = $(".n-r"), nBw = $(".n-bw"), nAng = $(".n-ang");
  const BLUE = "#2f6fa3";

  const MU0_2PI = 2e-7, BE = 30e-6;   // 한국의 지구 자기장 수평 성분 약 30 µT (북쪽)
  const WX = 40, WY = 22.5;           // 보이는 영역 (cm), 도선은 한가운데
  const wx = WX / 2, wy = WY / 2;
  let probe = { x: wx, y: wy - 5 };

  // 자기장 (T), 수학 좌표계(x 동쪽, y 북쪽). 입력은 화면 좌표(cm, y 아래)
  function B(px, py) {
    const I = +iIn.value, dx = (px - wx) / 100, dy = -(py - wy) / 100, r2 = dx * dx + dy * dy;
    // I > 0: 화면에서 나오는 전류 → 위에서 볼 때 시계 반대 방향
    let bx = -MU0_2PI * I * dy / r2, by = MU0_2PI * I * dx / r2;
    if (earthT.checked) by += BE;
    return [bx, by];
  }

  const P = fit(cv, () => draw());
  function compass(ctx, x, y, R, ang, strong) {
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2);
    ctx.fillStyle = strong ? "#fff" : "rgba(255,255,255,.7)"; ctx.fill();
    ctx.strokeStyle = strong ? C.ink : "rgba(35,35,38,.3)"; ctx.lineWidth = strong ? 1.5 : 1; ctx.stroke();
    // 바늘: 화면 각도 (y 아래) = −ang
    const c = Math.cos(ang), s = -Math.sin(ang), n = R * 0.85, wd = R * 0.22;
    ctx.fillStyle = C.warn;
    ctx.beginPath(); ctx.moveTo(x + c * n, y + s * n); ctx.lineTo(x - s * wd, y + c * wd); ctx.lineTo(x + s * wd, y - c * wd); ctx.fill();
    ctx.fillStyle = BLUE;
    ctx.beginPath(); ctx.moveTo(x - c * n, y - s * n); ctx.lineTo(x - s * wd, y + c * wd); ctx.lineTo(x + s * wd, y - c * wd); ctx.fill();
  }

  function draw() {
    const { ctx, size: { w, h } } = P;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = w / WX, X = (x) => x * s, Y = (y) => y * s, I = +iIn.value;
    // 도선의 자기력선 (동심원, 간격은 모식)
    if (Math.abs(I) > 0.05) {
      ctx.strokeStyle = "rgba(59,124,42,.22)"; ctx.lineWidth = 1;
      [2, 4, 7, 11].forEach((r) => {
        ctx.beginPath(); ctx.arc(X(wx), Y(wy), r * s, 0, Math.PI * 2); ctx.stroke();
        const a = -Math.PI / 4, px = X(wx) + r * s * Math.cos(a), py = Y(wy) + r * s * Math.sin(a);
        const t = I > 0 ? a - Math.PI / 2 : a + Math.PI / 2; // 화면에서 시계 반대(I>0)
        ctx.save(); ctx.translate(px, py); ctx.rotate(t); ctx.fillStyle = "rgba(59,124,42,.5)";
        ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(-3, -3.5); ctx.lineTo(-3, 3.5); ctx.fill(); ctx.restore();
      });
    }
    // 작은 나침반 격자
    const R = Math.min(11, s * 1.1);
    for (let gy = 2.25; gy < WY - 2.5; gy += 4.5) for (let gx = 2.5; gx < WX; gx += 5) {
      if (Math.hypot(gx - wx, gy - wy) < 1.6) continue;
      const [bx, by] = B(gx, gy);
      compass(ctx, X(gx), Y(gy), R, Math.atan2(by, bx), false);
    }
    // 도선
    ctx.beginPath(); ctx.arc(X(wx), Y(wy), 12, 0, Math.PI * 2); ctx.fillStyle = C.card; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
    if (I > 0.05) { ctx.beginPath(); ctx.arc(X(wx), Y(wy), 3.5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); }
    else if (I < -0.05) { ctx.beginPath(); ctx.moveTo(X(wx) - 6, Y(wy) - 6); ctx.lineTo(X(wx) + 6, Y(wy) + 6); ctx.moveTo(X(wx) + 6, Y(wy) - 6); ctx.lineTo(X(wx) - 6, Y(wy) + 6); ctx.stroke(); }
    // 큰 나침반 (끌어 옮김)
    const [bx, by] = B(probe.x, probe.y);
    compass(ctx, X(probe.x), Y(probe.y), Math.max(20, R * 2.2), Math.atan2(by, bx), true);
    // 방위
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right";
    const tag = (t, x, y, al) => { ctx.textAlign = al; const m = ctx.measureText(t).width, x0 = al === "right" ? x - m : x;
      ctx.fillStyle = "rgba(251,251,248,.88)"; ctx.fillRect(x0 - 4, y - 11, m + 8, 15); ctx.fillStyle = C.ink2; ctx.fillText(t, x, y); };
    tag("↑ 북", w - 8, 14, "right");
    tag(I > 0.05 ? "전류: 화면에서 나옴 ⊙" : I < -0.05 ? "전류: 화면으로 들어감 ⊗" : "전류 없음", w - 8, h - 6, "right");
    ctx.fillStyle = "rgba(251,251,248,.88)"; ctx.fillRect(4, h - 17, 5 * s + 44, 15);
    ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillRect(10, h - 10, 5 * s, 1.5); ctx.fillText("5 cm", 14 + 5 * s, h - 6);
  }

  function update() {
    const I = +iIn.value;
    iOut.textContent = `${I > 0 ? "+" : ""}${I.toFixed(1)}`;
    const r = Math.hypot(probe.x - wx, probe.y - wy);
    const bw = MU0_2PI * Math.abs(I) / (r / 100);
    const [bx, by] = B(probe.x, probe.y);
    let ang = 90 - Math.atan2(by, bx) * 180 / Math.PI; ang = ((ang % 360) + 360) % 360; // 북에서 시계 방향 방위각
    nR.textContent = `${r.toFixed(1)} cm`;
    nBw.textContent = `${(bw * 1e6).toFixed(1)} µT`;
    nAng.textContent = Math.hypot(bx, by) < 1e-9 ? "—" : ang <= 180 ? `동쪽으로 ${ang.toFixed(0)}°` : `서쪽으로 ${(360 - ang).toFixed(0)}°`;
    draw();
  }
  let drag = false;
  const toCm = (e) => { const r = cv.getBoundingClientRect(), s = r.width / WX; return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s }; };
  const move = (e) => {
    const p = toCm(e);
    let x = clamp(p.x, 1, WX - 1), y = clamp(p.y, 1, WY - 1);
    const d = Math.hypot(x - wx, y - wy);
    if (d < 1.5) { x = wx + (x - wx) / (d || 1) * 1.5; y = wy + (y - wy) / (d || 1) * 1.5; if (!d) x = wx + 1.5; }
    probe = { x, y }; update();
  };
  cv.addEventListener("pointerdown", (e) => { drag = true; cv.setPointerCapture(e.pointerId); move(e); });
  cv.addEventListener("pointermove", (e) => { if (drag) move(e); });
  const up = () => { drag = false; };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  iIn.addEventListener("input", update); earthT.addEventListener("change", update);
  root.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => { iIn.value = b.dataset.i; update(); }));
  update();
})();
