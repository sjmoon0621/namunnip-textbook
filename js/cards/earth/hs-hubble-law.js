/* 카드: 멀리 있는 은하일수록 왜 빨리 멀어질까? — 허블–르메트르 법칙에 직선 맞추기 (자료는 모식) */
(() => {
  const root = document.getElementById("card-earth-hlaw");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sH = $(".h0"), oH = $(".h0-out");
  const nFit = $(".fit"), nAge = $(".age"), nBest = $(".best"), msg = $(".hl-msg");
  const TRUE_H = 70, DMAX = 400;   // 모식 자료를 만든 기울기 (km/s/Mpc), 거리 범위 (Mpc)

  // 모식 자료: v = 70 d + 은하의 고유 운동 (표준 편차 약 400 km/s)
  let s = 42; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const gauss = () => { let u = 0; for (let i = 0; i < 6; i++) u += rnd(); return (u - 3) / Math.sqrt(0.5); };
  const DATA = Array.from({ length: 28 }, () => { const d = 8 + rnd() * (DMAX - 12); return [d, TRUE_H * d + 400 * gauss()]; });
  // 최소 제곱 기울기 (원점을 지나는 직선)
  const BEST = DATA.reduce((a, [d, v]) => a + d * v, 0) / DATA.reduce((a, [d]) => a + d * d, 0);
  const rms = (H) => Math.sqrt(DATA.reduce((a, [d, v]) => a + (v - H * d) ** 2, 0) / DATA.length);
  // 1/H0 → 년 (1 Mpc = 3.0857×10¹⁹ km)
  const ageGyr = (H) => 3.0857e19 / H / 3.156e7 / 1e9;

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const H = +sH.value, x0 = 52, y0 = 22, pw = w - x0 - 12, ph = h - y0 - 38;
    const VMAX = 32000;
    const X = (d) => x0 + d / DMAX * pw, Y = (v) => y0 + (1 - v / VMAX) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [0, 100, 200, 300, 400].map((d) => [d, `${d}`]), yt: [0, 10000, 20000, 30000].map((v) => [v, `${v / 1000}천`]), ylabel: "후퇴 속도 (km/s)", xlabel: "거리 (Mpc, 1 Mpc ≈ 326만 광년)" });
    // 잔차
    DATA.forEach(([d, v]) => { ctx.strokeStyle = "rgba(181,83,47,.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(d), Y(v)); ctx.lineTo(X(d), Y(Math.min(VMAX, H * d))); ctx.stroke(); });
    // 직선
    const dEnd = Math.min(DMAX, VMAX / H);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(dEnd), Y(H * dEnd)); ctx.stroke();
    DATA.forEach(([d, v]) => { ctx.beginPath(); ctx.arc(X(d), Y(v), 4, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); });
    ctx.font = `600 11px ${F.mono}`; ctx.fillStyle = C.forest; ctx.textAlign = "left";
    ctx.fillText(`v = ${H} × d`, X(Math.min(dEnd, DMAX) * 0.55) + 8, Y(H * Math.min(dEnd, DMAX) * 0.55) - 6);
    if (H >= 400) { ctx.fillStyle = C.warn; ctx.font = `10.5px ${F.sans}`; ctx.fillText("허블(1929)의 값 근처", x0 + 8, y0 + 14); }
  }

  function update() {
    const H = +sH.value;
    oH.textContent = H;
    const e = rms(H);
    nFit.textContent = `${Math.round(e).toLocaleString("ko-KR")} km/s`;
    nFit.classList.toggle("bad", e > 1500);
    nAge.textContent = `약 ${Math.round(ageGyr(H) * 10)}억 년`;
    nBest.textContent = Math.abs(H - BEST) < 1.5 ? `${BEST.toFixed(1)} (지금 직선)` : `${BEST.toFixed(1)}`;
    msg.textContent = H >= 400 ? `1929년 허블이 얻은 값(약 500 km/s/Mpc)으로 계산하면 우주의 나이가 약 ${Math.round(ageGyr(H) * 10)}억 년밖에 안 됩니다. 지구의 나이(약 46억 년)보다 젊다는 모순이 생깁니다.`
      : Math.abs(H - BEST) < 3 ? "점들과 직선 사이의 거리(붉은 선)가 가장 짧아졌습니다. 이 기울기가 허블 상수의 측정값입니다."
      : "슬라이더로 직선의 기울기를 바꿔 붉은 선들이 가장 짧아지게 맞춰 보세요.";
    draw();
  }
  sH.addEventListener("input", update);
  root.querySelectorAll("[data-h]").forEach((b) => b.addEventListener("click", () => { sH.value = b.dataset.h === "best" ? Math.round(BEST) : b.dataset.h; update(); }));
  update();
})();
