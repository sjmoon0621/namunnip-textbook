/* 카드: 진동하는 전기 쌍극자(안테나)가 내보내는 전자기파 — 원거리장 E ∝ sinθ cos(ωt − kr)/r, 편광과 방향성 */
(() => {
  const root = document.getElementById("card-adphy-wave");
  if (!root) return;
  const { C: COL, F, fit, loop, reduce } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sF = $(".f"), oF = $(".f-out"), sA = $(".a"), oA = $(".a-out");
  const nL = $(".n-l"), nP = $(".n-p"), nS = $(".n-s");
  const C0 = 2.998e8, WX = 6; /* 장면 가로 (m) */
  let rx = 1.5, rz = 0, phase = 0, drag = false;
  const freq = () => 10 ** +sF.value * 1e6;
  const off = document.createElement("canvas"), octx = off.getContext("2d");
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    const s = w / WX, cx = w / 2, cy = h / 2, lam = C0 / freq(), k = 2 * Math.PI / lam;
    const cell = 3, nx = Math.ceil(w / cell), ny = Math.ceil(h / cell);
    if (off.width !== nx || off.height !== ny) { off.width = nx; off.height = ny; }
    const img = octx.createImageData(nx, ny), d = img.data;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const x = (i * cell - cx) / s, z = (cy - j * cell) / s, r = Math.hypot(x, z), q = (j * nx + i) * 4;
      let v = 0;
      if (r > 0.12) v = (Math.abs(x) / r) * Math.cos(phase - k * r) / Math.max(r, 0.3) * 0.6;
      const a = Math.tanh(Math.abs(v) * 1.6);
      const base = [251, 251, 248], col = v > 0 ? [212, 73, 58] : [63, 111, 163];
      d[q] = base[0] + (col[0] - base[0]) * a; d[q + 1] = base[1] + (col[1] - base[1]) * a; d[q + 2] = base[2] + (col[2] - base[2]) * a; d[q + 3] = 255;
    }
    octx.putImageData(img, 0, 0);
    ctx.clearRect(0, 0, w, h); ctx.imageSmoothingEnabled = true; ctx.drawImage(off, 0, 0, nx * cell, ny * cell);
    /* 송신 안테나 (세로 막대, 전하가 위아래로 진동) */
    const sw = Math.cos(phase);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy - 0.25 * s); ctx.lineTo(cx, cy + 0.25 * s); ctx.stroke();
    [[-1, sw], [1, -sw]].forEach(([dy, g]) => { ctx.fillStyle = g > 0 ? COL.apple : "#3f6fa3"; ctx.globalAlpha = Math.abs(g) * .9 + .1; ctx.beginPath(); ctx.arc(cx, cy + dy * 0.25 * s, 5, 0, 2 * Math.PI); ctx.fill(); });
    ctx.globalAlpha = 1;
    /* 수신 안테나 */
    const X = cx + rx * s, Y = cy - rz * s, al = +sA.value * Math.PI / 180, L = 16;
    ctx.strokeStyle = COL.forest; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X - Math.sin(al) * L, Y + Math.cos(al) * L); ctx.lineTo(X + Math.sin(al) * L, Y - Math.cos(al) * L); ctx.stroke();
    ctx.strokeStyle = COL.forest; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(X, Y, 22, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
    /* 그 자리의 E 진동 방향 θ̂ */
    const r = Math.hypot(rx, rz), th = Math.atan2(rx, rz), ex = Math.cos(th), ez = -Math.sin(th);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4; const E = 30;
    ctx.beginPath(); ctx.moveTo(X - ex * E, Y + ez * E); ctx.lineTo(X + ex * E, Y - ez * E); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`;
    const tag = (t, x, y, col, al2 = "left") => { ctx.textAlign = al2; const tw = ctx.measureText(t).width, xx = al2 === "right" ? x - tw : x; ctx.fillStyle = "rgba(251,251,248,.9)"; ctx.fillRect(xx - 3, y - 11, tw + 6, 15); ctx.fillStyle = col; ctx.fillText(t, x, y); };
    tag("검은 선: 그 자리의 E 진동 방향", 8, h - 8, COL.ink2);
    tag(`화면 가로 ${WX} m · λ = ${lam >= 1 ? lam.toFixed(2) + " m" : (lam * 100).toFixed(1) + " cm"}`, 8, 15, COL.ink2);
    tag("빨강·파랑: E_θ의 순간값 · B는 종이면에 수직", w - 8, 15, COL.ink3, "right");
  }
  function update() {
    const f = freq(), lam = C0 / f;
    oF.textContent = f >= 1e9 ? `${(f / 1e9).toFixed(2)} GHz` : `${(f / 1e6).toFixed(0)} MHz`;
    oA.textContent = sA.value;
    nL.textContent = lam >= 1 ? `${lam.toFixed(2)} m` : `${(lam * 100).toFixed(1)} cm`;
    const r = Math.hypot(rx, rz), th = Math.atan2(rx, rz), al = +sA.value * Math.PI / 180;
    nP.textContent = `${(Math.abs(th) * 180 / Math.PI).toFixed(0)}°, ${r.toFixed(2)} m`;
    const amp = Math.abs(Math.sin(th)) / Math.max(r, 0.05) * Math.abs(Math.sin(al - th));
    nS.textContent = `${(amp * 100).toFixed(0)} %`;
    draw();
  }
  function setRx(e) {
    const b = cv.getBoundingClientRect(), s = b.width / WX;
    rx = (e.clientX - b.left - b.width / 2) / s; rz = (b.height / 2 - (e.clientY - b.top)) / s;
    const rr = Math.hypot(rx, rz); if (rr < 0.4) { rx *= 0.4 / rr || 1; rz *= 0.4 / rr; }
    update();
  }
  cv.addEventListener("pointerdown", (e) => { drag = true; cv.setPointerCapture(e.pointerId); setRx(e); });
  cv.addEventListener("pointermove", (e) => { if (drag) setRx(e); });
  cv.addEventListener("pointerup", () => { drag = false; });
  [sF, sA].forEach((el) => el.addEventListener("input", update));
  if (/[?&]demo\b/.test(location.search)) { rx = 1.2; rz = 1.2; sA.value = 45; phase = 1; }
  if (!reduce) loop(cv, (dt) => { phase += dt * 2 * Math.PI * 0.6; draw(); });
  update();
})();
