/* 카드: 무거운 별은 왜 더 빨리 죽을까? — 질량–광도 관계와 주계열 수명, 진화 경로 (모식) */
(() => {
  const root = document.getElementById("card-earth-evolve");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sM = $(".mass"), oM = $(".mass-out");
  const nL = $(".lum"), nLife = $(".life"), nEnd = $(".end"), msg = $(".ev-msg");
  const TSUN = 5772;

  // 주계열 위치 (근사): L ≈ M^3.5, R ≈ M^0.8 → T = T☉ (L / R²)^(1/4)
  const msL = (M) => M ** 3.5, msR = (M) => M ** 0.8, msT = (M) => TSUN * (msL(M) / msR(M) ** 2) ** 0.25;
  const life = (M) => 1e10 * M ** -2.5;   // 주계열 수명 ≈ 100억 년 × M^−2.5
  const fate = (M) => M < 8 ? ["백색 왜성", "행성상 성운을 남기고 중심핵이 백색 왜성이 됩니다."] : M < 25 ? ["중성자별", "초신성으로 폭발하고 중심핵이 중성자별이 됩니다."] : ["블랙홀", "초신성으로 폭발하거나 곧바로 붕괴해 블랙홀이 됩니다."];

  // 진화 경로 (모식): 주계열 → 적색 거성/초거성 → 최후
  function track(M) {
    const T0 = msT(M), L0 = msL(M), p = [[T0, L0]];
    if (M < 8) {
      p.push([T0 * 0.97, L0 * 1.8], [4800, L0 * 3 + 3], [4000, Math.max(100, L0 * 60)], [3600, Math.max(1500, L0 * 300)]);
      p.push([60000, 3000], [100000, 300], [40000, 0.3], [15000, 0.005]);
    } else {
      p.push([T0 * 0.9, L0 * 1.5], [9000, L0 * 1.6], [5000, L0 * 1.7], [3500, L0 * 1.8]);
    }
    return p;
  }

  const { ctx, size } = fit(cv, () => draw());
  const lT0 = Math.log10(120000), lT1 = Math.log10(2400), lL0 = -3, lL1 = 6.5;
  let prog = 0;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const M = +sM.value;
    const x0 = 46, y0 = 22, pw = w - x0 - 10, ph = h - y0 - 36;
    const X = (T) => x0 + (Math.log10(T) - lT0) / (lT1 - lT0) * pw, Y = (L) => y0 + (1 - (Math.log10(Math.max(L, 1e-3)) - lL0) / (lL1 - lL0)) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y,
      xt: [[100000, "100000"], [30000, "30000"], [10000, "10000"], [3000, "3000 K"]],
      yt: [[1e-2, "10⁻²"], [1, "1"], [1e2, "10²"], [1e4, "10⁴"], [1e6, "10⁶"]], ylabel: "광도 (태양 = 1)", xlabel: "표면 온도 (왼쪽이 뜨거움)" });
    // 주계열 (0.3~40 M☉)
    ctx.beginPath(); for (let lm = Math.log10(0.3); lm <= Math.log10(40); lm += 0.02) { const m = 10 ** lm, x = X(msT(m)), y = Y(msL(m)); lm === Math.log10(0.3) ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.strokeStyle = "rgba(59,124,42,.35)"; ctx.lineWidth = 8; ctx.lineCap = "round"; ctx.stroke(); ctx.lineCap = "butt";
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.forest; ctx.fillText("주계열", X(msT(0.5)) - 10, Y(msL(0.5)) + 16);
    // 경로
    const P = track(M);
    ctx.beginPath(); P.forEach(([T, L], i) => i ? ctx.lineTo(X(T), Y(L)) : ctx.moveTo(X(T), Y(L)));
    ctx.strokeStyle = "rgba(201,70,61,.45)"; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]);
    // 진행 점
    const seg = prog * (P.length - 1), i = Math.min(P.length - 2, Math.floor(seg)), f = seg - i;
    const lt = Math.log10(P[i][0]) * (1 - f) + Math.log10(P[i + 1][0]) * f, ll = Math.log10(P[i][1]) * (1 - f) + Math.log10(P[i + 1][1]) * f;
    ctx.beginPath(); ctx.arc(X(10 ** lt), Y(10 ** ll), 6, 0, Math.PI * 2); ctx.fillStyle = "#c9463d"; ctx.fill();
    // 끝 이름표
    const [eT, eL] = P[P.length - 1];
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
    ctx.fillText(M < 8 ? "백색 왜성" : "초신성 →", X(eT), Y(eL) + (M < 8 ? 16 : -10));
    ctx.textAlign = "left";
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.fillText(`${M} M☉ 별의 진화 경로 (모식)`, x0 + 8, y0 + 12);
  }

  function update() {
    const M = +sM.value;
    oM.textContent = M;
    const L = msL(M), y = life(M);
    nL.textContent = L >= 100 ? `${Math.round(L).toLocaleString("ko-KR")}배` : `${L.toPrecision(2)}배`;
    nLife.textContent = y >= 1e8 ? `약 ${Math.round(y / 1e8).toLocaleString("ko-KR")}억 년` : `약 ${Math.round(y / 1e6).toLocaleString("ko-KR")}백만 년`;
    nEnd.textContent = fate(M)[0];
    msg.textContent = `질량이 태양의 ${M}배인 별은 연료도 ${M}배지만, 연료를 태우는 빠르기(광도)는 약 ${L >= 100 ? Math.round(L).toLocaleString("ko-KR") : L.toPrecision(2)}배입니다. ${fate(M)[1]}`;
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.m === M)));
    prog = NM.reduce ? 1 : 0; draw();
  }
  sM.addEventListener("input", update);
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { sM.value = b.dataset.m; update(); }));
  update();
  loop(cv, (dt) => { if (prog >= 1) return; prog = Math.min(1, prog + dt / 5); draw(); });
})();
