/* 카드: 물이 얼면 왜 부피가 커질까? — 온도에 따른 물·얼음의 밀도와 수소 결합 (분자 그림은 모식) */
(() => {
  const root = document.getElementById("card-chem-ice");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".temp"), oT = $(".temp-out");
  const dSt = $(".v-st"), dRho = $(".v-rho"), dV = $(".v-vol"), dN = $(".v-n");

  // 1 atm에서 물의 밀도 (g/mL), 0~20 °C 1도 간격 (표준 자료 반올림)
  const WATER = [0.99984, 0.99990, 0.99994, 0.99997, 0.99997, 0.99996, 0.99994, 0.99990, 0.99985, 0.99978, 0.99970,
    0.99961, 0.99950, 0.99938, 0.99924, 0.99910, 0.99894, 0.99877, 0.99860, 0.99841, 0.99821];
  const ice = (T) => 0.9167 - 0.00014 * T;          // 0 °C 0.9167, −10 °C 약 0.918
  const water = (T) => { const i = Math.min(19, Math.floor(T)), f = T - i; return WATER[i] + (WATER[i + 1] - WATER[i]) * f; };
  const rho = (T) => (T < 0 ? ice(T) : water(T));

  // 얼음 모식: 육각 고리 격자 / 물: 같은 넓이에 약 9% 더 많은 분자
  const ICE = [], LIQ = [];
  (function build() {
    const a = 0.105, dx = a * Math.sqrt(3), dy = a * 1.5;
    for (let r = -1; r < 9; r++) for (let c = -1; c < 7; c++) {
      const x0 = c * dx + (r % 2 ? dx / 2 : 0), y0 = r * dy;
      ICE.push([x0, y0], [x0, y0 + a]);
    }
    const n = ICE.filter(([x, y]) => x >= 0 && x <= 1 && y >= 0 && y <= 1).length;
    const m = Math.round(n * 1.09);
    let seed = 3; const rnd = () => ((seed = seed * 16807 % 2147483647) / 2147483647);
    for (let i = 0; i < m; i++) LIQ.push({ x: rnd(), y: rnd(), a: rnd() * 6.28, vx: rnd() - .5, vy: rnd() - .5 });
    ICE.n = n; LIQ.n = m;
  })();

  const { ctx, size } = fit(cv, () => draw());
  let clock = 0;

  function mol(x, y, s, ang) {
    for (const t of [-52.25, 52.25]) {
      const q = ang + t * Math.PI / 180;
      ctx.beginPath(); ctx.arc(x + Math.cos(q) * s * 0.55, y + Math.sin(q) * s * 0.55, s * 0.26, 0, Math.PI * 2);
      ctx.fillStyle = "#f4f4f0"; ctx.fill(); ctx.strokeStyle = C.ink3; ctx.lineWidth = .7; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(x, y, s * 0.4, 0, Math.PI * 2); ctx.fillStyle = C.apple; ctx.fill();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const T = +sT.value, small = w < 520, frozen = T < 0;
    // ── 왼쪽: 분자 배치 (모식)
    const bs = Math.min(w * 0.4, h - 44), bx = 10, by = 24;
    ctx.fillStyle = frozen ? "#eef3f8" : "rgba(63,111,181,.08)"; ctx.fillRect(bx, by, bs, bs);
    ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bs, bs); ctx.clip();
    const s = bs * 0.07;
    if (frozen) {
      const a = 0.105, dx = a * Math.sqrt(3), dy = a * 1.5;
      ctx.strokeStyle = "rgba(63,111,181,.55)"; ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
      for (let r = -1; r < 9; r++) for (let c = -1; c < 7; c++) {
        const x0 = c * dx + (r % 2 ? dx / 2 : 0), y0 = r * dy, P = (x, y) => [bx + x * bs, by + y * bs];
        const up = P(x0, y0), dn = P(x0, y0 + a), l = P(x0 - dx / 2, y0 - a / 2), rr = P(x0 + dx / 2, y0 - a / 2);
        ctx.beginPath(); ctx.moveTo(...up); ctx.lineTo(...dn); ctx.moveTo(...up); ctx.lineTo(...l); ctx.moveTo(...up); ctx.lineTo(...rr); ctx.stroke();
      }
      ctx.setLineDash([]);
      ICE.forEach(([x, y], i) => mol(bx + x * bs + Math.sin(clock * 6 + i) * 0.6, by + y * bs, s, (i % 2 ? -Math.PI / 2 : Math.PI / 2)));
    } else {
      for (const p of LIQ) mol(bx + p.x * bs, by + p.y * bs, s, p.a);
    }
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(bx + .5, by + .5, bs, bs);
    ctx.font = `${small ? 9.5 : 10.5}px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText(frozen ? `얼음 (모식) · 이 틀에 분자 ${ICE.n}개` : `액체 물 (모식) · 같은 틀에 약 ${LIQ.n}개`, bx, by - 8);
    if (frozen) { ctx.fillStyle = "#3f6fb5"; ctx.fillText("점선: 수소 결합", bx, by + bs + 14); }

    // ── 오른쪽: 밀도–온도 그래프 + 확대 그림
    const x0 = bx + bs + (small ? 38 : 48), y0 = 22, pw = w - x0 - 10, ph = h - y0 - 36;
    const X = (t) => x0 + (t + 10) / 30 * pw, Y = (r) => y0 + (1 - (r - 0.91) / 0.095) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [[-10, "−10"], [0, "0"], [10, "10"], [20, "20 °C"]], yt: [[0.92, "0.92"], [0.96, "0.96"], [1.0, "1.00"]], ylabel: "밀도 (g/mL)" });
    ctx.strokeStyle = "#3f6fb5"; ctx.lineWidth = 2;
    ctx.beginPath(); for (let t = -10; t <= 0; t += 1) t === -10 ? ctx.moveTo(X(t), Y(ice(t))) : ctx.lineTo(X(t), Y(ice(t))); ctx.stroke();
    ctx.beginPath(); for (let t = 0; t <= 20; t += 0.5) t === 0 ? ctx.moveTo(X(t), Y(water(t))) : ctx.lineTo(X(t), Y(water(t))); ctx.stroke();
    ctx.setLineDash([2, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(0), Y(ice(0))); ctx.lineTo(X(0), Y(water(0))); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `${small ? 9.5 : 10.5}px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("얼음", X(-9), Y(ice(-9)) - 8); ctx.fillText("물", X(0.6), Y(1.0) - 7);
    ctx.beginPath(); ctx.arc(X(T), Y(rho(T)), 5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    // 확대: 0~20 °C 물
    const ix = X(1.5), iy = Y(0.985), iw = X(19.5) - ix, ih = Y(0.935) - iy;
    ctx.fillStyle = "#fff"; ctx.fillRect(ix, iy, iw, ih); ctx.strokeStyle = C.rule; ctx.strokeRect(ix + .5, iy + .5, iw, ih);
    const IX = (t) => ix + 6 + t / 20 * (iw - 12), IY = (r) => iy + 16 + (1 - (r - 0.99815) / 0.0019) * (ih - 26);
    ctx.strokeStyle = "#3f6fb5"; ctx.lineWidth = 1.6;
    ctx.beginPath(); for (let t = 0; t <= 20; t += 0.5) t === 0 ? ctx.moveTo(IX(t), IY(water(t))) : ctx.lineTo(IX(t), IY(water(t))); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `${small ? 9 : 10}px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText("확대: 0~20 °C의 물", ix + 5, iy + ih - 6);
    ctx.textAlign = "center"; ctx.fillText("4 °C 최대", IX(4), IY(water(4)) - 5);
    if (T >= 0) { ctx.beginPath(); ctx.arc(IX(T), IY(water(T)), 3.5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); }
  }

  function update() {
    const T = +sT.value, r = rho(T);
    oT.textContent = T;
    dSt.textContent = T < 0 ? "얼음" : "액체";
    dRho.textContent = `${r.toFixed(T < 0 ? 4 : 5)}`;
    dV.textContent = `${(1000 / r).toFixed(1)} mL`;
    const ch = (water(4) / r - 1) * 100;
    dN.textContent = `${ch >= 0 ? "+" : ""}${ch.toFixed(ch > 1 ? 1 : 3)}%`;
    dN.className = ch > 1 ? "v-n bad" : "v-n";
    draw();
  }
  sT.addEventListener("input", update);
  root.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { sT.value = b.dataset.t; update(); }));
  update();
  loop(cv, (dt) => {
    if (NM.reduce) return;
    clock += dt;
    if (+sT.value >= 0) for (const p of LIQ) {
      p.x = (p.x + p.vx * dt * 0.05 + 1) % 1; p.y = (p.y + p.vy * dt * 0.05 + 1) % 1; p.a += (p.vx) * dt * 2;
    }
    draw();
  });
})();
