/* 카드: 표준 생성 엔탈피 표 하나로 모든 반응열을 구할 수 있을까? — 원소 기준 엔탈피 준위, ΔH와 ΔU */
(() => {
  const root = document.getElementById("card-adchem-formation");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), cbGas = $(".gas");
  const RT = 8.314e-3 * 298.15;
  /* [계수, 화학식, ΔfH° kJ/mol, 기체 여부]. "W"는 물(상태는 체크 상자로) — CRC Handbook 값 */
  const RX = {
    ch4: { L: [[1, "CH₄(g)", -74.6, 1], [2, "O₂(g)", 0, 1]], P: [[1, "CO₂(g)", -393.5, 1], [2, "W"]] },
    etoh: { L: [[1, "C₂H₅OH(l)", -277.6, 0], [3, "O₂(g)", 0, 1]], P: [[2, "CO₂(g)", -393.5, 1], [3, "W"]] },
    glu: { L: [[1, "C₆H₁₂O₆(s)", -1273.3, 0], [6, "O₂(g)", 0, 1]], P: [[6, "CO₂(g)", -393.5, 1], [6, "W"]] },
    nh3: { L: [[1, "N₂(g)", 0, 1], [3, "H₂(g)", 0, 1]], P: [[2, "NH₃(g)", -45.9, 1]] },
    caco3: { L: [[1, "CaCO₃(s)", -1207.6, 0]], P: [[1, "CaO(s)", -634.9, 0], [1, "CO₂(g)", -393.5, 1]] },
    no: { L: [[1, "N₂(g)", 0, 1], [1, "O₂(g)", 0, 1]], P: [[2, "NO(g)", 91.3, 1]] },
  };
  let r = "ch4";
  const water = () => cbGas.checked ? ["H₂O(g)", -241.8, 1] : ["H₂O(l)", -285.8, 0];
  const expand = (list) => list.map(([c, f, h, g]) => f === "W" ? [c, ...water()] : [c, f, h, g]);
  function calc() {
    const L = expand(RX[r].L), P = expand(RX[r].P);
    const sum = (l) => l.reduce((s, [c, , h]) => s + c * h, 0);
    const ng = (l) => l.reduce((s, [c, , , g]) => s + c * g, 0);
    const HL = sum(L), HP = sum(P), dn = ng(P) - ng(L), dH = HP - HL;
    return { L, P, HL, HP, dH, nL: ng(L), nP: ng(P), dn, w: -dn * RT, dU: dH - dn * RT };
  }
  const sgn = (x, d = 1) => (x > 0 ? "+" : "") + x.toFixed(d).replace("-", "−");
  const side = (l) => l.map(([c, f]) => (c === 1 ? "" : c) + f).join(" + ");

  const { ctx, size } = fit(cv, () => draw());
  function arrow(x, y0, y1, col, lw) {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
    const d = y1 > y0 ? 1 : -1;
    if (Math.abs(y1 - y0) < 8) return;
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x - 4.5, y1 - 8 * d); ctx.lineTo(x + 4.5, y1 - 8 * d); ctx.closePath(); ctx.fill();
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = calc();
    const x0 = 46, x1 = w * 0.64, top = 26, bot = h - 18;
    const lo = Math.min(0, k.HL, k.HP), hi = Math.max(0, k.HL, k.HP), pad = (hi - lo) * 0.12 + 20;
    const Y = (v) => top + (hi + pad - v) / (hi - lo + 2 * pad) * (bot - top);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("H (kJ)", 4, 14);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, top - 6); ctx.lineTo(x0, bot); ctx.stroke();
    const lev = (v, xa, xb, col, lab, below) => {
      ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(xa, Y(v)); ctx.lineTo(xb, Y(v)); ctx.stroke();
      ctx.fillStyle = col; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(lab, (xa + xb) / 2, Y(v) + (below ? 14 : -6));
      if (v !== 0 && Math.abs(Y(v) - Y(0)) < 12) return;
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(sgn(v, 0), x0 - 4, Y(v) + 3);
    };
    const W = x1 - x0, ax = x0 + W * 0.06, aR = x0 + W * 0.30, bR = x0 + W * 0.66, bx = x0 + W * 0.98;
    ctx.setLineDash([4, 3]); lev(0, x0, x1, C.ink2, "", false); ctx.setLineDash([]);
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("성분 원소 (표준 상태) = 0", (x0 + x1) / 2, Y(0) + (k.HL < -1 || k.HP < -1 ? -6 : 14));
    lev(k.HL, ax, aR, "#3f6fa3", "반응물", k.HL < 0);
    lev(k.HP, bR, bx, C.warn, "생성물", k.HP < 0);
    /* 원소 → 반응물, 원소 → 생성물 (점선 화살표) */
    if (Math.abs(k.HL) > 0.5) arrow((ax + aR) / 2 - 18, Y(0), Y(k.HL), "rgba(63,111,163,.6)", 1.4);
    if (Math.abs(k.HP) > 0.5) arrow((bR + bx) / 2 + 18, Y(0), Y(k.HP), "rgba(181,83,47,.6)", 1.4);
    /* 반응 엔탈피 화살표 */
    const mx = (aR + bR) / 2;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(aR, Y(k.HL)); ctx.lineTo(mx, Y(k.HL)); ctx.moveTo(mx, Y(k.HP)); ctx.lineTo(bR, Y(k.HP)); ctx.stroke(); ctx.setLineDash([]);
    arrow(mx, Y(k.HL), Y(k.HP), C.ink, 2.2);
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText("ΔH° = " + sgn(k.dH), mx + 7, (Y(k.HL) + Y(k.HP)) / 2 + 4);

    /* 오른쪽: 반응 전후 기체의 부피 (피스톤) */
    const px0 = w * 0.70, pw = (w - px0 - 16) / 2 - 8, cyTop = 40, cyBot = h - 44;
    const nMax = Math.max(k.nL, k.nP, 1), Hc = cyBot - cyTop;
    [[k.nL, "반응 전", "#3f6fa3"], [k.nP, "반응 후", C.warn]].forEach(([n, lab, col], i) => {
      const cx = px0 + i * (pw + 16);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(cx, cyTop); ctx.lineTo(cx, cyBot); ctx.lineTo(cx + pw, cyBot); ctx.lineTo(cx + pw, cyTop); ctx.stroke();
      const hy = cyBot - Math.max(n, 0.02) / nMax * (Hc - 8);
      ctx.fillStyle = col; ctx.globalAlpha = 0.22; ctx.fillRect(cx + 1, hy, pw - 2, cyBot - hy - 1); ctx.globalAlpha = 1;
      ctx.fillStyle = C.ink2; ctx.fillRect(cx + 1, hy - 6, pw - 2, 6); ctx.fillRect(cx + pw / 2 - 2, hy - 22, 4, 16);
      ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(lab, cx + pw / 2, cyBot + 15);
      ctx.font = `10.5px ${F.mono}`; ctx.fillText(`기체 ${n} mol`, cx + pw / 2, cyBot + 30);
    });
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("대기압 1 bar로 누르는 피스톤", px0 + pw + 8, 18);
  }

  function update() {
    root.querySelectorAll("[data-r]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.r === r)));
    cbGas.disabled = !RX[r].P.some(([, f]) => f === "W");
    cbGas.parentElement.style.opacity = cbGas.disabled ? 0.45 : 1;
    const k = calc();
    $(".eq").textContent = `${side(k.L)} → ${side(k.P)}`;
    $(".n-h").textContent = sgn(k.dH); $(".n-n").textContent = sgn(k.dn, 0);
    $(".n-w").textContent = sgn(k.w, 2) + " kJ"; $(".n-u").textContent = sgn(k.dU);
    draw();
  }
  root.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => { r = b.dataset.r; update(); }));
  cbGas.addEventListener("change", update);
  update();
})();
