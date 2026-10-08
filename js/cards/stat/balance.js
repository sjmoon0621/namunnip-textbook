/* 카드: 확률분포의 '가운데'와 '퍼짐'은 어디서 읽을까? — 막대를 끌어 확률을 바꾸면 받침점 E(X)와 띠 E(X) ± σ(X)가 따라 움직인다 */
(() => {
  const root = document.getElementById("card-stat-balance");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const S = NMStat;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".presets .chip")];
  const cv = $("canvas");
  let wt = [1, 4, 6, 4, 1];
  const MAXW = 10;
  const { ctx, size } = fit(cv, () => draw());
  const geo = () => {
    const { w, h } = size, x0 = 22, gw = w - 44, top = 30, beam = Math.round(h * 0.66);
    return { w, h, X: (x) => x0 + (x + 0.5) / 5 * gw, top, beam, bh: beam - top - 4, unit: gw / 5 };
  };
  const stats = () => {
    const sum = wt.reduce((a, b) => a + b, 0), p = wt.map((x) => x / sum);
    const e = p.reduce((a, q, x) => a + x * q, 0), e2 = p.reduce((a, q, x) => a + x * x * q, 0), v = Math.max(0, e2 - e * e);
    return { p, e, e2, v, s: Math.sqrt(v) };
  };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const g = geo(), st = stats();
    wt.forEach((wi, x) => {
      const hh = wi / MAXW * g.bh, bw = g.unit * 0.56, cx = g.X(x);
      ctx.fillStyle = C.sprout; ctx.fillRect(cx - bw / 2, g.beam - hh, bw, hh);
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5; ctx.strokeRect(cx - bw / 2 + 0.5, g.beam - hh + 0.5, bw - 1, Math.max(0, hh - 1));
      ctx.fillStyle = C.forest; ctx.font = `600 11.5px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
      ctx.fillText(S.short(st.p[x], 3), cx, g.beam - hh - 6);
      ctx.fillStyle = C.ink2; ctx.font = `600 12px ${F.mono}`; ctx.fillText(`x=${x}`, cx, g.beam + 18);
    });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(g.X(-0.45), g.beam + 2); ctx.lineTo(g.X(4.45), g.beam + 2); ctx.stroke();
    const fx = g.X(st.e), fy = g.beam + 4;
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx - 11, fy + 28); ctx.lineTo(fx + 11, fy + 28); ctx.closePath(); ctx.fill();
    const by = g.beam + 44, lo = g.X(st.e - st.s), hi = g.X(st.e + st.s);
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(lo, by - 6); ctx.lineTo(lo, by + 6); ctx.moveTo(lo, by); ctx.lineTo(hi, by); ctx.moveTo(hi, by - 6); ctx.lineTo(hi, by + 6); ctx.stroke();
    ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = C.warn; ctx.textBaseline = "middle";
    const t1 = `E(X) = ${S.fmt(st.e, 2)}`, t2 = `E(X) ± σ(X)`;
    const place = (t, x, y) => { const tw = ctx.measureText(t).width; ctx.textAlign = "center"; ctx.fillText(t, clamp(x, tw / 2 + 4, w - tw / 2 - 4), y); };
    place(t1, fx, by + 18);
    place(t2, (lo + hi) / 2, h - 10);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.fillText("막대를 위아래로 끌어 보세요", 6, 14);
  }

  function update() {
    const st = stats();
    $(".n-e").textContent = S.fmt(st.e, 3); $(".n-e2").textContent = S.fmt(st.e2, 3);
    $(".n-v").textContent = S.fmt(st.v, 3); $(".n-s").textContent = S.fmt(st.s, 3);
    draw();
  }
  let drag = -1;
  const setFrom = (ev) => {
    const r = cv.getBoundingClientRect(), g = geo(), px = ev.clientX - r.left, py = ev.clientY - r.top;
    if (drag < 0) drag = clamp(Math.round((px - g.X(0)) / g.unit), 0, 4);
    const nw = clamp(Math.round((g.beam - py) / g.bh * MAXW), 0, MAXW), old = wt[drag];
    wt[drag] = nw; if (wt.every((x) => x === 0)) wt[drag] = old || 1;
    chips.forEach((x) => x.setAttribute("aria-pressed", "false"));
    update();
  };
  cv.addEventListener("pointerdown", (e) => { drag = -1; cv.setPointerCapture(e.pointerId); setFrom(e); });
  cv.addEventListener("pointermove", (e) => { if (drag >= 0) setFrom(e); });
  cv.addEventListener("pointerup", () => { drag = -1; });
  cv.addEventListener("pointercancel", () => { drag = -1; });
  chips.forEach((b) => b.addEventListener("click", () => { wt = b.dataset.w.split(",").map(Number); chips.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  update();
})();
