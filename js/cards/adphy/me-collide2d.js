/* 카드: 당구공은 왜 직각으로 갈라질까? — 매끄러운 두 원판의 평면 충돌, 실험실·질량 중심 좌표계, 운동량 벡터 삼각형 */
(() => {
  const root = document.getElementById("card-adphy-collide2d");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sM = $(".m"), sB = $(".b"), sE = $(".e"), oM = $(".m-out"), oB = $(".b-out"), oE = $(".e-out");
  const nSep = $(".n-sep"), nTh = $(".n-th"), nK = $(".n-k"), nV = $(".n-v");
  const BLUE = "#3f6fa3", ORANGE = "#e0a02a", u = 1, TW = 2.4;
  let frame = "lab", t = -TW, hold = 0;

  function solve() {
    const m1 = 1, m2 = +sM.value, b = +sB.value, e = +sE.value, M = m1 + m2;
    const n = [Math.sqrt(1 - b * b), -b];
    const vn = u * n[0];
    const J = (1 + e) * vn / (1 / m1 + 1 / m2);
    const v1 = [u, 0], v2 = [0, 0];
    const v1p = [u - J / m1 * n[0], -J / m1 * n[1]], v2p = [J / m2 * n[0], J / m2 * n[1]];
    const c1 = [-n[0], -n[1]], c2 = [0, 0];
    const V = [m1 * u / M, 0], R0 = [(m1 * c1[0]) / M, (m1 * c1[1]) / M];
    return { m1, m2, b, e, M, n, v1, v2, v1p, v2p, c1, c2, V, R0 };
  }
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
  function pos(S, tt) {
    let p1 = tt < 0 ? add(S.c1, S.v1, tt) : add(S.c1, S.v1p, tt);
    let p2 = tt < 0 ? add(S.c2, S.v2, tt) : add(S.c2, S.v2p, tt);
    let pc = add(S.R0, S.V, tt);
    if (frame === "cm") { const o = pc; p1 = [p1[0] - o[0], p1[1] - o[1]]; p2 = [p2[0] - o[0], p2[1] - o[1]]; pc = [0, 0]; }
    return { p1, p2, pc };
  }
  function arrow(ctx, x, y, dx, dy, col, lw = 2, dash) {
    const L = Math.hypot(dx, dy); if (L < 2) return;
    const ux = dx / L, uy = dy / L, hd = 7;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx - ux * hd * 0.8, y + dy - uy * hd * 0.8); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x + dx, y + dy); ctx.lineTo(x + dx - ux * hd - uy * hd * 0.45, y + dy - uy * hd + ux * hd * 0.45); ctx.lineTo(x + dx - ux * hd + uy * hd * 0.45, y + dy - uy * hd - ux * hd * 0.45); ctx.closePath(); ctx.fill();
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const S = solve();
    /* 왼쪽: 장면 */
    const sw = w * 0.6, sc = Math.min(sw / 8, h / 5.6), ox = frame === "cm" ? sw / 2 : sw * 0.58, oy = h / 2;
    const P = (q) => [ox + q[0] * sc, oy - q[1] * sc];
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, sw, h); ctx.clip();
    ctx.fillStyle = "#eef1ea"; ctx.fillRect(0, 0, sw, h);
    /* 경로 */
    const trace = (fn, col) => {
      ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.setLineDash([3, 4]); ctx.beginPath();
      for (let i = 0; i <= 80; i++) { const q = P(fn(pos(S, -TW + 2 * TW * i / 80))); if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }
      ctx.stroke(); ctx.setLineDash([]);
    };
    trace((o) => o.p1, "rgba(63,111,163,.55)"); trace((o) => o.p2, "rgba(224,160,42,.7)"); trace((o) => o.pc, "rgba(35,35,38,.35)");
    const now = pos(S, t);
    const ball = (q, col, lab) => {
      const [x, y] = P(q); ctx.fillStyle = col; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(x, y, 0.5 * sc, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff"; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(lab, x, y + 4);
    };
    ball(now.p1, BLUE, "1"); ball(now.p2, ORANGE, "2");
    const pc = P(now.pc); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(pc[0] - 5, pc[1]); ctx.lineTo(pc[0] + 5, pc[1]); ctx.moveTo(pc[0], pc[1] - 5); ctx.lineTo(pc[0], pc[1] + 5); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(frame === "cm" ? "질량 중심과 함께 움직이며 본 모습" : "실험실에서 본 모습", 6, 14);
    /* 오른쪽: 운동량 그림 */
    const rx0 = sw + 14, rw = w - rx0 - 8;
    ctx.fillStyle = C.ink2; ctx.fillText("운동량 벡터", rx0, 14);
    const pt = S.m1 * u;
    const sub = (v, k) => (frame === "cm" ? [v[0] - S.V[0], v[1] - S.V[1]] : v).map((c) => c * k);
    const p1 = sub(S.v1, S.m1), p2 = sub(S.v2, S.m2), p1p = sub(S.v1p, S.m1), p2p = sub(S.v2p, S.m2);
    const ps = frame === "cm" ? rw * 0.42 / pt : rw * 0.82 / pt;
    const O = frame === "cm" ? [rx0 + rw / 2, h * 0.52] : [rx0 + rw * 0.06, h * 0.52];
    const A = (v, from, col, lw, dash) => arrow(ctx, from[0], from[1], v[0] * ps, -v[1] * ps, col, lw, dash);
    ctx.font = `10px ${F.sans}`;
    if (frame === "cm") {
      const r = Math.hypot(p1[0], p1[1]) * ps;
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(O[0], O[1], r, 0, Math.PI * 2); ctx.stroke();
      A(p1, O, "rgba(63,111,163,.4)", 2, [4, 3]); A(p2, O, "rgba(224,160,42,.5)", 2, [4, 3]);
      A(p1p, O, BLUE, 2.4); A(p2p, O, ORANGE, 2.4);
      ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("점선: 전 · 실선: 후 · 합 = 0", O[0], h - 10);
    } else {
      A(p1, O, "rgba(35,35,38,.45)", 2, [4, 3]);
      A(p1p, O, BLUE, 2.4);
      const tip = [O[0] + p1p[0] * ps, O[1] - p1p[1] * ps];
      A(p2p, tip, ORANGE, 2.4);
      ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("점선: 처음 p₁ = 나중 p₁′ + p₂′", rx0, h - 10);
    }
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText(t < 0 ? "충돌 전" : "충돌 후", 6, h - 10);
  }
  const deg = (r) => r * 180 / Math.PI;
  function update() {
    const S = solve();
    oM.textContent = (+sM.value).toFixed(2); oB.textContent = (+sB.value).toFixed(2); oE.textContent = (+sE.value).toFixed(2);
    const s1 = Math.hypot(...S.v1p), s2 = Math.hypot(...S.v2p);
    const a1 = Math.atan2(S.v1p[1], S.v1p[0]), a2 = Math.atan2(S.v2p[1], S.v2p[0]);
    let sep = Math.abs(a1 - a2); if (sep > Math.PI) sep = 2 * Math.PI - sep;
    nSep.textContent = s1 < 1e-3 * u ? "공 1 정지" : s2 < 1e-6 ? "부딪치지 않음" : `${deg(sep).toFixed(1)}°`;
    nTh.textContent = s1 < 1e-3 * u ? "—" : `${deg(Math.abs(a1)).toFixed(1)}°`;
    const K = 0.5 * S.m1 * u * u, Kp = 0.5 * S.m1 * s1 * s1 + 0.5 * S.m2 * s2 * s2;
    nK.textContent = (Kp / K).toFixed(3);
    nV.textContent = (S.V[0] / u).toFixed(3);
    root.querySelectorAll("[data-f]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.f === frame)));
    draw();
  }
  loop(cv, (dt) => {
    if (hold > 0) { hold -= dt; if (hold <= 0) t = -TW; draw(); return; }
    t += dt * 0.9;
    if (t >= TW) { t = TW; hold = 0.8; }
    draw();
  });
  root.querySelectorAll("[data-f]").forEach((b) => b.addEventListener("click", () => { frame = b.dataset.f; update(); }));
  [sM, sB, sE].forEach((el) => el.addEventListener("input", () => { update(); }));
  update();
})();
