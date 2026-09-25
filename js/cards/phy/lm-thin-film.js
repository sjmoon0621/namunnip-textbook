/* 카드: 비눗방울은 왜 무지갯빛일까? — 얇은 막 간섭 (수직 입사, 두 반사광) */
(() => {
  const root = document.getElementById("card-phy-lm-film");
  if (!root) return;
  const { C, F, clamp, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const [cvFilm, cvSpec] = root.querySelectorAll("canvas");
  const tS = $(".t"), tO = $(".t-out"), noPi = $(".nopi");
  const optEl = $(".opt2"), strongEl = $(".strong"), weakEl = $(".weak");
  const N = 1.33, TMAX = 1200;

  // CIE 1931 등색 함수의 해석적 근사 (Wyman·Sloan·Shirley 2013)
  const g = (x, m, s1, s2) => { const t = (x - m) / (x < m ? s1 : s2); return Math.exp(-0.5 * t * t); };
  const xb = (l) => 1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2);
  const yb = (l) => 0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1);
  const zb = (l) => 1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8);
  const toRGB = (X, Y, Z) => [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.2040 * Y + 1.0570 * Z];
  const LS = []; for (let l = 380; l <= 730; l += 5) LS.push(l);
  const W = (() => { let X = 0, Y = 0, Z = 0; for (const l of LS) { X += xb(l); Y += yb(l); Z += zb(l); } return toRGB(X, Y, Z); })();
  const srgb = (v) => { v = clamp(v, 0, 1); return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055; };

  // 반사 세기(상대값): 두 반사광의 위상차 δ = 4πnt/λ (+π: 위 표면 반사)
  const R = (t, l) => { const d = 4 * Math.PI * N * t / l + (noPi.checked ? 0 : Math.PI); return (1 + Math.cos(d)) / 2; };
  function color(t) {
    let X = 0, Y = 0, Z = 0;
    for (const l of LS) { const r = R(t, l); X += r * xb(l); Y += r * yb(l); Z += r * zb(l); }
    const c = toRGB(X, Y, Z);
    return c.map((v, i) => srgb(0.85 * v / W[i]));
  }
  const css = (c) => `rgb(${c.map((v) => Math.round(v * 255)).join(",")})`;

  function wl2rgb(l) {
    let r = 0, gg = 0, b = 0;
    if (l < 440) { r = -(l - 440) / 60; b = 1; } else if (l < 490) { gg = (l - 440) / 50; b = 1; }
    else if (l < 510) { gg = 1; b = -(l - 510) / 20; } else if (l < 580) { r = (l - 510) / 70; gg = 1; }
    else if (l < 645) { r = 1; gg = -(l - 645) / 65; } else r = 1;
    let f = 1; if (l < 420) f = 0.3 + 0.7 * (l - 380) / 40; else if (l > 700) f = 0.3 + 0.7 * (780 - l) / 80;
    return `rgb(${[r, gg, b].map((v) => Math.round(255 * Math.pow(v * f, 0.8))).join(",")})`;
  }

  // 막의 색 띠는 두께마다 한 번만 계산해 둔다
  let band = [];
  const buildBand = () => { band = []; for (let t = 0; t <= TMAX; t += 4) band.push(css(color(t))); };

  const A = fit(cvFilm, () => drawFilm());
  const B = fit(cvSpec, () => drawSpec());
  let fgeo = null;

  function drawFilm() {
    const { ctx, size: { w, h } } = A;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 34, x1 = w - 58, y0 = 16, y1 = h - 20;
    fgeo = { y0, y1 };
    // 막: 위가 얇고 아래가 두껍다 (중력으로 흘러내림). 두께는 위에서 아래로 0 → 1200 nm
    for (let y = y0; y <= y1; y++) {
      const t = (y - y0) / (y1 - y0) * TMAX;
      ctx.fillStyle = band[Math.min(band.length - 1, Math.round(t / 4))];
      ctx.fillRect(x0, y, x1 - x0, 1.3);
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    ctx.strokeRect(x0 - 1.5, y0 - 1.5, x1 - x0 + 3, y1 - y0 + 3);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    for (const t of [0, 300, 600, 900, 1200]) {
      const y = y0 + t / TMAX * (y1 - y0);
      ctx.fillRect(x1 + 3, Math.round(y), 5, 1);
      ctx.fillText(`${t}`, x1 + 11, y + 3.5);
    }
    ctx.fillText("nm", x1 + 11, y1 + 16 > h - 2 ? h - 2 : y1 + 16);
    ctx.save(); ctx.translate(18, (y0 + y1) / 2); ctx.rotate(Math.PI / 2); ctx.textAlign = "center";
    ctx.fillText("얇다  ←  막 두께  →  두껍다", 0, 0); ctx.restore();
    const y = y0 + (+tS.value) / TMAX * (y1 - y0);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x0 - 8, y); ctx.lineTo(x1 + 8, y); ctx.stroke();
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.moveTo(x1 + 8, y); ctx.lineTo(x1 + 1, y - 4); ctx.lineTo(x1 + 1, y + 4); ctx.fill();
  }

  function drawSpec() {
    const { ctx, size: { w, h } } = B;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const padL = 30, padR = 10, padT = 22, bandH = 10, padB = 24 + bandH + 6;
    const pw = w - padL - padR, ph = h - padT - padB;
    const X = (l) => padL + (l - 380) / 350 * pw, Y = (v) => padT + (1 - v) * ph;
    NM.axes(ctx, { x0: padL, y0: padT, w: pw, h: ph, X, Y, yt: [[0, "0"], [0.5, ".5"], [1, "1"]], ylabel: "반사 세기" });
    const by = padT + ph + 5;
    for (let x = 0; x < pw; x++) { ctx.fillStyle = wl2rgb(380 + x / pw * 350); ctx.fillRect(padL + x, by, 1.5, bandH); }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (const l of [400, 500, 600, 700]) ctx.fillText(l, X(l), h - 6);
    ctx.textAlign = "right"; ctx.fillText("nm", w - 2, h - 18);
    const t = +tS.value;
    ctx.beginPath();
    for (let l = 380; l <= 730; l++) { const y = Y(R(t, l)); l === 380 ? ctx.moveTo(X(l), y) : ctx.lineTo(X(l), y); }
    ctx.lineTo(X(730), Y(0)); ctx.lineTo(X(380), Y(0)); ctx.closePath();
    ctx.fillStyle = "rgba(35,35,38,.07)"; ctx.fill();
    ctx.beginPath();
    for (let l = 380; l <= 730; l++) { const y = Y(R(t, l)); l === 380 ? ctx.moveTo(X(l), y) : ctx.lineTo(X(l), y); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
    // 반사광 색
    const c = css(color(t));
    ctx.fillStyle = c; ctx.fillRect(w - padR - 44, 2, 44, 16);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(w - padR - 44 + .5, 2.5, 43, 15);
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("반사광 색", w - padR - 50, 14);
  }

  // 가시광(380~730 nm)에서 보강·상쇄되는 파장
  function peaks(t) {
    const pt = 2 * N * t, s = [], k = [];
    // π 어긋남이 있으면 2nt = (m + ½)λ 에서 보강, 2nt = mλ 에서 상쇄. 없으면 반대.
    const off = noPi.checked ? 0 : 0.5;
    for (let m = 0; m < 12; m++) {
      const qs = m + off, qk = m + 0.5 - off;
      if (qs > 0 && pt / qs >= 380 && pt / qs <= 730) s.push(Math.round(pt / qs));
      if (qk > 0 && pt / qk >= 380 && pt / qk <= 730) k.push(Math.round(pt / qk));
    }
    return { s, k };
  }

  function update(rebuild) {
    if (rebuild) buildBand();
    const t = +tS.value;
    tO.textContent = t;
    optEl.textContent = `${Math.round(2 * N * t)} nm`;
    const { s, k } = peaks(t);
    strongEl.textContent = s.length ? s.join(", ") + " nm" : "없음";
    weakEl.textContent = k.length ? k.join(", ") + " nm" : "없음";
    drawFilm(); drawSpec();
  }
  tS.addEventListener("input", () => update(false));
  noPi.addEventListener("change", () => update(true));
  root.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { tS.value = b.dataset.t; update(false); }));

  let drag = false;
  const pick = (e) => {
    if (!fgeo) return;
    const r = cvFilm.getBoundingClientRect(), y = e.clientY - r.top;
    tS.value = Math.round(clamp((y - fgeo.y0) / (fgeo.y1 - fgeo.y0), 0, 1) * TMAX / 5) * 5; update(false);
  };
  cvFilm.style.touchAction = "pan-y";
  cvFilm.addEventListener("pointerdown", (e) => { drag = true; cvFilm.setPointerCapture(e.pointerId); pick(e); });
  cvFilm.addEventListener("pointermove", (e) => { if (drag) pick(e); });
  cvFilm.addEventListener("pointerup", () => { drag = false; });
  update(true);
})();
