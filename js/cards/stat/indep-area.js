/* 카드: 두 사각형이 어떻게 겹치면 독립일까? — 넓이 1인 정사각형 안의 직사각형 A, B를 끌어 P(A∩B)와 P(A)P(B) 비교 (눈금 1/20 단위) */
(() => {
  const root = document.getElementById("card-stat-indep-area");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s), cv = $("canvas");
  const U = 20;
  const PRE = {
    strip: [{ x: 4, y: 0, w: 8, h: 20 }, { x: 0, y: 10, w: 20, h: 5 }],
    apart: [{ x: 1, y: 3, w: 7, h: 8 }, { x: 11, y: 8, w: 7, h: 10 }],
    inside: [{ x: 2, y: 2, w: 14, h: 14 }, { x: 5, y: 5, w: 6, h: 6 }],
  };
  let A, B, drag = null, G = null;
  const { ctx, size } = fit(cv, () => draw());
  const area = (r) => r.w * r.h;
  const inter = () => {
    const x1 = Math.max(A.x, B.x), x2 = Math.min(A.x + A.w, B.x + B.w), y1 = Math.max(A.y, B.y), y2 = Math.min(A.y + A.h, B.y + B.h);
    return x2 > x1 && y2 > y1 ? { x: x1, y: y1, w: x2 - x1, h: y2 - y1 } : null;
  };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = Math.min(w, h) - 16, x0 = (w - s) / 2, y0 = 8, c = s / U;
    G = { x0, y0, c };
    for (let i = 0; i <= U; i++) {
      ctx.strokeStyle = i % 5 ? C.rule : C.ink3; ctx.lineWidth = i % 5 ? 0.6 : 1;
      ctx.beginPath(); ctx.moveTo(x0 + i * c, y0); ctx.lineTo(x0 + i * c, y0 + s); ctx.moveTo(x0, y0 + i * c); ctx.lineTo(x0 + s, y0 + i * c); ctx.stroke();
    }
    const box = (r, fill, alpha, line) => {
      ctx.globalAlpha = alpha; ctx.fillStyle = fill; ctx.fillRect(x0 + r.x * c, y0 + r.y * c, r.w * c, r.h * c); ctx.globalAlpha = 1;
      ctx.strokeStyle = line; ctx.lineWidth = 2; ctx.strokeRect(x0 + r.x * c, y0 + r.y * c, r.w * c, r.h * c);
    };
    box(A, C.sprout, 0.75, C.forest);
    box(B, C.amber, 0.4, C.amber);
    const I = inter();
    if (I) {
      ctx.save(); ctx.beginPath(); ctx.rect(x0 + I.x * c, y0 + I.y * c, I.w * c, I.h * c); ctx.clip();
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.2;
      for (let d = -s; d < s; d += 7) { ctx.beginPath(); ctx.moveTo(x0 + d, y0 + s); ctx.lineTo(x0 + d + s, y0); ctx.stroke(); }
      ctx.restore();
    }
    ctx.font = `700 14px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
    const tag = (r, t, col) => {
      const tx = x0 + r.x * c + 5, ty = y0 + r.y * c + 4;
      ctx.fillStyle = C.card; ctx.fillRect(tx - 2, ty - 1, 14, 17);
      ctx.fillStyle = col; ctx.fillText(t, tx, ty);
    };
    tag(A, "A", C.forest); tag(B, "B", C.warn);
    [A, B].forEach((r) => {
      const hx = x0 + (r.x + r.w) * c, hy = y0 + (r.y + r.h) * c;
      ctx.fillStyle = C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.fillRect(hx - 6, hy - 6, 12, 12); ctx.strokeRect(hx - 6, hy - 6, 12, 12);
    });
  }

  const dec = (x) => String(+x.toFixed(6));
  function update() {
    const nA = area(A), nB = area(B), I = inter(), nI = I ? area(I) : 0, T = U * U;
    const indep = nI * T === nA * nB;
    $(".eq").textContent = `P(A∩B) = ${dec(nI / T)} ${indep ? "=" : "≠"} P(A)P(B) = ${dec(nA / T)} × ${dec(nB / T)} = ${dec(nA * nB / T / T)}` +
      `,  P(B|A) = ${dec(nI / nA)}  →  ${indep ? "독립" : "종속"}`;
    $(".n-a").textContent = dec(nA / T); $(".n-b").textContent = dec(nB / T);
    $(".n-ab").textContent = dec(nI / T); $(".n-pp").textContent = dec(nA * nB / T / T);
    draw();
  }

  const unit = (e) => { const b = cv.getBoundingClientRect(); return [(e.clientX - b.left - G.x0) / G.c, (e.clientY - b.top - G.y0) / G.c]; };
  const inside = (r, u, v) => u >= r.x && u <= r.x + r.w && v >= r.y && v <= r.y + r.h;
  cv.addEventListener("pointerdown", (e) => {
    if (!G) return;
    const [u, v] = unit(e), tol = 12 / G.c;
    for (const r of [B, A]) if (Math.abs(u - r.x - r.w) < tol && Math.abs(v - r.y - r.h) < tol) { drag = { r, mode: "size" }; break; }
    if (!drag) for (const r of [B, A]) if (inside(r, u, v)) { drag = { r, mode: "move", ox: u - r.x, oy: v - r.y }; break; }
    if (drag) { cv.setPointerCapture(e.pointerId); e.preventDefault(); }
  });
  cv.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const [u, v] = unit(e), r = drag.r;
    if (drag.mode === "move") { r.x = clamp(Math.round(u - drag.ox), 0, U - r.w); r.y = clamp(Math.round(v - drag.oy), 0, U - r.h); }
    else { r.w = clamp(Math.round(u - r.x), 1, U - r.x); r.h = clamp(Math.round(v - r.y), 1, U - r.y); }
    update();
  });
  ["pointerup", "pointercancel"].forEach((t) => cv.addEventListener(t, () => { drag = null; }));
  const preset = (k) => { [A, B] = PRE[k].map((r) => ({ ...r })); update(); };
  root.querySelectorAll(".presets .chip").forEach((b) => b.addEventListener("click", () => preset(b.dataset.k)));
  preset("strip");
})();
