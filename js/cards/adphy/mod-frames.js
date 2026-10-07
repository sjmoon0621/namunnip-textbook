/* 카드: 돌아가는 회전판 위에서 똑바로 민 공은 왜 휘어 갈까? — 직선 가속 좌표계(버스·엘리베이터)와 회전 좌표계(원판) */
(() => {
  const root = document.getElementById("card-adphy-frames");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), launchBox = $(".launch");
  const SL = [{ inp: $(".sa"), out: $(".oa"), lab: $(".la") }, { inp: $(".sb"), out: $(".ob"), lab: $(".lb") }];
  const N = [0, 1, 2].map((i) => ({ dt: $(".d" + i), dd: $(".n" + i) }));
  const G = 9.8, RD = 1;
  const MODES = {
    bus: [["버스의 가속도 (앞 +)", -5, 5, 0.1, 3, (v) => v.toFixed(1) + " m/s²"], ["엘리베이터 가속도 (위 +)", -9.8, 5, 0.1, 0, (v) => v.toFixed(1) + " m/s²"]],
    disk: [["원판의 각속도 ω", 0.2, 2.5, 0.05, 1, (v) => v.toFixed(2) + " rad/s"], ["원판에 대한 미는 속력 v′", 0.1, 1.5, 0.05, 0.5, (v) => v.toFixed(2) + " m/s"]],
  };
  const store = { bus: [3, 0], disk: [1, 0.5] };
  let mode = "bus", kind = "out", t = 0, trailI = [], trailR = [], hold = 0;

  const { ctx, size } = fit(cv, () => draw());
  function txt(s, x, y, al, c, f) { ctx.fillStyle = c || C.ink3; ctx.font = f || `11px ${F.sans}`; ctx.textAlign = al || "left"; ctx.fillText(s, x, y); }
  function arrow(x0, y0, dx, dy, col, lab, dash) {
    const L = Math.hypot(dx, dy); if (L < 2) return;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2; ctx.setLineDash(dash ? [4, 3] : []);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + dx, y0 + dy); ctx.stroke(); ctx.setLineDash([]);
    const a = Math.atan2(dy, dx), x1 = x0 + dx, y1 = y0 + dy;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 8 * Math.cos(a - 0.4), y1 - 8 * Math.sin(a - 0.4)); ctx.lineTo(x1 - 8 * Math.cos(a + 0.4), y1 - 8 * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill();
    if (lab) txt(lab, x1 + (dx >= 0 ? 4 : -4), y1 + (dy > 0 ? 12 : -4), dx >= 0 ? "left" : "right", col);
  }

  /* ── 버스·엘리베이터 ── */
  function drawBus(w, h) {
    const [A, Ay] = store.bus, gx = -A, gy = -(G + Ay); /* 유효 중력 (x: 앞+, y: 위+) */
    const ge = Math.hypot(gx, gy), free = ge < 0.3;
    const bx = 16, by = 18, bw = w - 32, bh = h - 50;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = C.ink; [0.2, 0.8].forEach((f) => { ctx.beginPath(); ctx.arc(bx + bw * f, by + bh + 10, 9, 0, 7); ctx.fill(); });
    arrow(bx + bw - 70, by + bh + 26, A * 10, 0, C.warn);
    txt("앞 →", bx + bw, by + bh + 30, "right", C.ink);
    if (Math.abs(Ay) > 0.05) arrow(bx + bw - 14, by + bh * 0.5, 0, -Ay * 6, C.warn, "A", false);
    const ux = free ? 0 : gx / ge, uy = free ? 0 : gy / ge; /* 아래(유효) 방향 단위 벡터, 화면 y는 아래가 + */
    /* 추 */
    const px = bx + bw * 0.28, py = by + 6, Ls = bh * 0.55;
    const ex = px + ux * Ls, ey = py - uy * Ls;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(free ? px + Ls * 0.5 : ex, free ? py + Ls * 0.4 : ey); ctx.stroke();
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + Ls); ctx.stroke(); ctx.setLineDash([]);
    const bobx = free ? px + Ls * 0.5 : ex, boby = free ? py + Ls * 0.4 : ey;
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(bobx, boby, 8, 0, 7); ctx.fill();
    const fs = 4.2;
    arrow(bobx, boby, 0, G * fs, "#3f6fa3", "mg");
    arrow(bobx, boby, -A * fs, Ay * fs, "#3b7c2a", "관성력 −mA", true);
    if (!free) arrow(bobx, boby, -ux * ge * fs, uy * ge * fs, "#7a4fa0", "장력");
    txt("추", px - 10, py + 12, "right", C.ink);
    /* 풍선 */
    const qx = bx + bw * 0.6, qy = by + bh - 4, Lb = bh * 0.55;
    const tx = free ? qx : qx - ux * Lb, ty = free ? qy - Lb : qy + uy * Lb;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.fillStyle = "rgba(212,73,58,.85)"; ctx.beginPath(); ctx.ellipse(tx, ty - 11, 11, 14, 0, 0, 7); ctx.fill();
    txt(free ? "풍선 (떠 있음)" : "헬륨 풍선", tx + 16, ty - 8, "left", C.ink);
    /* 물컵 */
    const cx = bx + bw * 0.86, cw = 44, ch = 54, cy = by + bh - ch - 2;
    ctx.save(); ctx.beginPath(); ctx.rect(cx - cw / 2, cy, cw, ch); ctx.clip();
    const slope = free || uy > -0.05 ? 0 : -ux / uy; /* 수면 기울기: 유효 중력에 수직 */
    const mid = cy + ch * 0.45;
    ctx.fillStyle = "rgba(63,111,163,.35)"; ctx.beginPath();
    ctx.moveTo(cx - cw / 2, mid + slope * (cw / 2)); ctx.lineTo(cx + cw / 2, mid - slope * (cw / 2)); ctx.lineTo(cx + cw / 2, cy + ch); ctx.lineTo(cx - cw / 2, cy + ch); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx - cw / 2, cy); ctx.lineTo(cx - cw / 2, cy + ch); ctx.lineTo(cx + cw / 2, cy + ch); ctx.lineTo(cx + cw / 2, cy); ctx.stroke();
    txt("물컵", cx, cy - 6, "center", C.ink);
    const th = Math.atan2(A, G + Ay) * 180 / Math.PI;
    N[0].dt.textContent = "추의 기울기 θ (뒤 +)"; N[0].dd.textContent = free ? "정해지지 않음" : `${th.toFixed(1)}°`;
    N[1].dt.textContent = "유효 중력 g_eff"; N[1].dd.textContent = `${ge.toFixed(2)} m/s²`;
    N[2].dt.textContent = "체중계 눈금 (평소의 몇 배)"; N[2].dd.textContent = `${((G + Ay) / G).toFixed(2)}배`;
  }

  /* ── 회전 원판 ── */
  function init() {
    const [w, v] = store.disk;
    let r0, vr;
    if (kind === "out") { r0 = [0, 0]; vr = [v, 0]; }
    else if (kind === "rest") { r0 = [0.3, 0]; vr = [0, 0]; }
    else { r0 = [0.95, 0]; vr = [-v, 0]; }
    return { r0, u: [vr[0] - w * r0[1], vr[1] + w * r0[0]] };
  }
  function state(tt) {
    const w = store.disk[0], { r0, u } = init();
    const ri = [r0[0] + u[0] * tt, r0[1] + u[1] * tt];
    const c = Math.cos(-w * tt), s = Math.sin(-w * tt);
    const rr = [c * ri[0] - s * ri[1], s * ri[0] + c * ri[1]];
    const vi = [u[0] + w * ri[1], u[1] - w * ri[0]]; /* u − ω×r */
    const vr = [c * vi[0] - s * vi[1], s * vi[0] + c * vi[1]];
    return { ri, rr, vr, speed: Math.hypot(u[0], u[1]) };
  }
  function diskPanel(cx, cy, Rp, ang, title, trail, pos, vecs) {
    ctx.fillStyle = "rgba(181,215,172,.35)"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, 7); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2;
    for (let k = 0; k < 4; k++) { const a = ang + k * Math.PI / 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Rp * Math.cos(a), cy - Rp * Math.sin(a)); ctx.globalAlpha = k ? 0.3 : 1; ctx.stroke(); }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.8; ctx.beginPath();
    trail.forEach(([x, y], i) => (i ? ctx.lineTo(cx + x * Rp, cy - y * Rp) : ctx.moveTo(cx + x * Rp, cy - y * Rp))); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx + pos[0] * Rp, cy - pos[1] * Rp, 6, 0, 7); ctx.fill();
    (vecs || []).forEach(([vx0, vy0, col]) => { const k = Math.min(1, Rp * 0.6 / Math.max(1e-6, Math.hypot(vx0, vy0))), vx = vx0 * k, vy = vy0 * k; arrow(cx + pos[0] * Rp, cy - pos[1] * Rp, vx, -vy, col); });
    txt(title, cx, cy - Rp - 8, "center", C.ink, `12px ${F.sans}`);
  }
  function drawDisk(w, h) {
    const om = store.disk[0], Rp = Math.min(w * 0.22, h * 0.4), cy = h * 0.53;
    const st = state(t);
    diskPanel(w * 0.25, cy, Rp, om * t, "밖에서 본 모습 (관성계)", trailI, st.ri);
    const cor = [2 * om * st.vr[1], -2 * om * st.vr[0]], cen = [om * om * st.rr[0], om * om * st.rr[1]];
    const sc = Rp * 0.22;
    diskPanel(w * 0.75, cy, Rp, 0, "원판과 함께 돌며 본 모습", trailR, st.rr, [[cor[0] * sc, cor[1] * sc, "#3b7c2a"], [cen[0] * sc, cen[1] * sc, "#e0a02a"]]);
    txt("↺ 반시계 방향 회전", w * 0.25, cy + Rp + 18, "center");
    txt("초록: 코리올리 · 주황: 원심", w * 0.75, cy + Rp + 18, "center");
    const vrm = Math.hypot(st.vr[0], st.vr[1]), rm = Math.hypot(st.rr[0], st.rr[1]);
    N[0].dt.textContent = "관성계에서 퍽의 속력 (일정)"; N[0].dd.textContent = `${st.speed.toFixed(2)} m/s`;
    N[1].dt.textContent = "코리올리 가속도 2ωv′"; N[1].dd.textContent = `${(2 * om * vrm).toFixed(2)} m/s²`;
    N[2].dt.textContent = "원심 가속도 ω²r"; N[2].dd.textContent = `${(om * om * rm).toFixed(2)} m/s²`;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    if (mode === "bus") drawBus(w, h); else drawDisk(w, h);
  }
  function reset() { t = 0; hold = 0; const s = state(0); trailI = [s.ri]; trailR = [s.rr]; }
  loop(cv, (dt) => {
    if (mode !== "disk") return;
    if (hold > 0) { hold -= dt; if (hold <= 0) reset(); draw(); return; }
    t += dt;
    const s = state(t);
    if (Math.hypot(s.ri[0], s.ri[1]) > RD || t > 10) { hold = 1.2; return; }
    trailI.push(s.ri); trailR.push(s.rr); draw();
  });
  function setMode(m) {
    mode = m; launchBox.hidden = m !== "disk";
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === m)));
    MODES[m].forEach((d, i) => { const s = SL[i]; s.lab.textContent = d[0]; s.inp.min = d[1]; s.inp.max = d[2]; s.inp.step = d[3]; s.inp.value = store[m][i]; s.inp.setAttribute("aria-label", d[0]); });
    update();
  }
  function update() {
    MODES[mode].forEach((d, i) => { store[mode][i] = +SL[i].inp.value; SL[i].out.textContent = d[5](store[mode][i]); });
    SL[1].inp.disabled = mode === "disk" && kind === "rest";
    reset(); draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.m)));
  root.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => {
    kind = b.dataset.k; root.querySelectorAll("[data-k]").forEach((c) => c.setAttribute("aria-pressed", String(c === b))); update();
  }));
  SL.forEach((s) => s.inp.addEventListener("input", update));
  const dq = new URLSearchParams(location.search).get("demo");
  setMode(MODES[dq] ? dq : "bus");
})();
