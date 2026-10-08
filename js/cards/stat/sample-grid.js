/* 카드: 두 눈의 합이 11가지이면 확률은 각각 1/11일까? — 36칸 표본공간에 사건을 칠해 P(A) = n(A)/36, 합 묶음의 크기 비교 */
(() => {
  const root = document.getElementById("card-stat-sample-grid");
  if (!root) return;
  const { C, F, fit } = NM;
  const D = NMDice;
  const $ = (s) => root.querySelector(s), cv = $("canvas");
  const PRE = { none: () => false, s7: (a, b) => a + b === 7, dbl: (a, b) => a === b, le4: (a, b) => a + b <= 4, all: () => true };
  const sel = new Set(); // 첫째 눈 × 10 + 둘째 눈
  let L = null, paint = null;
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const gb = Math.round(h * 0.7);
    L = D.layout(w, gb);
    D.draw(ctx, L, (a, b) => (sel.has(a * 10 + b) ? { fill: C.sprout, ring: true } : null));
    const x0 = L.x0, bw = 6 * L.c / 11, top = gb + 26, bot = h - 18, unit = (bot - top - 14) / 6;
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillText("두 눈의 합으로 묶으면 (묶음 속 결과 수)", x0, top - 8);
    for (let s = 2; s <= 12; s++) {
      const tot = 6 - Math.abs(s - 7), x = x0 + (s - 2) * bw;
      let k = 0; sel.forEach((v) => { if (Math.floor(v / 10) + (v % 10) === s) k++; });
      ctx.fillStyle = C.sprout; ctx.fillRect(x + 4, bot - k * unit, bw - 8, k * unit);
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
      for (let j = 1; j < tot; j++) { ctx.beginPath(); ctx.moveTo(x + 4, bot - j * unit + 0.5); ctx.lineTo(x + bw - 4, bot - j * unit + 0.5); ctx.stroke(); }
      ctx.strokeStyle = C.ink3; ctx.strokeRect(x + 4.5, bot - tot * unit + 0.5, bw - 9, tot * unit - 1);
      ctx.font = `500 10.5px ${F.mono}`; ctx.textAlign = "center"; ctx.fillStyle = C.ink2;
      ctx.fillText(s, x + bw / 2, bot + 13);
      ctx.fillStyle = k ? C.forest : C.ink3; ctx.fillText(k ? `${k}/${tot}` : tot, x + bw / 2, bot - tot * unit - 4);
    }
  }

  function update() {
    const n = sel.size;
    const tag = n === 0 ? " (A = ∅, 일어날 수 없는 사건)" : n === 36 ? " (A = S, 반드시 일어나는 사건)" : "";
    $(".eq").textContent = `P(A) = n(A)/n(S) = ${n}/36 = ${D.fr(n, 36)}${tag}`;
    $(".n-a").textContent = n;
    $(".n-p").textContent = D.fr(n, 36);
    $(".n-d").textContent = (n / 36).toFixed(3);
    draw();
  }
  const at = (e) => { const b = cv.getBoundingClientRect(); return L && D.hit(L, e.clientX - b.left, e.clientY - b.top); };
  const apply = (p) => { const k = p[0] * 10 + p[1]; if (paint) sel.add(k); else sel.delete(k); update(); };
  cv.addEventListener("pointerdown", (e) => {
    const p = at(e); if (!p) return;
    paint = !sel.has(p[0] * 10 + p[1]); cv.setPointerCapture(e.pointerId); apply(p);
  });
  cv.addEventListener("pointermove", (e) => { if (paint === null) return; const p = at(e); if (p) apply(p); });
  ["pointerup", "pointercancel"].forEach((t) => cv.addEventListener(t, () => { paint = null; }));
  const preset = (k) => { sel.clear(); for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (PRE[k](a, b)) sel.add(a * 10 + b); update(); };
  root.querySelectorAll(".presets .chip").forEach((b) => b.addEventListener("click", () => preset(b.dataset.k)));
  preset("s7");
})();
