/* 카드: 약을 두 알 먹으면 몸에서 빠져나가는 데 두 배가 걸릴까? — 1차 반응의 일정한 반감기, 2차 반응과 비교 (자료 해석) */
(() => {
  const root = document.getElementById("card-mateng-half-life");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sC = $(".c"), oC = $(".c-out"), nH1 = $(".n-h1"), nH2 = $(".n-h2"), nJ = $(".n-j");
  const EX = { caf: { t: "시간 (h)", th: 5, tmax: 24, dt: 1, order: 1 }, n2o5: { t: "시간 (분)", th: 24, tmax: 120, dt: 6, order: 1 }, second: { t: "시간 (분)", th: 24, tmax: 120, dt: 6, order: 2 } };
  let ex = "caf";
  const conc = (t) => { const E = EX[ex], c0 = +sC.value; if (E.order === 1) return c0 * 0.5 ** (t / E.th); const k = 1 / (100 * E.th); return c0 / (1 + k * c0 * t); };   // 2차: 100 %에서 반감기 = th
  const tTo = (f) => { const E = EX[ex], c0 = +sC.value; if (E.order === 1) return E.th * Math.log2(1 / f); const k = 1 / (100 * E.th); return (1 / f - 1) / (k * c0); };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const E = EX[ex], c0 = +sC.value, x0 = 50, y0 = h - 32, pw = w - x0 - 20, ph = h - 50;
    const X = (t) => x0 + t / E.tmax * pw, Y = (c) => y0 - c / 210 * ph;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    [0, 50, 100, 150, 200].forEach((c) => { ctx.beginPath(); ctx.moveTo(x0, Y(c)); ctx.lineTo(x0 + pw, Y(c)); ctx.stroke(); ctx.fillText(`${c}`, x0 - 5, Y(c) + 3); });
    ctx.textAlign = "center"; for (let t = 0; t <= E.tmax; t += E.tmax / 6) ctx.fillText(`${t}`, X(t), y0 + 13); ctx.fillText(E.t, x0 + pw / 2, y0 + 26);
    ctx.textAlign = "left"; ctx.fillText("농도 (%)", x0 + 4, y0 - ph + 4);
    ctx.strokeStyle = "rgba(63,111,163,.5)"; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 0; i <= 200; i++) { const t = E.tmax * i / 200; i ? ctx.lineTo(X(t), Y(conc(t))) : ctx.moveTo(X(t), Y(conc(t))); } ctx.stroke();
    let s = 21; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    ctx.fillStyle = "#3f6fa3"; for (let t = 0; t <= E.tmax + 1e-9; t += E.dt) { const c = conc(t) * (1 + (rnd() - 0.5) * 0.05); ctx.beginPath(); ctx.arc(X(t), Y(c), 3.5, 0, Math.PI * 2); ctx.fill(); }
    // 1/2, 1/4 표시
    [[0.5, "1/2"], [0.25, "1/4"]].forEach(([f, lab], i) => {
      const t = tTo(f), c = c0 * f; if (t > E.tmax) return;
      ctx.strokeStyle = i ? "#e0a02a" : "#b5532f"; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x0, Y(c)); ctx.lineTo(X(t), Y(c)); ctx.lineTo(X(t), y0); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = ctx.strokeStyle; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`처음의 ${lab}`, X(t) + 5, Y(c) - 5);
    });
  }
  function update() {
    oC.textContent = sC.value;
    const t1 = tTo(0.5), t2 = tTo(0.25) - t1, u = ex === "caf" ? "시간" : "분";
    nH1.textContent = `${t1.toFixed(1)} ${u}`; nH2.textContent = `${t2.toFixed(1)} ${u}`;
    nJ.textContent = Math.abs(t2 - t1) < 0.01 * t1 ? "반감기 일정 → 1차 반응" : "반감기가 길어짐 → 1차 아님";
    root.querySelectorAll("[data-ex]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.ex === ex)));
    draw();
  }
  sC.addEventListener("input", update);
  root.querySelectorAll("[data-ex]").forEach((b) => b.addEventListener("click", () => { ex = b.dataset.ex; update(); }));
  update();
})();
