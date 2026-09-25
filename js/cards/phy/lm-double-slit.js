/* 카드: 이중 슬릿 무늬의 간격은 무엇이 정할까? — 경로차와 밝은 무늬 */
(() => {
  const root = document.getElementById("card-phy-lm-dslit");
  if (!root) return;
  const { C, F, clamp, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const lam = $(".lam"), dS = $(".d"), LS = $(".L"), yS = $(".yp");
  const lamO = $(".lam-out"), dO = $(".d-out"), LO = $(".L-out"), yO = $(".yp-out");
  const gapEl = $(".gap"), pdEl = $(".pd"), brEl = $(".br");

  const A = 0.04e-3;     // 슬릿 하나의 폭 0.04 mm (고정)
  const YMAX = 10;       // 스크린 표시 범위 ±10 mm

  function wl2rgb(l) {
    let r = 0, g = 0, b = 0;
    if (l < 440) { r = -(l - 440) / 60; b = 1; }
    else if (l < 490) { g = (l - 440) / 50; b = 1; }
    else if (l < 510) { g = 1; b = -(l - 510) / 20; }
    else if (l < 580) { r = (l - 510) / 70; g = 1; }
    else if (l < 645) { r = 1; g = -(l - 645) / 65; }
    else r = 1;
    let f = 1;
    if (l < 420) f = 0.3 + 0.7 * (l - 380) / 40; else if (l > 700) f = 0.3 + 0.7 * (780 - l) / 80;
    return [r * f, g * f, b * f].map((v) => Math.pow(v, 0.8));
  }
  const rgba = (c, a) => `rgba(${c.map((v) => Math.round(255 * v)).join(",")},${a})`;

  const P = () => ({ l: +lam.value * 1e-9, d: +dS.value * 1e-3, L: +LS.value, y: +yS.value * 1e-3 });
  const inten = (y, p) => {
    const s = y / p.L; // 작은 각: sin θ ≈ y / L
    const b = Math.PI * A * s / p.l;
    const env = b === 0 ? 1 : (Math.sin(b) / b) ** 2;
    return Math.cos(Math.PI * p.d * s / p.l) ** 2 * env;
  };

  const { ctx, size } = fit(cv, () => draw());
  let geo = null;

  function draw() {
    const { w, h } = size;
    if (!w) return;
    const p = P(), col = wl2rgb(+lam.value);
    ctx.clearRect(0, 0, w, h);
    const padT = 14, padB = 26, sx = Math.round(w * 0.14), scrX = Math.round(w * 0.58);
    const Y = (ymm) => padT + (1 - (ymm + YMAX) / (2 * YMAX)) * (h - padT - padB);
    const cy = Y(0);
    const half = 10 + (+dS.value) * 70; // 그림 속 슬릿 간격(과장)
    geo = { Y, padT, padB, h };

    // 들어오는 평면파
    ctx.strokeStyle = rgba(col, 0.55); ctx.lineWidth = 1.5;
    const wav = 7 + (+lam.value - 400) / 300 * 9;
    for (let x = 12; x < sx - 3; x += wav) { ctx.beginPath(); ctx.moveTo(x, padT + 10); ctx.lineTo(x, h - padB - 10); ctx.stroke(); }
    // 슬릿 판
    ctx.fillStyle = C.ink;
    const sw = 3;
    ctx.fillRect(sx - 2, padT, 4, cy - half - sw - padT);
    ctx.fillRect(sx - 2, cy - half + sw, 4, 2 * half - 2 * sw);
    ctx.fillRect(sx - 2, cy + half + sw, 4, h - padB - (cy + half + sw));
    // 스크린
    ctx.fillStyle = C.rule; ctx.fillRect(scrX, padT, 2, h - padT - padB);
    // 스크린의 무늬 띠
    const stripX = scrX + 4, stripW = 16;
    for (let py = padT; py < h - padB; py++) {
      const ymm = ((1 - (py - padT) / (h - padT - padB)) * 2 - 1) * YMAX;
      ctx.fillStyle = rgba(col, inten(ymm * 1e-3, p));
      ctx.fillRect(stripX, py, stripW, 1.2);
    }
    ctx.fillStyle = C.night; ctx.globalAlpha = 0.06; ctx.fillRect(stripX, padT, stripW, h - padT - padB); ctx.globalAlpha = 1;
    // 밝기 그래프 (오른쪽, 가로 = 밝기)
    const gx0 = stripX + stripW + 12, gw = w - gx0 - 12;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(gx0 + .5, padT); ctx.lineTo(gx0 + .5, h - padB); ctx.stroke();
    ctx.beginPath();
    for (let py = padT; py <= h - padB; py++) {
      const ymm = ((1 - (py - padT) / (h - padT - padB)) * 2 - 1) * YMAX;
      const x = gx0 + inten(ymm * 1e-3, p) * gw;
      py === padT ? ctx.moveTo(x, py) : ctx.lineTo(x, py);
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("밝기", gx0 + 4, h - padB + 16);
    // 눈금 (mm)
    ctx.textAlign = "right";
    for (const v of [-10, -5, 0, 5, 10]) {
      ctx.fillText(`${v}`, scrX - 4, Y(v) + 3);
      ctx.fillRect(scrX - 2, Math.round(Y(v)), 3, 1);
    }
    ctx.fillText("mm", scrX - 4, h - padB + 16);

    // P까지의 두 경로
    const py = Y(+yS.value), s1 = { x: sx, y: cy - half }, s2 = { x: sx, y: cy + half };
    const pd = p.d * p.y / p.L, m = pd / p.l;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = C.forest; ctx.beginPath(); ctx.moveTo(s1.x, s1.y); ctx.lineTo(scrX, py); ctx.stroke();
    ctx.strokeStyle = C.amber; ctx.beginPath(); ctx.moveTo(s2.x, s2.y); ctx.lineTo(scrX, py); ctx.stroke();
    // 경로차 표시: 먼 슬릿에서 가까운 쪽 경로와 같은 길이만큼 잰 지점 이후 구간
    const far = pd >= 0 ? s2 : s1, near = pd >= 0 ? s1 : s2;
    const dn = Math.hypot(scrX - near.x, py - near.y), df = Math.hypot(scrX - far.x, py - far.y);
    if (df - dn > 2) {
      const ux = (scrX - far.x) / df, uy = (py - far.y) / df;
      ctx.strokeStyle = C.warn; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(far.x, far.y); ctx.lineTo(far.x + ux * (df - dn), far.y + uy * (df - dn)); ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(scrX + 1, py, 4.5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    ctx.font = `11px ${F.mono}`; ctx.textAlign = "right"; ctx.fillStyle = C.ink;
    ctx.fillText("P", scrX - 8, py - 7);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`;
    ctx.fillText("슬릿", sx + 6, padT + 10);
    ctx.fillText("스크린", scrX - 70, padT + 10);
    ctx.fillStyle = C.warn;
    ctx.fillText(`경로차 ${Math.abs(m).toFixed(2)}λ`, sx + 8, h - padB + 16);
  }

  function update() {
    const p = P();
    lamO.textContent = lam.value; dO.textContent = (+dS.value).toFixed(2); LO.textContent = (+LS.value).toFixed(1); yO.textContent = (+yS.value).toFixed(2);
    gapEl.textContent = `${(p.l * p.L / p.d * 1e3).toFixed(2)} mm`;
    const pd = p.d * p.y / p.L;
    pdEl.textContent = `${Math.abs(pd * 1e9).toFixed(0)} nm = ${Math.abs(pd / p.l).toFixed(2)}λ`;
    const I = inten(p.y, p);
    brEl.textContent = `${Math.round(I * 100)}%`;
    draw();
  }
  [lam, dS, LS, yS].forEach((el) => el.addEventListener("input", update));

  // 스크린 위를 끌어 P를 옮긴다
  let drag = false;
  const toY = (e) => {
    if (!geo) return;
    const r = cv.getBoundingClientRect(), py = e.clientY - r.top;
    const ymm = ((1 - (py - geo.padT) / (geo.h - geo.padT - geo.padB)) * 2 - 1) * YMAX;
    yS.value = clamp(ymm, -YMAX, YMAX).toFixed(2); update();
  };
  cv.addEventListener("pointerdown", (e) => { drag = true; cv.setPointerCapture(e.pointerId); toY(e); });
  cv.addEventListener("pointermove", (e) => { if (drag) toY(e); });
  cv.addEventListener("pointerup", () => { drag = false; });
  cv.style.touchAction = "pan-y";
  root.querySelectorAll("[data-lam]").forEach((b) => b.addEventListener("click", () => { lam.value = b.dataset.lam; update(); }));
  update();
})();
