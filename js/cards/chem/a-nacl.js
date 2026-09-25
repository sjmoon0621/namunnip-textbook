/* 카드: 고체 소금은 전기가 안 통하는데, 녹이면 왜 통할까? — 이온의 이동과 용융 전기 분해 (입자 모식) */
(() => {
  const root = document.getElementById("card-chem-nacl");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const dBulb = $(".v-bulb"), dCar = $(".v-car"), dNeg = $(".v-neg"), dPos = $(".v-pos"), msg = $(".nacl-msg");

  let sub = "nacl", st = "solid", parts = [], prod = { neg: 0, pos: 0 }, flash = [], clock = 0;
  const NA_C = "#8e6fc1", CL_C = "#5ea35a", SUG_C = "#c9a227";
  const conducts = () => sub === "nacl" && st !== "solid";

  // 확대 상자 좌표는 0~1 (왼쪽 벽 = (−)극, 오른쪽 벽 = (+)극)
  function setup() {
    parts = []; prod = { neg: 0, pos: 0 }; flash = [];
    if (sub === "nacl" && st === "solid") {
      const n = 7, m = 5;
      for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
        const x = 0.14 + i * 0.12, y = 0.14 + j * 0.18;
        parts.push({ k: (i + j) % 2 ? "cl" : "na", x, y, hx: x, hy: y, vx: 0, vy: 0 });
      }
    } else if (sub === "nacl") {
      const n = st === "melt" ? 30 : 12;
      for (let i = 0; i < n; i++) parts.push(spawn(i % 2 ? "cl" : "na"));
      if (st === "aq") for (let i = 0; i < 40; i++) parts.push(spawn("w"));
    } else {
      const n = st === "aq" ? 8 : st === "melt" ? 16 : 16;
      if (st === "solid") for (let i = 0; i < 16; i++) { const x = 0.18 + (i % 4) * 0.21, y = 0.18 + Math.floor(i / 4) * 0.21; parts.push({ k: "s", x, y, hx: x, hy: y, vx: 0, vy: 0, a: 0 }); }
      else for (let i = 0; i < n; i++) parts.push(spawn("s"));
      if (st === "aq") for (let i = 0; i < 40; i++) parts.push(spawn("w"));
    }
  }
  function spawn(k) {
    const a = Math.random() * 6.28;
    return { k, x: 0.1 + Math.random() * 0.8, y: 0.08 + Math.random() * 0.84, vx: Math.cos(a) * 0.12, vy: Math.sin(a) * 0.12, a: Math.random() * 6.28 };
  }

  const { ctx, size } = fit(cv, () => draw());

  function ion(k, x, y, s) {
    if (k === "w") { ctx.beginPath(); ctx.arc(x, y, s * 0.35, 0, Math.PI * 2); ctx.fillStyle = "rgba(63,111,181,.22)"; ctx.fill(); return; }
    if (k === "s") { ctx.fillStyle = SUG_C; ctx.beginPath(); ctx.ellipse(x, y, s * 0.95, s * 0.6, 0.4, 0, Math.PI * 2); ctx.fill(); return; }
    const r = k === "na" ? s * 0.55 : s * 0.85;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = k === "na" ? NA_C : CL_C; ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = `600 ${Math.round(r * 1.3)}px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(k === "na" ? "+" : "−", x, y + r * 0.45);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const small = w < 520, on = conducts();
    // ── 왼쪽: 회로 (전원 · 전구 · 비커)
    const lw = w * 0.4, bx = lw * 0.18, bw = lw * 0.64, by = h * 0.45, bh = h * 0.42;
    ctx.fillStyle = st === "solid" ? "#ecebe4" : st === "melt" ? (sub === "nacl" ? "rgba(224,160,42,.28)" : "rgba(160,110,40,.3)") : "rgba(63,111,181,.13)";
    ctx.fillRect(bx, st === "solid" ? by + bh * 0.55 : by + bh * 0.25, bw, st === "solid" ? bh * 0.45 : bh * 0.75);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
    const e1 = bx + bw * 0.25, e2 = bx + bw * 0.75;
    ctx.fillStyle = "#6b6b70"; ctx.fillRect(e1 - 3, by - 16, 6, bh * 0.85 + 16); ctx.fillRect(e2 - 3, by - 16, 6, bh * 0.85 + 16);
    const wy = h * 0.14, xm = lw * 0.5;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(e1, by - 16); ctx.lineTo(e1, wy); ctx.lineTo(xm - 30, wy); ctx.moveTo(xm - 16, wy); ctx.lineTo(xm + 12, wy); ctx.moveTo(xm + 28, wy); ctx.lineTo(e2, wy); ctx.lineTo(e2, by - 16); ctx.stroke();
    // 전원 (긴 선이 +)
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xm - 30, wy - 5); ctx.lineTo(xm - 30, wy + 5); ctx.moveTo(xm - 22, wy - 10); ctx.lineTo(xm - 22, wy + 10); ctx.stroke();
    ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(xm - 22, wy); ctx.lineTo(xm - 16, wy); ctx.stroke();
    // 전구
    const lx = xm + 20;
    if (on) { const g = ctx.createRadialGradient(lx, wy, 2, lx, wy, 26); g.addColorStop(0, "rgba(224,160,42,.7)"); g.addColorStop(1, "rgba(224,160,42,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lx, wy, 26, 0, Math.PI * 2); ctx.fill(); }
    ctx.beginPath(); ctx.arc(lx, wy, 8, 0, Math.PI * 2); ctx.fillStyle = on ? C.amber : C.card; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.font = `${small ? 9.5 : 10.5}px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    ctx.fillText("(−)극", e1, by + bh + 16); ctx.fillText("(+)극", e2, by + bh + 16);
    ctx.fillText(st === "solid" ? "고체" : st === "melt" ? (sub === "nacl" ? "녹인 것 (801 °C 이상)" : "녹인 것 (약 186 °C)") : "수용액", bx + bw / 2, by + bh + 32);
    // 확대 표시
    ctx.setLineDash([2, 3]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    const zx = lw + 10, zy = 20, zs = Math.min(w - zx - 10, h - 40), zw = w - zx - 10;
    ctx.beginPath(); ctx.moveTo(bx + bw / 2, by + bh * 0.62); ctx.lineTo(zx, zy); ctx.moveTo(bx + bw / 2, by + bh * 0.62); ctx.lineTo(zx, zy + zs); ctx.stroke(); ctx.setLineDash([]);

    // ── 오른쪽: 두 전극 사이 확대 (모식)
    ctx.fillStyle = "#fff"; ctx.fillRect(zx, zy, zw, zs);
    ctx.fillStyle = "#6b6b70"; ctx.fillRect(zx, zy, 8, zs); ctx.fillRect(zx + zw - 8, zy, 8, zs);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(zx + .5, zy + .5, zw - 1, zs - 1);
    ctx.font = `${small ? 9.5 : 10.5}px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("확대 (모식) · 왼쪽 벽이 (−)극", zx, zy - 6);
    const s = Math.min(zw, zs) * 0.045, X = (x) => zx + 8 + x * (zw - 16), Y = (y) => zy + y * zs;
    ctx.save(); ctx.beginPath(); ctx.rect(zx + 8, zy, zw - 16, zs); ctx.clip();
    for (const p of parts) ion(p.k, X(p.x), Y(p.y), s);
    ctx.restore();
    // 전극에서 생긴 것
    for (const f of flash) {
      ctx.globalAlpha = Math.max(0, 1 - f.t / 1.2);
      if (f.side === "neg" && st === "melt") { ctx.fillStyle = "#b8b8c0"; ctx.beginPath(); ctx.arc(zx + 12, Y(f.y), s * 0.7, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = C.ink2; ctx.stroke(); }
      else { ctx.strokeStyle = f.side === "neg" ? C.ink2 : CL_C; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(f.side === "neg" ? zx + 14 + f.t * 6 : zx + zw - 14 - f.t * 6, Y(f.y) - f.t * 30, s * 0.55, 0, Math.PI * 2); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
  }

  function info() {
    const on = conducts();
    dBulb.textContent = on ? "켜짐" : "꺼짐";
    dBulb.className = on ? "v-bulb good" : "v-bulb";
    dCar.textContent = on ? "Na⁺, Cl⁻ 이온" : sub === "nacl" ? "없음 (이온이 제자리)" : "없음 (전하 없는 분자)";
    dNeg.textContent = !on ? "—" : st === "melt" ? "Na (금속)" : "H₂ 기체";
    dPos.textContent = !on ? "—" : "Cl₂ 기체";
    msg.textContent = sub === "sugar"
      ? "설탕은 분자로 이루어져 있어, 녹여도 전하를 띤 입자가 생기지 않습니다."
      : st === "solid" ? "이온은 있지만 결정 속 제자리에 묶여 떨고만 있습니다. 전하가 이동하지 못하니 전류가 흐르지 않습니다."
      : st === "melt" ? "Na⁺는 (−)극에서 전자를 받아 나트륨 금속이 되고, Cl⁻는 (+)극에 전자를 내주어 염소 기체가 됩니다."
      : "이온은 움직이지만, (−)극에서는 Na⁺ 대신 물이 전자를 받아 수소 기체가 나옵니다(진한 소금물 기준).";
  }

  function pick(group, val) {
    root.querySelectorAll(`[data-${group}]`).forEach((b) => b.setAttribute("aria-pressed", b.dataset[group] === val ? "true" : "false"));
  }
  root.querySelectorAll("[data-sub]").forEach((b) => b.addEventListener("click", () => { sub = b.dataset.sub; pick("sub", sub); setup(); info(); draw(); }));
  root.querySelectorAll("[data-st]").forEach((b) => b.addEventListener("click", () => { st = b.dataset.st; pick("st", st); setup(); info(); draw(); }));
  setup(); info();

  loop(cv, (dt) => {
    if (NM.reduce) { draw(); return; }
    clock += dt;
    const on = conducts(), drift = 0.16;
    for (const p of parts) {
      if (p.hx !== undefined) {           // 고체: 제자리 진동
        p.x = p.hx + Math.sin(clock * 9 + p.hy * 40) * 0.006; p.y = p.hy + Math.cos(clock * 8 + p.hx * 50) * 0.006; continue;
      }
      const q = p.k === "na" ? -1 : p.k === "cl" ? 1 : 0;   // Na⁺는 (−)극(왼쪽)으로
      p.vx += (Math.random() - .5) * 1.2 * dt; p.vy += (Math.random() - .5) * 1.2 * dt;
      const sp = Math.hypot(p.vx, p.vy), lim = p.k === "w" ? 0.2 : 0.12;
      if (sp > lim) { p.vx *= lim / sp; p.vy *= lim / sp; }
      p.x += (p.vx + (on ? q * drift : 0)) * dt; p.y += p.vy * dt;
      if (p.y < 0.05 || p.y > 0.95) { p.vy *= -1; p.y = Math.min(0.95, Math.max(0.05, p.y)); }
      if (p.x < 0.03 || p.x > 0.97) {
        const naAq = st === "aq" && q < 0;       // 수용액에서 Na⁺는 전자를 받지 않고 극 근처에 머문다
        if (on && q && !naAq && ((q < 0 && p.x < 0.03) || (q > 0 && p.x > 0.97))) {
          flash.push({ side: q < 0 ? "neg" : "pos", y: p.y, t: 0 });
          if (st === "aq") flash.push({ side: "neg", y: 0.1 + Math.random() * 0.8, t: 0 });   // 그만큼 (−)극에서 물이 전자를 받아 H₂
          Object.assign(p, spawn(p.k), { x: q < 0 ? 0.75 + Math.random() * 0.2 : 0.05 + Math.random() * 0.2 });
        } else { p.vx *= -1; p.x = Math.min(0.97, Math.max(0.03, p.x)); }
      }
    }
    for (const f of flash) f.t += dt;
    flash = flash.filter((f) => f.t < 1.2);
    draw();
  });
})();
