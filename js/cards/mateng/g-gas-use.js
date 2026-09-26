/* 카드: 에어백을 부풀리려면 기체가 몇 몰 필요할까? — PV = nRT로 에어백의 N₂·NaN₃ 양, 기상 관측 풍선의 부피 */
(() => {
  const root = document.getElementById("card-mateng-gas-use");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sV = $(".v"), sT = $(".t"), sH = $(".h"), oV = $(".v-out"), oT = $(".t-out"), oH = $(".h-out");
  const n1 = $(".n-1"), n2 = $(".n-2"), n3 = $(".n-3"), d1 = $(".d1"), d2 = $(".d2"), d3 = $(".d3"), msg = $(".msg");
  const R = 0.08206, P_BAG = 1.2, M_NAN3 = 65.01;
  // 표준 대기: 고도(km) → 압력(atm), 온도(K)
  const ATM = [[0, 1.0, 288], [5, 0.533, 256], [10, 0.261, 223], [15, 0.119, 217], [20, 0.0545, 217], [25, 0.0251, 222], [30, 0.0118, 227]];
  const atm = (h) => { for (let i = 1; i < ATM.length; i++) if (h <= ATM[i][0]) { const [h0, p0, t0] = ATM[i - 1], [h1, p1, t1] = ATM[i], f = (h - h0) / (h1 - h0); return [p0 * (p1 / p0) ** f, t0 + (t1 - t0) * f]; } return [ATM[6][1], ATM[6][2]]; };
  let mode = "bag";
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    if (mode === "bag") {
      const V = +sV.value, n = P_BAG * V / (R * +sT.value);
      // 운전대와 에어백 (부피 ∝ 반지름³)
      const cx = w * 0.42, cy = h * 0.52, r = Math.cbrt(V / 150) * h * 0.42;
      ctx.fillStyle = "#5d5d61"; ctx.beginPath(); ctx.arc(cx - r * 0.2, cy + r * 0.9 + 10, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(233,233,228,1)"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(cx, cy, r * 1.1, r, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
      const dots = Math.min(160, Math.round(n * 25));
      ctx.fillStyle = "#3f6fa3"; for (let i = 0; i < dots; i++) { const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * 0.92; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * rr * r * 1.1, cy + Math.sin(a) * rr * r, 2.2, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillText("2NaN₃ → 2Na + 3N₂", w * 0.72, 30); ctx.fillText(`N₂ ${n.toFixed(2)} mol`, w * 0.72, 50);
      ctx.fillText(`→ NaN₃ ${(n * 2 / 3).toFixed(2)} mol`, w * 0.72, 70); ctx.fillText(`= ${(n * 2 / 3 * M_NAN3).toFixed(0)} g`, w * 0.72, 90);
      ctx.fillStyle = C.ink3; ctx.fillText("파란 점: 기체 분자 (모식)", w * 0.72, h - 14);
    } else {
      const H = +sH.value, [P, T] = atm(H), ratio = (1 / P) * (T / 288);
      const gx = w * 0.12, gy0 = h - 20, gh = h - 40;
      ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(gx, gy0); ctx.lineTo(gx, gy0 - gh); ctx.stroke();
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; [0, 10, 20, 30].forEach((k) => ctx.fillText(`${k} km`, gx - 4, gy0 - k / 30 * gh + 3));
      const by = gy0 - H / 30 * gh, r = Math.min(h * 0.45, 10 * Math.cbrt(ratio));
      ctx.fillStyle = "rgba(224,160,42,.35)"; ctx.strokeStyle = "#e0a02a"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(w * 0.45, Math.max(r + 4, by), r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(224,160,42,.35)"; ctx.beginPath(); ctx.arc(w * 0.45 - 90, gy0 - 10, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.font = `10.5px ${F.sans}`; ctx.fillText("지상에서의 크기", w * 0.45 - 90, gy0 + 12);
      ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText(`부피 ${ratio.toFixed(1)}배`, w * 0.72, 40); ctx.fillText(`지름 ${Math.cbrt(ratio).toFixed(1)}배`, w * 0.72, 60);
    }
  }
  function update() {
    root.querySelector(".bag-ctl").hidden = mode !== "bag"; root.querySelector(".balloon-ctl").hidden = mode === "bag";
    if (mode === "bag") {
      oV.textContent = sV.value; oT.textContent = sT.value;
      const n = P_BAG * +sV.value / (R * +sT.value);
      d1.textContent = "필요한 질소 N₂"; d2.textContent = "아자이드화 나트륨 NaN₃"; d3.textContent = "에어백 속 압력";
      n1.textContent = `${n.toFixed(2)} mol`; n2.textContent = `${(n * 2 / 3 * M_NAN3).toFixed(0)} g`; n3.textContent = `${P_BAG} atm`;
      msg.textContent = `에어백 속 압력은 대기압보다 조금 높은 ${P_BAG} atm으로 가정했습니다. 기체 상수 R = 0.082 atm·L/(mol·K), NaN₃ 몰 질량 65.0 g/mol.`;
    } else {
      oH.textContent = sH.value; const [P, T] = atm(+sH.value), ratio = (1 / P) * (T / 288);
      d1.textContent = "주변 압력"; d2.textContent = "주변 온도"; d3.textContent = "지상 대비 부피";
      n1.textContent = `${P.toFixed(3)} atm`; n2.textContent = `${T.toFixed(0)} K`; n3.textContent = `${ratio.toFixed(1)}배`;
      msg.textContent = "풍선 속 기체의 양은 그대로이고, 풍선 막이 늘어나 속 압력이 바깥과 같다고 가정했습니다. 고도별 압력과 온도는 국제 표준 대기의 대략값입니다.";
    }
    root.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
    draw();
  }
  [sV, sT, sH].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.mode; update(); }));
  update();
})();
