/* 카드: 인공지능의 판정을 두 집단에 모두 공정하게 만들 수 있을까? — 기저율이 다를 때 오류율 균형과 예측 동등성 (모식) */
(() => {
  const root = document.getElementById("card-fusi-fairness");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sB = $(".bb"), sA = $(".ta"), sT = $(".tb"), cS = $(".same");
  const MP = 0.62, MN = 0.40, SD = 0.13, BA = 0.30;
  const erf = (x) => {
    const t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return x >= 0 ? y : -y;
  };
  const above = (m, t) => 0.5 * (1 - erf((t - m) / (SD * Math.SQRT2)));
  const pdf = (m, x) => Math.exp(-((x - m) ** 2) / (2 * SD * SD)) / (SD * Math.sqrt(2 * Math.PI));
  function rates(base, t) {
    const tpr = above(MP, t), fpr = above(MN, t);
    const pos = base * tpr + (1 - base) * fpr;
    return { pos, fpr, fnr: 1 - tpr, ppv: base * tpr / pos };
  }
  const { ctx, size } = fit(cv, () => draw());
  function panel(y0, hh, base, t, name, w) {
    const x0 = 40, x1 = w - 14, X = (s) => x0 + s * (x1 - x0);
    const top = pdf(MP, MP) * 0.62, Y = (v) => y0 + hh - v / top * (hh - 16);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0 + hh + .5); ctx.lineTo(x1, y0 + hh + .5); ctx.stroke();
    const area = (m, wgt, fill, stroke) => {
      ctx.beginPath(); ctx.moveTo(X(t), y0 + hh);
      for (let i = 0; i <= 100; i++) { const s = t + (1 - t) * i / 100; ctx.lineTo(X(s), Y(wgt * pdf(m, s))); }
      ctx.lineTo(X(1), y0 + hh); ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
      ctx.beginPath(); for (let i = 0; i <= 200; i++) { const s = i / 200, py = Y(wgt * pdf(m, s)); i ? ctx.lineTo(X(s), py) : ctx.moveTo(X(s), py); }
      ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke();
    };
    area(MN, 1 - base, "rgba(63,111,163,.22)", "#3f6fa3");
    area(MP, base, "rgba(181,83,47,.22)", C.warn);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.moveTo(X(t), y0 + 4); ctx.lineTo(X(t), y0 + hh); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink; ctx.font = `bold 12px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`${name} (실제 양성 ${Math.round(base * 100)} %)`, x0, y0 + 10);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink2;
    const tx = X(t), right = tx < (x1 - 90);
    ctx.textAlign = right ? "left" : "right"; ctx.fillText(right ? "기준 → 양성 판정" : "양성 판정 ← 기준", tx + (right ? 5 : -5), y0 + 26);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    for (let s = 0; s <= 1.001; s += 0.2) ctx.fillText(s.toFixed(1), X(s), y0 + hh + 12);
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const hh = (h - 64) / 2;
    panel(8, hh, BA, +sA.value, "집단 A", w);
    panel(8 + hh + 26, hh, +sB.value / 100, +sT.value, "집단 B", w);
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = C.warn; ctx.fillText("━ 실제 양성인 사람", 40, h - 6);
    ctx.fillStyle = "#3f6fa3"; ctx.fillText("━ 실제 음성인 사람", 160, h - 6);
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("위험 점수", w - 14, h - 6);
  }
  const pct = (v) => `${(v * 100).toFixed(0)} %`, dp = (v) => `${v >= 0 ? "+" : "−"}${Math.abs(v * 100).toFixed(0)}`;
  function update(src) {
    if (cS.checked) { if (src === sT) sA.value = sT.value; else sT.value = sA.value; }
    $(".bb-out").textContent = sB.value; $(".ta-out").textContent = (+sA.value).toFixed(2); $(".tb-out").textContent = (+sT.value).toFixed(2);
    const a = rates(BA, +sA.value), b = rates(+sB.value / 100, +sT.value);
    const fill = (sel, r) => { const td = root.querySelectorAll(`${sel} td`); [r.pos, r.fpr, r.fnr, r.ppv].forEach((v, i) => { td[i + 1].textContent = pct(v); }); };
    fill(".ra", a); fill(".rb", b);
    const g = root.querySelectorAll(".gap td"); ["pos", "fpr", "fnr", "ppv"].forEach((k, i) => { g[i + 1].textContent = `${dp(b[k] - a[k])}%p`; });
    draw();
  }
  [sB, sA, sT].forEach((s) => s.addEventListener("input", () => update(s)));
  cS.addEventListener("change", () => update(sA));
  update(sA);
})();
