/* 카드: 별의 색으로 온도를 어떻게 알까? — 플랑크 곡선, 빈 법칙, 슈테판–볼츠만 법칙 */
(() => {
  const root = document.getElementById("card-earth-blackbody");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".temp"), oT = $(".temp-out"), cmp = $(".cmp");
  const nPeak = $(".peak"), nPow = $(".pow"), sw = $(".star-sw"), msg = $(".bb-msg");
  const h = 6.626e-34, c = 2.998e8, k = 1.381e-23, WIEN = 2.898e-3, TSUN = 5772;

  // 플랑크 법칙: 파장 λ(m), 온도 T(K)에서의 복사 세기
  const planck = (l, T) => 2 * h * c * c / l ** 5 / (Math.exp(h * c / (l * k * T)) - 1);
  // CIE 1931 등색 함수의 해석적 근사 (Wyman, Sloan, Shirley 2013)
  const g = (x, m, s1, s2) => Math.exp(-0.5 * ((x - m) / (x < m ? s1 : s2)) ** 2);
  const cmf = (nm) => [
    1.056 * g(nm, 599.8, 37.9, 31.0) + 0.362 * g(nm, 442.0, 16.0, 26.7) - 0.065 * g(nm, 501.1, 20.4, 26.2),
    0.821 * g(nm, 568.8, 46.9, 40.5) + 0.286 * g(nm, 530.9, 16.3, 31.1),
    1.217 * g(nm, 437.0, 11.8, 36.0) + 0.681 * g(nm, 459.0, 26.0, 13.8)];
  function linRGB(T) {
    let X = 0, Y = 0, Z = 0;
    for (let nm = 380; nm <= 780; nm += 5) { const p = planck(nm * 1e-9, T), [x, y, z] = cmf(nm); X += p * x; Y += p * y; Z += p * z; }
    return [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.2040 * Y + 1.0570 * Z];
  }
  const WHITE = linRGB(6504);   // 기준 흰색(D65)에 맞춰 보정: 6504 K 흑체를 흰색으로 둔다
  function starColor(T) {
    let [r, gg, b] = linRGB(T).map((v, i) => v / WHITE[i]);
    const m = Math.max(r, gg, b); [r, gg, b] = [r, gg, b].map((v) => Math.pow(Math.max(0, v / m), 1 / 2.2));
    return `rgb(${Math.round(r * 255)},${Math.round(gg * 255)},${Math.round(b * 255)})`;
  }
  // 파장 → 대략의 색 (가시광 띠 그리기용)
  function wl(l) {
    let r = 0, gg = 0, b = 0;
    if (l < 440) { r = -(l - 440) / 60; b = 1; } else if (l < 490) { gg = (l - 440) / 50; b = 1; } else if (l < 510) { gg = 1; b = -(l - 510) / 20; }
    else if (l < 580) { r = (l - 510) / 70; gg = 1; } else if (l < 645) { r = 1; gg = -(l - 645) / 65; } else r = 1;
    return `rgb(${Math.round(r * 255)},${Math.round(gg * 255)},${Math.round(b * 255)})`;
  }

  const { ctx, size } = fit(cv, () => draw());
  const L0 = 100, L1 = 2000;   // nm

  function draw() {
    const { w, h: H } = size; if (!w) return;
    ctx.clearRect(0, 0, w, H);
    const T = +sT.value;
    const x0 = 44, y0 = 22, pw = w - x0 - 10, ph = H - y0 - 50;
    const peakT = planck(WIEN / T, T), peakS = planck(WIEN / TSUN, TSUN);
    const ymax = Math.max(peakT, cmp.checked ? peakS : 0) * 1.08;
    const X = (nm) => x0 + (nm - L0) / (L1 - L0) * pw, Y = (v) => y0 + (1 - v / ymax) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [[100, "100"], [500, "500"], [1000, "1000"], [1500, "1500"], [2000, "2000 nm"]], yt: [], ylabel: "복사 세기 (상대값, 같은 눈금)" });
    // 가시광 띠
    for (let nm = 380; nm <= 750; nm += 2) { ctx.fillStyle = wl(nm); ctx.globalAlpha = 0.09; ctx.fillRect(X(nm), y0, X(nm + 2) - X(nm) + .5, ph); }
    ctx.globalAlpha = 1;
    for (let nm = 380; nm <= 750; nm += 2) { ctx.fillStyle = wl(nm); ctx.fillRect(X(nm), y0 + ph + 20, X(nm + 2) - X(nm) + .5, 7); }
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    ctx.fillText("자외선", X(230), y0 + ph + 27); ctx.fillText("가시광선", X(565), y0 + ph + 40); ctx.fillText("적외선", X(1200), y0 + ph + 27);
    const curve = (TT, col, lw, dash) => {
      ctx.beginPath(); for (let nm = L0; nm <= L1; nm += 4) { const y = Y(planck(nm * 1e-9, TT)); nm === L0 ? ctx.moveTo(X(nm), y) : ctx.lineTo(X(nm), y); }
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]);
    };
    if (cmp.checked) curve(TSUN, C.ink3, 1.3, [4, 4]);
    curve(T, starColor(T) === "rgb(255,255,255)" ? C.ink : C.ink, 2.4, []);
    // 봉우리
    const lp = WIEN / T * 1e9;
    if (lp >= L0 && lp <= L1) {
      ctx.strokeStyle = C.warn; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(lp), Y(peakT)); ctx.lineTo(X(lp), y0 + ph); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.warn; ctx.textAlign = lp > 1500 ? "right" : "left"; ctx.font = `10.5px ${F.mono}`;
      ctx.fillText(`λmax = ${Math.round(lp)} nm`, X(lp) + (lp > 1500 ? -6 : 6), Y(peakT) + 12);
    }
    if (cmp.checked) { ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.font = `10px ${F.sans}`; ctx.fillText("점선: 태양 (5772 K)", x0 + pw, y0 + 10); }
    ctx.textAlign = "left";
  }

  function update() {
    const T = +sT.value;
    oT.textContent = T.toLocaleString("ko-KR");
    const lp = WIEN / T * 1e9;
    nPeak.textContent = `${Math.round(lp)} nm`;
    const r = (T / TSUN) ** 4;
    nPow.textContent = r >= 10 ? `${Math.round(r)}배` : `${r.toFixed(2)}배`;
    sw.style.background = starColor(T);
    msg.textContent = lp < 380 ? "봉우리가 자외선 쪽에 있습니다. 가시광선에서는 파란빛이 상대적으로 세서 청백색으로 보입니다."
      : lp > 750 ? "봉우리가 적외선 쪽에 있습니다. 가시광선에서는 붉은빛이 상대적으로 세서 붉게 보입니다."
      : "봉우리가 가시광선 안에 있습니다. 여러 색이 고르게 섞여 흰색에 가깝게 보입니다(태양은 우주에서 보면 흰색입니다).";
    root.querySelectorAll("[data-t]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.t === T)));
    draw();
  }
  sT.addEventListener("input", update); cmp.addEventListener("change", update);
  root.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { sT.value = b.dataset.t; update(); }));
  update();
})();
