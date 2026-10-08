/* 카드: 어떤 x를 넣어도 성립하는 등식은 무엇이 다를까? — 2x² − x + 5 = a(x − 1)² + b(x − 1) + c를 그래프로 맞추기 */
(() => {
  const root = document.getElementById("card-cm1-identity");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const P = NMPoly;
  const $ = (s) => root.querySelector(s);
  const sa = $(".a"), sb = $(".b"), sc = $(".c"), st = $(".t");
  const L = [5, -1, 2];
  const right = () => { const a = +sa.value, b = +sb.value, c = +sc.value; return [a - b + c, b - 2 * a, a]; };
  const X0 = -3, X1 = 4, Y0 = -10, Y1 = 40;
  const { ctx, size } = fit($("canvas"), () => draw());

  function meets() {
    const d = P.sub(L, right()).concat([0, 0, 0]).slice(0, 3), [d0, d1, d2] = d;
    if (d.every((v) => Math.abs(v) < 1e-9)) return { all: true, xs: [] };
    if (Math.abs(d2) > 1e-9) {
      const D = d1 * d1 - 4 * d2 * d0;
      if (D < -1e-9) return { xs: [] };
      if (Math.abs(D) < 1e-9) return { xs: [-d1 / (2 * d2)] };
      const s = Math.sqrt(D); return { xs: [(-d1 - s) / (2 * d2), (-d1 + s) / (2 * d2)] };
    }
    if (Math.abs(d1) > 1e-9) return { xs: [-d0 / d1] };
    return { xs: [] };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 34, y0 = 12, gw = w - x0 - 10, gh = h - y0 - 24;
    const X = (x) => x0 + (x - X0) / (X1 - X0) * gw, Y = (y) => y0 + (Y1 - y) / (Y1 - Y0) * gh;
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [-3, -2, -1, 0, 1, 2, 3, 4].map((v) => [v, String(v).replace("-", "−")]), yt: [-10, 0, 10, 20, 30, 40].map((v) => [v, String(v).replace("-", "−")]) });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x0 + gw, Y(0)); ctx.moveTo(X(0), y0); ctx.lineTo(X(0), y0 + gh); ctx.stroke();
    const R = right(), m = meets(), box = { x: x0, y: y0, w: gw, h: gh }, t = +st.value;
    P.curve(ctx, (x) => P.at(L, x), X, Y, X0, X1, box, C.forest, m.all ? 5 : 2.5);
    P.curve(ctx, (x) => P.at(R, x), X, Y, X0, X1, box, C.warn, 2, [6, 4]);
    ctx.setLineDash([2, 3]); ctx.strokeStyle = C.ink2; ctx.beginPath(); ctx.moveTo(X(t), y0); ctx.lineTo(X(t), y0 + gh); ctx.stroke(); ctx.setLineDash([]);
    [[P.at(L, t), C.forest], [P.at(R, t), C.warn]].forEach(([v, col]) => { if (v < Y0 || v > Y1) return; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(t), Y(v), 4.5, 0, 7); ctx.fill(); });
    m.xs.filter((x) => x >= X0 && x <= X1).forEach((x) => { const v = P.at(L, x); if (v < Y0 || v > Y1) return; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(x), Y(v), 6, 0, 7); ctx.stroke(); });
    ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = m.all ? C.forest : C.ink2;
    ctx.fillText(m.all ? "완전히 겹침: 항등식" : `만나는 점 ${m.xs.length}개 (○)`, x0 + 6, y0 + 12);
  }

  function update() {
    ["a", "b", "c", "t"].forEach((n) => { $(`.${n}-out`).textContent = $(`.${n}`).value; });
    const a = +sa.value, b = +sb.value, c = +sc.value, R = right(), t = +st.value, m = meets();
    const pair = (k, name) => `<span class="${Math.abs(R[k] - L[k]) < 1e-9 ? "ok" : "bad"}">${name}: ${P.n(L[k])} ↔ ${P.n(R[k])}</span>`;
    $(".cmp").innerHTML = `좌변 2<i>x</i><sup>2</sup> − <i>x</i> + 5<br>우변 ${P.n(a)}(<i>x</i> − 1)<sup>2</sup> + ${b < 0 ? "(" + P.n(b) + ")" : b}(<i>x</i> − 1) + ${c < 0 ? "(" + P.n(c) + ")" : c} = ${P.fmt(R, true)}<br>계수 비교 ${pair(2, "<i>x</i><sup>2</sup>")} · ${pair(1, "<i>x</i>")} · ${pair(0, "상수")}`;
    $(".d-l").textContent = `좌변 (x = ${t})`; $(".d-r").textContent = `우변 (x = ${t})`;
    $(".n-l").textContent = P.n(P.at(L, t)); $(".n-r").textContent = P.n(P.at(R, t));
    const nm = $(".n-m"); nm.textContent = m.all ? "모든 x" : `${m.xs.length}개`; nm.className = `n-m ${m.all ? "good" : ""}`;
    draw();
  }
  [sa, sb, sc, st].forEach((s) => s.addEventListener("input", update));
  update();
})();
