/* 카드: 냉찜질 팩은 어떻게 차가워질까? — 물질을 물에 녹일 때의 온도 변화 */
(() => {
  const root = document.getElementById("card-is2-cold-pack");
  if (!root) return;
  const { C, F, clamp, ease, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), mS = $(".mass"), mO = $(".mass-out");
  const nN = $(".mol"), nQ = $(".q"), nT = $(".tf");

  // 25 °C, 묽은 용액에서의 용해 엔탈피 (kJ/mol), 몰질량 (g/mol)
  const SOL = {
    nh4no3: { name: "질산 암모늄", f: "NH₄NO₃", dh: 25.69, M: 80.04, col: "#3f7fc4" },
    nh4cl: { name: "염화 암모늄", f: "NH₄Cl", dh: 14.78, M: 53.49, col: "#6aa7c9" },
    nacl: { name: "염화 나트륨", f: "NaCl", dh: 3.88, M: 58.44, col: "#8d8d92" },
    naoh: { name: "수산화 나트륨", f: "NaOH", dh: -44.51, M: 40.00, col: "#d4493a" },
    cacl2: { name: "염화 칼슘", f: "CaCl₂", dh: -81.3, M: 110.98, col: "#e0a02a" },
  };
  const W = 100, T0 = 25, CP = 4.18;
  let key = "nh4no3", prog = 1;
  const Tf = (k, m) => T0 - (m / SOL[k].M) * SOL[k].dh * 1000 / ((W + m) * CP);

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = +mS.value, s = SOL[key], p = ease(prog);
    const narrow = w < 460;
    // 비커와 온도계
    const bx = 16, bw = narrow ? w * 0.46 : w * 0.34, by = 40, bh = narrow ? h * 0.42 : h - by - 36;
    const T = T0 + (Tf(key, m) - T0) * p;
    const warm = clamp((T - 25) / 40, -1, 1);
    ctx.fillStyle = warm < 0 ? `rgba(90,140,210,${0.15 - warm * 0.35})` : `rgba(220,110,70,${0.12 + warm * 0.35})`;
    const lvl = by + bh * 0.3;
    ctx.fillRect(bx + 2, lvl, bw - 4, by + bh - lvl - 2);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
    // 녹는 결정
    let seed = 2; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const nC = Math.round(m * 1.2);
    for (let i = 0; i < nC; i++) {
      const x = bx + 12 + rnd() * (bw * 0.55), y = by + bh - 8 - rnd() * 12, r = (2 + rnd() * 2.5) * (1 - p);
      if (r > 0.3) { ctx.fillStyle = "#f5f5f0"; ctx.strokeStyle = C.ink3; ctx.lineWidth = .7; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.strokeRect(x - r, y - r, 2 * r, 2 * r); }
    }
    // 온도계
    const tx = bx + bw * 0.8, tTop = by - 26, tBot = by + bh - 14, tMin = 0, tMax = 90;
    const TY = (v) => tBot - (v - tMin) / (tMax - tMin) * (tBot - tTop);
    ctx.fillStyle = "#fff"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(tx - 5, tTop, 10, tBot - tTop + 6, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.apple; ctx.fillRect(tx - 2.5, TY(T), 5, tBot - TY(T) + 4);
    ctx.beginPath(); ctx.arc(tx, tBot + 6, 7, 0, Math.PI * 2); ctx.fill();
    ctx.font = `600 14px ${F.mono}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText(`${T.toFixed(1)} °C`, bx + 6, by - 12);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink3;
    ctx.fillText(`물 100 g + ${s.f} ${m} g`, bx + 6, by + bh + 18);

    // 그래프: 녹인 질량에 따른 최종 온도
    const gx = narrow ? 40 : bx + bw + 52, gy = narrow ? by + bh + 44 : 22, gw = w - gx - 12, gh = narrow ? h - gy - 30 : h - gy - 34;
    const X = (v) => gx + v / 30 * gw, Y = (v) => gy + (1 - (v - 0) / 90) * gh;
    NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [[0, "0"], [10, "10"], [20, "20"], [30, "30 g"]], yt: [[0, "0"], [25, "25"], [50, "50"], [90, "90"]], ylabel: "녹인 뒤 온도 (°C)", xlabel: "녹인 양" });
    for (const k of Object.keys(SOL)) {
      const on = k === key;
      ctx.strokeStyle = SOL[k].col; ctx.lineWidth = on ? 2.6 : 1.2; ctx.globalAlpha = on ? 1 : 0.5;
      ctx.beginPath(); for (let v = 0; v <= 30; v += 0.5) { const y = Y(Tf(k, v)); v ? ctx.lineTo(X(v), y) : ctx.moveTo(X(v), y); } ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.font = `${on ? 700 : 400} 10.5px ${F.sans}`; ctx.fillStyle = SOL[k].col; ctx.textAlign = "right";
      ctx.fillText(SOL[k].f, X(30) - 2, Y(Tf(k, 30)) + (SOL[k].dh > 0 ? 13 : -5));
    }
    ctx.beginPath(); ctx.arc(X(m), Y(Tf(key, m)), 4.5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
  }

  function update() {
    const m = +mS.value, s = SOL[key], n = m / s.M, q = n * s.dh;
    mO.textContent = m;
    nN.textContent = `${n.toFixed(3)} mol`;
    nQ.textContent = q === 0 ? "0" : q > 0 ? `${q.toFixed(1)} kJ 흡수` : `${(-q).toFixed(1)} kJ 방출`;
    nQ.className = q > 0 ? "" : q < 0 ? "bad" : "";
    nT.textContent = `${Tf(key, m).toFixed(1)} °C`;
    root.querySelectorAll("[data-k]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.k === key)));
    draw();
  }
  root.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => { key = b.dataset.k; prog = NM.reduce ? 1 : 0; update(); }));
  mS.addEventListener("input", () => { prog = 1; update(); });
  update();
  loop(cv, (dt) => { if (prog >= 1) return; prog = Math.min(1, prog + dt / 2.5); draw(); });
})();
