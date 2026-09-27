/* 카드: 별빛의 검은 선으로 온도와 원소를 어떻게 알아낼까? — 흑체 연속 스펙트럼 + 온도에 따른 흡수선 세기(모식) */
(() => {
  const root = document.getElementById("card-emq-star-spectrum");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), oT = $(".t-out"), nC = $(".n-c"), nW = $(".n-w"), nL = $(".n-l");
  const L0 = 380, L1 = 700;
  const g = (x, m, s) => Math.exp(-(((x - m) / s) ** 2));
  // [이름, 파장들, 온도에 따른 세기, 선 폭]
  const LINES = [
    ["수소 (Hα·Hβ·Hγ·Hδ)", [656.3, 486.1, 434.0, 410.2], (T) => g(Math.log10(T), 4.0, 0.2), 1.6, "H"],
    ["칼슘 이온 (Ca II H·K)", [393.4, 396.8], (T) => g(T, 5200, 2200), 2.0, "Ca"],
    ["나트륨 (Na D)", [589.0, 589.6], (T) => g(T, 4300, 1500), 1.0, "Na"],
    ["마그네슘·철", [517.3, 527.0, 438.4, 430.8], (T) => g(T, 4800, 1700) * 0.8, 0.9, "Fe"],
    ["헬륨 (He I)", [447.1, 471.3, 501.6, 587.6, 667.8], (T) => T > 9000 ? g(T, 22000, 8000) : 0, 1.0, "He"],
    ["산화 타이타늄 분자띠 (TiO)", [476.1, 495.5, 516.7, 544.8, 586.1, 615.9, 667.4], (T) => Math.max(0, Math.min(1, (4000 - T) / 900)), 5, "TiO"],
  ];
  const cls = (T) => T > 30000 ? "O" : T > 10000 ? "B" : T > 7500 ? "A" : T > 6000 ? "F" : T > 5200 ? "G" : T > 3700 ? "K" : "M";
  function rgb(l) { let r = 0, gg = 0, b = 0; if (l < 440) { r = (440 - l) / 60; b = 1; } else if (l < 490) { gg = (l - 440) / 50; b = 1; } else if (l < 510) { gg = 1; b = (510 - l) / 20; } else if (l < 580) { r = (l - 510) / 70; gg = 1; } else if (l < 645) { r = 1; gg = (645 - l) / 65; } else r = 1; const f = l < 420 ? 0.3 + 0.7 * (l - 380) / 40 : l > 680 ? 0.3 + 0.7 * (700 - l) / 20 : 1; return [r * f, gg * f, b * f]; }
  const planck = (l, T) => 1 / ((l * 1e-9) ** 5 * (Math.exp(0.014388 / (l * 1e-9 * T)) - 1));
  const absorb = (l, T) => { let t = 1; LINES.forEach(([, ls, fs, wd]) => { const s = fs(T); ls.forEach((c) => { t *= 1 - 0.92 * s * Math.exp(-(((l - c) / wd) ** 2)); }); }); return t; };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const T = 10 ** +sT.value, x0 = 14, x1 = w - 14, X = (l) => x0 + (l - L0) / (L1 - L0) * (x1 - x0), N = Math.round(x1 - x0);
    let bmax = 0; for (let l = L0; l <= L1; l++) bmax = Math.max(bmax, planck(l, T));
    // 스펙트럼 띠
    const sy = 12, sh = h * 0.26;
    for (let i = 0; i < N; i++) { const l = L0 + (L1 - L0) * i / N, [r, gg, b] = rgb(l), a = absorb(l, T), br = 0.25 + 0.75 * planck(l, T) / bmax; ctx.fillStyle = `rgb(${Math.round(255 * r * a * br)},${Math.round(255 * gg * a * br)},${Math.round(255 * b * a * br)})`; ctx.fillRect(x0 + i, sy, 1.2, sh); }
    // 세기 그래프
    const gy0 = h - 38, gy1 = sy + sh + 14, Y = (v) => gy0 - v * (gy0 - gy1);
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); for (let l = L0; l <= L1; l++) { const y = Y(planck(l, T) / bmax); l === L0 ? ctx.moveTo(X(l), y) : ctx.lineTo(X(l), y); } ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.beginPath(); for (let l = L0; l <= L1; l += 0.25) { const y = Y(planck(l, T) / bmax * absorb(l, T)); l === L0 ? ctx.moveTo(X(l), y) : ctx.lineTo(X(l), y); } ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(x0, gy0); ctx.lineTo(x1, gy0); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; [400, 450, 500, 550, 600, 650, 700].forEach((l) => { ctx.textAlign = l === 700 ? "right" : "center"; ctx.fillText(`${l}`, X(l), gy0 + 12); });
    ctx.textAlign = "right"; ctx.fillText("파장 (nm)", x1, gy0 + 24);
    // 두드러진 선 이름표
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "center";
    LINES.forEach(([, ls, fs, , tag]) => { if (fs(T) < 0.35) return; const c = tag === "TiO" ? ls[3] : ls[0]; ctx.fillStyle = C.warn; ctx.fillText(tag, X(c), gy1 - 2); });
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("점선: 흡수선이 없을 때 (흑체)", x0, h - 6);
  }
  function update() {
    const T = 10 ** +sT.value; oT.textContent = Math.round(T / 10) * 10;
    nC.textContent = `${cls(T)}형`; const lm = 2.898e6 / T; nW.textContent = `${Math.round(lm)} nm${lm > 700 ? " (적외선)" : lm < 380 ? " (자외선)" : ""}`;
    const s = LINES.map(([n, , f]) => [n, f(T)]).filter(([, v]) => v > 0.35).sort((a, b) => b[1] - a[1]).map(([n]) => n);
    nL.textContent = s.length ? s.join(", ") : "뚜렷한 선이 적음";
    draw();
  }
  root.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { sT.value = Math.log10(+b.dataset.t); update(); }));
  sT.addEventListener("input", update); update();
})();
