/* 카드: 교류를 직류로, 작은 신호를 큰 신호로 어떻게 바꿀까? — 다이오드 I–V, 반파·전파 정류와 평활, 트랜지스터 */
(() => {
  const root = document.getElementById("card-emq-semis");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sC = $(".c"), oC = $(".c-out"), sB = $(".b"), oB = $(".b-out"), d1 = $(".d1"), d2 = $(".d2"), n1 = $(".n-1"), n2 = $(".n-2"), note = $(".f-note");
  let mode = "iv", rect = "full";
  const Vp = 12, RL = 100, BETA = 100, VCC = 9, RC = 1000; // 정류: 12 V(최댓값), 100 Ω 부하 / 트랜지스터: 9 V, 1 kΩ
  const diode = (v, vt) => 10 * (Math.exp((v - vt) / 0.06) - Math.exp(-vt / 0.06)); // mA, 모식: 문턱 전압에서 약 10 mA
  function rectWave() {
    const Cc = +sC.value * 1e-6, f = 60, N = 1200, T = 3 / f, dt = T / N, vin = [], vout = []; let vc = 0;
    for (let k = 0; k <= N; k++) {
      const t = k * dt, v = Vp * Math.sin(2 * Math.PI * f * t), src = Math.max(0, (rect === "full" ? Math.abs(v) - 1.4 : v - 0.7));
      if (Cc > 0) { vc = src > vc ? src : vc * Math.exp(-dt / (RL * Cc)); } else vc = src;
      vin.push(v); vout.push(vc);
    }
    return { vin, vout, T };
  }
  const { ctx, size } = fit(cv, () => draw());
  function axes(x0, x1, y0, y1, xl, yl) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke(); ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(xl, x1, y0 - 6); ctx.textAlign = "left"; ctx.fillText(yl, x0 + 4, y1 + 8); }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 44, x1 = w - 12, top = 14, bot = h - 24;
    if (mode === "iv") {
      const X = (v) => x0 + (v + 3) / 6 * (x1 - x0), yz = bot - 30, Y = (i) => yz - i / 40 * (yz - top);
      ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x0, yz); ctx.lineTo(x1, yz); ctx.moveTo(X(0), top); ctx.lineTo(X(0), bot); ctx.stroke();
      [["규소 다이오드 (약 0.7 V)", 0.7, "#3f6fa3"], ["빨간 LED (약 1.8 V)", 1.8, "#d7263d"], ["파란 LED (약 2.8 V)", 2.8, "#3b5bd9"]].forEach(([lab, vt, col], i) => {
        ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); let first = true;
        for (let v = -3; v <= 3; v += 0.005) { const I = Math.min(45, diode(v, vt)); const yy = Y(Math.max(-2, I)); first ? ctx.moveTo(X(v), yy) : ctx.lineTo(X(v), yy); first = false; if (I >= 45) break; }
        ctx.stroke(); ctx.fillStyle = col; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(lab, x0 + 6, top + 12 + i * 15);
      });
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; [-3, -2, -1, 0, 1, 2, 3].forEach((v) => ctx.fillText(`${v} V`, X(v), bot + 12));
      ctx.textAlign = "left"; ctx.font = `10px ${F.sans}`; ctx.fillText("← 역방향: 거의 흐르지 않음", X(-2.9), yz - 8); ctx.fillText("순방향 →", X(0.1), yz + 14); ctx.save(); ctx.translate(X(0) - 6, top + 60); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("전류 (mA)", 0, 0); ctx.restore();
    } else if (mode === "rect") {
      const b2 = bot - 26, { vin, vout } = rectWave(), X = (k) => x0 + k / (vin.length - 1) * (x1 - x0), mid = (top + b2) / 2, Y = (v) => mid - v / 13 * (b2 - top) / 2;
      ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x0, mid); ctx.lineTo(x1, mid); ctx.stroke();
      ctx.strokeStyle = "rgba(141,141,146,.7)"; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.4; ctx.beginPath(); vin.forEach((v, k) => (k ? ctx.lineTo(X(k), Y(v)) : ctx.moveTo(X(k), Y(v)))); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = C.forest; ctx.lineWidth = 2.4; ctx.beginPath(); vout.forEach((v, k) => (k ? ctx.lineTo(X(k), Y(v)) : ctx.moveTo(X(k), Y(v)))); ctx.stroke();
      ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("점선: 입력 교류 (60 Hz, 최댓값 12 V)", x0 + 4, h - 22); ctx.fillStyle = C.forest; ctx.fillText("실선: 부하(100 Ω)에 걸린 출력", x0 + 4, h - 7);
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; [12, 0, -12].forEach((v) => ctx.fillText(`${v} V`, x0 - 4, Y(v) + 3));
    } else {
      const IB = +sB.value * 1e-6, X = (ib) => x0 + ib / 200e-6 * (x1 - x0), Y = (ic) => bot - ic / 10e-3 * (bot - top), sat = (VCC - 0.2) / RC;
      axes(x0, x1, bot, top, "베이스 전류 I_B (μA)", "컬렉터 전류 I_C (mA)");
      ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2.2; ctx.beginPath(); for (let ib = 0; ib <= 200e-6; ib += 1e-6) { const ic = Math.min(sat, BETA * ib); ib ? ctx.lineTo(X(ib), Y(ic)) : ctx.moveTo(X(ib), Y(ic)); } ctx.stroke();
      ctx.fillStyle = "rgba(59,124,42,.1)"; ctx.fillRect(x0, top, X(sat / BETA) - x0, bot - top); ctx.fillStyle = "rgba(181,83,47,.1)"; ctx.fillRect(X(sat / BETA), top, x1 - X(sat / BETA), bot - top);
      ctx.fillStyle = C.forest; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("증폭 영역 I_C = 100 × I_B", (x0 + X(sat / BETA)) / 2, top + 26); ctx.fillStyle = C.warn; ctx.fillText("포화 = 스위치 켜짐", (X(sat / BETA) + x1) / 2, top + 26);
      const ic = Math.min(sat, BETA * IB); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(IB), Y(ic), 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; [0, 50, 100, 150, 200].forEach((v) => ctx.fillText(v, X(v * 1e-6), bot + 12)); ctx.textAlign = "right"; [0, 5, 10].forEach((v) => ctx.fillText(v, x0 - 4, Y(v * 1e-3) + 3));
    }
  }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    root.querySelectorAll("[data-r]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.r === rect)));
    root.querySelectorAll(".x-rect").forEach((e) => (e.hidden = mode !== "rect")); root.querySelectorAll(".x-tr").forEach((e) => (e.hidden = mode !== "tr"));
    oC.textContent = sC.value; oB.textContent = sB.value;
    if (mode === "iv") { d1.textContent = "순방향 문턱 전압"; n1.textContent = "규소 약 0.7 V · LED는 색마다 다름"; d2.textContent = "역방향"; n2.textContent = "거의 0 (공핍층이 두꺼워짐)"; note.textContent = "곡선은 문턱 부근에서 전류가 급격히 커지는 모양을 보인 모식입니다."; }
    else if (mode === "rect") { const { vout } = rectWave(), tail = vout.slice(vout.length / 3), mx = Math.max(...tail), mn = Math.min(...tail); d1.textContent = "출력 평균 (대략)"; n1.textContent = `${(tail.reduce((a, b) => a + b, 0) / tail.length).toFixed(1)} V`; d2.textContent = "출력의 흔들림 (최대 − 최소)"; n2.textContent = `${(mx - mn).toFixed(1)} V`; note.textContent = "다이오드 하나에서 약 0.7 V가 떨어진다고 두었습니다(브리지는 두 개를 지나 1.4 V)."; }
    else { const IB = +sB.value * 1e-6, sat = (VCC - 0.2) / RC, ic = Math.min(sat, BETA * IB); d1.textContent = "컬렉터 전류 I_C"; n1.textContent = `${(ic * 1000).toFixed(2)} mA ${BETA * IB >= sat ? "(포화: 켜짐)" : IB === 0 ? "(꺼짐)" : `(= ${BETA} × I_B)`}`; d2.textContent = "전류 증폭"; n2.textContent = IB > 0 ? `${Math.round(ic / IB)} 배` : "—"; note.textContent = "npn 트랜지스터, 전원 9 V, 컬렉터 저항 1 kΩ, 전류 증폭률 β = 100으로 둔 모식입니다."; }
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; update(); }));
  root.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => { rect = b.dataset.r; update(); }));
  sC.addEventListener("input", update); sB.addEventListener("input", update); update();
})();
