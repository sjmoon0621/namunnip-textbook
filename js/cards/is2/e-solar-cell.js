/* 카드: 태양 전지는 빛을 어떻게 전기로 바꿀까? — 띠틈과 햇빛 스펙트럼 (5778 K 흑체 근사) */
(() => {
  const root = document.getElementById("card-is2-solar-cell");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sG = $(".eg"), oG = $(".eg-out"), oL = $(".lam-out");
  const nBelow = $(".below"), nHeat = $(".heat"), nUse = $(".use"), msg = $(".s-msg");

  const kT = 8.617e-5 * 5778;                      // eV
  const n = (E) => E * E / (Math.exp(E / kT) - 1); // 광자 수 분포 (상대값)
  const p = (E) => E * n(E);                       // 에너지 분포
  const dE = 0.005, EMAX = 10;
  let TOT = 0; for (let E = dE; E < EMAX; E += dE) TOT += p(E) * dE;
  function split(Eg) {
    let N = 0, above = 0;
    for (let E = Eg; E < EMAX; E += dE) { N += n(E) * dE; above += p(E) * dE; }
    const use = Eg * N / TOT;
    return { below: 1 - above / TOT, heat: above / TOT - use, use };
  }
  const MAT = { ge: 0.66, si: 1.12, gaas: 1.42, gainp: 1.9 };

  const { ctx, size } = fit(cv, () => draw());
  // 파장(nm) → 대략의 색
  function wl2rgb(l) {
    let r = 0, g = 0, b = 0;
    if (l < 440) { r = -(l - 440) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; }
    else if (l < 510) { g = 1; b = -(l - 510) / 20; } else if (l < 580) { r = (l - 510) / 70; g = 1; }
    else if (l < 645) { r = 1; g = -(l - 645) / 65; } else { r = 1; }
    return `rgb(${Math.round(255 * r)},${Math.round(255 * g)},${Math.round(255 * b)})`;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const Eg = +sG.value;
    const padL = 14, padR = 12, padT = 24, band = 8, padB = 34 + band;
    const insetW = w < 480 ? 0 : Math.min(130, w * 0.26);
    const pw = w - padL - padR - insetW, ph = h - padT - padB;
    const E0 = 0, E1 = 4, pmax = p(2.821 * kT) * 1.08;
    const X = (E) => padL + (E - E0) / (E1 - E0) * pw, Y = (v) => padT + (1 - v / pmax) * ph;
    NM.axes(ctx, { x0: padL, y0: padT, w: pw, h: ph, X, Y, xt: [[0, "0"], [1, "1"], [2, "2"], [3, "3"], [4, "4 eV"]], ylabel: "햇빛 에너지 분포 (상대값)" });
    // 채우기: 띠틈 아래(통과), 띠틈 위의 쓰는 몫과 열
    for (let E = 0.01; E < E1; E += 0.01) {
      const x = X(E), wd = X(E + 0.01) - x + 0.5;
      if (E < Eg) { ctx.fillStyle = "rgba(141,141,146,.35)"; ctx.fillRect(x, Y(p(E)), wd, Y(0) - Y(p(E))); }
      else {
        const use = Eg * n(E);
        ctx.fillStyle = "rgba(59,124,42,.75)"; ctx.fillRect(x, Y(use), wd, Y(0) - Y(use));
        ctx.fillStyle = "rgba(181,83,47,.45)"; ctx.fillRect(x, Y(p(E)), wd, Y(use) - Y(p(E)));
      }
    }
    ctx.beginPath(); for (let E = 0.01; E < E1; E += 0.01) ctx.lineTo(X(E), Y(p(E))); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.stroke();
    // 가시광 띠 (1.65–3.1 eV)
    const by = padT + ph + 18;
    for (let E = 1.6; E <= 3.2; E += 0.01) { const l = 1240 / E; if (l < 390 || l > 760) continue; ctx.fillStyle = wl2rgb(l); ctx.fillRect(X(E), by, X(E + 0.01) - X(E) + 0.5, band); }
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText("적외선", X(0.5), by + band - 1); ctx.textAlign = "right"; ctx.fillText("자외선", X(4), by + band - 1); ctx.textAlign = "left";
    // 띠틈 선
    ctx.strokeStyle = C.ink; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(Eg), padT); ctx.lineTo(X(Eg), padT + ph); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.mono}`; ctx.fillText(`띠틈 ${Eg.toFixed(2)} eV`, X(Eg) + 5, padT + 12);
    // 인셋: 에너지띠 그림
    if (insetW) {
      const ix = w - insetW + 8, iw = insetW - 16, top = padT + 10, gapPx = clamp(Eg / 3, 0.1, 1) * (ph * 0.5);
      const cb = top + 30, vb = cb + 14 + gapPx;
      ctx.fillStyle = "rgba(74,120,168,.25)"; ctx.fillRect(ix, top, iw, cb - top);
      ctx.fillStyle = "rgba(141,141,146,.35)"; ctx.fillRect(ix, vb, iw, 40);
      ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2;
      ctx.fillText("전도띠", ix + 4, top + 12); ctx.fillText("원자가 띠", ix + 4, vb + 30);
      ctx.fillStyle = C.ink3; ctx.fillText(`띠틈`, ix + iw - 30, (cb + vb) / 2 + 4);
      // 전자와 양공
      const ex = ix + iw * 0.35;
      ctx.fillStyle = "#4a78a8"; ctx.beginPath(); ctx.arc(ex, cb - 6, 4, 0, 7); ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ex, vb + 8, 4, 0, 7); ctx.stroke();
      ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let k = 0; k <= 30; k++) { const y = vb + 8 - (vb - cb + 14) * k / 30; ctx.lineTo(ex - 18 + 4 * Math.sin(k * 1.2), y); }
      ctx.stroke();
      ctx.fillStyle = "#8a6516"; ctx.fillText("빛", ex - 30, (cb + vb) / 2 + 4);
      ctx.fillStyle = C.ink3; ctx.fillText("전자 −", ex + 8, cb - 3); ctx.fillText("양공 +", ex + 8, vb + 11);
    }
  }

  function update() {
    const Eg = +sG.value, s = split(Eg);
    oG.textContent = Eg.toFixed(2); oL.textContent = Math.round(1240 / Eg);
    nBelow.textContent = `${(s.below * 100).toFixed(0)}%`;
    nHeat.textContent = `${(s.heat * 100).toFixed(0)}%`;
    nUse.textContent = `${(s.use * 100).toFixed(0)}%`;
    msg.textContent = Eg < 0.9 ? "띠틈이 작으면 거의 모든 빛을 흡수하지만, 전자 하나가 얻는 에너지가 작아 햇빛 에너지의 절반가량을 열로 잃습니다."
      : Eg > 1.8 ? "띠틈이 크면 전자 하나가 얻는 에너지는 크지만, 에너지가 모자란 빛이 절반 넘게 그냥 통과합니다."
      : "두 손실이 균형을 이루는 1.1 eV 부근에서 쓸 수 있는 몫이 가장 큽니다. 실리콘의 띠틈이 이 근처에 있습니다.";
    root.querySelectorAll("[data-eg]").forEach((b) => b.setAttribute("aria-pressed", Math.abs(MAT[b.dataset.eg] - Eg) < 0.005));
    draw();
  }
  sG.addEventListener("input", update);
  root.querySelectorAll("[data-eg]").forEach((b) => b.addEventListener("click", () => { sG.value = MAT[b.dataset.eg]; update(); }));
  update();
})();
