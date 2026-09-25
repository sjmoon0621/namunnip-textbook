/* 카드: 축전기는 전기 에너지를 어떻게 저장할까? — 평행판 축전기, 전지 연결/분리, Q–V 그래프의 넓이 */
(() => {
  const root = document.getElementById("card-phy-capacitor");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const aIn = $(".area"), aOut = $(".area-out"), dIn = $(".gap"), dOut = $(".gap-out"), vIn = $(".volt"), vOut = $(".volt-out");
  const nC = $(".n-c"), nQ = $(".n-q"), nV = $(".n-v"), nU = $(".n-u"), nE = $(".n-e"), nR = $(".n-ratio");
  const BLUE = "#2f6fa3";
  const EPS0 = 8.854e-12;
  let kappa = 1, connected = true, Qfix = 0, ref = null;

  const cap = () => kappa * EPS0 * (+aIn.value * 1e-4) / (+dIn.value * 1e-3); // F
  function state() {
    const c = cap();
    const q = connected ? c * +vIn.value : Qfix;
    const v = q / c;
    return { c, q, v, u: 0.5 * q * v, e: v / (+dIn.value * 1e-3) };
  }
  const setRef = () => { ref = state(); };

  const P = fit(cv, () => draw());
  const nice = (x) => { const e = 10 ** Math.floor(Math.log10(x)), m = x / e; return ([1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((k) => m <= k + 1e-9)) * e; };

  function draw() {
    const { ctx, size: { w, h } } = P;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = state(), narrow = w < 520;
    const lw = w * (narrow ? 0.48 : 0.5);

    // ── 왼쪽: 옆에서 본 축전기
    const gap = 14 + (+dIn.value - 0.5) / 4.5 * (narrow ? 44 : 70);     // 간격 → 픽셀 (모식 배율)
    const plen = (h - 70) * (0.45 + 0.55 * Math.sqrt((+aIn.value - 50) / 350)); // 판 길이 ∝ √넓이
    const cx = lw * 0.62, cy = h * 0.47, xl = cx - gap / 2, xr = cx + gap / 2, yt = cy - plen / 2, yb = cy + plen / 2;
    // 유전체
    if (kappa > 1) { ctx.fillStyle = "rgba(116,171,102,.18)"; ctx.fillRect(xl, yt, gap, plen); }
    // 전기장 선: 개수 ∝ E (모식)
    const nE_ = clamp(Math.round(s.e / 1500), 0, 16);
    ctx.strokeStyle = "rgba(35,35,38,.3)"; ctx.fillStyle = "rgba(35,35,38,.3)"; ctx.lineWidth = 1;
    for (let i = 0; i < nE_; i++) {
      const y = yt + (i + 0.5) * plen / nE_;
      ctx.beginPath(); ctx.moveTo(xl + 3, y); ctx.lineTo(xr - 4, y); ctx.stroke();
      if (gap > 20) { ctx.beginPath(); ctx.moveTo(xr - 3, y); ctx.lineTo(xr - 8, y - 2.5); ctx.lineTo(xr - 8, y + 2.5); ctx.fill(); }
    }
    // 판
    ctx.fillStyle = C.ink; ctx.fillRect(xl - 5, yt, 5, plen); ctx.fillRect(xr, yt, 5, plen);
    // 자유 전하: 개수 ∝ √Q (모식), 유전체 표면의 분극 전하 ∝ Q(1 − 1/κ)
    const qn = s.q * 1e9, nq = clamp(Math.round(4 * Math.sqrt(qn)), 0, 26);
    ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center";
    for (let i = 0; i < nq; i++) {
      const y = yt + (i + 0.5) * plen / nq + 4;
      ctx.fillStyle = C.warn; ctx.fillText("+", xl - 12, y);
      ctx.fillStyle = BLUE; ctx.fillText("−", xr + 12, y);
    }
    const nb = Math.round(nq * (1 - 1 / kappa));
    ctx.font = `9px ${F.mono}`;
    for (let i = 0; i < nb; i++) {
      const y = yt + (i + 0.5) * plen / nb + 3;
      ctx.fillStyle = "rgba(47,111,163,.8)"; ctx.fillText("−", xl + 5, y);
      ctx.fillStyle = "rgba(181,83,47,.8)"; ctx.fillText("+", xr - 5, y);
    }
    // 전지와 스위치
    const bx = lw * 0.14, wireY0 = yt - 16, wireY1 = yb + 16;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(xl - 3, yt); ctx.lineTo(xl - 3, wireY0); ctx.lineTo(bx, wireY0); ctx.lineTo(bx, cy - 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx, cy + 12); ctx.lineTo(bx, wireY1);
    const swx = (bx + xr) / 2;
    ctx.lineTo(swx - 12, wireY1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(swx + 12, wireY1); ctx.lineTo(xr + 3, wireY1); ctx.lineTo(xr + 3, yb); ctx.stroke();
    // 스위치 날
    ctx.beginPath(); ctx.moveTo(swx - 12, wireY1);
    if (connected) ctx.lineTo(swx + 12, wireY1); else ctx.lineTo(swx + 8, wireY1 - 13);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(swx - 12, wireY1, 2.5, 0, Math.PI * 2); ctx.arc(swx + 12, wireY1, 2.5, 0, Math.PI * 2); ctx.fillStyle = C.ink2; ctx.fill();
    // 전지 기호
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(bx - 12, cy - 5); ctx.lineTo(bx + 12, cy - 5); ctx.stroke();
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bx - 6, cy + 5); ctx.lineTo(bx + 6, cy + 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx, cy - 5); ctx.lineTo(bx, cy - 12); ctx.moveTo(bx, cy + 5); ctx.lineTo(bx, cy + 12); ctx.lineWidth = 1.4; ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText(`${vIn.value} V`, bx + 15, cy + 4);
    ctx.fillStyle = connected ? C.forest : C.warn; ctx.textAlign = "center";
    ctx.fillText(connected ? "연결" : "분리", swx, wireY1 + 16);
    ctx.fillStyle = C.ink3;
    ctx.fillText(`d = ${(+dIn.value).toFixed(1)} mm`, cx, h - 6);

    // ── 오른쪽: Q–V 그래프 (기준 상태와 비교)
    const gx = lw + (narrow ? 30 : 44), gw = w - gx - 12, gy = 24, gh = h - gy - 34;
    const vmax = nice(Math.max(12, s.v, ref.v) * 1.05), qmax = nice(Math.max(s.q, ref.q, s.c * 12, ref.c * 12) * 1.05);
    const X = (v) => gx + v / vmax * gw, Y = (q) => gy + gh - q / qmax * gh;
    const tick = (m, n) => Array.from({ length: n + 1 }, (_, i) => m * i / n);
    NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y,
      xt: tick(vmax, 4).map((v) => [v, `${+v.toFixed(1)}`]),
      yt: tick(qmax, 4).map((q) => [q, `${+(q * 1e9).toPrecision(3)}`]),
      ylabel: "Q (nC)", xlabel: "V (볼트)" });
    // 기준 상태
    ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
    const vEnd = (c) => Math.min(vmax, qmax / c);
    ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(vEnd(ref.c)), Y(ref.c * vEnd(ref.c))); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(X(ref.v), Y(ref.q), 3.5, 0, Math.PI * 2); ctx.fillStyle = C.ink3; ctx.fill();
    // 현재 상태: 넓이 = ½QV
    ctx.fillStyle = "rgba(116,171,102,.28)";
    ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(s.v), Y(s.q)); ctx.lineTo(X(s.v), Y(0)); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(vEnd(s.c)), Y(s.c * vEnd(s.c))); ctx.stroke();
    ctx.beginPath(); ctx.arc(X(s.v), Y(s.q), 5, 0, Math.PI * 2); ctx.fillStyle = C.forest; ctx.fill();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.forest; ctx.textAlign = "left";
    const lx = clamp(X(s.v * 0.62), gx + 4, gx + gw - 70), ly = clamp(Y(s.q * 0.2), gy + 12, gy + gh - 4);
    if (s.v > 0) ctx.fillText("넓이 = U", lx, ly);
    ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText("점선: 기준 상태", gx + gw, gy + 12);
    ctx.textAlign = "left";
  }

  const fmtQ = (q) => { const n = q * 1e9; return n >= 10 ? n.toFixed(1) : n >= 1 ? n.toFixed(2) : n.toFixed(3); };
  function update() {
    aOut.textContent = aIn.value; dOut.textContent = (+dIn.value).toFixed(1);
    const s = state();
    vOut.textContent = connected ? vIn.value : `${vIn.value} (분리됨)`;
    vIn.disabled = !connected;
    const cp = s.c * 1e12;
    nC.textContent = cp >= 1000 ? `${(cp / 1000).toFixed(2)} nF` : `${cp.toFixed(cp >= 100 ? 0 : 1)} pF`;
    nQ.textContent = `${fmtQ(s.q)} nC`;
    nV.textContent = `${s.v >= 100 ? s.v.toFixed(0) : s.v.toFixed(2)} V`;
    const un = s.u * 1e9;
    nU.textContent = `${un >= 100 ? un.toFixed(0) : un >= 10 ? un.toFixed(1) : un.toFixed(2)} nJ`;
    nE.textContent = `${Math.round(s.e).toLocaleString("ko-KR")} V/m`;
    nR.textContent = ref.u > 0 ? `${(s.u / ref.u).toFixed(2)}배` : "—";
    root.querySelectorAll("[data-k]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.k === kappa)));
    root.querySelectorAll("[data-conn]").forEach((b) => b.setAttribute("aria-pressed", String((b.dataset.conn === "1") === connected)));
    draw();
  }

  [aIn, dIn, vIn].forEach((el) => el.addEventListener("input", update));
  vIn.addEventListener("input", () => { setRef(); update(); });
  root.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => { kappa = +b.dataset.k; update(); }));
  root.querySelectorAll("[data-conn]").forEach((b) => b.addEventListener("click", () => {
    const want = b.dataset.conn === "1";
    if (want === connected) return;
    if (!want) Qfix = state().q;
    connected = want; setRef(); update();
  }));
  $(".set-ref").addEventListener("click", () => { setRef(); update(); });
  setRef(); update();
})();
