/* 카드: 같은 곳에 도착해도 길에 따라 열과 일이 달라질까? — 이상 기체 1 mol, 세 경로의 q, w, ΔU */
(() => {
  const root = document.getElementById("card-adchem-path");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sP = $(".pb"), sV = $(".vb");
  const R = 8.314, PA = 1.0, VA = 24.8;
  const COL = ["#3f6fa3", C.warn, C.forest];
  const NAMES = ["①", "②", "③"];
  let path = 0, cvR = 1.5;

  /* 경로별 계가 받은 일 w (J). 1 bar·L = 100 J */
  function calc(PB, VB) {
    const dV = VB - VA;
    const w = [-PB * dV * 100, -PA * dV * 100, -(PA + PB) / 2 * dV * 100];
    const dU = cvR * (PB * VB - PA * VA) * 100;
    return w.map((wi) => ({ w: wi, dU, q: dU - wi }));
  }
  const corners = (PB, VB) => [
    [[VA, PA], [VA, PB], [VB, PB]],
    [[VA, PA], [VB, PA], [VB, PB]],
    [[VA, PA], [VB, PB]],
  ];
  const kJ = (x) => (x / 1000).toFixed(2).replace("-", "−");

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const PB = +sP.value, VB = +sV.value, res = calc(PB, VB);
    /* 왼쪽: P–V 도표 */
    const lx0 = 40, lx1 = w * 0.5 - 10, ly0 = h - 30, ly1 = 18;
    const X = (v) => lx0 + v / 55 * (lx1 - lx0), Y = (p) => ly0 - p / 3.2 * (ly0 - ly1);
    NM.axes(ctx, { x0: lx0, y0: ly1, w: lx1 - lx0, h: ly0 - ly1, X, Y,
      xt: [[0, "0"], [20, "20"], [40, "40"]], yt: [[0, "0"], [1, "1"], [2, "2"], [3, "3"]], xlabel: "V (L)", ylabel: "P (bar)" });
    /* 선택 경로 아래 넓이 = 기체가 한 일 */
    const cs = corners(PB, VB)[path];
    ctx.fillStyle = "rgba(63,111,163,.13)";
    if (path === 0) ctx.fillStyle = "rgba(63,111,163,.13)";
    else if (path === 1) ctx.fillStyle = "rgba(181,83,47,.13)";
    else ctx.fillStyle = "rgba(59,124,42,.13)";
    ctx.beginPath(); ctx.moveTo(X(cs[0][0]), Y(0));
    cs.forEach(([v, p]) => ctx.lineTo(X(v), Y(p)));
    ctx.lineTo(X(cs[cs.length - 1][0]), Y(0)); ctx.closePath(); ctx.fill();
    corners(PB, VB).forEach((pts, i) => {
      ctx.strokeStyle = COL[i]; ctx.lineWidth = i === path ? 2.6 : 1.2;
      ctx.setLineDash(i === path ? [] : [4, 3]);
      ctx.beginPath(); pts.forEach(([v, p], k) => k ? ctx.lineTo(X(v), Y(p)) : ctx.moveTo(X(v), Y(p))); ctx.stroke();
    });
    ctx.setLineDash([]);
    [[VA, PA, "A"], [VB, PB, "B"]].forEach(([v, p, s]) => {
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(v), Y(p), 4, 0, Math.PI * 2); ctx.fill();
      ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(s, X(v) + 6, Y(p) - 6);
    });
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillText(VB >= VA ? "칠한 넓이 = 기체가 한 일 (−w)" : "칠한 넓이 = 기체가 받은 일 (w)", lx1, ly1 + 4);

    /* 오른쪽: 경로별 q, w, ΔU 막대 */
    const rx0 = w * 0.5 + 34, rx1 = w - 8, ry0 = 30, ry1 = h - 30, mid = (ry0 + ry1) / 2;
    let m = 1; res.forEach((r) => { m = Math.max(m, Math.abs(r.q), Math.abs(r.w), Math.abs(r.dU)); });
    m = Math.ceil(m / 2000) * 2000;
    const BY = (x) => mid - x / m * (ry1 - ry0) / 2;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(rx0, BY(m)); ctx.lineTo(rx0, BY(-m)); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(rx0, mid); ctx.lineTo(rx1, mid); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
    [m, 0, -m].forEach((v) => ctx.fillText(kJ(v), rx0 - 4, BY(v) + 3));
    ctx.textAlign = "left"; ctx.fillText("kJ", rx0 - 30, ry0 - 14);
    const gw = (rx1 - rx0) / 3, bw = Math.min(16, gw / 4.2);
    res.forEach((r, i) => {
      const gx = rx0 + gw * i + gw / 2;
      [["q", r.q], ["w", r.w], ["ΔU", r.dU]].forEach(([lab, v], k) => {
        const x = gx + (k - 1) * (bw + 3) - bw / 2;
        ctx.globalAlpha = i === path ? 1 : 0.35;
        ctx.fillStyle = k === 2 ? C.ink : COL[i];
        const y = BY(Math.max(v, 0)), hh = Math.abs(BY(v) - mid);
        ctx.fillRect(x, y, bw, Math.max(hh, 1));
        ctx.globalAlpha = 1;
        ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
        ctx.fillText(lab, x + bw / 2, v >= 0 ? mid + 12 : mid - 5);
      });
      ctx.fillStyle = i === path ? COL[i] : C.ink3; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText("경로 " + NAMES[i], gx, h - 10);
    });
  }

  function update() {
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.p === path)));
    root.querySelectorAll("[data-g]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.g === cvR)));
    const PB = +sP.value, VB = +sV.value, r = calc(PB, VB)[path];
    $(".pb-out").textContent = PB.toFixed(2); $(".vb-out").textContent = VB.toFixed(1);
    const TA = PA * VA * 100 / R, TB = PB * VB * 100 / R;
    $(".n-t").textContent = `${TA.toFixed(0)} → ${TB.toFixed(0)} K`;
    $(".n-q").textContent = kJ(r.q) + " kJ"; $(".n-w").textContent = kJ(r.w) + " kJ"; $(".n-u").textContent = kJ(r.dU) + " kJ";
    draw();
  }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { path = +b.dataset.p; update(); }));
  root.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => { cvR = +b.dataset.g; update(); }));
  sP.addEventListener("input", update); sV.addEventListener("input", update);
  update();
})();
