/* 카드: 지구의 궤도가 바뀌면 빙하기가 올까? — 궤도 요소(모식 주기)와 65°N 하짓날 일사량(천문 공식) */
(() => {
  const root = document.getElementById("card-earth-milankovitch");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cvO = $(".cv-wide"), cvS = $(".cv-series");
  const sT = $(".t"), oT = $(".t-out"), cE = $(".on-e"), cO = $(".on-o"), cP = $(".on-p");
  const nE = $(".n-e"), nO = $(".n-o"), nP = $(".n-p"), nQ = $(".n-q");

  const S0 = 1361, TAU = Math.PI * 2, D2R = Math.PI / 180;
  const E0 = 0.0167, O0 = 23.44, P0 = 167;  // 현재: 하짓날의 근점 이각 약 167° (근일점 1월 초)
  // 모식 주기: 실제 궤도 해가 아니라 주기와 범위만 맞춘 사인 곡선
  const ecc = (t) => cE.checked ? 0.028 + 0.022 * Math.sin(TAU * t / 100 - 0.5423) : E0;
  const obl = (t) => cO.checked ? 23.3 + 1.2 * Math.sin(TAU * t / 41 + 0.1169) : O0;
  const prc = (t) => cP.checked ? (P0 + 360 * t / 23) % 360 : P0;

  // 하루 평균 대기 꼭대기 일사량 (W/m²), 위도 lat, 적위 dec, 근점 이각 nu
  function Q(lat, dec, e, nu) {
    const phi = lat * D2R, d = dec * D2R;
    const x = -Math.tan(phi) * Math.tan(d);
    const h0 = x <= -1 ? Math.PI : x >= 1 ? 0 : Math.acos(x);
    const f = (1 + e * Math.cos(nu * D2R)) / (1 - e * e);
    return S0 / Math.PI * f * f * (h0 * Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.sin(h0));
  }
  const q65 = (t) => Q(65, obl(t), ecc(t), prc(t));
  const Q_NOW = Q(65, O0, E0, P0);

  // 근일점 날짜: 하지(6월 21일)에서 (360 − ψ)/360 년 뒤 (궤도 속도 차는 무시한 어림)
  function periDate(psi) {
    const days = (360 - psi) / 360 * 365.25;
    const d = new Date(Date.UTC(2001, 5, 21) + days * 864e5);
    const m = d.getUTCMonth() + 1, dd = d.getUTCDate();
    return `${m}월 ${dd <= 10 ? "초" : dd <= 20 ? "중순" : "말"}`;
  }

  const O = fit(cvO, () => drawOrbit());
  const Sr = fit(cvS, () => drawSeries());

  function earth(ctx, x, y, r, tiltDeg, towardSun) {
    // 자전축: 화면에서 위쪽이 북극. towardSun = 1이면 북극이 태양 쪽(오른쪽)으로 기울어 보이도록
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = "#2f5f8a"; ctx.fill();
    const a = tiltDeg * D2R * towardSun;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x - Math.sin(a) * r * 1.7, y + Math.cos(a) * r * 1.7); ctx.lineTo(x + Math.sin(a) * r * 1.7, y - Math.cos(a) * r * 1.7); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x + Math.sin(a) * r * 1.7, y - Math.cos(a) * r * 1.7, 2, 0, Math.PI * 2); ctx.fill();
  }

  function drawOrbit() {
    const { ctx, size: { w, h } } = O; if (!w) return;
    const t = +sT.value, e = ecc(t), ob = obl(t), psi = prc(t), small = w < 480;
    ctx.clearRect(0, 0, w, h);
    // 궤도 (이심률 6배 과장). 근일점은 오른쪽(태양 쪽), 하지 위치는 근점 이각 psi.
    const cx = w * (small ? .5 : .42), cy = h / 2 + 6, a = Math.min(w * (small ? .36 : .3), h * .62), ed = Math.min(.45, e * 6);
    const b = a * Math.sqrt(1 - ed * ed), fx = cx + a * ed; // 태양 = 오른쪽 초점
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(cx, cy, a, b * .55, 0, 0, Math.PI * 2); ctx.stroke();
    // 태양
    ctx.beginPath(); ctx.arc(fx, cy, 10, 0, Math.PI * 2); ctx.fillStyle = C.amber; ctx.fill();
    // 궤도 위 점: 근점 이각 nu → 초점 기준 거리 r = a(1−e²)/(1+e cos nu)
    const pos = (nu) => { const r = a * (1 - ed * ed) / (1 + ed * Math.cos(nu * D2R)); return [fx + r * Math.cos(nu * D2R), cy - r * Math.sin(nu * D2R) * .55]; };
    const [px, py] = pos(0), [ax, ay] = pos(180);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    ctx.fillText("근일점", px, py - 8); ctx.fillText("원일점", ax, ay - 8);
    // 북반구 하지와 동지
    const [sx, sy] = pos(psi), [wx, wy] = pos(psi + 180);
    earth(ctx, sx, sy, small ? 7 : 9, ob, sx < fx ? 1 : -1);
    earth(ctx, wx, wy, small ? 6 : 8, ob, wx < fx ? -1 : 1);
    ctx.font = `${small ? 10 : 11}px ${F.sans}`; ctx.fillStyle = C.warn;
    ctx.fillText("북반구 여름", sx, sy + (small ? 26 : 30)); ctx.fillStyle = "#3f6fa3"; ctx.fillText("북반구 겨울", wx, wy + (small ? 24 : 28));
    // 오른쪽 수치 막대 (넓은 화면)
    if (!small) {
      const bx = w * .8, bw = w * .16, top = 24, bot = h - 26, q = q65(t);
      const Y = (v) => bot - (v - 380) / (600 - 380) * (bot - top);
      ctx.fillStyle = "rgba(181,83,47,.18)"; ctx.fillRect(bx, Y(q), bw, bot - Y(q));
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, Y(q)); ctx.lineTo(bx + bw, Y(q)); ctx.stroke();
      ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx - 4, Y(Q_NOW)); ctx.lineTo(bx + bw + 4, Y(Q_NOW)); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
      ctx.fillText("65°N 하지", bx + bw / 2, top - 8);
      ctx.fillText(`${q.toFixed(0)}`, bx + bw / 2, Y(q) - 5);
      ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("현재", bx + bw + 2, Y(Q_NOW) + 12);
      [400, 500, 600].forEach((v) => { ctx.textAlign = "right"; ctx.fillText(String(v), bx - 6, Y(v) + 3); });
    }
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("궤도의 찌그러짐은 과장해서 그림", 6, h - 8);
  }

  function drawSeries() {
    const { ctx, size: { w, h } } = Sr; if (!w) return;
    const t = +sT.value, small = w < 480;
    ctx.clearRect(0, 0, w, h);
    const x0 = small ? 32 : 40, gw = w - x0 - 10, top = 18, bot = h - 26;
    const X = (tt) => x0 + tt / 400 * gw, Y = (v) => bot - (v - 400) / (580 - 400) * (bot - top);
    NM.axes(ctx, { x0, y0: top, w: gw, h: bot - top, X, Y,
      xt: [0, 100, 200, 300, 400].map((v) => [v, String(v)]), yt: [420, 480, 540].map((v) => [v, String(v)]),
      xlabel: "모형 시간 (천 년)", ylabel: "65°N 하짓날 일사량 (W/m²)" });
    ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, Y(Q_NOW)); ctx.lineTo(x0 + gw, Y(Q_NOW)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.beginPath();
    for (let tt = 0; tt <= 400; tt += 0.5) { const y = Y(clamp(q65(tt), 395, 585)); tt ? ctx.lineTo(X(tt), y) : ctx.moveTo(X(tt), y); }
    ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X(t), top); ctx.lineTo(X(t), bot); ctx.stroke();
    ctx.beginPath(); ctx.arc(X(t), Y(clamp(q65(t), 395, 585)), 4, 0, Math.PI * 2); ctx.fillStyle = C.warn; ctx.fill();
  }

  function update() {
    const t = +sT.value;
    oT.textContent = t;
    nE.textContent = ecc(t).toFixed(4);
    nO.textContent = `${obl(t).toFixed(2)}°`;
    nP.textContent = periDate(prc(t));
    const q = q65(t), d = q - Q_NOW;
    nQ.textContent = `${q.toFixed(0)} W/m² (${d >= 0 ? "+" : "−"}${Math.abs(d).toFixed(0)})`;
    drawOrbit(); drawSeries();
  }
  sT.addEventListener("input", update);
  [cE, cO, cP].forEach((c) => c.addEventListener("change", update));
  update();
})();
