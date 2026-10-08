/* 카드: '앞뒤앞'에 수를 붙이면 무엇이 달라질까? — 동전 세 개의 표본공간 → 확률변수의 값 → 확률분포와 상대도수 */
(() => {
  const root = document.getElementById("card-stat-rv-coins");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMStat;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".presets .chip")];
  const OUT = [[1, 1, 1], [1, 1, 0], [1, 0, 1], [1, 0, 0], [0, 1, 1], [0, 1, 0], [0, 0, 1], [0, 0, 0]];
  const name = (o) => o.map((b) => (b ? "앞" : "뒤")).join("");
  const VARS = [
    (o) => o[0] + o[1] + o[2],
    (o) => 2 * (o[0] + o[1] + o[2]) - 3,
    (o) => (o.indexOf(1) + 1),
  ];
  const r = S.rng(20261008);
  let v = 0, tally = [], last = -1;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const frac = (c) => { const g = gcd(c, 8); return `${c / g}/${8 / g}`; };
  const lab = (x) => String(x).replace("-", "−");
  const { ctx, size } = fit($("canvas"), () => draw());

  function dist() {
    const f = VARS[v], vals = [...new Set(OUT.map(f))].sort((a, b) => a - b);
    return vals.map((x) => ({ x, c: OUT.filter((o) => f(o) === x).length }));
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const top = 26, bot = h - 10, rowH = (bot - top) / 8, d = dist(), f = VARS[v];
    const ox = 10, ax = Math.round(w * 0.36), bx = ax + 20, bw = w - bx - 44;
    const vy = (i) => top + (bot - top) * (i + 0.5) / d.length;
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left"; ctx.fillText("표본공간 (8가지)", ox, 14);
    ctx.textAlign = "center"; ctx.fillText("X의 값", ax, 14);
    ctx.textAlign = "left"; ctx.fillText("P(X = x)", bx + 14, 14);
    const n = tally.length;
    OUT.forEach((o, i) => {
      const y = top + rowH * (i + 0.5), j = d.findIndex((e) => e.x === f(o)), hot = i === last;
      ctx.font = `${hot ? 700 : 500} 12px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = hot ? C.forest : C.ink; ctx.fillText(name(o), ox, y);
      const x1 = ox + 44, x2 = ax - 15, y2 = vy(j);
      ctx.strokeStyle = hot ? C.forest : C.ink3; ctx.lineWidth = hot ? 2.2 : 1;
      ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y2); ctx.stroke();
      const a = Math.atan2(y2 - y, x2 - x1);
      ctx.fillStyle = hot ? C.forest : C.ink3;
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 6 * Math.cos(a - 0.4), y2 - 6 * Math.sin(a - 0.4)); ctx.lineTo(x2 - 6 * Math.cos(a + 0.4), y2 - 6 * Math.sin(a + 0.4)); ctx.fill();
    });
    d.forEach((e, j) => {
      const y = vy(j), p = e.c / 8, len = p / 0.55 * bw, bh = Math.min(22, (bot - top) / d.length - 8);
      ctx.fillStyle = C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(ax, y, 12, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `600 11.5px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(lab(e.x), ax, y + 0.5);
      ctx.fillStyle = C.sprout; ctx.fillRect(bx, y - bh / 2, len, bh);
      ctx.strokeStyle = C.forest; ctx.strokeRect(bx + 0.5, y - bh / 2 + 0.5, len - 1, bh - 1);
      ctx.fillStyle = C.forest; ctx.font = `600 11.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(frac(e.c), bx + len + 6, y);
      if (n) {
        const rf = tally.filter((t) => f(OUT[t]) === e.x).length / n, xx = bx + rf / 0.55 * bw;
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(xx, y - bh / 2 - 4); ctx.lineTo(xx, y + bh / 2 + 4); ctx.stroke();
      }
    });
  }

  function update() {
    const d = dist(), f = VARS[v];
    $(".r-x").innerHTML = `<th><i>X</i> = <i>x</i></th>` + d.map((e) => `<td>${lab(e.x)}</td>`).join("");
    $(".r-p").innerHTML = `<th>P(<i>X</i> = <i>x</i>)</th>` + d.map((e) => `<td>${frac(e.c)}</td>`).join("");
    $(".n-n").textContent = tally.length;
    $(".n-last").textContent = last < 0 ? "—" : `${name(OUT[last])} → ${lab(f(OUT[last]))}`;
    $(".n-sum").textContent = `${d.reduce((s, e) => s + e.c, 0)}/8 = 1`;
    draw();
  }
  const toss = (k) => { for (let i = 0; i < k; i++) { last = Math.floor(r() * 8); tally.push(last); } update(); };
  chips.forEach((b) => b.addEventListener("click", () => { v = +b.dataset.v; chips.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  $(".go-one").addEventListener("click", () => toss(1));
  $(".go-many").addEventListener("click", () => toss(100));
  $(".go-reset").addEventListener("click", () => { tally = []; last = -1; update(); });
  update();
})();
