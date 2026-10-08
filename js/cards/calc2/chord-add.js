/* 카드: cos(α − β)를 α, β의 삼각함수로 나타낼 수 있을까? — 현 PQ와 회전한 현 AB의 길이 비교로 덧셈정리 증명 */
(() => {
  const root = document.getElementById("card-calc2-chord-add");
  if (!root) return;
  const { C, F, fit, loop, reduce, ease } = NM;
  const n = NMCalc.n;
  const $ = (s) => root.querySelector(s);
  const sa = $(".sa"), sb = $(".sb"), rot = $(".go-rot"), cv = $("canvas");
  const RAD = Math.PI / 180;
  let t = 0, run = false;
  const { ctx, size } = fit(cv, () => draw());

  function label(text, x, y, col) {
    ctx.save(); ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const tw = ctx.measureText(text).width;
    ctx.fillStyle = C.card; ctx.globalAlpha = 0.85; ctx.fillRect(x - tw / 2 - 3, y - 8, tw + 6, 16); ctx.globalAlpha = 1;
    ctx.fillStyle = col; ctx.fillText(text, x, y); ctx.restore();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sa.value * RAD, b = +sb.value * RAD;
    const R0 = Math.min(h * 0.38, w * 0.36), cx = w / 2, cy = h / 2;
    const pt = (th, r = R0) => [cx + r * Math.cos(th), cy - r * Math.sin(th)];
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath();
    ctx.moveTo(cx - R0 - 20, cy); ctx.lineTo(cx + R0 + 20, cy); ctx.moveTo(cx, cy - R0 - 16); ctx.lineTo(cx, cy + R0 + 16); ctx.stroke();
    ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.arc(cx, cy, R0, 0, 7); ctx.stroke();
    const tri = (p, q, col, dash, width) => {
      ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = width; if (dash) ctx.setLineDash(dash);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(...p); ctx.lineTo(...q); ctx.closePath(); ctx.stroke(); ctx.restore();
    };
    const A = pt(0), B = pt(a - b), P = pt(a), Q = pt(b);
    tri(A, B, C.amber, null, 2.4);
    tri(P, Q, C.forest, null, 2.4);
    if (t > 0) {
      const s = ease(t) * b;
      tri(pt(a - s), pt(b - s), C.forest, [5, 4], 1.8);
    }
    for (const [p, col] of [[A, C.amber], [B, C.amber], [P, C.forest], [Q, C.forest]]) {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p[0], p[1], 4.5, 0, 7); ctx.fill();
    }
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 7); ctx.fill();
    const lr = R0 + 16;
    label("A", ...pt(0, lr), C.amber); label("B(α−β)", ...pt(a - b, lr + 12), C.amber);
    label("P(α)", ...pt(a, lr + 6), C.forest); label("Q(β)", ...pt(b, lr + 6), C.forest);
    label("O", cx - 10, cy + 12, C.ink2);
  }

  function update() {
    const A = +sa.value, B = +sb.value, a = A * RAD, b = B * RAD;
    $(".a-out").textContent = A; $(".b-out").textContent = B;
    const pq = (Math.cos(a) - Math.cos(b)) ** 2 + (Math.sin(a) - Math.sin(b)) ** 2;
    const ab = (Math.cos(a - b) - 1) ** 2 + Math.sin(a - b) ** 2;
    $(".n-pq").textContent = n(pq, 4); $(".n-ab").textContent = n(ab, 4);
    $(".n-c").textContent = n(Math.cos(a - b), 4);
    $(".n-r").textContent = n(Math.cos(a) * Math.cos(b) + Math.sin(a) * Math.sin(b), 4);
    $(".eq").innerHTML = `cos(${A}° − ${B}°) = ${n(Math.cos(a - b), 4)}, &nbsp;cos α − cos β = ${n(Math.cos(a) - Math.cos(b), 4)}`;
    draw();
  }

  loop(cv, (dt) => {
    if (!run) return false;
    t = Math.min(1, t + dt / 1.4); if (t >= 1) run = false;
    draw();
  });
  rot.addEventListener("click", () => {
    if (reduce) { t = 1; draw(); return; }
    t = 0; run = true;
  });
  $(".go-15").addEventListener("click", () => { sa.value = 45; sb.value = 30; t = 0; run = false; update(); });
  [sa, sb].forEach((s) => s.addEventListener("input", () => { t = 0; run = false; update(); }));
  update();
})();
