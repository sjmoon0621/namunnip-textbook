/* 카드: 가우스 면 하나로 전기장을 구할 수 있을까? — 구대칭 전하 분포와 가우스 법칙, 도체·유전체·쌍극자 */
(() => {
  const root = document.getElementById("card-adphy-gauss");
  if (!root) return;
  const { C: COL, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sR = $(".r"), oR = $(".r-out"), sK = $(".k"), oK = $(".k-out");
  const nQ = $(".n-q"), nP = $(".n-p"), nE = $(".n-e"), nV = $(".n-v"), note = $(".n-note");
  const K = 8.988e9, EPS0 = 8.854e-12, Q = 1e-9;
  const A = 0.04, B = 0.06, D = 0.015; /* 구·껍질 반지름(m), 쌍극자 전하의 중심 거리(m) */
  let P = "point", G = "E";
  const kap = () => +sK.value;

  /* 구대칭 분포: 반지름 r(m)에서 자유 전하·속박 전하 합(가우스 면 안) */
  function qenc(r) {
    const k = kap();
    switch (P) {
      case "point": return { free: Q, bound: 0 };
      case "sphere": return { free: r < A ? Q * (r / A) ** 3 : Q, bound: 0 };
      case "cond": return { free: r < A ? Q : r < B ? 0 : Q, bound: 0, ind: r >= A && r < B };
      case "shield": return { free: r < B ? 0 : Q, bound: 0 };
      case "diel": return { free: Q, bound: r < A ? 0 : r < B ? -Q * (1 - 1 / k) : 0 };
      default: return { free: 0, bound: 0 };
    }
  }
  /* 구대칭 E(r): 가우스 법칙 E·4πr² = Q_안/ε₀ (도체 안은 E = 0) */
  function Er(r) {
    const q = qenc(r); return K * (q.free + q.bound) / (r * r);
  }
  function Vr(r) {
    /* 1 m 바깥은 점전하와 같으므로 kQ/R, 안쪽은 적분 */
    const R = 1, N = 1500; let s = 0;
    const lr0 = Math.log(r), lr1 = Math.log(R);
    for (let i = 0; i < N; i++) {
      const a = Math.exp(lr0 + (lr1 - lr0) * i / N), b = Math.exp(lr0 + (lr1 - lr0) * (i + 1) / N);
      s += 0.5 * (Er(a) + Er(b)) * (b - a);
    }
    return s + K * Q / R;
  }
  /* 쌍극자: +Q는 (0, +D/2), −Q는 (0, −D/2). 평면 위의 실제 3차원 전기장 */
  function Edip(x, y) {
    let ex = 0, ey = 0;
    [[0, D / 2, Q], [0, -D / 2, -Q]].forEach(([qx, qy, q]) => {
      const dx = x - qx, dy = y - qy, r2 = dx * dx + dy * dy, r3 = r2 * Math.sqrt(r2);
      ex += K * q * dx / r3; ey += K * q * dy / r3;
    });
    return [ex, ey];
  }
  const fmt = (v, d = 3) => {
    if (v === 0) return "0";
    const a = Math.abs(v);
    if (a >= 1e4 || a < 1e-2) { const e = Math.floor(Math.log10(a)); return `${(v / 10 ** e).toFixed(2)}×10${sup(e)}`; }
    return (+v.toPrecision(d)).toString();
  };
  const sup = (n) => String(n).split("").map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹⁻"["0123456789-".indexOf(c)]).join("");

  const { ctx, size } = fit(cv, () => draw());
  function arrow(x, y, dx, dy, col) {
    const L = Math.hypot(dx, dy); if (L < 2) return;
    const ux = dx / L, uy = dy / L;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y + dy); ctx.stroke();
    const hx = x + dx, hy = y + dy, s = Math.min(6, L * .5);
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - ux * s - uy * s * .55, hy - uy * s + ux * s * .55); ctx.lineTo(hx - ux * s + uy * s * .55, hy - uy * s - ux * s * .55); ctx.closePath(); ctx.fill();
  }
  function charge(x, y, sgn, rad = 7) {
    ctx.fillStyle = sgn > 0 ? COL.apple : "#3f6fa3";
    ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.6; ctx.beginPath();
    ctx.moveTo(x - rad * .55, y); ctx.lineTo(x + rad * .55, y);
    if (sgn > 0) { ctx.moveTo(x, y - rad * .55); ctx.lineTo(x, y + rad * .55); }
    ctx.stroke();
  }
  function ringSigns(cx, cy, rad, sgn, n) {
    ctx.font = `bold 11px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = sgn > 0 ? COL.apple : "#3f6fa3";
    for (let i = 0; i < n; i++) { const t = i / n * 2 * Math.PI; ctx.fillText(sgn > 0 ? "+" : "−", cx + rad * Math.cos(t), cy + rad * Math.sin(t)); }
    ctx.textBaseline = "alphabetic";
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = +sR.value / 100, sceneH = h * 0.56, cx = w / 2, cy = sceneH / 2 + 4;
    const s = Math.min(w, sceneH) / 2 / 0.105; /* px per m */
    /* 장면 */
    if (P === "sphere") { ctx.fillStyle = "rgba(212,73,58,.16)"; ctx.beginPath(); ctx.arc(cx, cy, A * s, 0, 7); ctx.fill(); ctx.strokeStyle = "rgba(212,73,58,.5)"; ctx.lineWidth = 1; ctx.stroke(); ringSigns(cx, cy, A * s * .5, 1, 6); ringSigns(cx, cy, A * s * .82, 1, 10); charge(cx, cy, 1, 0); ctx.fillStyle = COL.apple; ctx.font = `bold 11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("+", cx, cy + 4); }
    if (P === "cond" || P === "shield") {
      ctx.fillStyle = "#c9cbc3"; ctx.beginPath(); ctx.arc(cx, cy, B * s, 0, 2 * Math.PI); ctx.moveTo(cx + A * s, cy); ctx.arc(cx, cy, A * s, 0, 2 * Math.PI, true); ctx.fill();
      ctx.strokeStyle = COL.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, B * s, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, A * s, 0, 7); ctx.stroke();
      if (P === "cond") { charge(cx, cy, 1); ringSigns(cx, cy, A * s + 7, -1, 12); }
      ringSigns(cx, cy, B * s - 7, 1, 16);
    }
    if (P === "diel") {
      ctx.fillStyle = "rgba(224,160,42,.28)"; ctx.beginPath(); ctx.arc(cx, cy, B * s, 0, 2 * Math.PI); ctx.moveTo(cx + A * s, cy); ctx.arc(cx, cy, A * s, 0, 2 * Math.PI, true); ctx.fill();
      const n = Math.round(12 * (1 - 1 / kap()));
      if (n > 0) { ringSigns(cx, cy, A * s + 7, -1, n); ringSigns(cx, cy, B * s - 7, 1, n); }
      charge(cx, cy, 1);
    }
    if (P === "point") charge(cx, cy, 1);
    if (P === "dipole") { charge(cx, cy - D / 2 * s, 1, 6); charge(cx, cy + D / 2 * s, -1, 6); }
    /* 가우스 면 */
    ctx.setLineDash([5, 4]); ctx.strokeStyle = COL.forest; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(cx, cy, r * s, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    /* 면 위의 전기장 화살표 */
    const Eref = P === "dipole" ? Math.hypot(...Edip(0, 0.03)) : Math.max(Er(0.03), 1);
    const NA = 16;
    for (let i = 0; i < NA; i++) {
      const t = (i + .5) / NA * 2 * Math.PI, nx = Math.cos(t), ny = Math.sin(t);
      let ex, ey;
      if (P === "dipole") { [ex, ey] = Edip(r * nx, -r * ny); ey = -ey; }
      else { const e = Er(r); ex = e * nx; ey = e * ny; }
      const m = Math.hypot(ex, ey); if (m < 1e-9) continue;
      const L = 30 * Math.min(1.2, Math.sqrt(m / Eref));
      const out = ex * nx + ey * ny >= 0;
      arrow(cx + r * s * nx, cy + r * s * ny, ex / m * L, ey / m * L, out ? COL.ink : COL.warn);
    }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = COL.forest; ctx.textAlign = "left";
    ctx.fillText(`가우스 면 r = ${(r * 100).toFixed(1)} cm`, 6, 14);
    ctx.fillStyle = COL.ink3; ctx.fillText("검은 화살표: 밖으로  주황: 안으로", 6, sceneH - 4);

    /* 아래 그래프 */
    const x0 = 52, x1 = w - 14, y0 = h - 30, y1 = sceneH + 26;
    ctx.strokeStyle = COL.rule; ctx.beginPath(); ctx.moveTo(0, sceneH + 6); ctx.lineTo(w, sceneH + 6); ctx.stroke();
    if (P === "dipole") {
      /* 면 위 E_r(θ): 위쪽(θ=0)은 밖으로, 아래쪽은 안으로 */
      const X = (t) => x0 + t / Math.PI * (x1 - x0);
      const vals = []; let mx = 0;
      for (let i = 0; i <= 180; i++) { const t = i / 180 * Math.PI, nx = Math.sin(t), ny = Math.cos(t); const [ex, ey] = Edip(r * nx, r * ny); const v = (ex * nx + ey * ny) * Math.sin(t); vals.push(v); mx = Math.max(mx, Math.abs(v)); }
      const mid = (y0 + y1) / 2, Y = (v) => mid - v / (mx || 1) * (y0 - y1) / 2 * .9;
      NM.axes(ctx, { x0, y0: y1, w: x1 - x0, h: y0 - y1, X, Y, xt: [[0, "0°"], [Math.PI / 2, "90°"], [Math.PI, "180°"]], yt: [[0, "0"]], xlabel: "면 위의 각도 θ (위쪽 = 0°)", ylabel: "E_r · sin θ (면을 지나는 선속의 몫, 상대값)" });
      ctx.beginPath(); vals.forEach((v, i) => { const x = X(i / 180 * Math.PI); i ? ctx.lineTo(x, Y(v)) : ctx.moveTo(x, Y(v)); }); ctx.lineTo(x1, mid); ctx.lineTo(x0, mid); ctx.closePath();
      ctx.fillStyle = "rgba(116,171,102,.3)"; ctx.fill();
      ctx.strokeStyle = COL.forest; ctx.lineWidth = 1.8; ctx.beginPath(); vals.forEach((v, i) => { const x = X(i / 180 * Math.PI); i ? ctx.lineTo(x, Y(v)) : ctx.moveTo(x, Y(v)); }); ctx.stroke();
      return;
    }
    const rmin = 0.005, rmax = 0.10, X = (rr) => x0 + (rr - 0) / rmax * (x1 - x0);
    const f = G === "E" ? Er : Vr;
    const pts = []; for (let i = 0; i <= 190; i++) { const rr = rmin + (rmax - rmin) * i / 190; pts.push([rr, f(rr)]); }
    let ymax = 0; pts.forEach(([rr, v]) => { if (rr >= 0.02) ymax = Math.max(ymax, v); }); ymax *= 1.15;
    if (G === "V") ymax = Math.max(ymax, f(0.02) * 1.1);
    const Y = (v) => y0 - Math.min(v, ymax * 1.05) / ymax * (y0 - y1);
    const nice = (v) => { const e = 10 ** Math.floor(Math.log10(v)); const m = v / e; return (m < 2 ? 1 : m < 5 ? 2 : 5) * e; };
    const step = nice(ymax / 3), yt = []; for (let v = 0; v <= ymax; v += step) yt.push([v, v >= 1e5 ? fmt(v, 2) : String(+v.toPrecision(3))]);
    if (P === "cond" || P === "shield" || P === "diel") { ctx.fillStyle = P === "diel" ? "rgba(224,160,42,.2)" : "rgba(0,0,0,.07)"; ctx.fillRect(X(A), y1, X(B) - X(A), y0 - y1); }
    if (P === "sphere") { ctx.fillStyle = "rgba(212,73,58,.08)"; ctx.fillRect(X(0), y1, X(A) - X(0), y0 - y1); }
    NM.axes(ctx, { x0, y0: y1, w: x1 - x0, h: y0 - y1, X, Y, xt: [[0, "0"], [0.02, "2"], [0.04, "4"], [0.06, "6"], [0.08, "8"], [0.10, "10 cm"]], yt, xlabel: "", ylabel: G === "E" ? "E (N/C)" : "V (V), 무한히 먼 곳 = 0" });
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y1 - 2, x1 - x0, y0 - y1 + 2); ctx.clip();
    ctx.strokeStyle = G === "E" ? COL.ink : "#3f6fa3"; ctx.lineWidth = 2; ctx.beginPath();
    pts.forEach(([rr, v], i) => { i ? ctx.lineTo(X(rr), Y(v)) : ctx.moveTo(X(rr), Y(v)); }); ctx.stroke(); ctx.restore();
    ctx.strokeStyle = COL.forest; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(r), y1); ctx.lineTo(X(r), y0); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = COL.forest; ctx.beginPath(); ctx.arc(X(r), Y(f(r)), 4, 0, 7); ctx.fill();
  }

  function update() {
    const r = +sR.value / 100; oR.textContent = (+sR.value).toFixed(1); oK.textContent = kap().toFixed(1);
    sK.disabled = P !== "diel";
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === P)));
    root.querySelectorAll("[data-g]").forEach((b) => { b.setAttribute("aria-pressed", String(b.dataset.g === G)); b.disabled = P === "dipole"; });
    if (P === "dipole") {
      const inside = r > D / 2 ? "+Q와 −Q 모두" : "없음";
      nQ.textContent = "0"; nP.textContent = "0";
      const [ex, ey] = Edip(0, r); nE.textContent = `${fmt(Math.hypot(ex, ey))}`; nV.textContent = "면마다 다름";
      note.textContent = `면 안의 전하: ${inside}. 선속은 0이지만 면 위 전기장은 0이 아닙니다(E는 면의 맨 위 지점 값).`;
    } else {
      const q = qenc(r), qt = q.free + q.bound;
      nQ.textContent = `${fmt(qt / 1e-9)} nC`;
      nP.textContent = `${fmt(qt / EPS0)}`;
      nE.textContent = `${fmt(Er(r))}`; nV.textContent = `${fmt(Vr(r))}`;
      const msg = {
        point: "점전하: 면을 키워도 선속은 같고, E는 1/r²로 줄어듭니다.",
        sphere: "균일하게 대전된 부도체 구(반지름 4 cm): 구 안에서는 면 안의 전하가 r³에 비례해 E ∝ r입니다.",
        cond: "중성 도체 껍질(4–6 cm) 안에 +1 nC: 안쪽 면에 −1 nC, 바깥 면에 +1 nC가 유도됩니다. 도체 속 E = 0.",
        shield: "+1 nC로 대전된 도체 껍질(4–6 cm), 속은 비어 있음: 전하는 모두 바깥 면에 있고 빈 공간의 E = 0입니다.",
        diel: `점전하를 유전체 껍질(4–6 cm, κ = ${kap().toFixed(1)})이 감쌌습니다. 안쪽 면의 속박 전하 ${fmt(-(1 - 1 / kap()))} nC가 전기장을 1/κ로 줄입니다.`,
      }[P];
      note.textContent = msg + (q.bound ? ` (자유 전하 ${fmt(q.free / 1e-9)} nC + 속박 전하 ${fmt(q.bound / 1e-9)} nC)` : "");
    }
    draw();
  }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { P = b.dataset.p; if (P === "dipole") G = "E"; update(); }));
  root.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => { G = b.dataset.g; update(); }));
  [sR, sK].forEach((s) => s.addEventListener("input", update));
  if (/[?&]demo\b/.test(location.search)) { P = "diel"; sR.value = 5; sK.value = 4; }
  update();
})();
