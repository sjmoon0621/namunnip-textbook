/* 카드: 볼록 렌즈는 왜 빛을 한 점에 모을까? — 구면에서 스넬 법칙으로 광선 추적 */
(() => {
  const root = document.getElementById("card-phy-lm-refract");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const nS = $(".n"), RS = $(".R"), bS = $(".beam"), normals = $(".normals");
  const nO = $(".n-out"), RO = $(".R-out"), bO = $(".beam-out");
  const fEl = $(".fpar"), eEl = $(".fedge"), aEl = $(".aberr");
  const AP = 25; // 렌즈 반지름(구경의 절반) 25 mm
  let shape = "convex";

  function lens() {
    const n = +nS.value, R = +RS.value;
    const sag = R - Math.sqrt(R * R - AP * AP);
    if (shape === "convex") { const t = 2 * sag + 2; return { n, R1: R, R2: -R, t }; }
    return { n, R1: -R, R2: R, t: 2 };
  }
  // 두꺼운 렌즈의 근축 초점 (뒤 꼭짓점 기준 거리)
  function paraxial(L) {
    const { n, R1, R2, t } = L;
    const P = (n - 1) * (1 / R1 - 1 / R2 + (n - 1) * t / (n * R1 * R2));
    if (Math.abs(P) < 1e-9) return null;
    const f = 1 / P, bfl = f * (1 - (n - 1) * t / (n * R1));
    return { f, x: L.t / 2 + bfl };
  }
  // 광선 하나를 추적: 경로 점 목록과 나가는 방향
  function trace(L, h) {
    const surf = [{ vx: -L.t / 2, R: L.R1, n1: 1, n2: L.n }, { vx: L.t / 2, R: L.R2, n1: L.n, n2: 1 }];
    let p = { x: -1e3, y: h }, d = { x: 1, y: 0 };
    const pts = [], hits = [];
    for (const s of surf) {
      const cx = s.vx + s.R, r = Math.abs(s.R);
      const ox = p.x - cx, oy = p.y;
      const b = ox * d.x + oy * d.y, c = ox * ox + oy * oy - r * r, D = b * b - c;
      if (D < 0) return null;
      const s1 = -b - Math.sqrt(D), s2 = -b + Math.sqrt(D);
      const q1 = { x: p.x + s1 * d.x, y: p.y + s1 * d.y }, q2 = { x: p.x + s2 * d.x, y: p.y + s2 * d.y };
      const q = Math.abs(q1.x - s.vx) < Math.abs(q2.x - s.vx) ? q1 : q2;
      let N = { x: (q.x - cx) / r, y: q.y / r };
      if (N.x * d.x + N.y * d.y > 0) N = { x: -N.x, y: -N.y };
      const eta = s.n1 / s.n2, ci = -(N.x * d.x + N.y * d.y), k = 1 - eta * eta * (1 - ci * ci);
      pts.push(q); hits.push({ q, N });
      if (k < 0) return { pts, hits, d: null };
      const m = eta * ci - Math.sqrt(k);
      d = { x: eta * d.x + m * N.x, y: eta * d.y + m * N.y };
      p = q;
    }
    return { pts, hits, d, p };
  }
  const cross = (r) => (r && r.d && Math.abs(r.d.y) > 1e-9) ? r.p.x - r.p.y * r.d.x / r.d.y : null;

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const L = lens(), x0 = -60, x1 = 260, sc = w / (x1 - x0);
    const X = (x) => (x - x0) * sc, Y = (y) => h / 2 - 10 - y * sc;
    // 광축
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(0, Y(0) + .5); ctx.lineTo(w, Y(0) + .5); ctx.stroke(); ctx.setLineDash([]);
    // 렌즈
    const surfX = (vx, R, y) => vx + R - Math.sign(R) * Math.sqrt(R * R - y * y);
    ctx.beginPath();
    for (let y = -AP; y <= AP; y += 0.5) { const x = surfX(-L.t / 2, L.R1, y); y === -AP ? ctx.moveTo(X(x), Y(y)) : ctx.lineTo(X(x), Y(y)); }
    for (let y = AP; y >= -AP; y -= 0.5) ctx.lineTo(X(surfX(L.t / 2, L.R2, y)), Y(y));
    ctx.closePath();
    const tint = Math.min(0.35, 0.08 + (L.n - 1) * 0.2);
    ctx.fillStyle = `rgba(92,150,190,${tint})`; ctx.fill();
    ctx.strokeStyle = "#4b7fa3"; ctx.lineWidth = 1.2; ctx.stroke();

    // 광선
    const frac = +bS.value / 100, NR = 11;
    const px = paraxial(L);
    let edge = null;
    for (let i = 0; i < NR; i++) {
      const hh = (-1 + 2 * i / (NR - 1)) * AP * 0.96 * frac;
      const r = trace(L, hh);
      if (!r) continue;
      const hue = Math.abs(hh) / (AP * 0.96);
      ctx.strokeStyle = `rgba(${Math.round(59 + 150 * hue)},${Math.round(124 - 40 * hue)},${Math.round(42 + 20 * hue)},.9)`;
      ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(X(x0), Y(hh));
      r.pts.forEach((q) => ctx.lineTo(X(q.x), Y(q.y)));
      if (r.d) { const s = (x1 - r.p.x) / r.d.x; ctx.lineTo(X(r.p.x + s * r.d.x), Y(r.p.y + s * r.d.y)); }
      ctx.stroke();
      // 오목 렌즈: 나간 광선을 뒤로 늘여 허초점 찾기
      if (r.d && shape === "concave" && hh !== 0) {
        const s = (x0 - r.p.x) / r.d.x;
        ctx.setLineDash([3, 4]); ctx.lineWidth = 1; ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.moveTo(X(r.p.x), Y(r.p.y)); ctx.lineTo(X(r.p.x + s * r.d.x), Y(r.p.y + s * r.d.y)); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
      }
      if (normals.checked && hh !== 0) {
        ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
        for (const { q, N } of r.hits) { ctx.beginPath(); ctx.moveTo(X(q.x - N.x * 14), Y(q.y - N.y * 14)); ctx.lineTo(X(q.x + N.x * 14), Y(q.y + N.y * 14)); ctx.stroke(); }
        ctx.setLineDash([]);
      }
      if (i === NR - 1) edge = r;
    }
    // 초점 표시
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
    if (px && px.x > x0 && px.x < x1) {
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(px.x), Y(0), 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillText("F (근축)", X(px.x), Y(0) + 18);
    }
    const ex = cross(edge);
    if (ex !== null && ex > x0 && ex < x1 && frac > 0.3 && Math.abs(ex - (px ? px.x : 1e9)) > 1) {
      ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(ex), Y(0), 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillText("가장자리", X(ex), Y(0) - 10);
    }
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3;
    ctx.fillText(`n = ${L.n.toFixed(2)}`, 8, 14);
    // 눈금 막대 50 mm
    const by = h - 10;
    ctx.fillStyle = C.ink3; ctx.fillRect(w - 10 - 50 * sc, by, 50 * sc, 1.5);
    ctx.textAlign = "right"; ctx.fillText("50 mm", w - 10, by - 5);
    return { px, edge };
  }

  const fmt = (v) => Math.abs(v) > 5000 ? "∞" : `${v.toFixed(0)} mm`;
  function update() {
    nO.textContent = (+nS.value).toFixed(2); RO.textContent = RS.value; bO.textContent = bS.value;
    const L = lens(), px = paraxial(L);
    const frac = +bS.value / 100;
    const r = trace(L, AP * 0.96 * frac);
    const ex = cross(r);
    fEl.textContent = px ? fmt(px.x - L.t / 2) : "∞";
    if (ex === null || !px) { eEl.textContent = r && !r.d ? "전반사" : "—"; aEl.textContent = "—"; }
    else {
      const e = ex - L.t / 2;
      eEl.textContent = `${e.toFixed(0)} mm`;
      const bfl = px.x - L.t / 2, diff = Math.abs(bfl - e);
      aEl.textContent = `${diff.toFixed(1)} mm`;
      aEl.classList.toggle("bad", diff > 2);
    }
    draw();
  }
  [nS, RS, bS].forEach((el) => el.addEventListener("input", update));
  normals.addEventListener("change", update);
  root.querySelectorAll("[data-n]").forEach((b) => b.addEventListener("click", () => { nS.value = b.dataset.n; update(); }));
  const shapeBtns = root.querySelectorAll("[data-shape]");
  shapeBtns.forEach((b) => b.addEventListener("click", () => {
    shape = b.dataset.shape; shapeBtns.forEach((o) => o.setAttribute("aria-pressed", o === b)); update();
  }));
  update();
})();
