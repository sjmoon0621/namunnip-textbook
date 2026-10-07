/* 카드: 힘의 그래프에서 위치 에너지를 어떻게 얻을까? — F(x)의 넓이로 U(x)를 만들고, 에너지 도표에서 돌아서는 점과 운동을 본다 */
(() => {
  const root = document.getElementById("card-adphy-potential");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sX = $(".x"), sE = $(".e"), oX = $(".x-out"), oE = $(".e-out"), bPlay = $(".play");
  const nU = $(".n-u"), nF = $(".n-f"), nK = $(".n-k"), nT = $(".n-turn");
  const AMBER = C.amber, BLUE = "#3f6fa3", RED = "#d4493a";
  const LJU = (x) => 4 * (x ** -12 - x ** -6), LJF = (x) => 24 / x * (2 * x ** -12 - x ** -6);
  const P = {
    spring: { x0: -0.5, x1: 0.5, ref: 0, U: (x) => 50 * x * x, F: (x) => -100 * x, E0: 0, E1: 12, u: [-1, 13], f: [-55, 55], xu: "m", eu: "J", fu: "N", slow: 0.15, wall: null, dx: 2, de: 2 },
    grav: { x0: 0, x1: 5, ref: 0, U: (x) => 9.8 * x, F: () => -9.8, E0: 0, E1: 48, u: [-3, 52], f: [-12, 12], xu: "m", eu: "J", fu: "N", slow: 0.6, wall: 0, dx: 2, de: 1 },
    lj: { x0: 0.95, x1: 3, ref: 3, U: LJU, F: LJF, E0: -0.95, E1: 1.5, u: [-1.2, 1.8], f: [-3, 8], xu: "σ", eu: "ε", fu: "ε/σ", slow: 0.25, wall: null, dx: 2, de: 2 },
  };
  let key = "spring", playing = false, xp = 0, vp = 0, left = false;
  const cur = () => P[key];
  const xv = () => { const p = cur(); return p.x0 + (+sX.value) * (p.x1 - p.x0); };
  const Ev = () => { const p = cur(); return p.E0 + (+sE.value) * (p.E1 - p.E0); };
  function turning(p, E) {
    const out = []; const N = 600;
    let prev = p.U(p.x0) - E;
    for (let i = 1; i <= N; i++) {
      const x = p.x0 + (p.x1 - p.x0) * i / N, d = p.U(x) - E;
      if ((prev <= 0) !== (d <= 0)) { const xa = x - (p.x1 - p.x0) / N; out.push(xa + (x - xa) * prev / (prev - d)); }
      prev = d;
    }
    return out;
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = cur(), E = Ev(), x = playing ? xp : xv();
    const gx0 = 46, gx1 = w - 12, X = (v) => gx0 + (v - p.x0) / (p.x1 - p.x0) * (gx1 - gx0);
    const ut = 22, ub = h * 0.52, ft = h * 0.52 + 26, fb = h - 24;
    const UY = (v) => ub - (v - p.u[0]) / (p.u[1] - p.u[0]) * (ub - ut);
    const FY = (v) => fb - (v - p.f[0]) / (p.f[1] - p.f[0]) * (fb - ft);
    const panel = (top, bot, Yf, zero, lab) => {
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(gx0, top, gx1 - gx0, bot - top);
      ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(gx0, Yf(zero)); ctx.lineTo(gx1, Yf(zero)); ctx.stroke();
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(lab, gx0, top - 6);
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("0", gx0 - 5, Yf(zero) + 3);
    };
    panel(ut, ub, UY, 0, `위치 에너지 U (${p.eu})`);
    panel(ft, fb, FY, 0, `힘 F (${p.fu}) · 칠한 넓이 = −(U(x) − U(기준))`);
    /* x 눈금 */
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    const span = p.x1 - p.x0, st = span > 3 ? 1 : span > 1.5 ? 0.5 : 0.25;
    for (let v = Math.ceil(p.x0 / st) * st; v <= p.x1 + 1e-9; v += st) ctx.fillText(`${+v.toFixed(2)}`, X(v), fb + 13);
    ctx.textAlign = "right"; ctx.fillText(`x(${p.xu})`, gx0 - 18, fb + 13);
    ctx.save(); ctx.beginPath(); ctx.rect(gx0, ut, gx1 - gx0, ub - ut); ctx.clip();
    /* 허용 구간 */
    ctx.fillStyle = "rgba(116,171,102,.13)";
    const N = 300;
    let run = null;
    for (let i = 0; i <= N; i++) {
      const v = p.x0 + span * i / N, ok = i < N && p.U(v + span / N / 2) <= E;
      if (ok && run === null) run = v;
      if (!ok && run !== null) { ctx.fillRect(X(run), ut, X(v) - X(run), ub - ut); run = null; }
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= N; i++) { const v = p.x0 + span * i / N, y = clamp(UY(p.U(v)), ut - 50, ub + 50); if (i) ctx.lineTo(X(v), y); else ctx.moveTo(X(v), y); }
    ctx.stroke();
    ctx.strokeStyle = AMBER; ctx.lineWidth = 1.6; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(gx0, UY(E)); ctx.lineTo(gx1, UY(E)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#a8741a"; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("E", gx1 - 4, UY(E) - 4);
    turning(p, E).forEach((t) => { ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(t), UY(E), 3.5, 0, Math.PI * 2); ctx.fill(); });
    /* 접선과 운동 에너지 막대 */
    const Ux = p.U(x), Fx = p.F(x), bx = X(x), by = UY(Ux);
    const slope = -Fx, dxp = span * 0.08;
    ctx.strokeStyle = RED; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(X(x - dxp), UY(Ux - slope * dxp)); ctx.lineTo(X(x + dxp), UY(Ux + slope * dxp)); ctx.stroke();
    if (E > Ux) { ctx.strokeStyle = BLUE; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, UY(E)); ctx.stroke(); }
    ctx.fillStyle = E >= Ux ? C.ink : C.warn; ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (E > Ux && UY(E) > ut + 12) { ctx.fillStyle = BLUE; ctx.font = `10px ${F.sans}`; ctx.textAlign = bx > (gx0 + gx1) / 2 ? "right" : "left"; ctx.fillText("K", bx + (bx > (gx0 + gx1) / 2 ? -6 : 6), (by + UY(E)) / 2 + 3); }
    /* 아래: F(x)와 넓이 */
    ctx.save(); ctx.beginPath(); ctx.rect(gx0, ft, gx1 - gx0, fb - ft); ctx.clip();
    const a = Math.min(p.ref, x), b = Math.max(p.ref, x);
    ctx.fillStyle = "rgba(224,160,42,.3)"; ctx.beginPath(); ctx.moveTo(X(a), FY(0));
    for (let i = 0; i <= 120; i++) { const v = a + (b - a) * i / 120; ctx.lineTo(X(v), clamp(FY(p.F(v)), ft - 20, fb + 20)); }
    ctx.lineTo(X(b), FY(0)); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = RED; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= N; i++) { const v = p.x0 + span * i / N, y = clamp(FY(p.F(v)), ft - 50, fb + 50); if (i) ctx.lineTo(X(v), y); else ctx.moveTo(X(v), y); }
    ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx, ft); ctx.lineTo(bx, fb); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center";
    if (p.ref < p.x1) ctx.fillText("기준", X(p.ref), FY(0) - 5 < ft + 10 ? ft + 12 : FY(0) - 5);
    else ctx.fillText("기준 → 먼 곳", X(p.x1) - 30, ft + 12);
    if (key === "grav") { ctx.fillStyle = C.ink2; ctx.fillRect(gx0 - 4, ut, 4, ub - ut); }
  }
  const fmt = (v) => Math.abs(v) >= 10 ? v.toFixed(1) : Math.abs(v) >= 1 ? v.toFixed(2) : v.toFixed(3);
  function readout() {
    const p = cur(), E = Ev(), x = playing ? xp : xv();
    oX.textContent = `${fmt(x)} ${p.xu}`; oE.textContent = `${fmt(E)} ${p.eu}`;
    const U = p.U(x);
    nU.textContent = `${fmt(U)} ${p.eu}`; nF.textContent = `${fmt(p.F(x))} ${p.fu}`;
    nK.textContent = E >= U ? `${fmt(E - U)} ${p.eu}` : "갈 수 없음"; nK.classList.toggle("bad", E < U);
    const t = turning(p, E);
    nT.textContent = left ? "멀리 떠나감" : t.length ? t.map((v) => fmt(v)).join(", ") + (key === "grav" ? " (위)" : "") : "없음";
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === key)));
    bPlay.setAttribute("aria-pressed", String(playing)); bPlay.textContent = playing ? "멈추기" : "놓아 보기";
  }
  function update() { readout(); draw(); }
  function start() {
    const p = cur(), E = Ev(); left = false;
    let x = xv();
    if (p.U(x) > E) { let best = x, bd = 1e9; for (let i = 0; i <= 600; i++) { const v = p.x0 + (p.x1 - p.x0) * i / 600; if (p.U(v) <= E && Math.abs(v - x) < bd) { bd = Math.abs(v - x); best = v; } } x = best; }
    xp = x; vp = Math.sqrt(Math.max(0, 2 * (E - p.U(x)))); playing = true; update();
  }
  loop(cv, (dt) => {
    if (!playing) return;
    const p = cur(), E = Ev(), n = 40, h = dt * p.slow / n;
    for (let i = 0; i < n; i++) {
      const a0 = p.F(xp); xp += vp * h + 0.5 * a0 * h * h; vp += 0.5 * (a0 + p.F(xp)) * h;
      if (p.wall !== null && xp < p.wall) { xp = 2 * p.wall - xp; vp = -vp; }
      const k2 = 2 * (E - p.U(xp)); if (k2 > 1e-6) vp = Math.sign(vp || 1) * Math.sqrt(k2);
      if (xp > p.x1) { xp = p.x1; playing = false; left = true; break; }
      if (xp < p.x0) { xp = p.x0; vp = Math.abs(vp); }
    }
    sX.value = (xp - p.x0) / (p.x1 - p.x0);
    update();
  });
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => {
    key = b.dataset.p; playing = false; left = false;
    sX.value = key === "lj" ? 0.12 : key === "grav" ? 0.3 : 0.75; sE.value = key === "lj" ? 0.15 : 0.6; update();
  }));
  bPlay.addEventListener("click", () => { if (playing) { playing = false; update(); } else start(); });
  sX.addEventListener("input", () => { playing = false; left = false; update(); });
  sE.addEventListener("input", () => { left = false; update(); });
  update();
})();
