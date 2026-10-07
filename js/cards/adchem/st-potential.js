/* 카드: 두 입자를 가까이 가져가면 에너지는 어떻게 변할까? — U(r) 곡선과 F = −dU/dr */
(() => {
  const root = document.getElementById("card-adchem-potential");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sR = $(".r"), cP = $(".parts");
  const KC = 138935; /* N_A·e²/(4πε₀) in kJ·pm/mol */
  const B8 = KC * Math.pow(236, 7) / 8;
  const P = {
    h2: {
      name: "H–H", re: 74.1, x0: 30, x1: 300, De: 458,
      U: (r) => 458 * ((1 - Math.exp(-0.0194 * (r - 74.1))) ** 2 - 1),
    },
    nacl: {
      name: "Na⁺–Cl⁻", re: 236, x0: 170, x1: 1100, De: KC / 236 * (7 / 8),
      U: (r) => -KC / r + B8 / r ** 8,
      att: (r) => -KC / r, rep: (r) => B8 / r ** 8, atoms: -147,
    },
    ar: {
      name: "Ar···Ar", re: 376, x0: 310, x1: 800, De: 1.19,
      U: (r) => 1.19 * ((376 / r) ** 12 - 2 * (376 / r) ** 6),
      att: (r) => -2 * 1.19 * (376 / r) ** 6, rep: (r) => 1.19 * (376 / r) ** 12,
    },
  };
  let key = "h2";
  const rNow = () => { const p = P[key]; return p.x0 + (+sR.value) * (p.x1 - p.x0); };
  const dU = (r) => (P[key].U(r + 0.01) - P[key].U(r - 0.01)) / 0.02;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[key], r = rNow();
    const yTop = p.De * 0.9, yBot = -p.De * 1.18;
    const L = 48, Rr = w - 10, T = 14, Bm = h - 30;
    const X = (v) => L + (v - p.x0) / (p.x1 - p.x0) * (Rr - L), Y = (u) => T + (yTop - u) / (yTop - yBot) * (Bm - T);
    const yt = [], st = p.De > 100 ? 200 : 0.5;
    for (let u = Math.ceil(yBot / st) * st; u <= yTop; u += st) yt.push([u, p.De > 100 ? `${u}` : u.toFixed(1)]);
    const xs = p.x1 - p.x0 > 600 ? 200 : p.x1 - p.x0 > 300 ? 100 : 50, xt = [];
    for (let v = Math.ceil(p.x0 / xs) * xs; v <= p.x1; v += xs) xt.push([v, `${v}`]);
    NM.axes(ctx, { x0: L, y0: T, w: Rr - L, h: Bm - T, X, Y, xt, yt, xlabel: "r (pm)", ylabel: "U (kJ/mol)" });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L, Y(0) + .5); ctx.lineTo(Rr, Y(0) + .5); ctx.stroke();
    const curve = (f, col, wd, dash) => {
      ctx.save(); ctx.beginPath(); ctx.rect(L, T, Rr - L, Bm - T); ctx.clip();
      ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.setLineDash(dash || []); ctx.beginPath();
      for (let i = 0; i <= 400; i++) { const v = p.x0 + i / 400 * (p.x1 - p.x0), u = Math.max(yBot * 3, Math.min(yTop * 3, f(v))); i ? ctx.lineTo(X(v), Y(u)) : ctx.moveTo(X(v), Y(u)); }
      ctx.stroke(); ctx.restore();
    };
    if (cP.checked && p.att) { curve(p.att, "#3f6fa3", 1.4, [5, 4]); curve(p.rep, C.apple, 1.4, [5, 4]); }
    if (p.atoms) {
      ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(L, Y(p.atoms)); ctx.lineTo(Rr, Y(p.atoms)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("중성 원자 Na + Cl (−147)", Rr - 4, Y(p.atoms) - 5);
    }
    curve(p.U, C.forest, 2.4);
    /* 평형 표시 */
    ctx.strokeStyle = C.amber; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(p.re), Y(0)); ctx.lineTo(X(p.re), Y(-p.De)); ctx.stroke(); ctx.setLineDash([]);
    /* 현재 점과 힘 화살표 */
    const u = p.U(r), fx = -dU(r), px = X(r), py = Y(Math.max(yBot, Math.min(yTop, u)));
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(px, py, 5, 0, 7); ctx.fill();
    const fmax = Math.abs(p.De / (p.re * 0.3)), len = Math.min(70, Math.abs(fx) / fmax * 70);
    if (len > 2) {
      const dir = fx > 0 ? 1 : -1, ay = py - 18;
      ctx.strokeStyle = fx > 0 ? C.apple : "#3f6fa3"; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(px, ay); ctx.lineTo(px + dir * len, ay); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px + dir * (len + 7), ay); ctx.lineTo(px + dir * len, ay - 5); ctx.lineTo(px + dir * len, ay + 5); ctx.fill();
      ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(fx > 0 ? "척력" : "인력", px + dir * len / 2, ay - 7);
    }
    /* 범례 */
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    const leg = [[C.forest, "U(r)"]];
    if (cP.checked && p.att) leg.push(["#3f6fa3", "인력 항"], [C.apple, "반발 항"]);
    const tw = leg.reduce((t, [, x]) => t + ctx.measureText(x).width + 32, 0);
    let lx = Rr - tw; const ly = T + 14;
    leg.forEach(([c, t]) => { ctx.fillStyle = c; ctx.fillRect(lx, ly - 4, 14, 3); ctx.fillStyle = C.ink2; ctx.fillText(t, lx + 18, ly); lx += ctx.measureText(t).width + 32; });
    if (!p.att && cP.checked) { ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("(모스 퍼텐셜은 두 항으로 나누지 않음)", Rr, ly + 16); }
  }
  function update() {
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === key)));
    const p = P[key], r = rNow(), u = p.U(r), f = -dU(r);
    $(".r-out").textContent = r.toFixed(0);
    $(".n-u").textContent = `${Math.abs(u) < 10 ? u.toFixed(2) : u.toFixed(0)} kJ/mol`;
    const nN = f * 1.6605;
    $(".n-f").textContent = Math.abs(nN) < 0.0005 ? "≈ 0" : `${nN > 0 ? "척력 " : "인력 "}${Math.abs(nN) < 0.1 ? Math.abs(nN).toFixed(4) : Math.abs(nN).toFixed(2)} nN`;
    $(".n-e").textContent = `${p.re.toFixed(0)} pm · ${p.De < 10 ? p.De.toFixed(2) : p.De.toFixed(0)}`;
    draw();
  }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => {
    key = b.dataset.p; const p = P[key]; sR.value = ((p.re * 1.35 - p.x0) / (p.x1 - p.x0)).toFixed(3); update();
  }));
  sR.addEventListener("input", update); cP.addEventListener("change", update);
  sR.value = ((74.1 * 1.35 - 30) / 270).toFixed(3);
  update();
})();
