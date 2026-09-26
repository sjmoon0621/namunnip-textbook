/* 카드: 중화점에서 용액은 언제나 중성일까? — 염산과 아세트산에 같은 NaOH 넣기 (BTB) */
(() => {
  const root = document.getElementById("card-chem-eq-point");
  if (!root) return;
  const { C, F, clamp, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sV = $(".vb"), oV = $(".vb-out");
  const d1 = $(".ph1"), d2 = $(".ph2"), dA = $(".ionized"), msg = $(".msg");
  const KA = 1.8e-5, KW = 1.0e-14, VA = 20;
  let c = 0.1;
  // 전하 균형: [H⁺] + [Na⁺] = [OH⁻] + [A⁻]
  function pH(Ka, Vb) {
    const V = VA + Vb, CA = c * VA / V, Na = c * Vb / V;
    let lo = -15, hi = 1;
    for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2, hh = 10 ** m; (hh + Na - KW / hh - CA * Ka / (Ka + hh)) > 0 ? hi = m : lo = m; }
    return -(lo + hi) / 2;
  }
  const alpha = (Vb) => { const h = 10 ** -pH(KA, Vb); return KA / (KA + h); }; // 아세트산 중 이온화한 비율
  // BTB: pH 6.0 노랑 → 7.6 파랑
  function btb(p) {
    const t = clamp((p - 6.0) / 1.6, 0, 1), Y = [226, 196, 52], G = [80, 150, 90], B = [40, 80, 170];
    const m = (a, b, k) => a.map((x, i) => Math.round(x + (b[i] - x) * k));
    return `rgb(${(t < .5 ? m(Y, G, t * 2) : m(G, B, (t - .5) * 2)).join(",")})`;
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const Vb = +sV.value;
    const cols = [["염산 HCl", 1e8], ["아세트산 CH₃COOH", KA]];
    cols.forEach(([name, Ka], i) => {
      const cx = w * (i ? 0.72 : 0.28), bw = Math.min(w * 0.3, 170), bh = h * 0.52, by = h * 0.2, bx = cx - bw / 2;
      const p = pH(Ka, Vb), lvl = by + bh * (1 - 0.4 - 0.45 * Vb / 30);
      ctx.fillStyle = btb(p); ctx.globalAlpha = 0.8; ctx.fillRect(bx, lvl, bw, by + bh - lvl); ctx.globalAlpha = 1;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
      ctx.font = `600 13px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.fillText(name, cx, by - 24);
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.fillText(`${c} M · 20 mL + BTB`, cx, by - 9);
      ctx.font = `500 ${Math.round(Math.min(26, w * 0.05))}px ${F.mono}`; ctx.fillStyle = C.ink;
      ctx.fillText(`pH ${p.toFixed(2)}`, cx, by + bh + 30);
    });
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    ctx.fillText(`넣은 ${c} M NaOH: ${Vb.toFixed(1)} mL  (중화점 20.0 mL)`, w / 2, h - 8);
  }

  function update() {
    const Vb = +sV.value; oV.textContent = Vb.toFixed(1);
    const p1 = pH(1e8, Vb), p2 = pH(KA, Vb);
    d1.textContent = p1.toFixed(2); d2.textContent = p2.toFixed(2);
    dA.textContent = Vb === 0 ? `${(alpha(0) * 100).toFixed(1)} %` : `${(alpha(Vb) * 100).toFixed(1)} %`;
    msg.textContent = Math.abs(Vb - 20) < 0.01 ? `중화점: 두 비커 모두 넣은 NaOH의 몰수가 처음 산의 몰수와 같습니다. 그런데 염산 쪽은 pH 7.00, 아세트산 쪽은 pH ${p2.toFixed(2)}입니다.`
      : Vb < 20 ? "두 산의 몰수가 같으므로, 중화에 필요한 NaOH의 양도 같습니다. 처음 pH가 다른 것은 이온화한 정도가 다르기 때문입니다."
      : "중화점을 지나면 남는 OH⁻가 pH를 정하므로 두 비커의 pH가 거의 같아집니다.";
    draw();
  }
  sV.addEventListener("input", update);
  root.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => { c = +b.dataset.c; root.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", x === b)); update(); }));
  root.querySelectorAll("[data-v]").forEach((b) => b.addEventListener("click", () => { sV.value = b.dataset.v; update(); }));
  update();
})();
