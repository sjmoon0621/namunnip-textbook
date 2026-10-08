/* 카드: 두 번째 공이 빨간 공일 확률은 첫 번째 공에 달려 있을까? — 복원·비복원 두 번 꺼내기의 나뭇가지 그림과 곱셈정리 */
(() => {
  const root = document.getElementById("card-stat-tree-draw");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s), cv = $("canvas"), sr = $(".r"), sw = $(".w");
  const chips = [...root.querySelectorAll(".presets .chip")];
  const LEAVES = [[1, 1], [1, 0], [0, 1], [0, 0]];
  const NAME = ["흰", "빨강"];
  const gcd = (x, y) => (y ? gcd(y, x % y) : x);
  const fr = (p, q) => { if (p === 0) return "0"; const g = gcd(p, q); return q / g === 1 ? String(p / g) : `${p / g}/${q / g}`; };
  let repl = false, leaf = 0, G = null;
  const { ctx, size } = fit(cv, () => draw());

  function branch(f, s) {
    const r = +sr.value, w = +sw.value, n = r + w;
    const c1 = f ? r : w, c2 = (s ? r : w) - (!repl && f === s ? 1 : 0), d2 = repl ? n : n - 1;
    return { c1, n, c2, d2 };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = +sr.value, wb = +sw.value;
    const bw = Math.round(w * 0.25), top = 26, H = h - top - 8;
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillText("주머니", bw / 2, 16);
    const bx = 6, by = top, bww = bw - 12, bh = Math.min(H, 150);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(bx, by, bww, bh, 12); ctx.stroke();
    const rad = Math.min(bww / 6 - 3, 10), balls = [...Array(r).fill(1), ...Array(wb).fill(0)];
    balls.forEach((b, i) => {
      const x = bx + bww / 2 + ((i % 3) - 1) * (2 * rad + 5), y = by + 14 + rad + Math.floor(i / 3) * (2 * rad + 5);
      ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fillStyle = b ? C.apple : C.card; ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke();
    });
    const xr = bw + 12, x1 = xr + (w - xr) * 0.3, x2 = xr + (w - xr) * 0.64, xl = x2 + 16;
    const rowH = H / 4, ly = (i) => top + (i + 0.5) * rowH, l1 = (f) => (f ? (ly(0) + ly(1)) / 2 : (ly(2) + ly(3)) / 2), yr = (ly(0) + ly(3)) / 2;
    G = { x1, top, rowH };
    ctx.fillStyle = C.ink3; ctx.fillText("첫째", x1, 16); ctx.fillText("둘째", x2, 16); ctx.fillText("경로의 확률", Math.min(xl + 26, w - 34), 16);
    LEAVES.forEach(([, s], i) => { if (s) { ctx.globalAlpha = 0.45; ctx.fillStyle = C.sprout; ctx.fillRect(x2 - 14, ly(i) - rowH / 2 + 3, w - x2 + 10, rowH - 6); ctx.globalAlpha = 1; } });
    const sel = LEAVES[leaf];
    const edge = (xa, ya, xb, yb, on, txt) => {
      ctx.strokeStyle = on ? C.forest : C.ink3; ctx.lineWidth = on ? 3 : 1.2;
      ctx.beginPath(); ctx.moveTo(xa, ya); ctx.lineTo(xb, yb); ctx.stroke();
      ctx.font = `600 11.5px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const mx = (xa + xb) / 2, my = (ya + yb) / 2, tw = ctx.measureText(txt).width;
      ctx.fillStyle = C.card; ctx.fillRect(mx - tw / 2 - 3, my - 8, tw + 6, 16);
      ctx.fillStyle = on ? C.forest : C.ink2; ctx.fillText(txt, mx, my);
    };
    const node = (x, y, red) => { ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fillStyle = red ? C.apple : C.card; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke(); };
    [1, 0].forEach((f) => {
      const b = branch(f, 1);
      edge(xr, yr, x1, l1(f), sel[0] === f, `${b.c1}/${b.n}`);
    });
    LEAVES.forEach(([f, s], i) => {
      const b = branch(f, s);
      edge(x1, l1(f), x2, ly(i), i === leaf, `${b.c2}/${b.d2}`);
    });
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(xr, yr, 4, 0, 7); ctx.fill();
    [1, 0].forEach((f) => node(x1, l1(f), f));
    LEAVES.forEach(([f, s], i) => {
      node(x2, ly(i), s);
      if (i === leaf) { ctx.strokeStyle = C.forest; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x2, ly(i), 12, 0, 7); ctx.stroke(); }
      const b = branch(f, s);
      ctx.font = `${i === leaf ? 700 : 500} 12.5px ${F.mono}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = i === leaf ? C.forest : C.ink; ctx.fillText(fr(b.c1 * b.c2, b.n * b.d2), xl, ly(i));
    });
  }

  function update() {
    const r = +sr.value, n = r + +sw.value, [f, s] = LEAVES[leaf], b = branch(f, s);
    $(".r-out").textContent = sr.value; $(".w-out").textContent = sw.value;
    $(".eq").textContent = `P(첫째 ${NAME[f]} ∩ 둘째 ${NAME[s]}) = P(첫째 ${NAME[f]}) × P(둘째 ${NAME[s]} | 첫째 ${NAME[f]}) = ${b.c1}/${b.n} × ${b.c2}/${b.d2} = ${fr(b.c1 * b.c2, b.n * b.d2)}`;
    $(".n-path").textContent = fr(b.c1 * b.c2, b.n * b.d2);
    $(".n-r1").textContent = fr(r, n);
    const p = branch(1, 1), q = branch(0, 1);
    $(".n-r2").textContent = fr(p.c1 * p.c2 + q.c1 * q.c2, p.n * p.d2);
    draw();
  }
  cv.addEventListener("pointerdown", (e) => {
    if (!G) return;
    const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    if (x < G.x1 + 10) return;
    leaf = Math.max(0, Math.min(3, Math.floor((y - G.top) / G.rowH))); update();
  });
  chips.forEach((c) => c.addEventListener("click", () => { repl = c.dataset.m === "1"; chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c))); update(); }));
  sr.addEventListener("input", update); sw.addEventListener("input", update);
  update();
})();
