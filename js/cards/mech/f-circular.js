/* 카드: 줄이 끊기면 공은 어느 쪽으로 날아갈까? — 위에서 본 등속 원운동, 속도(접선)와 구심력(중심), 줄 끊기, 구심력의 출처 세 가지 */
(() => {
  const root = document.getElementById("card-mech-circular");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sV = $(".v"), sR = $(".r"), oV = $(".v-out"), oR = $(".r-out");
  const nF = $(".n-f"), nP = $(".n-p"), nSrc = $(".n-src"), msg = $(".msg"), uV = $(".unit"), uR = $(".unit-r");
  // 모드별 설정: 질량, 속력·반지름의 눈금(표시 단위)과 최대 구심력
  const MODES = {
    string: { name: "줄의 장력", m: 0.2, vS: 1, rS: 1, vu: "m/s", ru: "m", fu: "N", fmax: 40, note: "질량 0.2 kg인 공. 줄이 견디는 최대 장력은 40 N으로 가정했습니다." },
    car: { name: "도로의 마찰력", m: 1500, vS: 3, rS: 20, vu: "m/s", ru: "m", fu: "kN", fmax: 0.7 * 1500 * 9.8, note: "질량 1500 kg인 자동차, 마른 도로의 마찰 계수 0.7(최대 마찰력 약 10 kN)을 가정했습니다." },
    orbit: { name: "지구의 중력", m: 420000, vS: 1, rS: 1, vu: "km/s", ru: "× 지구 반지름", fu: "", fmax: 0, note: "국제우주정거장(약 420 t) 크기의 위성. 궤도 속력은 반지름으로 정해지므로 속력 막대는 쓰지 않습니다." },
  };
  let mode = "string", theta = 0, cut = null, trail = [];
  const GM = 3.986e14, RE = 6.371e6;
  const radiusPx = () => { const { w, h } = size; return Math.min(w, h) * (0.2 + 0.18 * (+sR.value - 0.5) / 2.5); };

  function params() {
    const M = MODES[mode];
    if (mode === "orbit") { const r = (+sR.value * 0.4 + 0.9) * RE, v = Math.sqrt(GM / r); return { M, v, r, F: M.m * v * v / r, T: 2 * Math.PI * r / v, dispR: r / RE, dispV: v / 1000, ok: true }; }
    const v = +sV.value * M.vS, r = +sR.value * M.rS, F = M.m * v * v / r;
    return { M, v, r, F, T: 2 * Math.PI * r / v, dispR: r, dispV: v, ok: F <= M.fmax };
  }

  function arrow(ctx, x, y, dx, dy, col, label) {
    const L = Math.hypot(dx, dy); if (L < 3) return;
    const ux = dx / L, uy = dy / L, h = 9;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx - ux * h * 0.8, y + dy - uy * h * 0.8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + dx, y + dy); ctx.lineTo(x + dx - ux * h - uy * h * 0.5, y + dy - uy * h + ux * h * 0.5); ctx.lineTo(x + dx - ux * h + uy * h * 0.5, y + dy - uy * h - ux * h * 0.5); ctx.closePath(); ctx.fill();
    if (label) { ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(label, x + dx + ux * 14, y + dy + uy * 14 + 4); }
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = params(), cx = w / 2, cy = h / 2;
    const R = radiusPx();
    // 중심 물체
    if (mode === "orbit") { ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.arc(cx, cy, Math.min(w, h) * 0.12, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("지구", cx, cy + 4); }
    else if (mode === "car") { ctx.strokeStyle = "#8d8d92"; ctx.lineWidth = 26; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
    else { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill(); }
    if (mode !== "car") { ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
    // 자국
    ctx.strokeStyle = "rgba(181,83,47,.5)"; ctx.lineWidth = 1.5; ctx.beginPath(); trail.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    let bx, by, vx, vy;
    if (cut) { bx = cut.x; by = cut.y; vx = cut.vx; vy = cut.vy; }
    else { bx = cx + R * Math.cos(theta); by = cy + R * Math.sin(theta); vx = -Math.sin(theta); vy = Math.cos(theta); }
    if (!cut && mode === "string") { ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke(); }
    // 물체
    if (mode === "car") { ctx.save(); ctx.translate(bx, by); ctx.rotate(Math.atan2(vy, vx)); ctx.fillStyle = "#b5532f"; ctx.fillRect(-11, -6, 22, 12); ctx.restore(); }
    else { ctx.fillStyle = mode === "orbit" ? "#caa47c" : "#b5532f"; ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI * 2); ctx.fill(); }
    const vl = 34 + 8 * +sV.value * (mode === "orbit" ? 0 : 1) + (mode === "orbit" ? 40 : 0);
    arrow(ctx, bx, by, vx * vl, vy * vl, "#3b7c2a", "v");
    if (!cut) { const fl = mode === "orbit" ? R * 0.45 : Math.min(R * 0.95, 5 * (+sV.value) ** 2 / +sR.value); arrow(ctx, bx, by, (cx - bx) / R * fl, (cy - by) / R * fl, "#b5532f", "F"); }
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink3;
    ctx.fillText(cut ? "구심력이 사라진 뒤: 그 순간의 속도 방향으로 곧게" : "초록: 속도(접선 방향) · 빨강: 구심력(중심 방향)", 10, 18);
  }

  function update() {
    const p = params(), M = p.M;
    oV.textContent = (mode === "orbit" ? p.dispV : p.dispV).toFixed(1); oR.textContent = p.dispR.toFixed(mode === "orbit" ? 2 : 1);
    uV.textContent = M.vu; uR.textContent = M.ru;
    sV.disabled = mode === "orbit";
    nF.textContent = mode === "car" ? `${(p.F / 1000).toFixed(1)} kN` : mode === "orbit" ? `${(p.F / 1e6).toFixed(2)} MN` : `${p.F.toFixed(1)} N`;
    nP.textContent = mode === "orbit" ? `${(p.T / 60).toFixed(0)} 분` : `${p.T.toFixed(2)} s`;
    nSrc.textContent = M.name;
    nF.classList.toggle("bad", !p.ok);
    msg.textContent = M.note + (!p.ok ? (mode === "car" ? " 지금 속력에서는 마찰력이 모자라 자동차가 바깥쪽 접선 방향으로 밀려납니다." : " 줄이 끊어질 만큼 큰 장력이 필요합니다.") : "");
    if (!p.ok && !cut) doCut();
    draw();
  }
  function doCut() {
    const { w, h } = size, cx = w / 2, cy = h / 2, R = radiusPx();
    cut = { x: cx + R * Math.cos(theta), y: cy + R * Math.sin(theta), vx: -Math.sin(theta), vy: Math.cos(theta) }; trail = [[cut.x, cut.y]];
  }
  $(".cut").addEventListener("click", () => { if (!cut) doCut(); });
  $(".reset").addEventListener("click", () => { cut = null; trail = []; update(); });
  [sV, sR].forEach((el) => el.addEventListener("input", () => { cut = null; trail = []; update(); }));
  root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => {
    mode = b.dataset.mode; cut = null; trail = [];
    root.querySelectorAll("[data-mode]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    update();
  }));
  loop(cv, (dt) => {
    const p = params(), { w, h } = size; if (!w) return;
    const speed = mode === "orbit" ? 0.9 : 0.5 + +sV.value * 0.25;   // 화면 각속도 (보기 좋게)
    if (cut) {
      const s = speed * Math.min(w, h) * 0.25 * dt;
      cut.x += cut.vx * s; cut.y += cut.vy * s; trail.push([cut.x, cut.y]);
      if (cut.x < -20 || cut.x > w + 20 || cut.y < -20 || cut.y > h + 20) { cut = null; trail = []; }
    } else theta += speed * dt;
    draw();
  });
  update();
})();
