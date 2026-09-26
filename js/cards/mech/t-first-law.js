/* 카드: 기체에 준 열은 어디에 쓰일까? — 단원자 이상 기체 1 mol의 네 가지 과정, P–V 경로와 Q = ΔU + W */
(() => {
  const root = document.getElementById("card-mech-first-law");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sX = $(".x"), oX = $(".x-out"), lab = $(".lab"), unit = $(".unit");
  const nQ = $(".n-q"), nU = $(".n-u"), nW = $(".n-w"), nT = $(".n-t");
  const R = 8.314, n = 1, T1 = 300, V1 = n * R * T1 / 1e5;   // m³ (P1 = 100 kPa)
  const P1 = n * R * T1 / V1;
  let proc = "v";

  function solve() {
    const x = +sX.value;
    if (proc === "a") {   // 단열: 부피 비 f = 2^(x/100) (0.5 ~ 2)
      const f = 2 ** (x / 100), V2 = V1 * f, T2 = T1 * f ** (-2 / 3), dU = 1.5 * n * R * (T2 - T1);
      return { Q: 0, dU, W: -dU, T2, V2, P2: n * R * T2 / V2, path: (s) => { const V = V1 * f ** s; return [V, P1 * (V1 / V) ** (5 / 3)]; } };
    }
    const Q = x * 20;   // −2000 ~ 2000 J
    if (proc === "v") { const T2 = T1 + Q / (1.5 * n * R); return { Q, dU: Q, W: 0, T2, V2: V1, P2: n * R * T2 / V1, path: (s) => [V1, P1 + (n * R * T2 / V1 - P1) * s] }; }
    if (proc === "p") { const dT = Q / (2.5 * n * R), T2 = T1 + dT, V2 = n * R * T2 / P1; return { Q, dU: 1.5 * n * R * dT, W: n * R * dT, T2, V2, P2: P1, path: (s) => [V1 + (V2 - V1) * s, P1] }; }
    const V2 = V1 * Math.exp(Q / (n * R * T1));   // 등온
    return { Q, dU: 0, W: Q, T2: T1, V2, P2: n * R * T1 / V2, path: (s) => { const V = V1 * (V2 / V1) ** s; return [V, n * R * T1 / V]; } };
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = solve();
    const gx = 50, gy = h - 34, gw = w * 0.6 - gx, gh = h - 60;
    const Vmin = 0.008, Vmax = 0.055, Pmin = 0, Pmax = 250000;
    const X = (V) => gx + (V - Vmin) / (Vmax - Vmin) * gw, Y = (P) => gy - (P - Pmin) / (Pmax - Pmin) * gh;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    [0, 100, 200].forEach((p) => ctx.fillText(`${p}`, gx - 5, Y(p * 1000) + 3));
    ctx.textAlign = "center"; [10, 20, 30, 40, 50].forEach((v) => ctx.fillText(`${v}`, X(v / 1000), gy + 13));
    ctx.fillText("부피 V (L)", gx + gw / 2, gy + 26); ctx.save(); ctx.translate(14, gy - gh / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("압력 P (kPa)", 0, 0); ctx.restore();
    // 등온선 (참고)
    ctx.strokeStyle = C.rule; ctx.setLineDash([3, 4]); ctx.beginPath();
    for (let i = 0; i <= 60; i++) { const V = Vmin + (Vmax - Vmin) * i / 60, P = n * R * T1 / V; if (P > Pmax) continue; ctx.lineTo(X(V), Y(P)); } ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("300 K 등온선", X(0.05), Y(n * R * T1 / 0.05) - 5);
    // 경로 아래 넓이(=일)
    const pts = []; for (let i = 0; i <= 50; i++) pts.push(s.path(i / 50));
    ctx.fillStyle = s.W >= 0 ? "rgba(59,124,42,.22)" : "rgba(181,83,47,.22)";
    ctx.beginPath(); ctx.moveTo(X(pts[0][0]), gy); pts.forEach(([V, P]) => ctx.lineTo(X(V), Y(P))); ctx.lineTo(X(pts[pts.length - 1][0]), gy); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2.6; ctx.beginPath(); pts.forEach(([V, P], i) => (i ? ctx.lineTo(X(V), Y(P)) : ctx.moveTo(X(V), Y(P)))); ctx.stroke();
    const [va, pa] = pts[0], [vb, pb] = pts[pts.length - 1];
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(va), Y(pa), 4, 0, Math.PI * 2); ctx.fill(); ctx.fillText("처음", X(va) + 6, Y(pa) - 6);
    ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.arc(X(vb), Y(pb), 5, 0, Math.PI * 2); ctx.fill(); ctx.fillText("나중", X(vb) + 6, Y(pb) + 14);
    // 에너지 막대
    const bx = w * 0.64, bw = (w - bx - 10) / 3, base = h * 0.55, sc = (h * 0.4) / 2000;
    [["Q", s.Q, "#e0a02a"], ["ΔU", s.dU, "#b5532f"], ["W", s.W, "#3b7c2a"]].forEach(([nm, v, col], i) => {
      const x = bx + i * bw + 6, hh = v * sc;
      ctx.fillStyle = col; ctx.fillRect(x, hh >= 0 ? base - hh : base, bw - 12, Math.abs(hh));
      ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(nm, x + (bw - 12) / 2, h - 12);
      ctx.font = `10.5px ${F.mono}`; ctx.fillText(`${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(0)}`, x + (bw - 12) / 2, hh >= 0 ? base - hh - 5 : base - hh + 13);
    });
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(bx, base); ctx.lineTo(w - 6, base); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("Q = ΔU + W (J)", bx + (w - bx) / 2, 16);
  }
  function update() {
    const s = solve();
    if (proc === "a") { lab.textContent = "부피 변화"; oX.textContent = (2 ** (+sX.value / 100)).toFixed(2); unit.textContent = "배"; }
    else { lab.textContent = "가한 열 Q"; oX.textContent = (+sX.value * 20).toString().replace("-", "−"); unit.textContent = "J"; }
    const f = (v) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(0)} J`;
    nQ.textContent = f(s.Q); nU.textContent = f(s.dU); nW.textContent = f(s.W); nT.textContent = `${s.T2.toFixed(0)} K`;
    root.querySelectorAll("[data-proc]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.proc === proc)));
    draw();
  }
  sX.addEventListener("input", update);
  root.querySelectorAll("[data-proc]").forEach((b) => b.addEventListener("click", () => { proc = b.dataset.proc; update(); }));
  update();
})();
