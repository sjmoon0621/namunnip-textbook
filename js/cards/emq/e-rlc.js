/* 카드: 축전기에 담긴 에너지는 회로에서 어디로 갈까? — 직렬 RLC 방전의 에너지 분배 (수치 적분) */
(() => {
  const root = document.getElementById("card-emq-rlc");
  if (!root) return;
  const { C: COL, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sR = $(".r"), oR = $(".r-out"), sL = $(".l"), oL = $(".l-out"), sC = $(".c"), oC = $(".c-out"), nE = $(".n-e"), nK = $(".n-k"), nT = $(".n-t");
  const V0 = 10;
  const PRE = { rc: [1, -2, 2], lc: [-1, 1.3, 2], rlc: [0.7, 1, 2] };
  const vals = () => ({ R: 10 ** +sR.value, L: 10 ** +sL.value * 1e-3, Cc: 10 ** +sC.value * 1e-6 });
  function sim() {
    const { R, L, Cc } = vals(), T = 2 * Math.PI * Math.sqrt(L * Cc), under = R < 2 * Math.sqrt(L / Cc);
    const tEnd = under ? Math.min(6 * T, Math.max(2 * T, 3 * L / R)) : 5 * R * Cc, N = 3000, dt = tEnd / N;
    let q = Cc * V0, I = 0, heat = 0; const out = [];
    for (let k = 0; k <= N; k++) {
      out.push([k * dt, 0.5 * q * q / Cc, 0.5 * L * I * I, heat, I]);
      // 반암시적 오일러를 잘게 나눠서 (강성 회로 대비)
      const sub = 20, h = dt / sub;
      for (let j = 0; j < sub; j++) { I = (I + h * (-(q / Cc)) / L) / (1 + h * R / L); q += h * I; heat += R * I * I * h; }
    }
    return { out, tEnd };
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { out, tEnd } = sim(), E0 = out[0][1], x0 = 44, x1 = w - 12, y0 = h - 28, y1 = 16, X = (t) => x0 + t / tEnd * (x1 - x0), Y = (e) => y0 - e / E0 * (y0 - y1);
    // 쌓은 영역: 축전기(아래) + 인덕터 + 열
    const band = (f0, f1, col) => { ctx.fillStyle = col; ctx.beginPath(); out.forEach((p, i) => { const x = X(p[0]), y = Y(f1(p)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); for (let i = out.length - 1; i >= 0; i--) ctx.lineTo(X(out[i][0]), Y(f0(out[i]))); ctx.fill(); };
    band(() => 0, (p) => p[1], "rgba(63,111,163,.55)");
    band((p) => p[1], (p) => p[1] + p[2], "rgba(138,79,181,.5)");
    band((p) => p[1] + p[2], (p) => Math.min(E0, p[1] + p[2] + p[3]), "rgba(181,83,47,.4)");
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    ctx.fillStyle = COL.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("처음", x0 - 4, y1 + 4); ctx.fillText("0", x0 - 4, y0);
    const tu = tEnd < 1e-3 ? [1e6, "μs"] : tEnd < 1 ? [1e3, "ms"] : [1, "s"];
    for (let k = 0; k <= 4; k++) { const t = tEnd * k / 4; ctx.textAlign = k === 4 ? "right" : "center"; ctx.fillText(`${+(t * tu[0]).toPrecision(2)} ${tu[1]}`, X(t), y0 + 14); }
    [["rgba(63,111,163,.8)", "축전기 (전기장) ½CV²"], ["rgba(138,79,181,.8)", "인덕터 (자기장) ½LI²"], ["rgba(181,83,47,.7)", "저항에서 나간 열"]].forEach(([c, t], i) => { ctx.fillStyle = c; ctx.fillRect(x1 - 150, y1 + 4 + i * 15, 10, 10); ctx.fillStyle = COL.ink; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(t, x1 - 136, y1 + 13 + i * 15); });
  }
  function update() {
    const { R, L, Cc } = vals(); oR.textContent = R < 10 ? R.toFixed(1) : Math.round(R); oL.textContent = +(L * 1e3).toPrecision(2); oC.textContent = Math.round(Cc * 1e6);
    nE.textContent = `${(0.5 * Cc * V0 * V0 * 1000).toFixed(1)} mJ`;
    const crit = 2 * Math.sqrt(L / Cc); nK.textContent = R < crit * 0.999 ? `진동하며 줄어듦 (R < 2√(L/C) = ${crit.toFixed(1)} Ω)` : `진동 없이 줄어듦 (R ≥ 2√(L/C) = ${crit.toFixed(1)} Ω)`;
    const T = 2 * Math.PI * Math.sqrt(L * Cc); nT.textContent = T < 1e-3 ? `${(T * 1e6).toFixed(0)} μs` : `${(T * 1e3).toFixed(2)} ms`;
    draw();
  }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { const [r, l, c] = PRE[b.dataset.p]; sR.value = r; sL.value = l; sC.value = c; update(); }));
  [sR, sL, sC].forEach((s) => s.addEventListener("input", update)); update();
})();
