/* 카드: 안쪽 행성은 왜 암석으로, 바깥 행성은 왜 기체로 되어 있을까? — 원시 성운의 온도와 응축 온도, 눈선 */
(() => {
  const root = document.getElementById("card-esys-snowline");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sR = $(".r"), oR = $(".r-out"), nT = $(".n-t"), nS = $(".n-s"), nP = $(".n-p");
  const T = (r) => 280 * r ** -0.75;
  const MAT = [["금속 철", 1400, "#8d8d92"], ["규산염 암석", 1300, "#b5532f"], ["물 얼음", 150, "#6ea4e6"], ["메테인 얼음", 40, "#a78bd8"]];
  const PL = [["수성", 0.39], ["금성", 0.72], ["지구", 1], ["화성", 1.52], ["목성", 5.2], ["토성", 9.5], ["천왕성", 19.2], ["해왕성", 30]];
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 44, x1 = w - 14, y0 = h - 64, y1 = 20, lr0 = -1, lr1 = 1.7;
    const X = (r) => x0 + (Math.log10(r) - lr0) / (lr1 - lr0) * (x1 - x0), Y = (t) => y0 - (Math.log10(t) - 1) / (Math.log10(3000) - 1) * (y0 - y1);
    // 응축 영역 띠
    MAT.forEach(([n, tc, col], i) => { const rc = (280 / tc) ** (4 / 3); ctx.fillStyle = col + "22"; const bx = Math.max(x0, X(rc)); ctx.fillRect(bx, y0 + 20 + i * 11, x1 - bx, 9); ctx.fillStyle = col; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`${n} (고체)`, bx + 3, y0 + 28 + i * 11); });
    // 축
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    [10, 100, 1000].forEach((t) => ctx.fillText(`${t} K`, x0 - 4, Y(t) + 3));
    ctx.textAlign = "center"; [0.1, 1, 10, 50].forEach((r) => ctx.fillText(`${r} AU`, X(r), y0 + 13));
    // 온도 곡선과 응축 온도선
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 100; i++) { const r = 10 ** (lr0 + (lr1 - lr0) * i / 100); i ? ctx.lineTo(X(r), Y(T(r))) : ctx.moveTo(X(r), Y(T(r))); } ctx.stroke();
    MAT.forEach(([n, tc, col]) => { ctx.strokeStyle = col; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x0, Y(tc)); ctx.lineTo(x1, Y(tc)); ctx.stroke(); ctx.setLineDash([]); });
    // 눈선
    const rs = (280 / 150) ** (4 / 3); ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(rs), y1); ctx.lineTo(X(rs), y0); ctx.stroke();
    ctx.fillStyle = "#3f6fa3"; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`눈선 ≈ ${rs.toFixed(1)} AU`, X(rs) + 4, y1 + 12);
    // 행성
    PL.forEach(([n, r], i) => { const big = r > 4; ctx.fillStyle = big ? "#caa47c" : "#b5532f"; ctx.beginPath(); ctx.arc(X(r), Y(T(r)), big ? 7 : 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(n, X(r), Y(T(r)) - (i % 2 ? 12 : -18)); });
    // 지금 위치
    const r = 10 ** +sR.value; ctx.strokeStyle = "#e0a02a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(r), y1); ctx.lineTo(X(r), y0); ctx.stroke();
  }
  function update() {
    const r = 10 ** +sR.value, t = T(r); oR.textContent = r < 10 ? r.toFixed(2) : r.toFixed(0);
    nT.textContent = `약 ${t.toFixed(0)} K`;
    const solid = MAT.filter((m) => t < m[1]).map((m) => m[0]); nS.textContent = solid.length ? solid.join(", ") : "없음 (모두 기체)";
    const near = PL.reduce((a, p) => Math.abs(Math.log(p[1] / r)) < Math.abs(Math.log(a[1] / r)) ? p : a); nP.textContent = `${near[0]} (${near[1]} AU)`;
    draw();
  }
  sR.addEventListener("input", update); update();
})();
