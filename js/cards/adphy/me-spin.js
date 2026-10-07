/* 카드: 회전의자에서 팔을 오므리면 왜 빨리 돌까? — L = Iω 보존, K = L²/2I, 마찰 돌림힘 τ = dL/dt */
(() => {
  const root = document.getElementById("card-adphy-spin");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sR = $(".r"), oR = $(".r-out"), bAgain = $(".again"), bFric = $(".fric");
  const nI = $(".n-i"), nW = $(".n-w"), nL = $(".n-l"), nK = $(".n-k");
  const I0 = 2.0, md = 2, TAU = 0.5, SLOW = 0.5;
  const Iof = (r) => I0 + 2 * md * r * r;
  const L0 = Iof(0.8) * 3.0, K0 = L0 * L0 / (2 * Iof(0.8));
  let L = L0, phi = 0, fric = false;

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = +sR.value, I = Iof(r), om = L / I;
    /* 왼쪽: 위에서 본 모습 */
    const cx = w * 0.25, cy = h * 0.52, sc = Math.min(w * 0.22, h * 0.44) / 0.9;
    ctx.strokeStyle = C.rule; ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, r * sc, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#e7e9e1"; ctx.beginPath(); ctx.arc(cx, cy, 0.3 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-phi);
    ctx.strokeStyle = "#c9a27e"; ctx.lineWidth = 7; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-r * sc, 0); ctx.lineTo(r * sc, 0); ctx.stroke(); ctx.lineCap = "butt";
    ctx.fillStyle = "#5d5d61"; ctx.beginPath(); ctx.ellipse(0, 0, 0.2 * sc, 0.13 * sc, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3a3a3e"; ctx.beginPath(); ctx.arc(0, -0.02 * sc, 0.09 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink; [-1, 1].forEach((s) => { ctx.beginPath(); ctx.arc(s * r * sc, 0, 7, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("위에서 본 모습", 6, 14);
    /* 오른쪽 위: ω–r 곡선 */
    const gx0 = w * 0.55, gx1 = w - 12, gy0 = h * 0.58, gy1 = 24;
    const X = (v) => gx0 + (v - 0.1) / 0.8 * (gx1 - gx0), WMAX = 8, Y = (v) => gy0 - v / WMAX * (gy0 - gy1);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, gy1); ctx.lineTo(gx0, gy0); ctx.lineTo(gx1, gy0); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    [0.2, 0.4, 0.6, 0.8].forEach((v) => ctx.fillText(v === 0.8 ? "0.8 m" : v.toFixed(1), X(v), gy0 + 12));
    ctx.textAlign = "right"; [0, 2, 4, 6, 8].forEach((v) => ctx.fillText(`${v}`, gx0 - 4, Y(v) + 3));
    ctx.textAlign = "left"; ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText("각속도 ω (rad/s)", gx0 - 20, 14);
    const curve = (LL, col, lw, dash) => {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath();
      for (let i = 0; i <= 80; i++) { const v = 0.15 + 0.7 * i / 80; const y = Y(LL / Iof(v)); if (i) ctx.lineTo(X(v), y); else ctx.moveTo(X(v), y); }
      ctx.stroke(); ctx.setLineDash([]);
    };
    if (Math.abs(L - L0) > 1e-6) curve(L0, C.ink3, 1, [4, 3]);
    curve(L, "#3f6fa3", 2, []);
    ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.arc(X(r), Y(om), 4.5, 0, Math.PI * 2); ctx.fill();
    /* 오른쪽 아래: L과 K 막대 (처음 값 = 1) */
    const by = h * 0.72, bw = gx1 - gx0, bh = 11, KM = 2.4;
    const bar = (y, val, max, col, lab, txt) => {
      ctx.fillStyle = "#ebece5"; ctx.fillRect(gx0, y, bw, bh);
      ctx.fillStyle = col; ctx.fillRect(gx0, y, bw * Math.min(1, val / max), bh);
      ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(gx0 + bw / max, y - 3); ctx.lineTo(gx0 + bw / max, y + bh + 3); ctx.stroke();
      ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(lab, gx0, y - 4);
      ctx.textAlign = "right"; ctx.font = `10px ${F.mono}`; ctx.fillText(txt, gx1, y - 4);
    };
    bar(by, L / L0, KM, "#3b7c2a", "각운동량 L", `처음의 ${(L / L0).toFixed(2)}배`);
    const K = L * L / (2 * I);
    bar(by + 34, K / K0, KM, C.amber, "회전 운동 에너지 K", `처음의 ${(K / K0).toFixed(2)}배`);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("세로 눈금선: 처음 값", gx0, by + 34 + bh + 13);
  }
  function readout() {
    const r = +sR.value, I = Iof(r), om = L / I;
    oR.textContent = r.toFixed(2);
    nI.textContent = `${I.toFixed(2)} kg·m²`;
    nW.textContent = `${om.toFixed(2)} rad/s`;
    nL.textContent = `${L.toFixed(2)} kg·m²/s`;
    nK.textContent = `${(L * L / (2 * I)).toFixed(1)} J`;
    bFric.setAttribute("aria-pressed", String(fric)); bFric.textContent = fric ? "베어링 마찰 끄기" : "베어링 마찰 켜기";
  }
  let acc = 0;
  loop(cv, (dt) => {
    const sdt = dt * SLOW;
    if (fric && L > 0) L = Math.max(0, L - TAU * sdt);
    phi += (L / Iof(+sR.value)) * sdt;
    draw();
    acc += dt; if (acc > 0.2) { acc = 0; readout(); }
  });
  bAgain.addEventListener("click", () => { L = L0; sR.value = 0.8; readout(); draw(); });
  bFric.addEventListener("click", () => { fric = !fric; readout(); });
  sR.addEventListener("input", () => { readout(); draw(); });
  readout();
})();
