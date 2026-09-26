/* 카드 1.4.2: 온도계는 정말 온도를 잴까? — 온도 → 저항 → 전압 → 숫자 (NTC 서미스터, 대표 부품값) */
(() => {
  const root = document.getElementById("card-is1-sensor");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), oT = $(".tO");
  const dR = $(".r"), dV = $(".v"), dCode = $(".code"), dRes = $(".res");

  const R25 = 10000, B = 3950, RF = 10000, VCC = 5, T25 = 298.15;
  let bits = 10;
  const Rt = (c) => R25 * Math.exp(B * (1 / (c + 273.15) - 1 / T25));
  const Vout = (c) => VCC * RF / (Rt(c) + RF);               // 서미스터가 위, 고정 저항이 아래
  const codeOf = (v) => Math.min(2 ** bits - 1, Math.round(v / VCC * (2 ** bits - 1)));
  const tempOf = (code) => {                                  // 숫자 → 전압 → 저항 → 온도 (거꾸로)
    const v = Math.max(1e-6, code / (2 ** bits - 1) * VCC);
    const r = RF * (VCC - v) / v;
    return 1 / (Math.log(r / R25) / B + 1 / T25) - 273.15;
  };
  const stepC = (c) => { const dv = (Vout(c + 0.05) - Vout(c - 0.05)) / 0.1; return VCC / (2 ** bits - 1) / dv; };

  const { ctx, size } = fit(cv, () => draw());

  function update() {
    const c = +sT.value;
    oT.textContent = c.toFixed(1);
    const r = Rt(c);
    dR.textContent = r >= 1000 ? `${(r / 1000).toFixed(r < 10000 ? 2 : 1)} kΩ` : `${r.toFixed(0)} Ω`;
    dV.textContent = `${Vout(c).toFixed(3)} V`;
    dCode.textContent = codeOf(Vout(c));
    const s = stepC(c);
    dRes.textContent = `${s < 0.1 ? s.toFixed(3) : s.toFixed(2)} °C`;
    dRes.className = "res " + (s > 0.3 ? "bad" : "");
    draw();
  }

  function box(x, y, w, h, title, val, hl) {
    ctx.fillStyle = hl ? "#eef5eb" : C.card; ctx.strokeStyle = hl ? C.forest : C.ink; ctx.lineWidth = 1.2;
    ctx.fillRect(x, y, w, h); ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
    ctx.textAlign = "center";
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.fillText(title, x + w / 2, y + 15);
    ctx.font = `500 ${w < 70 ? 11.5 : 13}px ${F.mono}`; ctx.fillStyle = C.ink; ctx.fillText(val, x + w / 2, y + h - 10);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = +sT.value, v = Vout(c), code = codeOf(v), back = tempOf(code);

    // ── 위: 변환 사슬
    const titles = ["온도", "저항", "전압", "숫자", "표시"];
    const r = Rt(c);
    const vals = [`${c.toFixed(1)}°C`, r >= 1000 ? `${(r / 1000).toFixed(1)}kΩ` : `${r.toFixed(0)}Ω`, `${v.toFixed(2)}V`, `${code}`, `${back.toFixed(1)}°C`];
    const gap = w < 520 ? 10 : 18, bw = (w - 8 - gap * 4) / 5, bh = 44;
    titles.forEach((t, i) => {
      const x = 4 + i * (bw + gap);
      box(x, 6, bw, bh, t, vals[i], i === 0 || i === 4);
      if (i < 4) {
        ctx.strokeStyle = C.ink3; ctx.fillStyle = C.ink3; ctx.lineWidth = 1.2;
        const ax = x + bw + 2, ay = 6 + bh / 2;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + gap - 4, ay); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax + gap - 3, ay); ctx.lineTo(ax + gap - 8, ay - 3.5); ctx.lineTo(ax + gap - 8, ay + 3.5); ctx.closePath(); ctx.fill();
      }
    });
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    const sub = ["자연", "서미스터", "전압 나눔", `ADC ${bits}비트`, "거꾸로 계산"];
    if (w >= 420) sub.forEach((s, i) => ctx.fillText(s, 4 + i * (bw + gap) + bw / 2, 6 + bh + 13));

    // ── 아래: 온도–전압 그래프
    const x0 = 40, y0 = 6 + bh + 34, pw = w - x0 - 12, ph = h - y0 - 30;
    const X = (t) => x0 + (t + 20) / 120 * pw, Y = (vv) => y0 + (1 - vv / VCC) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y,
      xt: [-20, 0, 20, 40, 60, 80, 100].map((t) => [t, `${t}`]),
      yt: [0, 1, 2, 3, 4, 5].map((vv) => [vv, `${vv} V`]), xlabel: "온도 (°C)" });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let t = -20; t <= 100.01; t += 0.5) { t === -20 ? ctx.moveTo(X(t), Y(Vout(t))) : ctx.lineTo(X(t), Y(Vout(t))); }
    ctx.stroke();
    // 현재 점과 안내선
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(X(c), y0 + ph); ctx.lineTo(X(c), Y(v)); ctx.lineTo(x0, Y(v)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(X(c), Y(v), 5, 0, Math.PI * 2); ctx.fill();
    // 확대창: 이 온도 부근의 계단 (ADC 한 칸)
    const zw = Math.min(150, pw * 0.38), zh = Math.min(92, ph * 0.55), zx = c < 40 ? x0 + pw - zw - 4 : x0 + 8, zy = c < 40 ? y0 + ph - zh - 8 : y0 + 4;
    ctx.fillStyle = "rgba(251,251,248,.96)"; ctx.fillRect(zx, zy, zw, zh);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(zx + .5, zy + .5, zw - 1, zh - 1);
    const span = Math.max(0.5, stepC(c) * 5);  // 확대 폭 (°C)
    const tx = (t) => zx + 6 + (t - (c - span / 2)) / span * (zw - 12);
    const cA = codeOf(Vout(c - span / 2)), cB = codeOf(Vout(c + span / 2)), cr = Math.max(1, cB - cA + 1);
    const ty = (k) => zy + zh - 18 - (k - cA + 0.5) / cr * (zh - 34);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.8; ctx.beginPath();
    for (let i = 0; i <= 80; i++) { const t = c - span / 2 + span * i / 80, k = codeOf(Vout(t)); i ? ctx.lineTo(tx(t), ty(k)) : ctx.moveTo(tx(t), ty(k)); }
    ctx.stroke();
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(tx(c), ty(code), 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText(zw < 140 ? "확대: ADC 계단" : `확대: ${span.toFixed(span < 2 ? 2 : 1)} °C 구간의 ADC 숫자`, zx + 6, zy + 13);
    ctx.fillText(`계단 한 칸 = ${stepC(c).toFixed(2)} °C`, zx + 6, zy + zh - 5);
  }

  sT.addEventListener("input", update);
  root.querySelectorAll("[data-bits]").forEach((b) => b.addEventListener("click", () => {
    bits = +b.dataset.bits;
    root.querySelectorAll("[data-bits]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    update();
  }));
  update();
})();
