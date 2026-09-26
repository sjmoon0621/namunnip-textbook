/* 카드: 송전은 왜 높은 전압으로 할까? — P = VI, 손실 = I²R (직류 한 쌍으로 단순화한 모식) */
(() => {
  const root = document.getElementById("card-is2-transmission");
  if (!root) return;
  const { C, F, fit, clamp, reduce } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sV = $(".kv"), sP = $(".mw"), sL = $(".km");
  const oV = $(".kv-out"), oP = $(".mw-out"), oL = $(".km-out");
  const nI = $(".amp"), nLoss = $(".loss"), nArr = $(".arr"), msg = $(".t-msg");

  const RKM = 0.025;                         // 전선 저항 (Ω/km, 왕복 합의 대략값)
  const kv = () => { const v = 10 ** +sV.value, d = 10 ** (Math.floor(Math.log10(v)) - 2); return +(Math.round(v / d) * d).toPrecision(3); };
  function solve() {
    const V = kv() * 1e3, P = +sP.value * 1e6, R = RKM * +sL.value;
    const I = P / V, loss = I * I * R, frac = loss / P;
    return { V, P, R, I, loss, frac, ok: frac < 1 };
  }

  const { ctx, size } = fit(cv, () => draw());
  let flow = 0;

  function tower(x, y, hgt) {
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x - hgt * 0.18, y); ctx.lineTo(x, y - hgt); ctx.lineTo(x + hgt * 0.18, y);
    ctx.moveTo(x - hgt * 0.22, y - hgt * 0.8); ctx.lineTo(x + hgt * 0.22, y - hgt * 0.8); ctx.stroke();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = solve();
    const gy = h * 0.52, lineY = gy - h * 0.26, x0 = 58, x1 = w - 58;
    // 땅
    ctx.fillStyle = C.rule; ctx.fillRect(0, gy, w, 1);
    // 발전소, 도시
    ctx.fillStyle = C.ink2; ctx.fillRect(10, gy - 44, 34, 44); ctx.fillRect(16, gy - 60, 7, 16);
    ctx.fillStyle = C.ink2; [0, 1, 2].forEach((i) => ctx.fillRect(w - 46 + i * 12, gy - 24 - i * 10, 10, 24 + i * 10));
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    ctx.fillText("발전소", 27, gy + 14); ctx.fillText("도시", w - 28, gy + 14);
    // 탑
    const nT = 4;
    for (let i = 0; i <= nT; i++) tower(x0 + (x1 - x0) * i / nT, gy, gy - lineY + 6);
    // 전선: 굵기 ∝ 전류(로그), 붉기 ∝ 손실 비율
    const wd = clamp(1 + Math.log10(Math.max(r.I, 1)) * 1.6, 1, 9);
    const heat = clamp(r.frac * 3, 0, 1);
    ctx.strokeStyle = `rgb(${Math.round(90 + 150 * heat)},${Math.round(90 - 20 * heat)},${Math.round(90 - 40 * heat)})`;
    ctx.lineWidth = wd;
    ctx.beginPath(); ctx.moveTo(44, lineY + 6); ctx.lineTo(w - 46, lineY + 6); ctx.stroke();
    if (heat > 0.05) { ctx.strokeStyle = `rgba(212,73,58,${0.25 * heat})`; ctx.lineWidth = wd + 10; ctx.beginPath(); ctx.moveTo(44, lineY + 6); ctx.lineTo(w - 46, lineY + 6); ctx.stroke(); }
    // 움직이는 점: 전류가 클수록 빽빽하고 빠르게
    const dens = clamp(Math.log10(Math.max(r.I, 1)) * 3, 2, 16), gap = (x1 - x0) / dens;
    ctx.fillStyle = C.amber;
    for (let x = 44 + (flow % gap); x < w - 46; x += gap) { ctx.beginPath(); ctx.arc(x, lineY + 6, 2.2, 0, 7); ctx.fill(); }
    ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.font = `600 11px ${F.mono}`;
    ctx.fillText(`${kv().toLocaleString("ko-KR")} kV · 전류 ${Math.round(r.I).toLocaleString("ko-KR")} A`, w / 2, lineY - 12);
    // 아래: 보낸 전력의 행방
    const by = gy + 36, bh = Math.min(26, h * 0.12), bw = w - 40;
    ctx.textAlign = "left"; ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText(`보낸 전력 ${sP.value} MW의 행방`, 20, by - 8);
    const fl = clamp(r.frac, 0, 1);
    ctx.fillStyle = C.forest; ctx.fillRect(20, by, bw * (1 - fl), bh);
    ctx.fillStyle = C.warn; ctx.fillRect(20 + bw * (1 - fl), by, bw * fl, bh);
    ctx.fillStyle = C.ink2;
    ctx.fillText(r.ok ? `도착 ${(100 - r.frac * 100).toFixed(1)}%` : "도착 0% — 보낼 수 없음", 20, by + bh + 16);
    ctx.textAlign = "right"; ctx.fillStyle = C.warn;
    ctx.fillText(`전선에서 열로 ${r.ok ? (r.frac * 100).toFixed(r.frac < 0.1 ? 2 : 1) + "%" : "100% 이상"}`, 20 + bw, by + bh + 16);
    ctx.textAlign = "left";
    // 전압 눈금 표시
    const ky = by + bh + 42;
    if (ky < h - 4) {
      ctx.fillStyle = C.ink3;
      ctx.fillText(`전선 저항 R = ${r.R.toFixed(1)} Ω (${sL.value} km)`, 20, ky);
    }
  }

  function update() {
    const r = solve();
    oV.textContent = kv().toLocaleString("ko-KR"); oP.textContent = sP.value; oL.textContent = sL.value;
    nI.textContent = `${Math.round(r.I).toLocaleString("ko-KR")} A`;
    nLoss.textContent = r.ok ? `${(r.loss / 1e6).toFixed(r.loss < 1e7 ? 1 : 0)} MW` : "보낼 수 없음";
    nLoss.classList.toggle("bad", !r.ok || r.frac > 0.1);
    nArr.textContent = r.ok ? `${((r.P - r.loss) / 1e6).toFixed(0)} MW` : "0";
    msg.textContent = !r.ok ? "전류가 너무 커서 전선에서 떨어지는 전압(IR)이 보내는 전압보다 큽니다. 이 전압으로는 이 전력을 보낼 수 없습니다."
      : r.frac > 0.1 ? "전선이 난로처럼 달아오릅니다. 전압을 올려 전류를 줄여 보세요."
      : "전압을 10배 올리면 전류는 1/10, 전선에서 잃는 전력은 1/100이 됩니다.";
    root.querySelectorAll("[data-kv]").forEach((b) => b.setAttribute("aria-pressed", Math.abs(+b.dataset.kv - kv()) < 0.6));
    draw();
  }
  [sV, sP, sL].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-kv]").forEach((b) => b.addEventListener("click", () => { sV.value = Math.log10(+b.dataset.kv); update(); }));
  NM.loop(cv, (dt) => {
    if (reduce) return;
    const r = solve();
    flow += dt * clamp(Math.log10(Math.max(r.I, 1)) * 14, 10, 80);
    draw();
  });
  update();
})();
