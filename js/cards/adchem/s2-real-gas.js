/* 카드: 높은 압력의 기체는 왜 PV = nRT를 따르지 않을까? — 압축 인자와 상태 방정식 */
(() => {
  const root = document.getElementById("card-adchem-real-gas");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), sP = $(".p");
  const R = 0.08314; /* L·bar/(mol·K) */
  /* a (bar·L²/mol²), b (L/mol): CRC 편람. Tc (K), Pc (bar): 실측 임계값 */
  const G = {
    He: { n: "He", a: 0.0346, b: 0.0238, Tc: 5.19, Pc: 2.27 },
    H2: { n: "H₂", a: 0.2476, b: 0.02661, Tc: 33.2, Pc: 13.0 },
    N2: { n: "N₂", a: 1.370, b: 0.0387, Tc: 126.2, Pc: 33.9 },
    CH4: { n: "CH₄", a: 2.303, b: 0.0431, Tc: 190.6, Pc: 46.0 },
    CO2: { n: "CO₂", a: 3.640, b: 0.04267, Tc: 304.1, Pc: 73.8 },
    NH3: { n: "NH₃", a: 4.225, b: 0.0371, Tc: 405.4, Pc: 113.5 },
  };
  let gas = "CH4", eos = "vdw";

  /* 상태 방정식: P(V), 몰 헬름홀츠 에너지 A(V) (상수항 제외), 임계 온도·부피 */
  function model(g, e, T) {
    if (e === "vdw") {
      const { a, b } = g;
      return { b, P: (V) => R * T / (V - b) - a / (V * V), A: (V) => -R * T * Math.log(V - b) - a / V,
        Tc: 8 * a / (27 * R * b), Vc: 3 * b, rep: (V) => V / (V - b), att: (V) => a / (R * T * V) };
    }
    const a = 0.42748 * R * R * Math.pow(g.Tc, 2.5) / g.Pc, b = 0.08664 * R * g.Tc / g.Pc, s = Math.sqrt(T);
    return { b, P: (V) => R * T / (V - b) - a / (s * V * (V + b)), A: (V) => -R * T * Math.log(V - b) + a / (b * s) * Math.log(V / (V + b)),
      Tc: g.Tc, Vc: R * g.Tc / (3 * g.Pc), rep: (V) => V / (V - b), att: (V) => a / (s * R * T * (V + b)) };
  }
  /* 압력 P에서의 몰 부피: 모든 근을 찾아 G = A + PV가 가장 작은 근 */
  function volume(m, P, T) {
    const lo = Math.log(m.b * 1.0005), hi = Math.log(Math.max(R * T / P * 20, m.b * 50)), N = 500;
    const roots = []; let pv = lo, pf = m.P(Math.exp(lo)) - P;
    for (let i = 1; i <= N; i++) {
      const x = lo + (hi - lo) * i / N, fx = m.P(Math.exp(x)) - P;
      if (pf * fx <= 0) {
        let a = pv, c = x, fa = pf;
        for (let k = 0; k < 50; k++) { const mid = (a + c) / 2, fm = m.P(Math.exp(mid)) - P; if (fa * fm <= 0) c = mid; else { a = mid; fa = fm; } }
        roots.push(Math.exp((a + c) / 2));
      }
      pv = x; pf = fx;
    }
    if (!roots.length) return R * T / P;
    let best = roots[0], gb = Infinity;
    for (const V of roots) { const gv = m.A(V) + P * V; if (gv < gb) { gb = gv; best = V; } }
    return best;
  }

  const { ctx, size } = fit(cv, () => draw());
  const PMAX = 600, ZMAX = 2.2;

  function curve(e, T) {
    const m = model(G[gas], e, T), out = [];
    for (let i = 0; i <= 240; i++) { const P = 1 + (PMAX - 1) * i / 240, V = volume(m, P, T); out.push([P, P * V / (R * T), V < m.Vc && T < m.Tc]); }
    return out;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const T = +sT.value, Pp = +sP.value;
    const x0 = 40, x1 = w - 12, y1 = 22, y0 = h - 34;
    const X = (P) => x0 + P / PMAX * (x1 - x0), Y = (z) => y0 - Math.min(z, ZMAX) / ZMAX * (y0 - y1);
    const xt = []; for (let P = 0; P <= PMAX; P += 100) xt.push([P, `${P}`]);
    const yt = []; for (let z = 0; z <= ZMAX + 1e-9; z += 0.5) yt.push([z, z.toFixed(1)]);
    NM.axes(ctx, { x0, y0: y1, w: x1 - x0, h: y0 - y1, xt, yt, X, Y, xlabel: "압력 P (bar)", ylabel: "Z = PV/RT" });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    /* 이상 기체 */
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(0), Y(1)); ctx.lineTo(X(PMAX), Y(1)); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("이상 기체 Z = 1", x1 - 2, Y(1) + 13);
    const drawC = (pts, col, dash, lw) => {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath();
      pts.forEach(([P, z], i) => {
        const jump = i && Math.abs(z - pts[i - 1][1]) > 0.15;
        if (!i || jump) { if (jump) { ctx.stroke(); ctx.save(); ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(pts[i - 1][0]), Y(pts[i - 1][1])); ctx.lineTo(X(P), Y(z)); ctx.stroke(); ctx.restore(); ctx.beginPath(); } ctx.moveTo(X(P), Y(z)); }
        else ctx.lineTo(X(P), Y(z));
      });
      ctx.stroke(); ctx.setLineDash([]);
    };
    const other = eos === "vdw" ? "rk" : "vdw";
    const cO = curve(other, T), cM = curve(eos, T);
    drawC(cO, "#8a8f9a", [5, 4], 1.4);
    drawC(cM, "#3f6fa3", [], 2.4);
    /* 응축 표시 */
    const liqAt = cM.findIndex((p) => p[2]);
    if (liqAt > 0) {
      ctx.fillStyle = "#3f6fa3"; ctx.textAlign = "left"; ctx.font = `10.5px ${F.sans}`;
      ctx.fillText(`약 ${Math.round(cM[liqAt][0])} bar에서 응축 → 액체`, Math.min(X(cM[liqAt][0]) + 8, x1 - 150), Y(cM[liqAt][1]) + 18);
    }
    /* 살펴보는 점 */
    const m = model(G[gas], eos, T), V = volume(m, Pp, T), z = Pp * V / (R * T);
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(Pp), y1); ctx.lineTo(X(Pp), y0); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(X(Pp), Y(z), 5, 0, Math.PI * 2); ctx.fill();
    /* 범례 */
    ctx.textAlign = "left"; ctx.font = `10.5px ${F.sans}`;
    const nm = { vdw: "반데르발스", rk: "레들리히–퀑" };
    ctx.fillStyle = "#3f6fa3"; ctx.fillText(`실선: ${G[gas].n} ${T} K, ${nm[eos]}`, x0 + 8, y1 + 12);
    ctx.fillStyle = "#6d717a"; ctx.fillText(`점선: 같은 조건, ${nm[other]}`, x0 + 8, y1 + 27);
    return { V, z, m };
  }

  function update() {
    root.querySelectorAll("[data-g]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.g === gas)));
    root.querySelectorAll("[data-e]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.e === eos)));
    $(".t-out").textContent = sT.value; $(".p-out").textContent = sP.value;
    const T = +sT.value, P = +sP.value, g = G[gas], m = model(g, eos, T), V = volume(m, P, T), z = P * V / (R * T);
    const phase = V < m.Vc && T < m.Tc ? " (액체)" : "";
    $(".n-v").textContent = `${(R * T / P).toFixed(4)} / ${V.toFixed(4)} L/mol${phase}`;
    $(".n-z").textContent = z.toFixed(3);
    $(".n-t").textContent = `${m.rep(V).toFixed(3)} / −${m.att(V).toFixed(3)}`;
    $(".n-b").textContent = `${Math.round(g.a / (R * g.b))} K`;
    $(".n-c").textContent = `${(8 * g.a / (27 * R * g.b)).toFixed(1)} K / ${g.Tc} K`;
    draw();
  }
  root.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => { gas = b.dataset.g; update(); }));
  root.querySelectorAll("[data-e]").forEach((b) => b.addEventListener("click", () => { eos = b.dataset.e; update(); }));
  sT.addEventListener("input", update); sP.addEventListener("input", update);
  if (/[?&]demo\b/.test(location.search)) { gas = "CO2"; sT.value = 290; sP.value = 150; }
  update();
})();
