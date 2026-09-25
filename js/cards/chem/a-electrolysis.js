/* 카드: 물을 전기 분해하면 왜 수소가 산소의 2배 나올까? — 호프만 장치와 전하량 */
(() => {
  const root = document.getElementById("card-chem-h2oel");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sI = $(".cur"), oI = $(".cur-out"), go = $(".go"), reset = $(".reset");
  const dT = $(".v-t"), dQ = $(".v-q"), dE = $(".v-e"), dV = $(".v-v");

  const FARADAY = 96485, VM = 24.5, CAP = 50, SPEED = 60;   // 25 °C, 1 atm · 관 50 mL · 화면 1초 = 실제 60초
  let t = 0, Q = 0, on = false, hist = [[0, 0]], bubbles = [], dots = 0;
  const vol = (q) => ({ h: q / FARADAY / 2 * VM * 1000, o: q / FARADAY / 4 * VM * 1000 });

  const { ctx, size } = fit(cv, () => draw());

  function tube(x, top, bot, tw, v, label, gas, col) {
    const fullH = bot - top - 20, gh = v / CAP * fullH;
    ctx.fillStyle = "rgba(63,111,181,.13)"; ctx.fillRect(x - tw / 2, top + gh, tw, bot - top - gh);
    ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fillRect(x - tw / 2, top, tw, gh);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(x - tw / 2, top, tw, bot - top);
    ctx.fillStyle = C.ink3; ctx.font = `9px ${F.mono}`; ctx.textAlign = "right";
    for (let m = 0; m <= CAP; m += 10) {
      const y = top + m / CAP * fullH;
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + tw / 2 - (m % 50 ? 4 : 7), y); ctx.lineTo(x + tw / 2, y); ctx.stroke();
    }
    // 마개(콕)
    ctx.fillStyle = C.ink2; ctx.fillRect(x - 3, top - 12, 6, 12);
    if (v > 1.5) { ctx.fillStyle = col; ctx.font = `600 12px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(gas, x, top + Math.max(14, gh / 2 + 4)); }
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`;
    ctx.fillText(label, x, bot + 30);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const small = w < 520, v = vol(Q);
    // ── 왼쪽: 호프만 전기 분해 장치
    const lw = w * 0.48, tw = Math.min(30, lw * 0.13), top = 28, bot = h - 58;
    const xa = lw * 0.28, xb = lw * 0.72, xm = lw * 0.5;
    // 가운데 저장 관과 아래 연결관
    ctx.fillStyle = "rgba(63,111,181,.13)";
    ctx.fillRect(xa - tw / 2, bot - 14, xb - xa + tw, 14);
    ctx.fillRect(xm - tw * 0.35, top + 10, tw * 0.7, bot - top - 10);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
    ctx.strokeRect(xa - tw / 2, bot - 14, xb - xa + tw, 14);
    ctx.strokeRect(xm - tw * 0.35, top + 10, tw * 0.7, bot - top - 24);
    ctx.beginPath(); ctx.ellipse(xm, top + 4, tw * 0.9, 8, 0, 0, Math.PI * 2); ctx.stroke();
    tube(xa, top, bot, tw, v.h, "(−)극", "H₂", C.ink);
    tube(xb, top, bot, tw, v.o, "(+)극", "O₂", C.apple);
    // 전극과 전선, 전원
    const ey = bot - 6;
    ctx.fillStyle = "#6b6b70"; ctx.fillRect(xa - 3, ey - 26, 6, 26); ctx.fillRect(xb - 3, ey - 26, 6, 26);
    const wy = h - 16;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(xa, bot); ctx.lineTo(xa, wy); ctx.lineTo(xm - 12, wy); ctx.moveTo(xm + 12, wy); ctx.lineTo(xb, wy); ctx.lineTo(xb, bot); ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xm - 4, wy - 10); ctx.lineTo(xm - 4, wy + 10); ctx.moveTo(xm + 4, wy - 5); ctx.lineTo(xm + 4, wy + 5); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("전원", xm, wy - 14);
    // 전자의 흐름: (+)극 → 전원 → (−)극
    if (on) {
      ctx.fillStyle = "#3f6fb5";
      const path = [[xb, bot], [xb, wy], [xa, wy], [xa, bot]];
      const L = [0, 1, 2].map((i) => Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1])), tot = L[0] + L[1] + L[2];
      for (let k = 0; k < 10; k++) {
        let d = ((k / 10 + dots) % 1) * tot, i = 0;
        while (i < 2 && d > L[i]) { d -= L[i]; i++; }
        const f = d / L[i], x = path[i][0] + (path[i + 1][0] - path[i][0]) * f, y = path[i][1] + (path[i + 1][1] - path[i][1]) * f;
        if (Math.abs(x - xm) < 14 && Math.abs(y - wy) < 2) continue;
        ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.font = `9.5px ${F.mono}`; ctx.fillText("e⁻", xa - 12, wy - 4);
    }
    for (const b of bubbles) { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.strokeStyle = "rgba(35,35,38,.45)"; ctx.lineWidth = 1; ctx.stroke(); }

    // ── 오른쪽: 흘려 준 전하량 – 기체 부피
    const x0 = lw + (small ? 30 : 40), y0 = 22, pw = w - x0 - 12, ph = h - y0 - 38;
    const qMax = CAP * 2 * FARADAY / (VM * 1000);        // H₂ 50 mL가 될 때의 전하량
    const X = (q) => x0 + q / qMax * pw, Y = (m) => y0 + (1 - m / CAP) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [[0, "0"], [100, "100"], [200, "200"], [300, "300"]], yt: [[0, "0"], [25, "25"], [50, "50"]], xlabel: "흘려 준 전하량 (C)", ylabel: "기체 부피 (mL)" });
    for (const [k, col, name] of [["h", C.ink, "H₂"], ["o", C.apple, "O₂"]]) {
      ctx.setLineDash([3, 4]); ctx.strokeStyle = col; ctx.globalAlpha = .35; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(qMax), Y(vol(qMax)[k])); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(Q), Y(v[k])); ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.stroke();
      ctx.fillStyle = col; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "left";
      ctx.fillText(name, X(qMax) - 22, Y(vol(qMax)[k]) + (k === "h" ? 14 : -6));
    }
  }

  function numbers() {
    const v = vol(Q);
    oI.textContent = (+sI.value).toFixed(2);
    const s = Math.round(t);
    dT.textContent = `${Math.floor(s / 60)}분 ${String(s % 60).padStart(2, "0")}초`;
    dQ.textContent = `${Q.toFixed(0)} C`;
    dE.textContent = `${(Q / FARADAY * 1000).toFixed(2)} mmol`;
    dV.textContent = Q > 0 ? `${v.h.toFixed(1)} : ${v.o.toFixed(1)}` : "—";
  }
  go.addEventListener("click", () => { if (vol(Q).h >= CAP - 0.01) return; on = !on; go.textContent = on ? "멈춤" : "전류 흘리기"; });
  reset.addEventListener("click", () => { t = 0; Q = 0; on = false; bubbles = []; go.textContent = "전류 흘리기"; numbers(); draw(); });
  sI.addEventListener("input", () => { numbers(); draw(); });
  numbers();

  loop(cv, (dt) => {
    const { w, h } = size;
    if (on) {
      const I = +sI.value;
      t += dt * SPEED; Q += I * dt * SPEED; dots = (dots + dt * I * 1.2) % 1;
      if (vol(Q).h >= CAP) { Q = CAP * 2 * FARADAY / (VM * 1000); on = false; go.textContent = "전류 흘리기"; }
      const lw = w * 0.48, bot = h - 58;
      if (Math.random() < I * 1.6) bubbles.push({ x: lw * 0.28 + (Math.random() - .5) * 8, y: bot - 20, r: 1.2 + Math.random() * 1.5 });
      if (Math.random() < I * 0.8) bubbles.push({ x: lw * 0.72 + (Math.random() - .5) * 8, y: bot - 20, r: 1.2 + Math.random() * 1.5 });
      numbers();
    }
    const topG = { a: vol(Q).h, b: vol(Q).o };
    for (const b of bubbles) b.y -= 70 * dt;
    const top = 28, bot = h - 58, fullH = bot - top - 20;
    bubbles = bubbles.filter((b) => b.y > top + (b.x < w * 0.24 ? topG.a : topG.b) / CAP * fullH);
    if (on || bubbles.length) draw();
  });
})();
