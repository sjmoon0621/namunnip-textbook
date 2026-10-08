/* 카드: 불량품이 적어도 한 개 섞일 확률은 어떻게 구할까? — 10개 중 d개 불량, r개 뽑기: P(k개) 막대와 1 − P(0개), 모의 뽑기 */
(() => {
  const root = document.getElementById("card-stat-at-least");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s), sd = $(".d"), sr = $(".r");
  const N = 10;
  const rng = (s) => () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const rand = rng(1010);
  const comb = (n, k) => { if (k < 0 || k > n) return 0; let v = 1; for (let i = 1; i <= k; i++) v = v * (n - k + i) / i; return Math.round(v); };
  const gcd = (x, y) => (y ? gcd(y, x % y) : x);
  const fr = (p, q) => { if (p === 0) return "0"; const g = gcd(p, q); return q / g === 1 ? String(p / g) : `${p / g}/${q / g}`; };
  let picked = [], draws = 0, hits = 0;
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const d = +sd.value, r = +sr.value, tot = comb(N, r);
    const s = Math.min(30, (w - 20) / N - 6), gap = (w - N * s) / (N + 1);
    for (let i = 0; i < N; i++) {
      const x = gap + i * (s + gap), y = 10, bad = i < d;
      ctx.fillStyle = bad ? C.amber : C.card; ctx.fillRect(x, y, s, s);
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
      if (picked.includes(i)) { ctx.strokeStyle = C.forest; ctx.lineWidth = 3; ctx.strokeRect(x - 3, y - 3, s + 6, s + 6); }
    }
    const x0 = 34, y0 = s + 34, gw = w - x0 - 8, gh = h - y0 - 34;
    const cats = r + 2, cw = gw / cats;
    const X = (i) => x0 + i * cw, Y = (v) => y0 + (1 - v) * gh;
    axes(ctx, { x0, y0, w: gw, h: gh, X: (v) => x0 + v, Y, xt: [], yt: [0, 0.5, 1].map((v) => [v, String(v)]) });
    ctx.font = `500 10.5px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    let acc = 0;
    for (let k = 0; k <= r; k++) {
      const p = comb(d, k) * comb(N - d, r - k) / tot, x = X(k) + cw * 0.18, bw = cw * 0.64;
      ctx.fillStyle = k === 0 ? C.rule : C.amber; ctx.fillRect(x, Y(p), bw, Y(0) - Y(p));
      ctx.strokeStyle = k === 0 ? C.ink3 : C.ink2; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, Y(p) + 0.5, bw - 1, Y(0) - Y(p));
      ctx.fillStyle = C.ink2; ctx.fillText(`${k}개`, X(k) + cw / 2, y0 + gh + 14);
      ctx.fillText(p.toFixed(2).replace(/^0/, ""), X(k) + cw / 2, Y(p) - 4);
      if (k > 0) {
        const sx = X(r + 1) + cw * 0.15, sw = cw * 0.7;
        ctx.fillStyle = C.amber; ctx.fillRect(sx, Y(acc + p), sw, Y(acc) - Y(acc + p));
        ctx.strokeStyle = C.card; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(sx, Y(acc + p)); ctx.lineTo(sx + sw, Y(acc + p)); ctx.stroke();
        acc += p;
      }
    }
    const sx = X(r + 1) + cw * 0.15, sw = cw * 0.7, p0 = comb(N - d, r) / tot;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.strokeRect(sx + 0.5, Y(1) + 0.5, sw - 1, Y(0) - Y(1) - 1);
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(sx - 4, Y(1 - p0)); ctx.lineTo(sx + sw + 4, Y(1 - p0)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.forest; ctx.font = `600 10.5px ${F.sans}`;
    ctx.fillText("1개 이상", X(r + 1) + cw / 2, y0 + gh + 14);
    ctx.fillText("0개 = 여사건", X(0) + cw / 2, y0 + gh + 28);
  }

  function update() {
    const d = +sd.value, r = +sr.value, tot = comb(N, r), c0 = comb(N - d, r);
    $(".d-out").textContent = d; $(".r-out").textContent = r;
    $(".eq").innerHTML = `P(적어도 1개) = 1 − <sub>${N - d}</sub>C<sub>${r}</sub> / <sub>${N}</sub>C<sub>${r}</sub> = 1 − ${c0}/${tot} = ${fr(tot - c0, tot)}`;
    $(".n-0").textContent = fr(c0, tot);
    $(".n-1").textContent = fr(tot - c0, tot);
    $(".n-s").textContent = draws ? `${hits}/${draws} = ${(hits / draws).toFixed(3)}` : "—";
    draw();
  }
  function pick(times) {
    const d = +sd.value, r = +sr.value;
    for (let t = 0; t < times; t++) {
      const a = [...Array(N).keys()];
      for (let i = 0; i < r; i++) { const j = i + Math.floor(rand() * (N - i)); [a[i], a[j]] = [a[j], a[i]]; }
      picked = a.slice(0, r); draws++; if (picked.some((i) => i < d)) hits++;
    }
    update();
  }
  const reset = () => { picked = []; draws = 0; hits = 0; update(); };
  sd.addEventListener("input", reset); sr.addEventListener("input", reset);
  $(".go-one").addEventListener("click", () => pick(1));
  $(".go-many").addEventListener("click", () => pick(100));
  pick(1);
})();
