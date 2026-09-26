/* 카드: 암모니아 합성은 왜 높은 압력에서 할까? — N₂ + 3H₂ ⇌ 2NH₃ 평형 조성 (이상 기체 근사) */
(() => {
  const root = document.getElementById("card-chem-haber-eq");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sP = $(".pres"), sT = $(".temp"), oP = $(".pres-out"), oT = $(".temp-out");
  const dY = $(".y"), dK = $(".kp"), dN = $(".nmol");

  // Kp (atm⁻²): 300 °C 4.34×10⁻³, 500 °C 1.45×10⁻⁵ 두 측정값을 반트호프 식으로 이음 (400 °C에서 1.6×10⁻⁴)
  const Kp = (Tc) => Math.exp(-27.476 + 12630 / (Tc + 273.15));
  // N₂ 1 : H₂ 3 으로 넣었을 때 평형 진행 정도 x (N₂ 1 mol 중 반응한 몰수)
  function ext(P, Tc) {
    const K = Kp(Tc); let lo = 0, hi = 1 - 1e-12;
    for (let i = 0; i < 80; i++) {
      const x = (lo + hi) / 2, n = 4 - 2 * x;
      const q = ((2 * x / n) ** 2) / (((1 - x) / n) * ((3 - 3 * x) / n) ** 3) / (P * P);
      q < K ? lo = x : hi = x;
    }
    return lo;
  }
  const yNH3 = (P, Tc) => { const x = ext(P, Tc); return 2 * x / (4 - 2 * x); };

  const { ctx, size } = fit(cv, () => draw());
  const CN = "#4a6fa5", CH = "#b8bcc2", CNH = C.forest;
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const P = +sP.value, T = +sT.value;
    const split = Math.round(w * 0.62);
    const x0 = 40, y0 = 22, pw = split - x0 - 14, ph = h - y0 - 36, PM = 300;
    const X = (p) => x0 + p / PM * pw, Y = (v) => y0 + (1 - v) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [0, 100, 200, 300].map((v) => [v, `${v}`]), yt: [0, .2, .4, .6, .8].map((v) => [v, `${v * 100}`]), ylabel: "평형에서 NH₃ (몰 %)", xlabel: "압력 (atm)" });
    // 공업 조건 영역
    ctx.fillStyle = "rgba(224,160,42,.10)"; ctx.fillRect(X(150), y0, X(300) - X(150), ph);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = "#a8781c"; ctx.textAlign = "left"; ctx.fillText("실제 공정 압력", X(155), y0 + ph - 6);
    for (const Tc of [300, 400, 500, 600]) {
      ctx.beginPath();
      for (let p = 1; p <= PM; p += 3) { const yy = Y(yNH3(p, Tc)); p === 1 ? ctx.moveTo(X(p), yy) : ctx.lineTo(X(p), yy); }
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText(`${Tc} °C`, X(PM) - 2, Y(yNH3(PM, Tc)) - 4);
    }
    ctx.beginPath();
    for (let p = 1; p <= PM; p += 2) { const yy = Y(yNH3(p, T)); p === 1 ? ctx.moveTo(X(p), yy) : ctx.lineTo(X(p), yy); }
    ctx.strokeStyle = CNH; ctx.lineWidth = 2.4; ctx.stroke();
    const yy = yNH3(P, T);
    ctx.beginPath(); ctx.arc(X(P), Y(yy), 5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();

    // ── 입자 상자: 처음 N₂ 10개 + H₂ 30개
    const bx = split + 10, by = 22, bw = w - bx - 8, bh = h - 58;
    const x = ext(P, T);
    const nN = Math.round(10 * (1 - x)), nNH = Math.round(20 * x), nH = Math.round(30 * (1 - x));
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(bx + .5, by + .5, bw, bh);
    const list = [...Array(nNH).fill("a"), ...Array(nN).fill("n"), ...Array(nH).fill("h")];
    const cols = Math.max(4, Math.floor(Math.sqrt(40 * bw / bh))), rows = Math.ceil(40 / cols);
    const cw = bw / cols, rh = bh / rows, r = Math.min(cw, rh) * 0.2;
    let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - .5) * 0.3;
    list.forEach((k, i) => {
      const cx = bx + (i % cols + .5 + rnd()) * cw, cy = by + (Math.floor(i / cols) + .5 + rnd()) * rh;
      if (k === "a") { ctx.fillStyle = CN; ctx.beginPath(); ctx.arc(cx, cy, r * 1.2, 0, 7); ctx.fill(); ctx.fillStyle = CH; for (let j = 0; j < 3; j++) { const a = j * 2.1 + .5; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r * 1.4, cy + Math.sin(a) * r * 1.4, r * .6, 0, 7); ctx.fill(); } }
      else { const c = k === "n" ? CN : CH, rr = k === "n" ? r : r * .7; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx - rr * .8, cy, rr, 0, 7); ctx.arc(cx + rr * .8, cy, rr, 0, 7); ctx.fill(); }
    });
    ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText(`분자 ${nN + nH + nNH}개 (처음 40개)`, bx, h - 22);
    ctx.fillStyle = C.ink3; ctx.fillText("● N  ○ H", bx, h - 8);
  }

  function update() {
    const P = +sP.value, T = +sT.value;
    oP.textContent = P; oT.textContent = T;
    const y = yNH3(P, T);
    dY.textContent = `${(y * 100).toFixed(1)} %`;
    const k = Kp(T), e = Math.floor(Math.log10(k));
    dK.textContent = `${(k / 10 ** e).toFixed(1)}×10${String(e).split("").map((c) => "⁻⁰¹²³⁴⁵⁶⁷⁸⁹"["-0123456789".indexOf(c)]).join("")}`;
    const x = ext(P, T);
    dN.textContent = `${(4 - 2 * x).toFixed(2)} mol`;
    draw();
  }
  [sP, sT].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-set]").forEach((b) => b.addEventListener("click", () => { const [p, t] = b.dataset.set.split(","); sP.value = p; sT.value = t; update(); }));
  update();
})();
