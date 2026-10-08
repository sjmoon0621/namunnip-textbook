/* 카드: 두 화살표가 같은 쪽을 얼마나 향하는지 수 하나로? — a·b = |a||b|cosθ = a1b1 + a2b2, 정사영으로 본 내적 */
(() => {
  const root = document.getElementById("card-geo-dot-angle");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const V = NMGeoVec;
  const $ = (s) => root.querySelector(s), cv = $("canvas");
  let a = [4, 1], b = [1, 3], view = null;
  const { ctx, size } = fit(cv, () => draw());
  const par = (v) => v < 0 ? `(${V.n(v)})` : V.n(v);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    view = V.plane(w, h, [-6, 6], [-4.4, 4.4]);
    V.grid(ctx, view);
    const P = view.P, O = [0, 0], La = V.norm(a), Lb = V.norm(b);
    if (La > 0) {
      const u = V.mul(30 / La, a);
      V.line(ctx, ...P(V.mul(-1, u)), ...P(u), C.ink3, 1, [4, 5]);
      const foot = V.mul(V.dotp(a, b) / (La * La), a), pos = V.dotp(a, b) >= 0;
      V.line(ctx, ...P(b), ...P(foot), C.ink3, 1.2, [3, 3]);
      V.line(ctx, ...P(O), ...P(foot), pos ? C.forest : C.warn, 6);
      // 직각 표시
      if (Lb > 0 && V.norm(V.sub(b, foot)) > 0.3) {
        const s = 0.28, ua = V.mul(1 / La, a), ub = V.mul(1 / V.norm(V.sub(b, foot)), V.sub(b, foot));
        const p1 = V.add(foot, V.mul(-s, ua));
        ctx.save(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath();
        ctx.moveTo(...P(p1)); ctx.lineTo(...P(V.add(p1, V.mul(s, ub)))); ctx.lineTo(...P(V.add(foot, V.mul(s, ub)))); ctx.stroke(); ctx.restore();
      }
    }
    // 각 θ 호
    if (La > 0 && Lb > 0) {
      const t0 = Math.atan2(a[1], a[0]), t1 = Math.atan2(b[1], b[0]);
      let d = t1 - t0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      const r = 26, [ox, oy] = P(O);
      ctx.save(); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ox, oy, r, -t0, -(t0 + d), d > 0); ctx.stroke(); ctx.restore();
      const tm = t0 + d / 2;
      V.text(ctx, "θ", ox + Math.cos(tm) * (r + 11), oy - Math.sin(tm) * (r + 11), C.ink2, { font: `italic 13px ${F.serif}` });
    }
    V.arrow(ctx, ...P(O), ...P(a), C.apple, 2.8);
    V.arrow(ctx, ...P(O), ...P(b), C.amber, 2.8);
    V.dot(ctx, ...P(a), C.apple, 6, true); V.dot(ctx, ...P(b), C.amber, 6, true);
    const lab = (v, s, col) => { const [x, y] = P(v), L = Math.hypot(x - P(O)[0], y - P(O)[1]) || 1; V.vlabel(ctx, s, clamp(x + (x - P(O)[0]) / L * 16, 12, w - 12), clamp(y + (y - P(O)[1]) / L * 16, 14, h - 10), col); };
    lab(a, "{a}", C.apple); lab(b, "{b}", C.amber);
  }

  function update() {
    const La = V.norm(a), Lb = V.norm(b), d = V.dotp(a, b), th = V.angle(a, b);
    const ok = La > 0 && Lb > 0;
    $(".n-t").textContent = ok ? `${V.n(V.deg(th), 1)}°` : "정하지 않음";
    $(".n-pr").textContent = La > 0 ? V.n(d / La) : "—";
    $(".n-g").textContent = ok ? V.n(La * Lb * Math.cos(th)) : "0";
    const c = $(".n-c"); c.textContent = V.n(d); c.className = `n-c ${d === 0 ? "good" : d < 0 ? "bad" : ""}`;
    const vs = (x) => `<span class="vec"><i>${x}</i></span>`;
    $(".eq").innerHTML = `${vs("a")} = ${V.tup(a, 0)}, ${vs("b")} = ${V.tup(b, 0)}<br>${vs("a")}·${vs("b")} = ${par(a[0])}×${par(b[0])} + ${par(a[1])}×${par(b[1])} = ${V.n(d)}${d === 0 && ok ? " → 수직" : ""}`;
    draw();
  }

  V.drag(cv, () => view ? [["a", a], ["b", b]].map(([id, q]) => { const [x, y] = view.P(q); return { id, x, y }; }) : [], (id, px, py) => {
    const q = [clamp(Math.round(view.ix(px)), -5, 5), clamp(Math.round(view.iy(py)), -4, 4)];
    if (id === "a") a = q; else b = q;
    update();
  });
  update();
})();
