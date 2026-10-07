/* 카드: U–Pb 콘코디아. 가상 지르콘(참값은 이 파일 안에만), 붕괴 상수 Jaffey 외(1971), 238U/235U = 137.818. */
(() => {
  const root = document.getElementById("card-adearth-concordia");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), last = $(".cc-last"), nN = $(".n-n"), nUp = $(".n-up"), nLo = $(".n-lo");
  const L8 = 1.55125e-10, L5 = 9.8485e-10, U85 = 137.818;
  const cx = (t) => Math.expm1(L5 * t * 1e6), cy = (t) => Math.expm1(L8 * t * 1e6); /* t: Ma */
  const S = {
    a: { t1: 1870, t2: 230, fmax: 0.75, tick: 200, name: "화강 편마암" },
    b: { t1: 168, t2: 0, fmax: 0.06, tick: 20, name: "화강암" },
    c: { t1: 2700, t2: 0, fmax: 0.6, tick: 500, name: "오래된 지르콘" },
  };
  let s = "a", pts = [], truth = false;
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const age68 = (y) => Math.log1p(y) / L8 / 1e6, age75 = (x) => Math.log1p(x) / L5 / 1e6;
  function age76(x, y) {
    const r = x / y / U85; let a = 1, b = 4500;
    const f = (t) => cx(t) / cy(t) / U85;
    if (r <= f(1)) return 0;
    for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (f(m) < r) a = m; else b = m; }
    return (a + b) / 2;
  }
  function analyze() {
    const sc = S[s], f = Math.random() * sc.fmax;
    const x = (1 - f) * cx(sc.t1) + f * cx(sc.t2), y = (1 - f) * cy(sc.t1) + f * cy(sc.t2);
    const e = 0.006, px = x * (1 + e * gauss()), py = y * (1 + e * gauss());
    pts.push([px, py]);
  }
  function linfit() {
    const n = pts.length; if (n < 3) return null;
    const mx = pts.reduce((a, p) => a + p[0], 0) / n, my = pts.reduce((a, p) => a + p[1], 0) / n;
    const sxx = pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0), sxy = pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0);
    const xs = pts.map((p) => p[0]), spread = (Math.max(...xs) - Math.min(...xs)) / mx;
    if (!sxx) return null;
    const a = sxy / sxx, b = my - a * mx;
    /* 콘코디아와의 교점 */
    const g = (t) => cy(t) - (a * cx(t) + b), roots = [];
    let prev = g(0), tp = 0;
    for (let t = 2; t <= 4500; t += 2) { const v = g(t); if (prev === 0 || prev * v < 0) { let lo = tp, hi = t; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (g(lo) * g(m) <= 0) hi = m; else lo = m; } roots.push((lo + hi) / 2); } prev = v; tp = t; }
    return { a, b, roots, spread };
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const sc = S[s], tmax = sc.t1 * 1.18;
    const XM = cx(tmax), YM = cy(tmax);
    const x0 = 52, x1 = w - 16, y0 = 18, y1 = h - 40;
    const X = (v) => x0 + v / XM * (x1 - x0), Y = (v) => y1 - v / YM * (y1 - y0);
    /* 눈금 */
    const nice = (m) => { const p = Math.pow(10, Math.floor(Math.log10(m / 4))); const k = m / 4 / p; return (k < 1.5 ? 1 : k < 3.5 ? 2 : 5) * p; };
    const dx = nice(XM), dy = nice(YM);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    const fmt = (v, d) => (d >= 1 ? v.toFixed(0) : v.toFixed(Math.min(4, Math.ceil(-Math.log10(d)))));
    for (let v = 0; v <= XM + 1e-12; v += dx) { const x = Math.round(X(v)) + .5; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); ctx.textAlign = "center"; ctx.fillText(fmt(v, dx), x, y1 + 14); }
    for (let v = 0; v <= YM + 1e-12; v += dy) { const y = Math.round(Y(v)) + .5; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.textAlign = "right"; ctx.fillText(fmt(v, dy), x0 - 5, y + 3); }
    ctx.strokeStyle = C.ink; ctx.strokeRect(x0 + .5, y0 + .5, x1 - x0, y1 - y0);
    ctx.fillStyle = C.ink2; ctx.textAlign = "right"; ctx.fillText("²⁰⁷Pb*/²³⁵U", x1, y1 + 30);
    ctx.textAlign = "left"; ctx.fillText("²⁰⁶Pb*/²³⁸U", x0 + 4, y0 + 12);
    /* 콘코디아 */
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let t = 0, i = 0; t <= tmax; t += tmax / 300, i++) { const x = X(cx(t)), y = Y(cy(t)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    ctx.font = `10px ${F.mono}`;
    for (let t = sc.tick; t <= tmax; t += sc.tick) {
      const x = X(cx(t)), y = Y(cy(t)); ctx.fillStyle = "#fff"; ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.forest; if (x - x0 > 34) { ctx.textAlign = "right"; ctx.fillText(`${t}`, x - 6, y - 4); } else { ctx.textAlign = "left"; ctx.fillText(`${t}`, x + 7, y + 4); }
    }
    /* 디스코디아 */
    const fz = linfit();
    if (fz) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.3; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(X(0), Y(fz.b)); ctx.lineTo(X(XM), Y(fz.a * XM + fz.b)); ctx.stroke(); ctx.setLineDash([]);
      fz.roots.forEach((t) => { ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(cx(t)), Y(cy(t)), 5, 0, 7); ctx.fill(); });
    }
    if (truth) {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(cx(sc.t2)), Y(cy(sc.t2))); ctx.lineTo(X(cx(sc.t1)), Y(cy(sc.t1))); ctx.stroke();
      ctx.fillStyle = C.warn; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillText(`참값: 결정 ${sc.t1} Ma`, X(cx(sc.t1)) + 8 > x1 - 110 ? x1 - 112 : X(cx(sc.t1)) + 8, Y(cy(sc.t1)) + 16);
      ctx.fillText(`납 손실 ${sc.t2} Ma${sc.t2 === 0 ? "(최근)" : ""}`, X(cx(sc.t2)) + 10, Y(cy(sc.t2)) - 8);
    }
    /* 점 */
    pts.forEach(([x, y], i) => {
      ctx.fillStyle = i === pts.length - 1 ? "#3f6fa3" : "rgba(63,111,163,.55)"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(X(x), Y(y), Math.max(4.5, X(x * 0.012) - X(0)), Math.max(4.5, Y(0) - Y(y * 0.012)), 0, 0, 7); ctx.fill(); ctx.stroke();
    });
    ctx.restore();
    return fz;
  }
  function update() {
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === s)));
    const fz = draw();
    nN.textContent = pts.length;
    if (pts.length) {
      const [x, y] = pts[pts.length - 1];
      last.innerHTML = `방금 분석한 알갱이: ²⁰⁶Pb/²³⁸U 나이 <b>${Math.round(age68(y))}</b> Ma · ²⁰⁷Pb/²³⁵U 나이 <b>${Math.round(age75(x))}</b> Ma · ²⁰⁷Pb/²⁰⁶Pb 나이 <b>${Math.round(age76(x, y))}</b> Ma`;
    } else last.textContent = "버튼을 눌러 지르콘 알갱이를 하나씩 분석하세요.";
    if (!fz) { nUp.textContent = pts.length < 3 ? "3개 이상 필요" : "—"; nLo.textContent = "—"; }
    else if (fz.spread < 0.04) {
      const m = pts.reduce((a, p) => a + age68(p[1]), 0) / pts.length;
      nUp.textContent = "직선이 불안정"; nLo.textContent = "—";
      last.innerHTML += `<br>점들이 한곳에 모여 직선의 기울기를 정할 수 없습니다. 콘코디아 위에 겹친 알갱이들의 평균 ²⁰⁶Pb/²³⁸U 나이: <b>${Math.round(m)}</b> Ma`;
    } else {
      const r = fz.roots.slice().sort((a, b) => a - b);
      nUp.textContent = r.length ? Math.round(r[r.length - 1]) : "교점 없음";
      nLo.textContent = r.length > 1 ? Math.round(r[0]) : (fz.b > 0 ? "0 아래" : "—");
    }
  }
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { s = b.dataset.s; pts = []; truth = false; update(); }));
  $(".cc-add").addEventListener("click", () => { analyze(); update(); });
  $(".cc-add5").addEventListener("click", () => { for (let i = 0; i < 5; i++) analyze(); update(); });
  $(".cc-clear").addEventListener("click", () => { pts = []; truth = false; update(); });
  $(".cc-truth").addEventListener("click", () => { truth = !truth; update(); });
  if (/[?&]demo/.test(location.search)) { for (let i = 0; i < 7; i++) analyze(); }
  update();
})();
