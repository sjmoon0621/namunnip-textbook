/* 카드: 빛을 세게 비추면 전자가 더 빨리 튀어나올까? — 광전 효과 */
(() => {
  const root = document.getElementById("card-phy-lm-photo");
  if (!root) return;
  const { C, F, clamp, fit, loop, reduce } = NM;
  const $ = (s) => root.querySelector(s);
  const [cvT, cvG] = root.querySelectorAll("canvas");
  const metal = $(".metal"), lam = $(".lam"), amp = $(".amp");
  const lamO = $(".lam-out"), ampO = $(".amp-out");
  const eEl = $(".ephot"), kEl = $(".kmax"), vEl = $(".vstop");
  const HC = 1239.84, H = 4.1357e-15; // eV·nm, eV·s
  // 다결정 표면의 대표 일함수 (eV)
  const W = { cs: 2.14, k: 2.29, na: 2.36, zn: 4.33, cu: 4.65 };
  const NAME = { cs: "세슘", k: "칼륨", na: "나트륨", zn: "아연", cu: "구리" };

  function wl2rgb(l) {
    if (l < 380) return "rgb(150,120,200)";
    let r = 0, g = 0, b = 0;
    if (l < 440) { r = -(l - 440) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; }
    else if (l < 510) { g = 1; b = -(l - 510) / 20; } else if (l < 580) { r = (l - 510) / 70; g = 1; }
    else if (l < 645) { r = 1; g = -(l - 645) / 65; } else r = 1;
    let f = 1; if (l < 420) f = 0.3 + 0.7 * (l - 380) / 40; else if (l > 700) f = 0.3 + 0.7 * (780 - l) / 80;
    return `rgb(${[r, g, b].map((v) => Math.round(255 * Math.pow(v * f, 0.8))).join(",")})`;
  }
  const st = () => { const l = +lam.value, E = HC / l, w = W[metal.value]; return { l, E, w, K: E - w, f: E / H }; };

  const A = fit(cvT, () => drawTube());
  const B = fit(cvG, () => drawGraph());
  let photons = [], elec = [], accP = 0;

  function drawTube() {
    const { ctx, size: { w, h } } = A;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = st(), px = w * 0.2, py0 = h * 0.28, py1 = h * 0.78;
    // 진공관 테두리
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(8, h * 0.18, w - 16, h * 0.7, 18); ctx.stroke();
    // 금속판
    ctx.fillStyle = "#9aa0a6"; ctx.fillRect(px - 8, py0, 8, py1 - py0);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    ctx.fillText(NAME[metal.value], px - 4, py1 + 16);
    // 들어오는 빛
    const col = wl2rgb(s.l), a = +amp.value / 100;
    ctx.globalAlpha = 0.1 + 0.25 * a; ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(w * 0.62, 0); ctx.lineTo(w * 0.8, 0); ctx.lineTo(px, py1 - 10); ctx.lineTo(px, py0 + 10); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    for (const p of photons) {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p.x * w, p.y * h, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = C.ink;
    for (const e of elec) { ctx.beginPath(); ctx.arc(e.x * w, e.y * h, 3.2, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText(s.l < 380 ? "자외선 (보이지 않음)" : "가시광선", 12, 14);
    ctx.fillText("● 광자  ● 전자", 12, h - 8);
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(15, h - 11.5, 3, 0, Math.PI * 2); ctx.fill();
  }

  function drawGraph() {
    const { ctx, size: { w, h } } = B;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const padL = 30, padR = 8, padT = 22, padB = 30, pw = w - padL - padR, ph = h - padT - padB;
    const fmax = 2.0, ymin = -5, ymax = 7; // 진동수 ×10¹⁵ Hz, 에너지 eV
    const X = (f) => padL + f / fmax * pw, Y = (e) => padT + (ymax - e) / (ymax - ymin) * ph;
    NM.axes(ctx, { x0: padL, y0: padT, w: pw, h: ph, X, Y,
      xt: [[0, "0"], [0.5, ".5"], [1, "1.0"], [1.5, "1.5"], [2, "2.0"]], yt: [[-4, "−4"], [-2, "−2"], [0, "0"], [2, "2"], [4, "4"], [6, "6"]],
      ylabel: "최대 운동 에너지 (eV)", xlabel: "진동수 (×10¹⁵ Hz)" });
    // 가시광 구간
    ctx.fillStyle = "rgba(224,160,42,.12)"; ctx.fillRect(X(0.384), padT, X(0.789) - X(0.384), ph);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("가시광", X(0.59), padT + 11);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(padL, Y(0) + .5); ctx.lineTo(padL + pw, Y(0) + .5); ctx.stroke();
    for (const k of Object.keys(W)) {
      const on = k === metal.value, f0 = W[k] / H / 1e15;
      ctx.strokeStyle = on ? C.forest : "rgba(141,141,146,.35)"; ctx.lineWidth = on ? 2.2 : 1;
      ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(0), Y(-W[k])); ctx.lineTo(X(f0), Y(0)); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(X(f0), Y(0)); ctx.lineTo(X(fmax), Y(H * fmax * 1e15 - W[k])); ctx.stroke();
      if (on) {
        ctx.fillStyle = C.forest; ctx.textAlign = "left";
        ctx.fillText(`f₀ = ${(f0 * 1e15 / 1e14).toFixed(2)}×10¹⁴`, X(f0) + 4, Y(0) + 13);
        ctx.fillText(`−W`, X(0) + 4, Y(-W[k]) + 4);
      }
    }
    const s = st(), fx = s.f / 1e15;
    if (fx <= fmax) {
      const y = s.K > 0 ? s.K : 0;
      ctx.beginPath(); ctx.arc(X(fx), Y(y), 5, 0, Math.PI * 2);
      ctx.fillStyle = s.K > 0 ? C.ink : C.warn; ctx.fill();
    }
  }

  function update() {
    const s = st();
    lamO.textContent = s.l; ampO.textContent = amp.value;
    eEl.textContent = `${s.E.toFixed(2)} eV`;
    kEl.textContent = s.K > 0 ? `${s.K.toFixed(2)} eV` : "전자 없음";
    kEl.classList.toggle("bad", s.K <= 0);
    vEl.textContent = s.K > 0 ? `${s.K.toFixed(2)} V` : "—";
    drawTube(); drawGraph();
  }
  [lam, amp].forEach((el) => el.addEventListener("input", update));
  metal.addEventListener("change", update);
  root.querySelectorAll("[data-lam]").forEach((b) => b.addEventListener("click", () => { lam.value = b.dataset.lam; update(); }));

  // 광자는 세기에 비례해 도착하고, 광자 하나가 전자 하나를 떼어 낼 수 있다(문턱 위에서, 모식 확률 30%)
  function step(dt) {
    const s = st(), rate = 30 * (+amp.value / 100);
    accP += rate * dt;
    while (accP >= 1) {
      accP -= 1;
      const t = Math.random();
      photons.push({ x: 0.62 + 0.18 * t, y: 0, tx: 0.2, ty: 0.28 + 0.5 * (0.1 + 0.8 * t) });
    }
    const nx = [];
    for (const p of photons) {
      const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy), v = 0.9 * dt;
      if (d <= v) {
        if (s.K > 0 && Math.random() < 0.3) {
          const k = s.K * (0.25 + 0.75 * Math.random()), sp = 0.12 * Math.sqrt(k), an = (Math.random() - 0.5) * 1.2;
          elec.push({ x: p.tx + 0.01, y: p.ty, vx: sp * Math.cos(an), vy: sp * Math.sin(an) });
        }
      } else { p.x += dx / d * v; p.y += dy / d * v; nx.push(p); }
    }
    photons = nx;
    elec = elec.filter((e) => { e.x += e.vx * dt; e.y += e.vy * dt; return e.x < 0.97 && e.y > 0.2 && e.y < 0.86; });
  }
  loop(cvT, (dt) => { if (reduce) return; step(dt); drawTube(); });
  update();
})();
