/* 카드: 충돌 이론 — 2차원 원판 기체에서 A–B 충돌 수, 에너지·방향 조건을 만족하는 유효 충돌 수 */
(() => {
  const root = document.getElementById("card-adchem-collision");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const sT = $(".t"), sN = $(".n"), sE = $(".e");
  const RT300 = 8.314 * 300 / 1000; /* kJ/mol */
  const V0 = 0.5, RAD = 0.022, NB = 20, DT = 1 / 240;
  let T = 300, p = 1, speed = 1, parts = [], t = 0, nz = 0, ne = 0, seed = 99;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const gs = () => { let u = 0; while (!u) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };
  function make(na) {
    const sd = V0 * Math.sqrt(T / 300), out = [];
    const total = na + NB;
    for (let i = 0; i < total; i++) {
      let x, y, tries = 0;
      do { x = RAD + rnd() * (1 - 2 * RAD); y = RAD + rnd() * (1 - 2 * RAD); tries++; }
      while (tries < 200 && out.some((q) => (q.x - x) ** 2 + (q.y - y) ** 2 < (2.2 * RAD) ** 2));
      out.push({ a: i < na, x, y, vx: sd * gs(), vy: sd * gs(), ph: rnd() * Math.PI * 2, om: (rnd() - 0.5) * 4, fl: 0 });
    }
    parts = out;
  }
  function reset() { t = 0; nz = 0; ne = 0; }
  function step(dt) {
    const Ea = +sE.value / RT300; /* kT(300 K) = V0² 단위의 문턱 */
    for (const q of parts) {
      q.x += q.vx * dt; q.y += q.vy * dt; q.ph += q.om * dt; if (q.fl > 0) q.fl -= dt;
      if (q.x < RAD) { q.x = RAD; q.vx = Math.abs(q.vx); } else if (q.x > 1 - RAD) { q.x = 1 - RAD; q.vx = -Math.abs(q.vx); }
      if (q.y < RAD) { q.y = RAD; q.vy = Math.abs(q.vy); } else if (q.y > 1 - RAD) { q.y = 1 - RAD; q.vy = -Math.abs(q.vy); }
    }
    const n = parts.length;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const P = parts[i], Q = parts[j], dx = Q.x - P.x, dy = Q.y - P.y, d2 = dx * dx + dy * dy;
      if (d2 > 4 * RAD * RAD || d2 === 0) continue;
      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, vn = (Q.vx - P.vx) * nx + (Q.vy - P.vy) * ny;
      if (vn >= 0) continue;
      if (P.a !== Q.a) {
        nz++;
        const A = P.a ? P : Q, sgn = P.a ? 1 : -1;
        /* 중심선 방향 상대 에너지 ½μv², μ = m/2, m = 1, 단위 kT(300 K) = V0² */
        const eline = 0.25 * vn * vn / (V0 * V0);
        let da = Math.atan2(sgn * ny, sgn * nx) - A.ph; da = Math.atan2(Math.sin(da), Math.cos(da));
        if (eline >= Ea && Math.abs(da) <= Math.PI * p) { ne++; P.fl = Q.fl = 0.35; }
      }
      P.vx += vn * nx; P.vy += vn * ny; Q.vx -= vn * nx; Q.vy -= vn * ny;
      const ov = 2 * RAD - d; P.x -= nx * ov / 2; P.y -= ny * ov / 2; Q.x += nx * ov / 2; Q.y += ny * ov / 2;
    }
    t += dt;
  }
  const cv = $("canvas");
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const L = h - 16, bx = 8, by = 8, S = L;
    ctx.fillStyle = "#101418"; ctx.fillRect(bx, by, S, S);
    const r = RAD * S;
    for (const q of parts) {
      const x = bx + q.x * S, y = by + q.y * S;
      if (q.a) {
        ctx.fillStyle = "#c2402f"; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        if (p < 1) { ctx.fillStyle = "#ffb3a6"; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, q.ph - Math.PI * p, q.ph + Math.PI * p); ctx.closePath(); ctx.fill(); }
      } else { ctx.fillStyle = "#5b8fd1"; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
      if (q.fl > 0) { ctx.strokeStyle = `rgba(240,190,60,${Math.min(1, q.fl / 0.2)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r + 4, 0, Math.PI * 2); ctx.stroke(); }
    }
    /* 오른쪽: 300 K, A 20개에 대한 배수 (이론, 로그 눈금) */
    const x0 = bx + S + 34, x1 = w - 10, y0 = 34, y1 = h - 40, Ea = +sE.value;
    const na = +sN.value, fz = (na / 20) * Math.sqrt(T / 300), ff = Math.exp(-(Ea / 8.314e-3) * (1 / T - 1 / 300)), bars = [["충돌 빈도", fz, "#5b8fd1"], ["유효 비율", ff, "#e0a02a"], ["속도", fz * ff, "#3b7c2a"]];
    const lmax = Math.max(1, ...bars.map((b) => Math.log10(b[1]))), lmin = Math.min(-1, ...bars.map((b) => Math.log10(b[1])));
    const top = Math.ceil(lmax), bot = Math.floor(lmin), Y = (lv) => y0 + (top - lv) / (top - bot) * (y1 - y0);
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
    for (let k = bot; k <= top; k++) { ctx.strokeStyle = k === 0 ? C.ink : C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(k)); ctx.lineTo(x1, Y(k)); ctx.stroke(); ctx.fillStyle = C.ink3; ctx.fillText(k === 0 ? "1" : `10${k < 0 ? "⁻" : ""}${"⁰¹²³⁴⁵⁶⁷⁸⁹"[Math.abs(k)]}`, x0 - 4, Y(k) + 3); }
    const bw = (x1 - x0) / 3;
    bars.forEach(([lab, v, c], i) => {
      const xa = x0 + bw * i + bw * 0.2, xb = x0 + bw * (i + 1) - bw * 0.2, ya = Y(0), yb = Y(Math.log10(v));
      ctx.fillStyle = c; ctx.fillRect(xa, Math.min(ya, yb), xb - xa, Math.max(1.5, Math.abs(yb - ya)));
      ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.font = `10.5px ${F.mono}`;
      ctx.fillText(`×${v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)}`, (xa + xb) / 2, (v >= 1 ? yb - 5 : yb + 13));
      ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.fillText(lab, (xa + xb) / 2, h - 24);
    });
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("300 K, A 20개에 대한 배수 (이론)", x0 - 30, 18);
  }
  function nums() {
    const ok = t > 0.5;
    $(".n-z").textContent = ok ? (nz / t).toFixed(0) : "—";
    $(".n-ze").textContent = ok ? (ne / t).toFixed(1) : "—";
    $(".n-f").textContent = nz ? (ne / nz).toFixed(3) : "—";
    $(".n-th").textContent = (p * Math.exp(-(+sE.value) / (8.314e-3 * T))).toFixed(3);
  }
  let acc = 0;
  loop(cv, (dt) => {
    acc += dt * speed;
    let k = 0; while (acc >= DT && k < 40) { step(DT); acc -= DT; k++; }
    draw(); nums();
  });
  function update() {
    $(".t-out").textContent = sT.value; $(".n-out").textContent = sN.value; $(".e-out").textContent = (+sE.value).toFixed(1);
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.p === p)));
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.s === speed)));
    reset(); draw(); nums();
  }
  sT.addEventListener("input", () => {
    const Tn = +sT.value, f = Math.sqrt(Tn / T); T = Tn;
    parts.forEach((q) => { q.vx *= f; q.vy *= f; }); update();
  });
  sN.addEventListener("input", () => { make(+sN.value); update(); });
  sE.addEventListener("input", update);
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { p = +b.dataset.p; update(); }));
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { speed = +b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(+x.dataset.s === speed))); }));
  make(20); update();
  if (/[?&]demo\b/.test(location.search)) { sT.value = 400; sT.dispatchEvent(new Event("input")); sE.value = 8; update(); for (let i = 0; i < 240 * 20; i++) step(DT); draw(); nums(); }
})();
