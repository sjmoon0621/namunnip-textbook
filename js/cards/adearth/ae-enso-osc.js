/* 카드: 엘니뇨는 왜 2~7년마다 저절로 되풀이될까? — 단순화한 재충전 진동자(Jin 1997) 모식 */
(() => {
  const root = document.getElementById("card-adearth-enso-osc");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sB = $(".sl-b"), sC = $(".sl-c"), sN = $(".sl-n");
  const YEARS = 60, SPIN = 20, DT = 1 / 120, R = 0.25, CT = 0.1, CH = 24.7, EPS = 0.1;
  let seed = 7;
  let res = null;
  const rng = (s0) => { let s = s0 >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  function run() {
    const B = +sB.value, k = +sC.value, sig = +sN.value, rnd = rng(seed);
    const gauss = () => { let u = 0, v = 0; while (u === 0) u = rnd(); v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    let T = 0.3, h = 0;
    const Ts = [], Hs = [], n = Math.round((YEARS + SPIN) / DT), every = 10;
    for (let i = 0; i < n; i++) {
      const dT = ((B - 1) * T + CT * k * h - EPS * T ** 3) * DT + sig * Math.sqrt(DT) * gauss();
      const dh = (-R * h - CH * k * T) * DT;
      T += dT; h += dh;
      if (!Number.isFinite(T) || Math.abs(T) > 20) { T = Math.sign(T) * 20; }
      if (i * DT >= SPIN && i % every === 0) { Ts.push(T); Hs.push(h); }
    }
    /* 월 단위(DT*10 = 1/12년) 자료 */
    const m = Ts.length;
    /* 3개월 이동 평균 */
    const sm = Ts.map((_, i) => (Ts[Math.max(0, i - 1)] + Ts[i] + Ts[Math.min(m - 1, i + 1)]) / 3);
    /* 사건 수: ±0.5 이상이 5개월 이상 */
    const events = (sg) => { let c = 0, run = 0; for (let i = 0; i < m; i++) { if (sg * sm[i] >= 0.5) { run++; if (run === 5) c++; } else run = 0; } return c; };
    /* 주기: 상승 영점 교차 간격 */
    const ups = []; for (let i = 1; i < m; i++) if (sm[i - 1] < 0 && sm[i] >= 0) ups.push(i);
    let per = NaN; if (ups.length >= 3) per = (ups[ups.length - 1] - ups[0]) / (ups.length - 1) / 12;
    /* h가 앞서는 시간: 교차 상관 최대 */
    let best = -1e9, lag = 0;
    for (let L = 0; L <= 36; L++) { let s = 0; for (let i = 0; i + L < m; i++) s += Hs[i] * Ts[i + L]; if (s > best) { best = s; lag = L; } }
    const amp = Math.max(...Ts.map(Math.abs));
    res = { Ts, Hs, sm, en: events(1), ln: events(-1), per, lag, amp };
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w || !res) return;
    ctx.clearRect(0, 0, w, h);
    const { Ts, Hs } = res, m = Ts.length;
    /* 위: 시계열 */
    const x0 = 40, x1 = w - 40, y0 = 20, y1 = h * 0.50;
    const Tmax = Math.max(2, Math.ceil(res.amp)), Hmax = Math.max(20, Math.ceil(Math.max(...Hs.map(Math.abs)) / 10) * 10);
    const X = (i) => x0 + i / (m - 1) * (x1 - x0), YT = (v) => (y0 + y1) / 2 - v / Tmax * (y1 - y0) / 2, YH = (v) => (y0 + y1) / 2 - v / Hmax * (y1 - y0) / 2;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, YT(0)); ctx.lineTo(x1, YT(0)); ctx.stroke();
    ctx.setLineDash([2, 3]); [0.5, -0.5].forEach((v) => { ctx.beginPath(); ctx.moveTo(x0, YT(v)); ctx.lineTo(x1, YT(v)); ctx.stroke(); }); ctx.setLineDash([]);
    for (let i = 1; i < m; i++) {
      const v = res.sm[i]; if (Math.abs(v) < 0.5) continue;
      ctx.fillStyle = v > 0 ? "rgba(212,73,58,.55)" : "rgba(63,111,163,.55)";
      ctx.fillRect(X(i - 1), Math.min(YT(0), YT(v)), X(i) - X(i - 1) + 0.5, Math.abs(YT(v) - YT(0)));
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.3; ctx.beginPath(); Ts.forEach((v, i) => (i ? ctx.lineTo(X(i), YT(v)) : ctx.moveTo(X(i), YT(v)))); ctx.stroke();
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.4; ctx.setLineDash([5, 3]); ctx.beginPath(); Hs.forEach((v, i) => (i ? ctx.lineTo(X(i), YH(v)) : ctx.moveTo(X(i), YH(v)))); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText(`+${Tmax}`, x0 - 4, YT(Tmax) + 4); ctx.fillText("0", x0 - 4, YT(0) + 3); ctx.fillText(`−${Tmax}`, x0 - 4, YT(-Tmax) + 2);
    ctx.textAlign = "left"; ctx.fillStyle = "#b07a10"; ctx.fillText(`+${Hmax} m`, x1 + 4, YH(Hmax) + 4); ctx.fillText(`−${Hmax}`, x1 + 4, YH(-Hmax) + 2);
    ctx.fillStyle = C.ink3; ctx.textAlign = "center"; for (let y = 0; y <= YEARS; y += 10) ctx.fillText(`${y}년`, X(y * 12 * (m - 1) / (YEARS * 12)), y1 + 14);
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = C.ink; ctx.fillText("— 동태평양 수온 편차 T (°C)", x0 + 2, 12);
    ctx.fillStyle = "#b07a10"; ctx.fillText("- - 적도 수온 약층 깊이 편차 h", x0 + 180, 12);
    /* 아래 왼쪽: 위상 궤적 */
    const px0 = 40, px1 = w * 0.48, py0 = h * 0.60, py1 = h - 22, pcx = (px0 + px1) / 2, pcy = (py0 + py1) / 2;
    const PX = (v) => pcx + v / Hmax * (px1 - px0) / 2, PY = (v) => pcy - v / Tmax * (py1 - py0) / 2;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(px0, py0, px1 - px0, py1 - py0);
    ctx.beginPath(); ctx.moveTo(px0, pcy); ctx.lineTo(px1, pcy); ctx.moveTo(pcx, py0); ctx.lineTo(pcx, py1); ctx.stroke();
    const start = Math.max(0, m - 12 * 15);
    ctx.strokeStyle = "rgba(35,35,38,.55)"; ctx.lineWidth = 1.1; ctx.beginPath();
    for (let i = start; i < m; i++) { const x = PX(Hs[i]), y = PY(Ts[i]); i > start ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(PX(Hs[m - 1]), PY(Ts[m - 1]), 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("마지막 15년의 궤적", px0, py0 - 6);
    ctx.textAlign = "right"; ctx.fillText("h (열 저장) →", px1, py1 + 13);
    ctx.textAlign = "left"; ctx.fillText("T ↑", pcx + 4, py0 + 12);
    /* 아래 오른쪽: 되먹임 고리 */
    const bx0 = w * 0.54, bx1 = w - 8, by0 = h * 0.60, by1 = h - 22;
    const box = (x, y, t, col) => { ctx.font = `10.5px ${F.sans}`; const tw = ctx.measureText(t).width + 12; ctx.fillStyle = "#fff"; ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.fillRect(x - tw / 2, y - 10, tw, 20); ctx.strokeRect(x - tw / 2, y - 10, tw, 20); ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.fillText(t, x, y + 4); };
    const cxm = (bx0 + bx1) / 2, rows = [by0 + 12, by0 + (by1 - by0) * 0.37, by0 + (by1 - by0) * 0.66, by1 - 10];
    const ar = (xa, ya, xb, yb, col) => { ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(xa, ya); ctx.lineTo(xb, yb); ctx.stroke(); const L = Math.hypot(xb - xa, yb - ya), ux = (xb - xa) / L, uy = (yb - ya) / L; ctx.beginPath(); ctx.moveTo(xb, yb); ctx.lineTo(xb - 6 * ux - 3 * uy, yb - 6 * uy + 3 * ux); ctx.lineTo(xb - 6 * ux + 3 * uy, yb - 6 * uy - 3 * ux); ctx.fill(); };
    box(cxm, rows[0], "동태평양 수온 ↑", C.apple);
    box(cxm - (bx1 - bx0) * 0.22, rows[1], "무역풍 약화", C.ink3);
    box(cxm - (bx1 - bx0) * 0.22, rows[2], "용승 약화", C.ink3);
    box(cxm + (bx1 - bx0) * 0.22, rows[2], "적도 열 방출", C.amber);
    box(cxm, rows[3], "수온 약층 얕아짐 → 수온 ↓", C.amber);
    const lx = cxm - (bx1 - bx0) * 0.22, rx = cxm + (bx1 - bx0) * 0.22;
    ar(cxm - 20, rows[0] + 10, lx, rows[1] - 10, C.apple);
    ar(lx, rows[1] + 10, lx, rows[2] - 10, C.apple);
    ar(lx + 10, rows[2] - 10, cxm - 10, rows[0] + 10, C.apple);
    ar(cxm + 20, rows[0] + 10, rx, rows[2] - 10, C.amber);
    ar(rx, rows[2] + 10, cxm + 16, rows[3] - 10, C.amber);
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.apple; ctx.fillText("+ 빠른 되먹임", bx0, by0 - 6);
    ctx.textAlign = "right"; ctx.fillStyle = "#b07a10"; ctx.fillText("− 느린 되먹임", bx1, by0 - 6);
  }
  function update(rerun) {
    if (rerun) seed = (seed * 48271 + 11) % 2147483647;
    $(".b-out").textContent = (+sB.value).toFixed(2); $(".c-out").textContent = (+sC.value).toFixed(2); $(".n-out").textContent = (+sN.value).toFixed(2);
    run();
    $(".n-per").textContent = Number.isFinite(res.per) ? `${res.per.toFixed(1)}년` : "진동 없음";
    $(".n-en").textContent = `${res.en}회`; $(".n-ln").textContent = `${res.ln}회`;
    $(".n-lag").textContent = res.amp > 0.2 ? `${res.lag}개월` : "—";
    draw();
  }
  [sB, sC, sN].forEach((el) => el.addEventListener("input", () => update(false)));
  $(".rerun").addEventListener("click", () => update(true));
  update(false);
})();
