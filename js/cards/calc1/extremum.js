/* 카드: 기울기가 0인 점은 언제나 봉우리나 골짜기일까? — y = x³ + px² + qx의 증감표와 극값 */
(() => {
  const root = document.getElementById("card-calc1-extremum");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n, M = K.M;
  const $ = (s) => root.querySelector(s);
  const sp = $(".sp"), sq = $(".sq");
  const { ctx, size } = fit($("canvas"), () => draw());
  const f = (x) => { const p = +sp.value, q = +sq.value; return x ** 3 + p * x * x + q * x; };
  const d = (x) => 3 * x * x + 2 * +sp.value * x + +sq.value;

  function crit() {
    const p = +sp.value, q = +sq.value, D4 = p * p - 3 * q;
    if (D4 > 1e-12) { const r = Math.sqrt(D4); return { D4, xs: [(-p - r) / 3, (-p + r) / 3] }; }
    if (Math.abs(D4) <= 1e-12) return { D4: 0, xs: [-p / 3] };
    return { D4, xs: [] };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const g = K.frame(ctx, w, h, { xr: [-3.5, 3.5], yr: [-8, 8], ys: 2 });
    K.curve(ctx, g, f, C.ink2, { width: 2.6 });
    const { xs } = crit();
    xs.forEach((x, i) => {
      const y = f(x), kind = xs.length === 1 ? "none" : i === 0 ? "max" : "min";
      const col = kind === "max" ? C.forest : kind === "min" ? C.warn : C.ink;
      K.curve(ctx, g, () => y, col, { from: x - 0.8, to: x + 0.8, width: 1.4, dash: [4, 3] });
      K.guide(ctx, g, x, y, col, "x");
      K.dot(ctx, g, x, y, col, kind === "none", 5.5);
      const lab = kind === "max" ? `극대 (${n(x, 2)}, ${n(y, 2)})` : kind === "min" ? `극소 (${n(x, 2)}, ${n(y, 2)})` : `f′ = 0, 극값 아님`;
      K.tag(ctx, g, lab, g.X(x) + (kind === "max" ? -10 : 10), g.Y(y) + (kind === "max" ? -16 : 16), col, kind === "max" ? "right" : "left");
    });
  }

  function table(xs) {
    const sgn = (v) => (v > 0 ? "+" : M);
    const pts = [-Infinity, ...xs, Infinity];
    let r1 = "<th><i>x</i></th>", r2 = "<th>f′(<i>x</i>)</th>", r3 = "<th>f(<i>x</i>)</th>";
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const mid = !isFinite(a) && !isFinite(b) ? 0 : !isFinite(a) ? b - 1 : !isFinite(b) ? a + 1 : (a + b) / 2;
      const s = d(mid), cls = s > 0 ? "up" : "dn";
      r1 += "<td>…</td>"; r2 += `<td class="${cls}">${sgn(s)}</td>`; r3 += `<td class="${cls}">${s > 0 ? "↗" : "↘"}</td>`;
      if (isFinite(b)) {
        const l = d(b - 0.01), rr = d(b + 0.01);
        const k = l > 0 && rr < 0 ? "극대" : l < 0 && rr > 0 ? "극소" : "";
        r1 += `<td>${n(b, 2)}</td>`; r2 += "<td>0</td>"; r3 += `<td>${n(f(b), 2)}${k ? ` <b>${k}</b>` : ""}</td>`;
      }
    }
    return `<tr>${r1}</tr><tr>${r2}</tr><tr>${r3}</tr>`;
  }

  function update() {
    const p = +sp.value, q = +sq.value, { D4, xs } = crit();
    $(".p-out").textContent = n(p, 1); $(".q-out").textContent = n(q, 1);
    const t = (c, s) => (c === 0 ? "" : ` ${c < 0 ? M : "+"} ${Math.abs(c) === 1 ? "" : n(Math.abs(c), 1)}${s}`);
    $(".eq").innerHTML = `f(<i>x</i>) = <i>x</i><sup>3</sup>${t(p, "<i>x</i><sup>2</sup>")}${t(q, "<i>x</i>")}, &nbsp; f′(<i>x</i>) = 3<i>x</i><sup>2</sup>${t(2 * p, "<i>x</i>")}${q ? ` ${q < 0 ? M : "+"} ${n(Math.abs(q), 1)}` : ""}`;
    $(".tb").innerHTML = table(xs);
    const dd = $(".n-D"); dd.textContent = n(D4, 2); dd.className = `n-D ${D4 > 0 ? "good" : "bad"}`;
    $(".n-max").textContent = xs.length === 2 ? n(f(xs[0]), 3) : "없음";
    $(".n-min").textContent = xs.length === 2 ? n(f(xs[1]), 3) : "없음";
    draw();
  }
  [sp, sq].forEach((s) => s.addEventListener("input", update));
  update();
})();
