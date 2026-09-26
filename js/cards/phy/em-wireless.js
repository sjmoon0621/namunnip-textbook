/* 카드: 무선 충전기는 선 없이 어떻게 전기를 보낼까? — 두 원형 코일의 상호 유도
   원형 고리의 자기장·자기 선속 함수는 완전 타원 적분으로 정확히 계산한다.
   코일: 둘 다 반지름 20 mm, 10회 (한곳에 모인 고리로 본 모식), 1차 전류 진폭 1 A */
(() => {
  const root = document.getElementById("card-phy-wireless");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), zIn = $(".dist"), zOut = $(".dist-out"), xIn = $(".off"), xOut = $(".off-out");
  const nM = $(".n-m"), nK = $(".n-k"), nE = $(".n-e");

  const MU0 = 4e-7 * Math.PI, A = 0.02, N1 = 10, N2 = 10, I0 = 1, RW = 0.0005;
  const FREQ = { dc: 0, f60: 60, qi: 127e3 };
  let fk = "qi", phase = 0;

  // 완전 타원 적분 K(m), E(m) — 산술기하평균
  function KE(m) {
    let a = 1, b = Math.sqrt(1 - m), c = Math.sqrt(m), sum = 0.5 * c * c, p = 0.5;
    for (let i = 0; i < 30 && Math.abs(c) > 1e-15; i++) {
      c = (a - b) / 2; const an = (a + b) / 2; b = Math.sqrt(a * b); a = an; p *= 2; sum += p * c * c;
    }
    const K = Math.PI / (2 * a);
    return [K, K * (1 - sum)];
  }
  // 반지름 A, 전류 1 A 고리의 자기장 z 성분 (ρ: 축에서 거리, z: 고리 면에서 높이)
  function Bz(rho, z) {
    const q = (A + rho) ** 2 + z * z, m = 4 * A * rho / q, [K, E] = KE(m);
    return MU0 / (2 * Math.PI) / Math.sqrt(q) * (K + (A * A - rho * rho - z * z) / ((A - rho) ** 2 + z * z) * E);
  }
  // 선속 함수 ψ = ρA_φ (전류 1 A). 2πψ 가 반지름 ρ인 동축 원을 지나는 선속. 등고선이 곧 자기력선
  function psi(rho, z) {
    if (rho < 1e-9) return 0;
    const q = (A + rho) ** 2 + z * z, m = Math.min(4 * A * rho / q, 1 - 1e-12), k = Math.sqrt(m), [K, E] = KE(m);
    return rho * MU0 / (Math.PI * k) * Math.sqrt(A / rho) * ((1 - m / 2) * K - E);
  }
  // 2차 코일(중심이 x0만큼 비껴 있고 높이 z)을 지나는 선속, 1차 전류 1 A · 1회 기준
  function fluxRx(x0, z) {
    if (x0 < 1e-6) return 2 * Math.PI * psi(A, z);
    let s = 0; const nr = 30, na = 48;
    for (let i = 0; i < nr; i++) {
      const r = A * (i + 0.5) / nr;
      for (let j = 0; j < na; j++) {
        const t = 2 * Math.PI * (j + 0.5) / na, x = x0 + r * Math.cos(t), y = r * Math.sin(t);
        s += Bz(Math.hypot(x, y), z) * r;
      }
    }
    return s * (A / nr) * (2 * Math.PI / na);
  }
  const L1 = N1 * N1 * MU0 * A * (Math.log(8 * A / RW) - 2); // 가는 원형 코일의 자체 인덕턴스 어림
  const L2 = N2 * N2 * MU0 * A * (Math.log(8 * A / RW) - 2);

  let cache = null;
  function calc() {
    const z = +zIn.value / 1000, x0 = +xIn.value / 1000;
    const M = N1 * N2 * fluxRx(x0, z);
    return { z, x0, M, k: M / Math.sqrt(L1 * L2), emf: 2 * Math.PI * FREQ[fk] * M * I0 };
  }

  const P = fit(cv, () => { cache = null; draw(); });
  let grid = null;
  function buildGrid(w, sh, X0, Z0, s) {
    const cell = Math.max(4, Math.round(w / 150)), nx = Math.ceil(w / cell) + 1, ny = Math.ceil(sh / cell) + 1;
    const G = new Float64Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const x = (i * cell - X0) / s, z = (Z0 - j * cell) / s;
      G[j * nx + i] = psi(Math.abs(x), z);
    }
    return { cell, nx, ny, G, w, sh };
  }

  function draw() {
    const { ctx, size: { w, h } } = P;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    if (!cache) cache = calc();
    const R = cache, sh = h * 0.64;
    const s = w / 0.13, X0 = w / 2, Z0 = sh * 0.74;           // 가로 130 mm
    const X = (x) => X0 + x * s, Z = (z) => Z0 - z * s;
    if (!grid || grid.w !== w || grid.sh !== sh) grid = buildGrid(w, sh, X0, Z0, s);
    const cur = FREQ[fk] ? Math.sin(phase) : 1;
    // 자기력선: ψ의 등고선 (간격이 좁을수록 자기장이 셈). 밝기 ∝ 지금의 전류 크기
    const dpsi = psi(A * 0.95, 0) / 9;
    const { cell, nx, ny, G } = grid;
    ctx.strokeStyle = `rgba(47,111,163,${0.15 + 0.6 * Math.abs(cur)})`; ctx.lineWidth = 1.1;
    ctx.beginPath();
    for (let L = 1; L <= 14; L++) {
      const lv = L * dpsi;
      for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
        const a = G[j * nx + i] - lv, b = G[j * nx + i + 1] - lv, c = G[(j + 1) * nx + i + 1] - lv, d = G[(j + 1) * nx + i] - lv;
        const pts = [], x0 = i * cell, y0 = j * cell;
        if ((a > 0) !== (b > 0)) pts.push([x0 + cell * a / (a - b), y0]);
        if ((b > 0) !== (c > 0)) pts.push([x0 + cell, y0 + cell * b / (b - c)]);
        if ((c > 0) !== (d > 0)) pts.push([x0 + cell * (1 - c / (c - d)), y0 + cell]);
        if ((d > 0) !== (a > 0)) pts.push([x0, y0 + cell * (1 - d / (d - a))]);
        if (pts.length >= 2) { ctx.moveTo(...pts[0]); ctx.lineTo(...pts[1]); }
        if (pts.length === 4) { ctx.moveTo(...pts[2]); ctx.lineTo(...pts[3]); }
      }
    }
    ctx.stroke();
    // 가운데 자기장 방향 화살표
    if (Math.abs(cur) > 0.08) {
      const up = cur > 0, y = Z(0.012);
      ctx.fillStyle = C.forest; ctx.strokeStyle = C.forest; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X(0), y + (up ? 12 : -12)); ctx.lineTo(X(0), y + (up ? -8 : 8)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(0), y + (up ? -15 : 15)); ctx.lineTo(X(0) - 5, y + (up ? -6 : 6)); ctx.lineTo(X(0) + 5, y + (up ? -6 : 6)); ctx.fill();
    }
    // 패드와 휴대폰
    ctx.fillStyle = "rgba(35,35,38,.06)"; ctx.fillRect(X(-0.035), Z(-0.001), 0.07 * s, 0.006 * s);
    ctx.fillStyle = "rgba(35,35,38,.05)"; ctx.fillRect(X(R.x0 - 0.035), Z(R.z + 0.004), 0.07 * s, 0.006 * s);
    // 코일 단면: 1차(아래, 전류 표시), 2차(위)
    const dotI = (x, z, sgn, col) => {
      ctx.beginPath(); ctx.arc(X(x), Z(z), 6, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      ctx.fillStyle = "#fff"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
      if (sgn > 0.08) { ctx.beginPath(); ctx.arc(X(x), Z(z), 1.8, 0, Math.PI * 2); ctx.fill(); }
      else if (sgn < -0.08) { ctx.beginPath(); ctx.moveTo(X(x) - 3, Z(z) - 3); ctx.lineTo(X(x) + 3, Z(z) + 3); ctx.moveTo(X(x) + 3, Z(z) - 3); ctx.lineTo(X(x) - 3, Z(z) + 3); ctx.stroke(); }
    };
    // 1차 전류가 +일 때 오른쪽 단면은 화면으로 들어감(⊗) → 가운데 자기장 위쪽
    dotI(A, 0, -cur, "#b87333"); dotI(-A, 0, cur, "#b87333");
    const e2 = FREQ[fk] ? -Math.cos(phase) : 0; // ε₂ ∝ −dI₁/dt
    dotI(R.x0 + A, R.z, -e2, C.forest); dotI(R.x0 - A, R.z, e2, C.forest);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.textAlign = "right"; ctx.fillText("충전 패드 코일", X(-A) - 10, Z(0) + 16);
    ctx.textAlign = "left"; ctx.fillText("휴대폰 코일", X(R.x0 + A) + 10, Z(R.z) - 8);

    // 그래프: 1차 전류와 2차 기전력 (두 주기)
    const gy0 = sh + 8, gh = h - gy0 - 18, gx0 = 34, gw = w - gx0 - 10;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(gx0 + .5, gy0 + .5, gw, gh);
    ctx.beginPath(); ctx.moveTo(gx0, gy0 + gh / 2 + .5); ctx.lineTo(gx0 + gw, gy0 + gh / 2 + .5); ctx.stroke();
    const Yc = (v) => gy0 + gh / 2 - v * gh * 0.42;
    const TT = (u) => gx0 + u / (4 * Math.PI) * gw;
    const curve = (f, col) => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); for (let u = 0; u <= 4 * Math.PI + 1e-9; u += 0.05) { const y = Yc(f(u)); u ? ctx.lineTo(TT(u), y) : ctx.moveTo(TT(u), y); } ctx.stroke(); };
    if (FREQ[fk]) {
      curve(Math.sin, "#b87333");
      const amp = clamp(R.k * 3, 0.04, 1);          // 기전력 곡선 높이는 결합 세기에 따라 (모식)
      curve((u) => -Math.cos(u) * amp, C.forest);
      const u = phase % (4 * Math.PI);
      ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(TT(u), gy0); ctx.lineTo(TT(u), gy0 + gh); ctx.stroke(); ctx.setLineDash([]);
    } else {
      curve(() => 1, "#b87333"); curve(() => 0, C.forest);
    }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = "#b87333"; ctx.fillText("패드 전류 I₁", gx0 + 4, gy0 + 12);
    ctx.fillStyle = C.forest; ctx.fillText("휴대폰 코일 기전력 ε₂", gx0 + 96, gy0 + 12);
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText(FREQ[fk] ? "두 주기" : "직류: 시간에 따라 변하지 않음", gx0 + gw, gy0 + gh + 13);
    ctx.textAlign = "left";
  }

  function update() {
    zOut.textContent = zIn.value; xOut.textContent = xIn.value;
    cache = calc();
    nM.textContent = `${(cache.M * 1e6).toFixed(2)} µH`;
    nK.textContent = cache.k.toFixed(2);
    const e = cache.emf;
    nE.textContent = e === 0 ? "0 V" : e >= 1 ? `${e.toFixed(2)} V` : e >= 1e-3 ? `${(e * 1000).toFixed(1)} mV` : `${(e * 1e6).toFixed(1)} µV`;
    root.querySelectorAll("[data-f]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.f === fk)));
    draw();
  }
  zIn.addEventListener("input", update); xIn.addEventListener("input", update);
  root.querySelectorAll("[data-f]").forEach((b) => b.addEventListener("click", () => { fk = b.dataset.f; update(); }));
  // 화면의 진동은 실제 주파수와 상관없이 한 주기에 약 2초로 보여 준다
  loop(cv, (dt) => { if (NM.reduce || !FREQ[fk]) return; phase += dt * Math.PI; draw(); });
  phase = 1.1;
  update();
})();
