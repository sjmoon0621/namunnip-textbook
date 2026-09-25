/* 카드: 에너지는 왜 영양 단계를 올라갈수록 줄어들까? — 에너지 피라미드 */
(() => {
  const root = document.getElementById("card-is2-energy-pyramid");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sE = $(".eff"), oE = $(".eff-out"), sN = $(".lv"), oN = $(".lv-out"), logT = $(".logscale");
  const nTop = $(".ptop"), nNeed = $(".need"), msg = $(".p-msg");

  // 실버스프링스 (Odum, 1957) 영양 단계별 에너지, kcal/m²·년
  const SILVER = [20810, 3368, 383, 21];
  const NAMES = ["생산자", "1차 소비자", "2차 소비자", "3차 소비자", "4차 소비자"];
  let mode = "model";

  const levels = () => mode === "silver" ? SILVER.slice()
    : Array.from({ length: +sN.value }, (_, i) => 10000 * Math.pow(+sE.value / 100, i));

  const { ctx, size } = fit(cv, () => draw());
  const fmt = (v) => v >= 100 ? Math.round(v).toLocaleString("ko-KR") : v >= 1 ? v.toFixed(1) : v >= 0.01 ? v.toFixed(2) : v.toExponential(1);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const E = levels(), n = E.length, log = logT.checked;
    const padT = 26, padB = 10, labW = Math.min(96, w * 0.22), valW = Math.min(120, w * 0.24);
    const cx = labW + (w - labW - valW) / 2, maxW = w - labW - valW - 8;
    const rowH = Math.min(46, (h - padT - padB) / n);
    const lo = Math.log10(E[0]) - 5;
    const W = (v) => log ? Math.max(2, (Math.log10(v) - lo) / (Math.log10(E[0]) - lo) * maxW) : Math.max(1.5, v / E[0] * maxW);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText(log ? "막대 폭: 로그 눈금 (한 칸 줄 때마다 1/10)" : "막대 폭: 에너지에 비례", 6, 14);
    for (let i = 0; i < n; i++) {
      const y = h - padB - (i + 1) * rowH, ww = W(E[i]);
      ctx.fillStyle = i === 0 ? C.forest : i === 1 ? C.leaf : i === 2 ? C.amber : C.warn;
      ctx.fillRect(cx - ww / 2, y + 4, ww, rowH - 8);
      ctx.fillStyle = C.ink2; ctx.textAlign = "right"; ctx.font = `11px ${F.sans}`;
      ctx.fillText(NAMES[i], labW - 6, y + rowH / 2 + 4);
      ctx.textAlign = "left"; ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink;
      const pct = E[i] / E[0] * 100;
      ctx.fillText(`${fmt(E[i])} (${pct >= 1 ? pct.toFixed(pct >= 10 ? 0 : 1) : pct.toPrecision(2)}%)`, w - valW + 4, y + rowH / 2 + 4);
      if (i > 0) {
        ctx.fillStyle = C.warn; ctx.textAlign = "center"; ctx.font = `10px ${F.mono}`;
        const r = E[i] / E[i - 1] * 100;
        ctx.fillText(`↑ ${r.toFixed(r < 10 ? 1 : 0)}%`, cx + Math.max(W(E[i - 1]), 60) / 2 + 22, y + rowH + 3);
        ctx.textAlign = "left";
      }
    }
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillText(mode === "silver" ? "kcal/m²·년" : "생산자 = 10,000 (상대값)", w - 6, 14);
    ctx.textAlign = "left";
  }

  function update() {
    oE.textContent = sE.value; oN.textContent = sN.value;
    const E = levels(), top = E[E.length - 1];
    nTop.textContent = `${(top / E[0] * 100).toPrecision(2)}%`;
    nNeed.textContent = `${fmt(E[0] / top)} kJ`;
    msg.textContent = mode === "silver"
      ? "실제 생태계의 측정값입니다. 단계마다 넘어가는 비율이 16%, 11%, 5.5%로 제각각입니다."
      : "나머지 에너지는 각 단계 생물의 호흡으로 열이 되어 빠져나가거나, 사체·배설물로 분해자에게 갑니다.";
    [sE, sN].forEach((el) => { el.disabled = mode === "silver"; });
    root.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.mode === mode));
    draw();
  }
  [sE, sN].forEach((el) => el.addEventListener("input", update));
  logT.addEventListener("change", update);
  root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.mode; update(); }));
  update();
})();
