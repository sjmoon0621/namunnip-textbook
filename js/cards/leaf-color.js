/* 카드: 잎은 왜 초록색일까? — 색소 흡수 스펙트럼 모식도 */
(() => {
  const root = document.getElementById("card-leaf-color");
  if (!root) return;
  const { C, F, clamp, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), slider = $(".lambda"), out = $(".lambda-out");
  const absOut = $(".abs-out"), beam = $(".beam"), leafSw = $(".leaf-sw");
  const on = { a: true, b: true, car: true };

  const G = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2);
  // 추출 용액 기준의 대략적인 봉우리 위치를 따른 모식 곡선 (각각 최대값 1로 정규화)
  const PIG = {
    a:   { color: "#2f6b22", amt: 1.0,  f: (l) => 1.0 * G(l, 430, 13) + 0.25 * G(l, 410, 18) + 0.82 * G(l, 662, 11) + 0.12 * G(l, 618, 14) + 0.07 * G(l, 578, 16) },
    b:   { color: "#8fbf5e", amt: 0.45, f: (l) => 1.0 * G(l, 455, 12) + 0.30 * G(l, 432, 16) + 0.55 * G(l, 644, 10) + 0.10 * G(l, 598, 14) },
    car: { color: C.amber,   amt: 0.4,  f: (l) => 0.72 * G(l, 448, 15) + 0.86 * G(l, 477, 13) + 0.45 * G(l, 424, 12) },
  };
  for (const k in PIG) {
    const raw = PIG[k].f; let m = 0;
    for (let l = 380; l <= 720; l++) m = Math.max(m, raw(l));
    PIG[k].f = (l) => raw(l) / m;
  }
  const K = 1.7;
  const absorbed = (l) => {
    let A = 0;
    for (const k in PIG) if (on[k]) A += PIG[k].amt * PIG[k].f(l);
    return 1 - Math.pow(10, -K * A);
  };

  function wl2rgb(l) { // Dan Bruton 근사
    let r = 0, g = 0, b = 0;
    if (l < 440) { r = -(l - 440) / 60; b = 1; }
    else if (l < 490) { g = (l - 440) / 50; b = 1; }
    else if (l < 510) { g = 1; b = -(l - 510) / 20; }
    else if (l < 580) { r = (l - 510) / 70; g = 1; }
    else if (l < 645) { r = 1; g = -(l - 645) / 65; }
    else { r = 1; }
    let f = 1;
    if (l < 420) f = 0.3 + 0.7 * (l - 380) / 40;
    else if (l > 700) f = 0.3 + 0.7 * (780 - l) / 80;
    return [r * f, g * f, b * f];
  }
  const css = ([r, g, b]) => `rgb(${Math.round(255 * r)},${Math.round(255 * g)},${Math.round(255 * b)})`;
  const gam = (v) => Math.pow(clamp(v, 0, 1), 1 / 1.6);
  function leftover() {
    const sum = [0, 0, 0], white = [0, 0, 0];
    for (let l = 400; l <= 700; l += 2) {
      const c = wl2rgb(l), t = 1 - absorbed(l);
      for (let i = 0; i < 3; i++) { sum[i] += c[i] * t; white[i] += c[i]; }
    }
    return sum.map((s, i) => gam(0.9 * s / white[i]));
  }

  const { ctx, size } = fit(cv, () => draw());
  const L0 = 400, L1 = 700;

  function draw() {
    const { w, h } = size;
    const padL = 36, padR = 10, padT = 18, band = 12, padB = 22 + band + 8;
    const pw = w - padL - padR, ph = h - padT - padB;
    const X = (l) => padL + (l - L0) / (L1 - L0) * pw;
    const Y = (v) => padT + (1 - v / 1.05) * ph;
    ctx.clearRect(0, 0, w, h);
    NM.axes(ctx, { x0: padL, y0: padT, w: pw, h: ph, X, Y, yt: [[0, "0"], [0.5, ".5"], [1, "1"]], ylabel: "상대 흡광도" });
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let l = 400; l <= 700; l += 50) ctx.fillText(l, X(l), h - 6);
    ctx.textAlign = "right"; ctx.fillText("nm", w - 2, h - 20); ctx.textAlign = "left";

    const by = padT + ph + 6;
    for (let x = 0; x < pw; x++) {
      ctx.fillStyle = css(wl2rgb(L0 + x / pw * (L1 - L0)).map(gam));
      ctx.fillRect(padL + x, by, 1.5, band);
    }
    ctx.beginPath(); ctx.moveTo(X(L0), Y(0));
    for (let l = L0; l <= L1; l++) ctx.lineTo(X(l), Y(absorbed(l)));
    ctx.lineTo(X(L1), Y(0)); ctx.closePath();
    ctx.fillStyle = "rgba(35,35,38,.07)"; ctx.fill();

    for (const k in PIG) {
      const p = PIG[k];
      ctx.beginPath();
      for (let l = L0; l <= L1; l++) { const y = Y(p.f(l)); l === L0 ? ctx.moveTo(X(l), y) : ctx.lineTo(X(l), y); }
      ctx.strokeStyle = p.color; ctx.lineWidth = on[k] ? 2.2 : 1;
      ctx.globalAlpha = on[k] ? 1 : 0.25; ctx.setLineDash(on[k] ? [] : [3, 3]);
      ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.setLineDash([]);

    const l = +slider.value, x = X(l), a = absorbed(l);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + .5, padT); ctx.lineTo(x + .5, by + band); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, Y(a), 4, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    const right = x > w - 110;
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = right ? "right" : "left";
    ctx.fillText(`흡수율 ${Math.round(a * 100)}%`, x + (right ? -8 : 8), Math.max(Y(a) - 8, padT + 10));
    ctx.textAlign = "left";
  }

  function update() {
    const l = +slider.value, a = absorbed(l);
    out.textContent = l;
    beam.style.background = css(wl2rgb(l).map(gam));
    absOut.textContent = a > 0.7 ? `대부분 흡수 · ${Math.round(a * 100)}%` : a > 0.35 ? `절반쯤 흡수 · ${Math.round(a * 100)}%` : `대부분 통과 · ${Math.round(a * 100)}%`;
    leafSw.style.background = css(leftover());
    draw();
  }
  slider.addEventListener("input", update);
  root.querySelectorAll("[data-pig]").forEach((el) =>
    el.addEventListener("change", () => { on[el.dataset.pig] = el.checked; update(); }));
  update();
})();
