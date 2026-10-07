/* 카드: 바람만 알면 쿠로시오가 나르는 물의 양을 계산할 수 있을까? — 스토멜(1948) 모형의 해석해
   R∇²ψ + β ψ_x = curl τ / ρ,  τ = −τ0 cos(πy/b),  ψ = X(x) sin(πy/b),  ψ = 0 on boundaries */
(() => {
  const root = document.getElementById("card-adearth-sverdrup");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sB = $(".sl-b"), sT = $(".sl-t"), sR = $(".sl-r");
  const RHO = 1025, B0 = 1.982e-11, L = 6.0e6, BY = 3.0e6, H = 1000, k = Math.PI / BY;
  const model = () => {
    const beta = B0 * (+sB.value) / 100, tau0 = +sT.value, Rf = (+sR.value) * 1000 * B0;
    const Cc = tau0 * Math.PI / (RHO * BY), Xp = Cc / (Rf * k * k);
    const disc = Math.sqrt(beta * beta + 4 * Rf * Rf * k * k);
    const m1 = (-beta + disc) / (2 * Rf), m2 = (-beta - disc) / (2 * Rf);
    const e1 = Math.exp(-m1 * L), e2 = Math.exp(m2 * L), det = 1 - e1 * e2;
    const A = -Xp * (1 - e1) / det, B = -Xp * (1 - e2) / det;
    const X = (x) => Xp + A * Math.exp(m2 * x) + B * Math.exp(m1 * (x - L));
    const dX = (x) => A * m2 * Math.exp(m2 * x) + B * m1 * Math.exp(m1 * (x - L));
    return { beta, tau0, Rf, X, dX, Sv: beta > 0 ? Cc * L / beta : NaN };
  };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    const m = model();
    ctx.clearRect(0, 0, w, h);
    const mx0 = 40, mx1 = w - 10, my0 = 22, my1 = h * 0.60;
    const nx = 120, ny = 60;
    /* ψ 격자 */
    const psi = []; let pmax = 0;
    for (let j = 0; j <= ny; j++) { const row = [], sy = Math.sin(Math.PI * j / ny); for (let i = 0; i <= nx; i++) { const v = m.X(i / nx * L) * sy; row.push(v); pmax = Math.max(pmax, Math.abs(v)); } psi.push(row); }
    const cw = (mx1 - mx0) / nx, ch = (my1 - my0) / ny;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const v = Math.abs(psi[j][i]) / (pmax || 1);
      ctx.fillStyle = `rgba(212,73,58,${0.05 + 0.35 * v})`;
      ctx.fillRect(mx0 + i * cw, my1 - (j + 1) * ch, cw + 0.6, ch + 0.6);
    }
    /* 등유선 (마칭 스퀘어) */
    ctx.strokeStyle = "rgba(35,35,38,.75)"; ctx.lineWidth = 1;
    const P = (i, j) => [mx0 + i * cw, my1 - j * ch];
    for (let lev = 1; lev <= 7; lev++) {
      const c = pmax * lev / 8;
      ctx.beginPath();
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const a = psi[j][i], b = psi[j][i + 1], d = psi[j + 1][i], e = psi[j + 1][i + 1];
        const pts = [];
        const cross = (v1, v2, p1, p2) => { if ((v1 - c) * (v2 - c) < 0) { const t = (c - v1) / (v2 - v1); pts.push([p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])]); } };
        cross(a, b, P(i, j), P(i + 1, j)); cross(b, e, P(i + 1, j), P(i + 1, j + 1)); cross(e, d, P(i + 1, j + 1), P(i, j + 1)); cross(d, a, P(i, j + 1), P(i, j));
        if (pts.length >= 2) { ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); }
        if (pts.length === 4) { ctx.moveTo(pts[2][0], pts[2][1]); ctx.lineTo(pts[3][0], pts[3][1]); }
      }
      ctx.stroke();
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(mx0, my0, mx1 - mx0, my1 - my0);
    /* 순환 방향 표시: 중앙 아래 흐름 */
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("서", mx0 + 10, my1 + 13); ctx.fillText("동", mx1 - 10, my1 + 13); ctx.fillText("6000 km", (mx0 + mx1) / 2, my1 + 13);
    /* 바람 분포 (왼쪽) */
    ctx.strokeStyle = C.ink2; ctx.fillStyle = C.ink2; ctx.lineWidth = 1.3;
    for (let j = 1; j < 8; j++) {
      const yy = j / 8, t = -Math.cos(Math.PI * yy), y = my1 - yy * (my1 - my0), len = t * 14;
      ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(20 + len, y); ctx.stroke();
      if (Math.abs(len) > 2) { const s = Math.sign(len); ctx.beginPath(); ctx.moveTo(20 + len + s * 3, y); ctx.lineTo(20 + len - s * 2, y - 3); ctx.lineTo(20 + len - s * 2, y + 3); ctx.fill(); }
    }
    ctx.save(); ctx.translate(9, (my0 + my1) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("바람", 0, 0); ctx.restore();
    ctx.textAlign = "left"; ctx.fillText("편서풍", mx0 + 4, my0 + 12); ctx.fillText("무역풍", mx0 + 4, my1 - 6);
    /* 아래: 중앙 위도의 v(x) */
    const gy0 = h - 30, gy1 = my1 + 44, gx0 = mx0, gx1 = mx1;
    const N = 300, vs = []; let vmax = 0, vmin = 0;
    for (let i = 0; i <= N; i++) { const v = m.dX(i / N * L) / H; vs.push(v); vmax = Math.max(vmax, v); vmin = Math.min(vmin, v); }
    const top = Math.max(0.05, vmax) * 1.1, bot = Math.min(-0.01, vmin) * 1.4;
    const Y = (v) => gy0 - (v - bot) / (top - bot) * (gy0 - gy1), X = (i) => gx0 + i / N * (gx1 - gx0);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, Y(0)); ctx.lineTo(gx1, Y(0)); ctx.stroke();
    ctx.strokeStyle = C.apple; ctx.lineWidth = 2; ctx.beginPath(); vs.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)))); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillText("0", gx0 - 4, Y(0) + 3); ctx.fillText(`${top.toFixed(2)}`, gx0 - 4, gy1 + 4);
    ctx.textAlign = "left"; ctx.font = `10.5px ${F.sans}`;
    ctx.fillText("중앙 위도의 남북 유속 (m/s, + 북쪽)", gx0 + 4, gy1 - 8);
    ctx.textAlign = "right"; ctx.fillText("남쪽으로 느린 내부 흐름", gx1 - 4, Y(0) + 16);
  }
  function update() {
    const m = model();
    $(".b-out").textContent = sB.value; $(".t-out").textContent = (+sT.value).toFixed(2); $(".r-out").textContent = sR.value;
    $(".n-sv").textContent = Number.isFinite(m.Sv) ? `${(m.Sv / 1e6).toFixed(0)} Sv` : "정할 수 없음";
    $(".n-w").textContent = m.beta > 0 ? `${(m.Rf / m.beta / 1000).toFixed(0)} km` : "—";
    let vw = 0; for (let i = 0; i <= 400; i++) vw = Math.max(vw, m.dX(i / 400 * L) / H);
    $(".n-vw").textContent = `${vw.toFixed(2)} m/s`;
    $(".n-ve").textContent = `${(m.dX(0.75 * L) / H * 100).toFixed(1)} cm/s`;
    draw();
  }
  [sB, sT, sR].forEach((el) => el.addEventListener("input", update));
  update();
})();
