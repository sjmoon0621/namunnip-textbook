/* 카드: 농도를 2배로 하면 반응은 몇 배 빨라질까? — 초기 속도 실험 표로 반응 차수 찾기 */
(() => {
  const root = document.getElementById("card-mateng-rate-law");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA = $(".a"), sB = $(".b"), oA = $(".a-out"), oB = $(".b-out"), na = $(".na"), nb = $(".nb"), msg = $(".rl-msg");
  const RX = { no: { A: "NO", B: "O₂", m: 2, n: 1, k: 7.1e3 }, h2o2: { A: "H₂O₂", B: "I⁻", m: 1, n: 1, k: 0.0115 * 100 }, acetone: { A: "아세톤", B: "I₂", m: 1, n: 0, k: 2.7e-3 } };
  let rx = "no", rows = [], gm = null, gn = null, seed = 13;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const rate = (a, b) => { const R = RX[rx]; return R.k * a ** R.m * b ** R.n * (1 + (rnd() - 0.5) * 0.04); };   // ±2 % 측정 오차
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const R = RX[rx], cols = ["실험", `[${R.A}] (M)`, `[${R.B}] (M)`, "초기 속도 (M/s)"], cx = [0.08, 0.3, 0.52, 0.8].map((f) => f * w), rh = 26, y0 = 30;
    ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
    cols.forEach((c, i) => ctx.fillText(c, cx[i], y0));
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(10, y0 + 8); ctx.lineTo(w - 10, y0 + 8); ctx.stroke();
    if (!rows.length) { ctx.fillStyle = C.ink3; ctx.font = `12px ${F.sans}`; ctx.fillText("농도를 고르고 “이 농도로 실험하기”를 누르세요.", w / 2, y0 + 50); return; }
    rows.forEach((r, i) => {
      const y = y0 + 8 + rh * (i + 1) - 8;
      ctx.fillStyle = i % 2 ? "rgba(0,0,0,.02)" : "rgba(0,0,0,0)"; ctx.fillRect(10, y - rh + 10, w - 20, rh);
      ctx.fillStyle = C.ink; ctx.font = `12px ${F.mono}`;
      ctx.fillText(`${i + 1}`, cx[0], y); ctx.fillText(r[0].toFixed(3), cx[1], y); ctx.fillText(r[1].toFixed(3), cx[2], y); ctx.fillText(r[2].toExponential(2), cx[3], y);
      if (i > 0) { const q = r[2] / rows[0][2]; ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`1번의 ${q.toFixed(2)}배`, cx[3] + 48, y); ctx.textAlign = "center"; }
    });
  }
  function update() {
    const R = RX[rx]; na.textContent = R.A; nb.textContent = R.B; oA.textContent = (+sA.value).toFixed(3); oB.textContent = (+sB.value).toFixed(3);
    root.querySelectorAll("[data-rx]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.rx === rx)));
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.m === gm)));
    root.querySelectorAll("[data-n]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.n === gn)));
    if (gm === null || gn === null) msg.textContent = rows.length < 3 ? "한 번에 한 농도만 바꾸며 실험을 3번 이상 해 보세요." : "표를 보고 두 반응물의 차수를 골라 보세요.";
    else if (gm === R.m && gn === R.n) msg.innerHTML = `<b>맞습니다.</b> v = k[${R.A}]${R.m ? (R.m > 1 ? "²" : "") : "⁰"}[${R.B}]${R.n ? (R.n > 1 ? "²" : "") : "⁰"}입니다.${R.n === 0 ? ` ${R.B}의 농도는 속도에 영향을 주지 않습니다.` : ""}`;
    else msg.textContent = `아직 아닙니다. ${gm !== R.m ? `${R.A}` : `${R.B}`}만 바꾼 두 실험을 골라 속도가 몇 배가 되었는지 다시 보세요.`;
    msg.classList.toggle("bad", gm !== null && gn !== null && !(gm === R.m && gn === R.n));
    draw();
  }
  [sA, sB].forEach((el) => el.addEventListener("input", update));
  $(".run").addEventListener("click", () => { if (rows.length >= 6) rows.shift(); rows.push([+sA.value, +sB.value, rate(+sA.value, +sB.value)]); update(); });
  $(".clear").addEventListener("click", () => { rows = []; update(); });
  root.querySelectorAll("[data-rx]").forEach((b) => b.addEventListener("click", () => { rx = b.dataset.rx; rows = []; gm = gn = null; update(); }));
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { gm = +b.dataset.m; update(); }));
  root.querySelectorAll("[data-n]").forEach((b) => b.addEventListener("click", () => { gn = +b.dataset.n; update(); }));
  rows.push([0.01, 0.01, rate(0.01, 0.01)]);
  update();
})();
