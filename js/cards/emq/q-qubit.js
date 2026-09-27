/* 카드: 측정하기 전의 양자 상태는 0일까, 1일까? — 실수 큐비트, 두 측정 기준, 붕괴 */
(() => {
  const root = document.getElementById("card-emq-qubit");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), oT = $(".t-out"), nP = $(".n-p"), nC = $(".n-c"), nL = $(".n-l");
  let basis = "z", counts = [0, 0], last = null, seed = 5;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const LAB = { z: ["0", "1"], x: ["+", "−"] };
  const phi = () => +sT.value / 2 * Math.PI / 180;                 // 상태 벡터의 평면 각 (|0⟩ = 0, |1⟩ = 90°)
  const p0 = () => basis === "z" ? Math.cos(phi()) ** 2 : Math.cos(phi() - Math.PI / 4) ** 2;
  function measure(n) { for (let i = 0; i < n; i++) { const r = rnd() < p0() ? 0 : 1; counts[r]++; last = r; } update(); }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const cx = w * 0.24, cy = h * 0.55, R = Math.min(w * 0.19, h * 0.38);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke();
    // 기준 축: |0⟩ 오른쪽, |1⟩ 위쪽 (평면각 0 → 오른쪽, 90° → 위)
    const P = (a, r) => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
    const axes = basis === "z" ? [[0, "|0⟩"], [Math.PI / 2, "|1⟩"]] : [[Math.PI / 4, "|+⟩"], [3 * Math.PI / 4, "|−⟩"]];
    axes.forEach(([a, t]) => { const [x, y] = P(a, R * 1.05); ctx.strokeStyle = "rgba(63,111,163,.6)"; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = "#3f6fa3"; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(t, ...P(a, R * 1.18)); });
    // 상태 화살표
    const a = phi(), [sx, sy] = P(a, R); ctx.strokeStyle = C.warn; ctx.fillStyle = C.warn; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(sx, sy); ctx.stroke(); ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("준비한 상태 |ψ⟩", sx + 8, sy - 4);
    if (last !== null) { const la = axes[last][0], [lx, ly] = P(la, R * 0.8); ctx.strokeStyle = C.forest; ctx.fillStyle = C.forest; ctx.lineWidth = 2; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(lx, ly); ctx.stroke(); ctx.setLineDash([]); ctx.font = `10px ${F.sans}`; ctx.fillText("측정 직후", lx + 4, ly + 12); }
    // 오른쪽: 막대
    const gx0 = w * 0.56, gx1 = w - 14, gy0 = h - 30, gy1 = 20, tot = counts[0] + counts[1], pr = [p0(), 1 - p0()], bw = (gx1 - gx0) / 5;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, gy0); ctx.lineTo(gx1, gy0); ctx.stroke();
    [0, 1].forEach((k) => {
      const x = gx0 + bw * (1 + 2 * k), f = tot ? counts[k] / tot : 0;
      ctx.fillStyle = "rgba(59,124,42,.55)"; ctx.fillRect(x, gy0 - f * (gy0 - gy1), bw, f * (gy0 - gy1));
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 4, gy0 - pr[k] * (gy0 - gy1)); ctx.lineTo(x + bw + 4, gy0 - pr[k] * (gy0 - gy1)); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(`결과 ${LAB[basis][k]}`, x + bw / 2, gy0 + 15);
    });
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("막대: 측정 결과 비율 · 빨간 선: 예측 확률", gx0, gy1 - 6);
  }
  function update() {
    root.querySelectorAll("[data-b]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.b === basis)));
    oT.textContent = sT.value; const p = p0();
    nP.textContent = `${LAB[basis][0]}: ${(p * 100).toFixed(0)} % · ${LAB[basis][1]}: ${((1 - p) * 100).toFixed(0)} %`;
    const tot = counts[0] + counts[1]; nC.textContent = tot ? `${LAB[basis][0]}: ${counts[0]}번 · ${LAB[basis][1]}: ${counts[1]}번 (모두 ${tot}번)` : "아직 측정하지 않음";
    nL.textContent = last === null ? "—" : `|${LAB[basis][last]}⟩ (다시 같은 기준으로 재면 반드시 ${LAB[basis][last]})`;
    draw();
  }
  const reset = () => { counts = [0, 0]; last = null; update(); };
  root.querySelectorAll("[data-b]").forEach((b) => b.addEventListener("click", () => { basis = b.dataset.b; reset(); }));
  sT.addEventListener("input", reset);
  $(".m1").addEventListener("click", () => measure(1)); $(".m100").addEventListener("click", () => measure(100)); $(".reset").addEventListener("click", reset);
  update();
})();
