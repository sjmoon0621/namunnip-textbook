/* 카드: 명제와 대우의 참·거짓은 왜 항상 같을까? — 끌어 옮기는 원 P, Q로 P ⊂ Q와 Qᶜ ⊂ Pᶜ를 따로 판정해 비교 */
(() => {
  const root = document.getElementById("card-cm2-contra-venn");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const S = NMSets;
  const $ = (s) => root.querySelector(s), cv = $("canvas"), rp = $(".rp"), rq = $(".rq");
  let P = { u: 0.46, v: 0.52 }, Q = { u: 0.52, v: 0.5 }, drag = null, rect = null, cs = [];
  const { ctx, size } = fit(cv, () => draw());

  function geom() {
    const { w, h } = size;
    rect = { x: 6, y: 6, w: w - 12, h: h - 12 };
    const R = rect.h / 2 - 4;
    const mk = (o, s) => { const r = R * s / 100; o.u = clamp(o.u, (r + 4) / rect.w, 1 - (r + 4) / rect.w); o.v = clamp(o.v, (r + 4) / rect.h, 1 - (r + 4) / rect.h); return { x: rect.x + o.u * rect.w, y: rect.y + o.v * rect.h, r }; };
    cs = [mk(P, +rp.value), mk(Q, +rq.value)];
  }
  /* 격자로 표본을 찍어 두 집합의 포함관계를 따로 센다 */
  function judge() {
    let pq = true, qcpc = true, qp = true, pcqc = true;
    for (let y = rect.y + 1; y < rect.y + rect.h; y += 3) for (let x = rect.x + 1; x < rect.x + rect.w; x += 3) {
      const m = S.region(cs, x, y), inP = !!(m & 1), inQ = !!(m & 2);
      if (inP && !inQ) pq = false;
      if (!inQ && !(!inP)) qcpc = false;
      if (inQ && !inP) qp = false;
      if (!inP && !(!inQ)) pcqc = false;
    }
    return [pq, qcpc, qp, pcqc];
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    geom();
    ctx.clearRect(0, 0, w, h);
    S.shade(ctx, cs, rect, 3, C.sprout, 0.8);
    S.shade(ctx, cs, rect, 2, C.amber, 0.18);
    S.shade(ctx, cs, rect, 1, C.warn, 0.4);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(rect.x + .5, rect.y + .5, rect.w - 1, rect.h - 1);
    ctx.font = `600 13px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText("U", rect.x + 8, rect.y + 13);
    S.outline(ctx, cs, ["P", "Q"], [135, 45], [C.forest, C.amber]);
    const res = judge(), labs = [["p → q", res[0]], ["~q → ~p", res[1]], ["q → p", res[2]], ["~p → ~q", res[3]]];
    labs.forEach((v, i) => {
      const d = $(`.n-${i + 1}`); d.textContent = v[1] ? "참" : "거짓"; d.className = `n-${i + 1} ${v[1] ? "good" : "bad"}`;
    });
  }
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener("pointerdown", (e) => {
    const [x, y] = pos(e);
    const hit = cs.map((c, i) => ({ i, d: Math.hypot(x - c.x, y - c.y), r: c.r })).filter((o) => o.d < o.r).sort((a, b) => a.r - b.r)[0];
    if (!hit) return;
    drag = { o: hit.i ? Q : P, dx: x - cs[hit.i].x, dy: y - cs[hit.i].y };
    cv.setPointerCapture(e.pointerId); cv.style.cursor = "grabbing";
  });
  cv.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const [x, y] = pos(e);
    drag.o.u = (x - drag.dx - rect.x) / rect.w; drag.o.v = (y - drag.dy - rect.y) / rect.h; draw();
  });
  const end = () => { drag = null; cv.style.cursor = ""; };
  cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
  [rp, rq].forEach((s) => s.addEventListener("input", () => { $(".rp-out").textContent = rp.value; $(".rq-out").textContent = rq.value; draw(); }));
})();
