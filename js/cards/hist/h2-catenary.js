/* 카드: 아치와 추력선 — 자체 무게만 받는 아치에서 추력선이 돌 띠 안에 머무는지 찾기 (폭 = 1) */
(() => {
  const root = document.getElementById("card-hist-catenary");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sT = $(".t"), sH = $(".h");
  let shape = "semi", cl = null, minT = null;

  /* 반쪽 아치 중심선: 꼭대기(0, h)에서 밑동(0.5, 0)까지 */
  function centerline(kind, h) {
    const N = 240, P = [];
    if (kind === "semi") for (let i = 0; i <= N; i++) { const a = Math.PI / 2 * (1 - i / N); P.push([0.5 * Math.cos(a), 0.5 * Math.sin(a)]); }
    else if (kind === "para") for (let i = 0; i <= N; i++) { const x = 0.5 * i / N; P.push([x, h * (1 - (2 * x) ** 2)]); }
    else if (kind === "cat") {
      let lo = 0.01, hi = 50;
      for (let k = 0; k < 80; k++) { const a = Math.sqrt(lo * hi); if (a * (Math.cosh(0.5 / a) - 1) > h) lo = a; else hi = a; }
      const a = lo;
      for (let i = 0; i <= N; i++) { const x = 0.5 * i / N; P.push([x, h - a * (Math.cosh(x / a) - 1)]); }
    } else {
      const c = (h * h - 0.25), R = 0.5 + c, a0 = Math.atan2(h, c);
      for (let i = 0; i <= N; i++) { const a = a0 * (1 - i / N); P.push([-c + R * Math.cos(a), R * Math.sin(a)]); }
    }
    /* 구간별 무게(호의 길이에 비례)와 위치 */
    const L = [];
    for (let i = 0; i < N; i++) { const [x1, y1] = P[i], [x2, y2] = P[i + 1]; L.push([(x1 + x2) / 2, Math.hypot(x2 - x1, y2 - y1)]); }
    const W = L.reduce((s, q) => s + q[1], 0);
    return { P, L, W, h: kind === "semi" ? 0.5 : h };
  }

  /* 꼭대기 높이 y0, 수평 추력 H인 추력선 (x ≥ 0 쪽). 모멘트는 누적합으로 */
  function thrust(c, y0, H, xmax) {
    const T = [], n = 48;
    let j = 0, sw = 0, swx = 0;
    for (let i = 0; i <= n; i++) {
      const x = xmax * i / n;
      while (j < c.L.length && c.L[j][0] < x) { sw += c.L[j][1]; swx += c.L[j][1] * c.L[j][0]; j++; }
      T.push([x, y0 - (x * sw - swx) / H]);
    }
    return T;
  }
  /* 중심선까지의 거리: x가 가까운 점들만 본다 (중심선은 x가 커지는 순서) */
  const dist = (c, x, y, win) => {
    const P = c.P; let lo = 0, hi = P.length - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (P[m][0] < x - win) lo = m + 1; else hi = m; }
    let d = Infinity;
    for (let i = Math.max(0, lo - 1); i < P.length && P[i][0] <= x + win; i++) { const e = (P[i][0] - x) ** 2 + (P[i][1] - y) ** 2; if (e < d) d = e; }
    if (d === Infinity) { const q = P[Math.min(lo, P.length - 1)]; d = (q[0] - x) ** 2 + (q[1] - y) ** 2; }
    return Math.sqrt(d);
  };

  /* 두께 t에서 가장 덜 벗어나는 추력선 찾기. excess ≤ 0이면 버틴다 */
  function best(c, t) {
    let out = null;
    const xmax = 0.5 + t / 2 + 0.02;
    const tryOne = (y0, H) => {
      const T = thrust(c, y0, H, xmax);
      let ex = -Infinity, worst = null, hitBase = null;
      for (let i = 0; i < T.length; i++) {
        const [x, y] = T[i];
        if (y < 0) { if (hitBase === null && i) { const [xa, ya] = T[i - 1]; hitBase = xa + (x - xa) * ya / (ya - y); } break; }
        const e = dist(c, x, y, t / 2 + 0.02) - t / 2;
        if (e > ex) { ex = e; worst = [x, y]; }
      }
      if (hitBase === null) hitBase = xmax + 1;
      const eb = Math.abs(hitBase - 0.5) - t / 2;
      if (eb > ex) { ex = eb; worst = [Math.min(hitBase, xmax), 0]; }
      if (!out || ex < out.ex) out = { ex, y0, H, T, worst };
    };
    const Hs = []; for (let k = 0; k <= 30; k++) Hs.push(c.W * 0.03 * Math.pow(200, k / 30));
    for (let j = 0; j <= 8; j++) for (const H of Hs) tryOne(c.h - t / 2 + t * j / 8, H);
    const { y0: by, H: bH } = out;
    for (let j = -4; j <= 4; j++) for (let k = -6; k <= 6; k++) tryOne(Math.min(c.h + t / 2, Math.max(c.h - t / 2, by + t * j / 32)), bH * Math.pow(1.04, k));
    return out;
  }

  function solveMin(c) {
    let lo = 0.002, hi = 0.3;
    if (best(c, hi).ex > 0) return null;
    for (let k = 0; k < 13; k++) { const m = (lo + hi) / 2; if (best(c, m).ex <= 0) hi = m; else lo = m; }
    return hi;
  }

  const cv = fit($(".cv-wide"), () => draw());

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w || !cl) return;
    ctx.clearRect(0, 0, w, h);
    const t = +sT.value / 100, b = best(cl, t), ok = b.ex <= 1e-4;
    const sc = Math.min((w - 40) / 1.3, (h - 46) / (cl.h + 0.15)), ox = w / 2, oy = h - 28;
    const X = (x) => ox + x * sc, Y = (y) => oy - y * sc;
    /* 땅 */
    ctx.fillStyle = "#e7e6dd"; ctx.fillRect(0, oy, w, h - oy);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, oy + 0.5); ctx.lineTo(w, oy + 0.5); ctx.stroke();
    /* 돌 띠: 중심선의 법선 방향으로 ±t/2 */
    const full = [...cl.P.slice().reverse().map(([x, y]) => [-x, y]), ...cl.P.slice(1)];
    const nrm = (i) => { const a = full[Math.max(0, i - 1)], c2 = full[Math.min(full.length - 1, i + 1)], dx = c2[0] - a[0], dy = c2[1] - a[1], l = Math.hypot(dx, dy); return [-dy / l, dx / l]; };
    const outer = full.map((p, i) => { const [nx, ny] = nrm(i); return [p[0] + nx * t / 2, p[1] + ny * t / 2]; });
    const inner = full.map((p, i) => { const [nx, ny] = nrm(i); return [p[0] - nx * t / 2, p[1] - ny * t / 2]; });
    ctx.fillStyle = "#d8cdb6"; ctx.strokeStyle = "#8a7a5c"; ctx.lineWidth = 1;
    ctx.beginPath(); outer.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(Math.max(0, y))) : ctx.moveTo(X(x), Y(Math.max(0, y)))));
    inner.slice().reverse().forEach(([x, y]) => ctx.lineTo(X(x), Y(Math.max(0, y)))); ctx.closePath(); ctx.fill(); ctx.stroke();
    /* 돌 이음매 */
    ctx.strokeStyle = "rgba(138,122,92,.55)";
    for (let i = 6; i < full.length - 3; i += 12) { ctx.beginPath(); ctx.moveTo(X(outer[i][0]), Y(outer[i][1])); ctx.lineTo(X(inner[i][0]), Y(inner[i][1])); ctx.stroke(); }
    /* 추력선 (양쪽 대칭) */
    const T = b.T.filter(([, y]) => y >= -0.002);
    ctx.strokeStyle = ok ? C.warn : C.apple; ctx.lineWidth = 2.2; ctx.setLineDash(ok ? [] : [6, 4]);
    ctx.beginPath(); T.slice().reverse().forEach(([x, y], i) => (i ? ctx.lineTo(X(-x), Y(y)) : ctx.moveTo(X(-x), Y(y)))); T.forEach(([x, y]) => ctx.lineTo(X(x), Y(y))); ctx.stroke(); ctx.setLineDash([]);
    if (!ok && b.worst) {
      ctx.fillStyle = C.apple;
      [b.worst[0], -b.worst[0]].forEach((x) => { ctx.beginPath(); ctx.arc(X(x), Y(b.worst[1]), 6, 0, Math.PI * 2); ctx.fill(); });
      ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left";
      const lx = X(b.worst[0]) - 150, ly = Math.min(Y(b.worst[1]) - 34, h - 60);
      ctx.fillText("추력선이 돌 밖으로 → 균열", Math.min(lx, w - 170), Math.max(16, ly));
    }
    /* 밑동을 미는 힘 화살표 */
    const ax = X(0.5 + t / 2) + 6, ay = oy - 8;
    ctx.strokeStyle = C.forest; ctx.fillStyle = C.forest; ctx.lineWidth = 2;
    const al = Math.min(70, 18 + 40 * b.H / cl.W);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + al, ay); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax + al + 6, ay); ctx.lineTo(ax + al - 2, ay - 4); ctx.lineTo(ax + al - 2, ay + 4); ctx.fill();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.warn;
    ctx.fillText("─ 추력선 (누르는 힘의 길)", 10, 18);
    ctx.fillStyle = C.forest; ctx.fillText("→ 밑동을 옆으로 미는 힘", 10, 34);

    const okEl = $(".n-ok");
    okEl.textContent = ok ? "버팀" : "무너짐"; okEl.className = "n-ok " + (ok ? "good" : "bad");
    $(".n-H").textContent = (b.H / cl.W / 2).toFixed(2);
    $(".n-min").textContent = minT === null ? "30% 넘음" : (minT * 100).toFixed(1) + "%";
    $(".n-m").textContent = minT === null ? "—" : ((t / minT).toFixed(1) + "배");
  }

  function rebuild() {
    const hv = +sH.value;
    if (shape === "semi") { sH.value = 0.5; }
    if (shape === "goth" && hv < 0.5) sH.value = 0.5;
    $(".h-out").textContent = (+sH.value).toFixed(2);
    cl = centerline(shape, +sH.value);
    minT = solveMin(cl);
    draw();
  }
  $(".shape").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    shape = b.dataset.s; root.querySelectorAll(".shape .chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    rebuild();
  });
  sT.addEventListener("input", () => { $(".t-out").textContent = (+sT.value).toFixed(1); draw(); });
  sH.addEventListener("input", rebuild);
  if (/[?&]demo\b/.test(location.search)) { sT.value = 4; $(".t-out").textContent = "4.0"; }
  rebuild();
})();
