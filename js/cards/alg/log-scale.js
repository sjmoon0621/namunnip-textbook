/* 카드: 규모 7 지진은 규모 5 지진보다 몇 배 셀까? — 로그로 정한 양(규모, pH, dB)의 차와 실제 양의 비
   지진 에너지: log E = 4.8 + 1.5M (E는 J, 구텐베르크–리히터 관계)
   pH = −log[H⁺] ([H⁺]는 mol/L), 소리: L = 10 log(I/I₀) dB, I₀ = 10⁻¹² W/m² */
(() => {
  const root = document.getElementById("card-alg-log-scale");
  if (!root) return;
  const { C, F, fit } = NM, E = NMExp;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".presets .chip")];
  const sv = $(".v"), sr = $(".r");
  const K = {
    quake: { lab: "규모 M", min: 3, max: 9.5, step: 0.1, v: 7, r: 5, qn: "에너지 E", unit: "J",
      lq: (M) => 4.8 + 1.5 * M, note: "규모와 에너지 관계는 log E = 4.8 + 1.5M (E는 J)을 썼습니다.",
      marks: [[5.4, "2017 포항 5.4"], [5.8, "2016 경주 5.8"], [9.0, "2011 동일본 9.0"]] },
    ph: { lab: "pH", min: 0, max: 14, step: 0.1, v: 3, r: 7, qn: "[H⁺]", unit: "mol/L",
      lq: (p) => -p, note: "예시는 대략값입니다. 순수한 물의 pH 7은 25 °C 기준입니다.",
      marks: [[2, "레몬즙 약 2"], [5, "커피 약 5"], [7, "순수한 물 7"], [8.1, "바닷물 약 8.1"], [11.5, "암모니아수 약 11.5"]] },
    db: { lab: "세기 수준 L (dB)", min: 0, max: 130, step: 1, v: 90, r: 60, qn: "세기 I", unit: "W/m²",
      lq: (L) => L / 10 - 12, note: "예시는 대략값입니다. 0 dB은 사람이 들을 수 있는 가장 약한 소리의 기준 세기입니다.",
      marks: [[0, "기준 0"], [30, "속삭임 약 30"], [60, "대화 약 60"], [120, "통증을 느끼는 소리 약 120"]] },
  };
  let key = "quake";
  const { ctx, size } = fit($("canvas"), () => draw());
  const sci = (lg) => { const e = Math.floor(lg + 1e-9), m = 10 ** (lg - e); return `${m.toFixed(2)} × 10<sup>${E.n(e)}</sup>`; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = K[key], PL = 20, PR = w - 20, X = (v) => PL + (v - k.min) / (k.max - k.min) * (PR - PL);
    const y1 = h * 0.5, y2 = h * 0.82, v = +sv.value, r = +sr.value;
    k.marks.forEach(([mv, lab], i) => {
      const x = X(mv), y = 14 + (i % 3) * 16;
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.lineTo(x, y1 - 6); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textBaseline = "middle";
      const tw = ctx.measureText(lab).width; ctx.textAlign = x + tw / 2 > PR ? "right" : x - tw / 2 < PL ? "left" : "center";
      ctx.fillText(lab, x, y);
    });
    ctx.fillStyle = E.BLUE; ctx.globalAlpha = 0.25; ctx.fillRect(Math.min(X(v), X(r)), y1 - 7, Math.abs(X(v) - X(r)), 14); ctx.globalAlpha = 1;
    [[y1, "로그 값 (고른 간격)"], [y2, `${k.qn}의 10의 지수`]].forEach(([y, lab]) => {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(PL, y); ctx.lineTo(PR, y); ctx.stroke();
      ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "bottom"; ctx.fillText(lab, PL, y - 9);
    });
    const span = k.max - k.min, stepT = span > 50 ? 20 : span > 10 ? 2 : 1;
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillStyle = C.ink3;
    for (let t = Math.ceil(k.min / stepT) * stepT; t <= k.max + 1e-9; t += stepT) {
      ctx.fillRect(X(t) - 0.5, y1 - 5, 1, 10); ctx.fillText(E.n(t), X(t), y1 + 7);
      ctx.fillRect(X(t) - 0.5, y2 - 5, 1, 10); ctx.fillText(E.n(k.lq(t), 1), X(t), y2 + 7);
    }
    [[r, E.BLUE], [v, C.warn]].forEach(([val, col]) => { ctx.fillStyle = col; [y1, y2].forEach((y) => { ctx.beginPath(); ctx.arc(X(val), y, 6, 0, 7); ctx.fill(); }); });
  }

  function update() {
    const k = K[key], v = +sv.value, r = +sr.value, dl = k.lq(v) - k.lq(r);
    $(".v-out").textContent = E.n(v); $(".r-out").textContent = E.n(r); $(".lab").textContent = k.lab;
    $(".d-q").textContent = `${k.qn} (${k.unit})`;
    $(".n-q").innerHTML = sci(k.lq(v));
    $(".n-d").textContent = `${E.n(v - r, 2)} (지수 차 ${E.n(dl, 2)})`;
    const big = Math.abs(dl) < 6 ? E.n(10 ** Math.abs(dl), 2) : sci(Math.abs(dl)).replace(/^1\.00 × /, "");
    $(".n-r").innerHTML = dl >= 0 ? `${big}배` : `1/${big}배`;
    const eqs = {
      quake: `log E = 4.8 + 1.5 × ${E.n(v)} = ${E.n(k.lq(v), 2)}`,
      ph: `[H<sup>+</sup>] = 10<sup>−pH</sup> = 10<sup>${E.n(-v)}</sup> mol/L`,
      db: `I = I<sub>0</sub> × 10<sup>L/10</sup> = 10<sup>${E.n(k.lq(v), 1)}</sup> W/m<sup>2</sup>`,
    };
    $(".eq").innerHTML = eqs[key];
    $(".f-note").textContent = k.note;
    draw();
  }
  chips.forEach((c) => c.addEventListener("click", () => {
    key = c.dataset.k; const k = K[key];
    [sv, sr].forEach((s) => { s.min = k.min; s.max = k.max; s.step = k.step; });
    sv.value = k.v; sr.value = k.r;
    chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c))); update();
  }));
  [sv, sr].forEach((s) => s.addEventListener("input", update));
  update();
})();
