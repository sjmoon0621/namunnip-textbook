/* 카드: 먼 별까지는 왜 시차 대신 스펙트럼으로 거리를 잴까? — 시차와 분광 시차의 상대 오차 비교 */
(() => {
  const root = document.getElementById("card-adearth-distance-error");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sD = $(".d"), sM = $(".sm"), bExt = $(".ae-ext");
  const MV_TRUE = 5.9, MCLS = [5.9, 0.7, -4.5], CLS = ["K0 V", "K0 III", "K0 Ib"];
  let cls = 0, ext = false;
  /* 가이아 DR3 시차 오차(mas)를 G 등급으로 어림 (대표값 사이 로그 보간) */
  const GA = [[12, 0.02], [15, 0.02], [17, 0.07], [20, 0.5], [21, 1.3]];
  function gaiaSig(m) {
    if (m <= GA[0][0]) return GA[0][1];
    for (let i = 1; i < GA.length; i++) if (m <= GA[i][0]) { const [m0, s0] = GA[i - 1], [m1, s1] = GA[i]; return 10 ** (Math.log10(s0) + (m - m0) / (m1 - m0) * (Math.log10(s1) - Math.log10(s0))); }
    return Infinity;
  }
  const mObs = (d) => MV_TRUE + 5 * Math.log10(d) - 5 + (ext ? d / 1000 : 0);
  const fracGaia = (d) => gaiaSig(mObs(d)) * 1e-3 * d;
  const fracSpec = () => 0.4605 * +sM.value;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 48, x1 = w - 12, y0 = 22, y1 = h - 36;
    const X = (ld) => x0 + (ld - 0.3) / 4.2 * (x1 - x0), Y = (lf) => y1 - (lf + 3) / 4 * (y1 - y0);
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X, Y,
      xt: [[1, "10 pc"], [2, "100 pc"], [3, "1 kpc"], [4, "10 kpc"]],
      yt: [[-3, "0.1 %"], [-2, "1 %"], [-1, "10 %"], [0, "100 %"], [1, "1000 %"]],
      xlabel: "실제 거리", ylabel: "상대 거리 오차 σd/d" });
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    /* 20 % 경계 */
    ctx.fillStyle = "rgba(181,83,47,.07)"; ctx.fillRect(x0, y0, x1 - x0, Y(Math.log10(0.2)) - y0);
    const curve = (f, col, lw, dash) => {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath(); let pen = false;
      for (let i = 0; i <= 300; i++) { const ld = 0.3 + i / 300 * 4.2, v = f(10 ** ld); if (!isFinite(v) || v <= 0) { pen = false; continue; } const px = X(ld), py = Y(Math.log10(v)); if (!pen) { ctx.moveTo(px, py); pen = true; } else ctx.lineTo(px, py); }
      ctx.stroke(); ctx.setLineDash([]);
    };
    curve((d) => 0.01 * d, C.ink3, 1.3, [4, 3]);
    curve((d) => (mObs(d) <= 12 ? 0.001 * d : NaN), "#7a5aa6", 1.6);
    curve(fracGaia, "#3f6fa3", 2.4);
    curve(() => fracSpec(), C.forest, 2.4);
    const ld = +sD.value;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(ld), y0); ctx.lineTo(X(ld), y1); ctx.stroke();
    const g = fracGaia(10 ** ld);
    if (isFinite(g)) { ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.arc(X(ld), Y(Math.log10(g)), 4.5, 0, 2 * Math.PI); ctx.fill(); }
    ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(X(ld), Y(Math.log10(fracSpec())), 4.5, 0, 2 * Math.PI); ctx.fill();
    ctx.restore();
    /* 범례 */
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    let ly = y0 + 14; const lx = x0 + 8;
    const leg = (col, dash, txt) => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(lx, ly - 4); ctx.lineTo(lx + 16, ly - 4); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = C.ink2; ctx.fillText(txt, lx + 21, ly); ly += 15; };
    leg(C.ink3, [4, 3], "지상 시차 (σp ≈ 10 mas)");
    leg("#7a5aa6", null, "히파르코스 (≈ 1 mas, V ≤ 12)");
    leg("#3f6fa3", null, "가이아 DR3 (이 별의 밝기 반영)");
    leg(C.forest, null, "분광 시차 (0.46 σM)");
    ctx.fillStyle = C.warn; ctx.fillText("음영: σd/d > 20 %, 1/p를 그대로 쓰기 어려움", lx, ly + 6);
  }
  const pc = (d) => d >= 1000 ? `${(d / 1000).toFixed(2)} kpc` : `${d < 10 ? d.toFixed(1) : Math.round(d)} pc`;
  function update() {
    const d = 10 ** +sD.value, m = mObs(d);
    $(".d-out").textContent = pc(d); $(".sm-out").textContent = (+sM.value).toFixed(2);
    root.querySelectorAll("[data-c]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.c === cls)));
    bExt.setAttribute("aria-pressed", String(ext));
    $(".n-m").textContent = m.toFixed(2);
    const sg = gaiaSig(m), p = 1000 / d;
    $(".n-p").textContent = isFinite(sg) ? `${p < 1 ? p.toFixed(3) : p.toFixed(2)} ± ${sg < 0.1 ? sg.toFixed(2) : sg.toFixed(1)} mas` : `${p.toFixed(3)} mas (측정 불가)`;
    const ds = 10 ** ((m - MCLS[cls] + 5) / 5);
    const nsd = $(".n-sd"); nsd.textContent = `${pc(ds)} (${(ds / d).toFixed(2)}배)`;
    nsd.classList.toggle("bad", Math.abs(ds / d - 1) > 0.3);
    const g = fracGaia(d), s = fracSpec();
    $(".n-w").textContent = !isFinite(g) ? "분광 시차" : g < s ? `시차 (${(g * 100).toFixed(g < 0.01 ? 2 : 1)} %)` : `분광 시차 (${(s * 100).toFixed(0)} %)`;
    draw();
  }
  [sD, sM].forEach((s) => s.addEventListener("input", update));
  root.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => { cls = +b.dataset.c; update(); }));
  bExt.addEventListener("click", () => { ext = !ext; update(); });
  update();
})();
