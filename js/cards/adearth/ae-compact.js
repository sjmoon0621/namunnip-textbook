/* 카드: 별이 남긴 중심핵은 얼마나 무거워질 수 있을까? — 백색 왜성 질량–반지름 관계, 중성자별, 슈바르츠실트 반지름 */
(() => {
  const root = document.getElementById("card-adearth-compact");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sM = $(".m"), oM = $(".m-out"), cNR = $(".nr");
  const nKind = $(".n-kind"), nR = $(".n-r"), nRho = $(".n-rho"), nV = $(".n-v");
  const RSUN = 695700, G = 6.674e-8, MSUN = 1.989e33, CL = 2.998e10, NSMAX = 2.2, NSR = 12;
  let mu = 2;
  const mch = () => 5.816 / (mu * mu);
  /* Nauenberg(1972): R/R☉ = (0.0225/μe) x^(-1/3) sqrt(1 − x^(4/3)), x = M/M_Ch. 결과는 km */
  const rWD = (m, nr) => { const x = m / mch(); if (!nr && x >= 1) return NaN; const s = nr ? 1 : Math.sqrt(1 - Math.pow(x, 4 / 3)); return 0.0225 / mu * Math.pow(x, -1 / 3) * s * RSUN; };
  const rS = (m) => 2.953 * m;
  /* 측정값: [이름, 질량 M☉, 반지름 km, 종류] */
  const OBS = [
    ["시리우스 B", 1.018, 0.0081 * RSUN, "wd"],
    ["에리다누스 40 B", 0.573, 0.01308 * RSUN, "wd"],
    ["프로키온 B", 0.592, 0.01234 * RSUN, "wd"],
    ["J0030+0451", 1.34, 12.71, "ns"],
    ["J0740+6620", 2.08, 12.39, "ns"],
  ];
  const { ctx, size } = fit(cv, () => draw());
  const sup = (e) => String(e).replace(/-/g, "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
  const sci = (v) => { const e = Math.floor(Math.log10(v)); return `${(v / 10 ** e).toFixed(1)}×10${sup(e)}`; };
  function state() {
    const m = 10 ** +sM.value;
    if (m < mch()) return { m, kind: "백색 왜성", r: rWD(m, false) };
    if (m < NSMAX) return { m, kind: "중성자별", r: NSR };
    return { m, kind: "블랙홀", r: rS(m) };
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 50, y0 = 16, gw = w - x0 - 14, gh = h - y0 - 38;
    const lx0 = -1, lx1 = Math.log10(30), ly0 = 0, ly1 = 4.5;
    const X = (m) => x0 + (Math.log10(m) - lx0) / (lx1 - lx0) * gw;
    const Y = (r) => y0 + gh - (Math.log10(r) - ly0) / (ly1 - ly0) * gh;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, gw, gh); ctx.clip();
    /* 블랙홀 영역: R < Rs */
    ctx.fillStyle = "rgba(35,35,38,.08)"; ctx.beginPath(); ctx.moveTo(X(0.1), Y(rS(0.1))); ctx.lineTo(X(30), Y(rS(30))); ctx.lineTo(X(30), y0 + gh); ctx.lineTo(X(0.1), y0 + gh); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(X(0.1), Y(rS(0.1))); ctx.lineTo(X(30), Y(rS(30))); ctx.stroke();
    /* 지구 반지름 */
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 4]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(6371)); ctx.lineTo(x0 + gw, Y(6371)); ctx.stroke(); ctx.setLineDash([]);
    /* 중성자별 띠 (모식) */
    ctx.fillStyle = "rgba(63,111,163,.18)"; ctx.fillRect(X(1.1), Y(14), X(NSMAX) - X(1.1), Y(10) - Y(14));
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 1; ctx.strokeRect(X(1.1), Y(14), X(NSMAX) - X(1.1), Y(10) - Y(14));
    /* 백색 왜성 곡선 */
    if (cNR.checked) {
      ctx.strokeStyle = C.amber; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]); ctx.beginPath();
      for (let i = 0; i <= 200; i++) { const m = 10 ** (lx0 + i / 200 * (lx1 - lx0)); const r = rWD(m, true); i ? ctx.lineTo(X(m), Y(r)) : ctx.moveTo(X(m), Y(r)); }
      ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.2; ctx.beginPath();
    const mc = mch(); let first = true;
    for (let i = 0; i <= 400; i++) { const m = 10 ** (lx0 + i / 400 * (Math.log10(mc) - lx0)); const r = rWD(Math.min(m, mc * 0.99999), false); if (r < 1) break; first ? ctx.moveTo(X(m), Y(r)) : ctx.lineTo(X(m), Y(r)); first = false; }
    ctx.stroke();
    ctx.restore();
    /* 찬드라세카르 한계 */
    ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(mc), y0); ctx.lineTo(X(mc), y0 + gh); ctx.stroke(); ctx.setLineDash([]);
    /* 축 */
    NM.axes(ctx, { x0, y0, w: gw, h: gh, X, Y,
      xt: [[0.1, "0.1"], [0.3, "0.3"], [1, "1"], [3, "3"], [10, "10"], [30, "30"]],
      yt: [[1, "1"], [10, "10"], [100, "100"], [1000, "10³"], [10000, "10⁴"]],
      xlabel: "질량 (M☉)", ylabel: "반지름 (km)" });
    /* 이름표 */
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = C.warn; ctx.fillText(`M_Ch = ${mc.toFixed(2)}`, X(mc) + 4, y0 + 12);
    ctx.fillStyle = C.forest; ctx.fillText("백색 왜성", X(0.15), Y(rWD(0.15, false)) + 20);
    ctx.fillStyle = "#3f6fa3"; ctx.fillText("중성자별 (모식)", X(1.1), Y(10) + 14);
    ctx.fillStyle = C.ink; ctx.save(); ctx.translate(X(9), Y(rS(9)) - 6); ctx.rotate(-Math.atan2(Y(1) - Y(10), X(10) - X(1))); ctx.fillText("슈바르츠실트 반지름 2GM/c²", -60, 0); ctx.restore();
    ctx.fillStyle = C.ink3; ctx.fillText("블랙홀 안 (R < R_s)", X(4), Y(1.6));
    ctx.fillText("지구 반지름", x0 + gw - 70, Y(6371) - 5);
    if (cNR.checked) { ctx.fillStyle = C.amber; ctx.fillText("상대론 무시", X(3), Y(rWD(3, true)) - 8); }
    /* 측정값 */
    ctx.font = `10px ${F.sans}`;
    for (const [nm, m, r, k] of OBS) {
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(m), Y(r), 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ink2;
      const dy = nm === "에리다누스 40 B" ? 14 : nm === "J0740+6620" ? 14 : -7;
      ctx.textAlign = nm === "에리다누스 40 B" || nm === "J0030+0451" ? "right" : "left";
      ctx.fillText(nm, X(m) + (ctx.textAlign === "right" ? -5 : 5), Y(r) + dy);
    }
    /* 현재 중심핵 */
    const s = state();
    ctx.fillStyle = C.apple; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(X(s.m), Y(s.r), 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  function update() {
    root.querySelectorAll("[data-mu]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.mu === mu)));
    const s = state();
    oM.textContent = s.m < 10 ? s.m.toFixed(2) : s.m.toFixed(1);
    nKind.textContent = s.kind;
    nR.textContent = s.r >= 100 ? `${Math.round(s.r).toLocaleString()} km` : `${s.r.toFixed(1)} km`;
    const rcm = s.r * 1e5, rho = s.m * MSUN / (4 / 3 * Math.PI * rcm ** 3);
    nRho.textContent = `${sci(rho)} g/cm³`;
    const v = Math.min(1, Math.sqrt(2 * G * s.m * MSUN / rcm) / CL);
    nV.textContent = v >= 0.999 ? "c (빛도 못 나옴)" : `${v < 0.1 ? v.toFixed(3) : v.toFixed(2)} c`;
    draw();
  }
  root.querySelectorAll("[data-mu]").forEach((b) => b.addEventListener("click", () => { mu = +b.dataset.mu; update(); }));
  sM.addEventListener("input", update); cNR.addEventListener("change", update);
  update();
})();
