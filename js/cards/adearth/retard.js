/* 카드: 간섭색과 미셸-레비 도표 — 직교 니콜 투과율을 존스 행렬로 계산하고 CIE 1931 등색 함수(Wyman 외 2013 근사)로 색을 만든다 */
(() => {
  const root = document.getElementById("card-adearth-retard");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sB = $(".b"), sD = $(".d"), sT = $(".t"), cG = $(".gyp");
  const g = (l, m, s1, s2) => { const t = (l - m) / (l < m ? s1 : s2); return Math.exp(-0.5 * t * t); };
  const xb = (l) => 1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2);
  const yb = (l) => 0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1);
  const zb = (l) => 1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8);
  /* 광원: 6504 K 흑체(주광 근사) */
  const planck = (l) => { const x = l * 1e-9; return 1 / (x ** 5 * (Math.exp(1.4388e-2 / (x * 6504)) - 1)); };
  const LS = []; for (let l = 380; l <= 780; l += 5) LS.push([l, planck(l) * xb(l), planck(l) * yb(l), planck(l) * zb(l)]);
  const toLin = (X, Y, Z) => [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z];
  const WH = (() => { let X = 0, Y = 0, Z = 0; LS.forEach(([, a, b, c]) => { X += a; Y += b; Z += c; }); return toLin(X, Y, Z); })();
  const gam = (v) => { v = Math.max(0, Math.min(1, v)); return Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)); };
  const K = 1.15;
  function color(trans) {
    let X = 0, Y = 0, Z = 0;
    LS.forEach(([l, a, b, c]) => { const t = trans(l); X += a * t; Y += b * t; Z += c * t; });
    const lin = toLin(X, Y, Z).map((v, i) => v / WH[i] * K);
    return lin.map(gam);
  }
  /* 직교 니콜(하부 0°, 상부 90°) 사이 지연판들의 투과율: 존스 계산 */
  function trans(l, plates) {
    let ex = [1, 0], ey = [0, 0];
    plates.forEach(([phi, G]) => {
      const d = 2 * Math.PI * G / l, c = Math.cos(phi), s = Math.sin(phi);
      /* 판 좌표로 회전 */
      const u = [c * ex[0] + s * ey[0], c * ex[1] + s * ey[1]], v = [-s * ex[0] + c * ey[0], -s * ex[1] + c * ey[1]];
      /* 느린 축(v)에 위상 지연 e^{-id} */
      const cd = Math.cos(d), sd = -Math.sin(d), v2 = [v[0] * cd - v[1] * sd, v[0] * sd + v[1] * cd];
      ex = [c * u[0] - s * v2[0], c * u[1] - s * v2[1]]; ey = [s * u[0] + c * v2[0], s * u[1] + c * v2[1]];
    });
    return ey[0] * ey[0] + ey[1] * ey[1];
  }
  const GMAX = 1800, CHART = []; for (let G = 0; G <= GMAX; G += 3) CHART.push(color((l) => Math.sin(Math.PI * G / l) ** 2));
  const MIN = [[0.009, "석영"], [0.024, "보통각섬석"], [0.036, "감람석"], [0.172, "방해석"]];
  const { ctx, size } = fit(cv, () => draw());
  const st = () => ({ b: 10 ** +sB.value, d: +sD.value, th: +sT.value * Math.PI / 180, gyp: cG.checked });
  function plates(s) { const p = [[Math.PI / 2 - s.th, s.d * 1000 * s.b]]; if (s.gyp) p.push([Math.PI / 4, 550]); return p; }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = st(), G = s.d * 1000 * s.b, x0 = 40, x1 = w - 12, y0 = 22, y1 = h * 0.5, DM = 60;
    const X = (G) => x0 + G / GMAX * (x1 - x0), Y = (d) => y1 - d / DM * (y1 - y0);
    const cw = (x1 - x0) / (CHART.length - 1);
    CHART.forEach(([r, gg, b], i) => { ctx.fillStyle = `rgb(${r},${gg},${b})`; ctx.fillRect(x0 + i * cw - 0.5, y0, cw + 1, y1 - y0); });
    ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = 1; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let q = 0; q <= GMAX; q += 300) { ctx.fillText(String(q), X(q), y1 + 13); }
    ctx.textAlign = "right"; for (let d = 0; d <= DM; d += 10) ctx.fillText(String(d), x0 - 5, Y(d) + 3);
    ctx.textAlign = "left"; ctx.fillText("두께 (μm)", x0, y0 - 8); ctx.textAlign = "right"; ctx.fillText("광로차 Δ (nm)", x1, y1 + 26);
    [550, 1100, 1650].forEach((q, i) => { ctx.fillStyle = "rgba(0,0,0,.55)"; ctx.textAlign = "center"; ctx.fillText(`${i + 1}차 | ${i + 2}차`, X(q), y1 - 6); });
    /* 30 μm 선 */
    ctx.strokeStyle = "rgba(0,0,0,.55)"; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(x0, Y(30)); ctx.lineTo(x1, Y(30)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "rgba(0,0,0,.7)"; ctx.textAlign = "right"; ctx.fillText("표준 두께 30 μm", x1 - 4, Y(30) - 4);
    /* 복굴절 선 */
    ctx.font = `10px ${F.sans}`;
    MIN.forEach(([b, name]) => {
      const dEnd = Math.min(DM, GMAX / (1000 * b)), xe = X(dEnd * 1000 * b), ye = Y(dEnd);
      ctx.strokeStyle = "rgba(0,0,0,.6)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(xe, ye); ctx.stroke();
      ctx.fillStyle = "rgba(0,0,0,.8)"; ctx.textAlign = dEnd < DM ? "right" : "left"; ctx.fillText(`${name} ${b}`, dEnd < DM ? xe - 3 : xe + 3, dEnd < DM ? ye + 11 : ye + 11);
    });
    /* 현재 */
    const sel = 1000 * s.b, dEnd = Math.min(DM, GMAX / sel);
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(dEnd * sel), Y(dEnd)); ctx.stroke();
    if (G <= GMAX) { ctx.fillStyle = "#fff"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(G), Y(s.d), 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    /* 아래 왼쪽: 투과 스펙트럼 */
    const sx0 = x0, sx1 = w * 0.6, sy0 = y1 + 50, sy1 = h - 26, LX = (l) => sx0 + (l - 400) / 300 * (sx1 - sx0), LY = (t) => sy1 - t * (sy1 - sy0);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    [400, 500, 600, 700].forEach((l) => ctx.fillText(String(l), LX(l), sy1 + 13));
    ctx.textAlign = "left"; ctx.fillText("파장별 투과율", sx0, sy0 - 6); ctx.textAlign = "right"; ctx.fillText("파장 (nm)", sx1, sy1 + 24);
    ctx.strokeStyle = C.rule; ctx.strokeRect(sx0 + 0.5, sy0 + 0.5, sx1 - sx0, sy1 - sy0);
    const pl = plates(s);
    for (let l = 400; l < 700; l += 2) {
      const t = trans(l + 1, pl), hue = 270 - (l - 400) / 300 * 270;
      ctx.fillStyle = `hsl(${hue},80%,55%)`; ctx.fillRect(LX(l), LY(t), LX(l + 2) - LX(l) + 0.5, sy1 - LY(t));
    }
    /* 아래 오른쪽: 시야 */
    const cx = (sx1 + x1) / 2 + 6, cy = (sy0 + sy1) / 2 + 4, R = Math.min((x1 - sx1) / 2 - 10, (sy1 - sy0) / 2);
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = "#0b0b0d"; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    const col = color((l) => trans(l, pl));
    ctx.translate(cx, cy); ctx.rotate(-s.th);
    ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`; ctx.beginPath();
    [[-0.55, -0.22], [0.1, -0.42], [0.62, -0.18], [0.5, 0.3], [-0.2, 0.45], [-0.66, 0.12]].forEach(([a, b], i) => { if (i) ctx.lineTo(a * R, b * R); else ctx.moveTo(a * R, b * R); });
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(-0.7 * R, 0); ctx.lineTo(0.7 * R, 0); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.font = `10px ${F.sans}`; ctx.fillText("직교 니콜 시야 (점선: 진동 방향)", cx, cy + R + 16);
  }
  function update() {
    const s = st(), G = s.d * 1000 * s.b;
    $(".b-out").textContent = s.b.toFixed(s.b < 0.1 ? 3 : 3); $(".d-out").textContent = s.d.toFixed(1); $(".t-out").textContent = sT.value;
    root.querySelectorAll("[data-b]").forEach((b) => b.setAttribute("aria-pressed", String(Math.abs(+b.dataset.b - s.b) < 0.0006)));
    $(".n-g").textContent = `${G.toFixed(0)} nm` + (s.gyp ? " (+검판)" : "");
    $(".n-o").textContent = G > 2200 ? "고차 (4차 이상)" : `${Math.floor(G / 550) + 1}차`;
    $(".n-s").textContent = (Math.sin(2 * s.th) ** 2).toFixed(2);
    draw();
  }
  root.querySelectorAll("[data-b]").forEach((b) => b.addEventListener("click", () => { sB.value = String(Math.log10(+b.dataset.b)); update(); }));
  [sB, sD, sT].forEach((el) => el.addEventListener("input", update)); cG.addEventListener("change", update);
  update();
})();
